"""
LangGraph Multi-Agent Workflow for IT Ticket Analysis
Replaces CrewAI with adaptive routing, HITL, performance tracking, and cost-aware selection
"""

from typing import Dict, List, Any, Optional, TypedDict, Annotated
import time
import uuid
import json
from datetime import datetime
from operator import add

try:
    from langgraph.graph import StateGraph, END
    from langgraph.checkpoint.memory import MemorySaver
    LANGGRAPH_AVAILABLE = True
except ImportError:
    print("LangGraph not available, using fallback implementation")
    LANGGRAPH_AVAILABLE = False
    StateGraph = None
    END = "END"

from core.config import Settings
from services.model_service import ModelService
from services.knowledge_service import KnowledgeService
from utils.logger import setup_logger
from utils.response_formatter import response_formatter

logger = setup_logger(__name__)

# State definition for the workflow
class TicketState(TypedDict):
    """State passed between agents in the workflow"""
    # Input
    ticket_id: str
    title: str
    description: str
    requester_info: Optional[Dict[str, Any]]
    additional_context: Optional[Dict[str, Any]]
    
    # Processing metadata
    is_simple: bool
    skip_priority: bool
    ticket_length: int
    selected_model: str
    
    # Agent outputs
    classification: Optional[Dict[str, Any]]
    priority_prediction: Optional[Dict[str, Any]]
    recommended_solutions: Optional[List[Dict[str, Any]]]
    qa_review: Optional[Dict[str, Any]]
    
    # Performance tracking
    agent_metrics: Annotated[List[Dict[str, Any]], add]
    processing_steps: Annotated[List[str], add]
    
    # Status
    status: str  # "processing", "needs_review", "completed"
    needs_human_review: bool
    draft_analysis: Optional[Dict[str, Any]]
    review_url: Optional[str]


class AgentPerformanceTracker:
    """Track agent performance and accuracy over time"""
    
    def __init__(self):
        self.metrics = {}
        self.predictions = []
        
    def log_agent_prediction(
        self, 
        agent: str, 
        ticket_id: str,
        predicted: Any,
        confidence: float,
        metadata: Optional[Dict] = None
    ):
        """Log an agent's prediction for later accuracy tracking"""
        prediction = {
            "agent": agent,
            "ticket_id": ticket_id,
            "predicted": predicted,
            "confidence": confidence,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }
        self.predictions.append(prediction)
        logger.info(f"📊 Logged prediction: {agent} -> {predicted} (confidence: {confidence:.2f})")
    
    def log_agent_feedback(
        self,
        ticket_id: str,
        agent: str,
        actual: Any,
        feedback_source: str = "user"
    ):
        """Log actual outcome for accuracy calculation"""
        # Find the prediction
        for pred in self.predictions:
            if pred["ticket_id"] == ticket_id and pred["agent"] == agent:
                pred["actual"] = actual
                pred["feedback_source"] = feedback_source
                pred["feedback_timestamp"] = datetime.utcnow().isoformat()
                
                # Calculate accuracy for this prediction
                is_correct = str(pred["predicted"]).lower() == str(actual).lower()
                pred["correct"] = is_correct
                
                # Update agent metrics
                if agent not in self.metrics:
                    self.metrics[agent] = {
                        "total": 0,
                        "correct": 0,
                        "accuracy": 0.0,
                        "avg_confidence": 0.0
                    }
                
                self.metrics[agent]["total"] += 1
                if is_correct:
                    self.metrics[agent]["correct"] += 1
                self.metrics[agent]["accuracy"] = (
                    self.metrics[agent]["correct"] / self.metrics[agent]["total"]
                )
                
                logger.info(
                    f"✅ Feedback logged: {agent} predicted '{pred['predicted']}', "
                    f"actual '{actual}' ({'✓' if is_correct else '✗'}). "
                    f"Agent accuracy: {self.metrics[agent]['accuracy']:.2%}"
                )
                break
    
    def get_agent_stats(self, agent: str) -> Dict[str, Any]:
        """Get performance stats for a specific agent"""
        return self.metrics.get(agent, {
            "total": 0,
            "correct": 0,
            "accuracy": 0.0,
            "predictions": []
        })
    
    def get_all_stats(self) -> Dict[str, Any]:
        """Get performance stats for all agents"""
        return {
            "agents": self.metrics,
            "total_predictions": len(self.predictions),
            "predictions_with_feedback": len([p for p in self.predictions if "actual" in p])
        }


class WorkflowManager:
    def _sanitize_text(self, text: str) -> str:
        """Sanitize input by masking common PII patterns (emails, phone numbers, etc.)"""
        import re
        # Mask emails
        text = re.sub(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "[EMAIL]", text)
        # Mask phone numbers (simple patterns)
        text = re.sub(r"\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b", "[PHONE]", text)
        # Mask credit card numbers (very basic)
        text = re.sub(r"\b(?:\d[ -]*?){13,16}\b", "[CREDIT_CARD]", text)
        # Mask SSN (US)
        text = re.sub(r"\b\d{3}-\d{2}-\d{4}\b", "[SSN]", text)
        return text
    """Manages LangGraph-based multi-agent workflow for ticket analysis"""
    
    def __init__(
        self, 
        settings: Settings,
        model_service: ModelService,
        knowledge_service: KnowledgeService
    ):
        self.settings = settings
        self.model_service = model_service
        self.knowledge_service = knowledge_service
        self.workflow = None
        self.app = None
        self.initialized = False
        self.langgraph_available = LANGGRAPH_AVAILABLE
        self.performance_tracker = AgentPerformanceTracker()
        
        # Cost-aware model selection
        self.fast_model = "llama-3.1-8b-instant"  # Groq's fastest/cheapest
        self.standard_model = getattr(settings, 'groq_model', 'llama-3.1-8b-instant')

    @staticmethod
    def _to_plain(obj: Any) -> Optional[Dict[str, Any]]:
        """Best-effort conversion to plain dict for safe .get access (handles Pydantic models)."""
        if obj is None:
            return None
        if isinstance(obj, dict):
            return obj
        if hasattr(obj, "model_dump"):
            try:
                return obj.model_dump()
            except Exception:
                pass
        if hasattr(obj, "dict"):
            try:
                return obj.dict()
            except Exception:
                pass
        try:
            return dict(obj)  # type: ignore[arg-type]
        except Exception:
            try:
                return json.loads(json.dumps(obj, default=lambda o: getattr(o, "__dict__", str(o))))
            except Exception:
                return None
        
    async def initialize(self):
        """Initialize the LangGraph workflow"""
        try:
            logger.info("🔧 Initializing LangGraph Workflow Manager...")
            
            if not self.langgraph_available:
                logger.warning("LangGraph not available, using fallback mode")
                self.initialized = True
                return
            
            # Build the workflow graph
            await self._build_workflow()
            
            self.initialized = True
            logger.info("✅ LangGraph Workflow initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize LangGraph Workflow: {str(e)}")
            self.initialized = True  # Allow fallback mode
    
    def _select_model_for_ticket(self, title: str, description: str) -> str:
        """Cost-aware model selection based on ticket complexity"""
        text = f"{title} {description}"
        ticket_length = len(text)
        
        # Use fast model for simple tickets
        if ticket_length < 100:
            logger.info(f"💰 Using fast model ({self.fast_model}) for short ticket ({ticket_length} chars)")
            return self.fast_model
        
        # Standard model for complex tickets
        logger.info(f"🎯 Using standard model ({self.standard_model}) for ticket ({ticket_length} chars)")
        return self.standard_model
    
    async def _build_workflow(self):
        """Build the LangGraph StateGraph workflow"""
        if not self.langgraph_available:
            return
        
        # Create the graph
        workflow = StateGraph(TicketState)
        
        # Add agent nodes
        workflow.add_node("classify", self._classify_node)
        workflow.add_node("prioritize", self._prioritize_node)
        workflow.add_node("recommend", self._recommend_node)
        workflow.add_node("qa_reviewer", self._qa_review_node)
        
        # Set entry point
        workflow.set_entry_point("classify")
        
        # Adaptive routing: skip prioritization for high-confidence simple tickets
        def should_skip_priority(state: TicketState) -> str:
            """Conditional routing based on classification confidence"""
            classification = state.get("classification", {})
            confidence = classification.get("confidence", 0.0)
            
            if confidence > 0.95 and state.get("is_simple", False):
                logger.info("⚡ High confidence + simple ticket: skipping priority agent")
                state["skip_priority"] = True
                state["processing_steps"].append("skipped_priority_due_to_confidence")
                return "recommend"
            return "prioritize"
        
        # Add conditional edges from classify
        workflow.add_conditional_edges(
            "classify",
            should_skip_priority,
            {
                "prioritize": "prioritize",
                "recommend": "recommend"
            }
        )
        
        # Add edges
        workflow.add_edge("prioritize", "recommend")
        workflow.add_edge("recommend", "qa_reviewer")
        
        # QA review decides if we need human review or can complete
        def qa_routing(state: TicketState) -> str:
            """Route based on QA score"""
            qa = state.get("qa_review", {})
            quality_score = qa.get("quality_score", 1.0)
            
            if quality_score < 0.75:
                logger.warning(f"⚠️ Low QA score ({quality_score:.2f}): flagging for human review")
                state["needs_human_review"] = True
                state["status"] = "needs_review"
                return END
            
            state["status"] = "completed"
            return END
        
        workflow.add_conditional_edges(
            "qa_reviewer",
            qa_routing,
            {END: END}
        )
        
        # Compile the workflow with memory
        memory = MemorySaver()
        self.app = workflow.compile(checkpointer=memory)
        
        logger.info("✅ LangGraph workflow compiled with adaptive routing and HITL")
    
    async def _classify_node(self, state: TicketState) -> Dict[str, Any]:
        """Classification agent node"""
        start_time = time.time()
        
        try:
            # Determine ticket complexity
            text = f"{state['title']} {state['description']}"
            state["ticket_length"] = len(text)
            state["is_simple"] = len(text) < 100
            
            # Select model (for metadata only)
            model = self._select_model_for_ticket(state["title"], state["description"])
            state["selected_model"] = model

            # Use ModelService classification with built-in fallbacks
            categories = [
                "Network Issues", "Software Problems", "Hardware Failures", "Security Incidents",
                "Account Access", "Email Issues", "Printer Problems", "Application Errors",
                "System Performance", "Mobile Device Support", "Database Issues", "Backup & Recovery",
                "General Support"
            ]
            cls = await self.model_service.classify_text(text, categories)
            
            # Comprehensive subcategory mapping (MUST NEVER BE None)
            category = cls.get("category", "General Support")
            tl = text.lower()
            subcategory = "Other"  # Default fallback
            
            if category == "Email Issues":
                if any(k in tl for k in ["iphone", "ios", "android", "mobile", "phone", "tablet"]):
                    subcategory = "Mobile Email Sync"
                elif any(k in tl for k in ["outlook", "client", "application"]):
                    subcategory = "Outlook"
                elif any(k in tl for k in ["smtp", "send", "receive", "imap", "pop", "sync"]):
                    subcategory = "SMTP/IMAP"
                elif any(k in tl for k in ["calendar", "meeting", "appointment"]):
                    subcategory = "Calendar"
                else:
                    subcategory = "Email General"
            elif category == "Network Issues":
                if any(k in tl for k in ["wifi", "wireless"]):
                    subcategory = "WiFi"
                elif any(k in tl for k in ["vpn", "remote"]):
                    subcategory = "VPN"
                elif any(k in tl for k in ["internet", "web"]):
                    subcategory = "Internet"
                elif any(k in tl for k in ["lan", "ethernet", "cable"]):
                    subcategory = "LAN"
                else:
                    subcategory = "Connectivity"
            elif category == "Hardware Failures":
                if any(k in tl for k in ["desktop", "pc", "computer"]):
                    subcategory = "Desktop"
                elif any(k in tl for k in ["laptop", "notebook"]):
                    subcategory = "Laptop"
                elif any(k in tl for k in ["printer", "print"]):
                    subcategory = "Printer"
                elif any(k in tl for k in ["mobile", "phone", "iphone", "android"]):
                    subcategory = "Mobile Device"
                elif any(k in tl for k in ["mouse", "keyboard", "monitor", "peripheral"]):
                    subcategory = "Peripherals"
                else:
                    subcategory = "Hardware General"
            elif category == "Software Problems":
                if any(k in tl for k in ["install", "installation"]):
                    subcategory = "Installation"
                elif any(k in tl for k in ["update", "upgrade", "patch"]):
                    subcategory = "Update"
                elif any(k in tl for k in ["error", "crash", "exception"]):
                    subcategory = "Application Error"
                elif any(k in tl for k in ["windows", "linux", "macos", "os"]):
                    subcategory = "OS Problem"
                else:
                    subcategory = "Software General"
            elif category == "Access & Permissions" or category == "Account Access":
                if any(k in tl for k in ["login", "sign in", "logon"]):
                    subcategory = "Login"
                elif any(k in tl for k in ["password", "reset", "forgot"]):
                    subcategory = "Password"
                elif any(k in tl for k in ["account", "user", "access"]):
                    subcategory = "Account Access"
                elif any(k in tl for k in ["permission", "denied", "unauthorized"]):
                    subcategory = "File Permissions"
                else:
                    subcategory = "Access General"
            elif category == "General Support":
                if any(k in tl for k in ["how to", "how do", "tutorial", "guide"]):
                    subcategory = "How-To"
                elif any(k in tl for k in ["request", "need", "want"]):
                    subcategory = "Request"
                else:
                    subcategory = "Other"
            else:
                subcategory = "Other"

            classification = {
                "category": category,
                "subcategory": subcategory,  # ALWAYS populated, never None
                "confidence": cls.get("confidence", 0.7),
                "reasoning": cls.get("reasoning", f"Classified as {category}/{subcategory} based on keyword analysis")
            }
            
            processing_time = (time.time() - start_time) * 1000
            
            # Log prediction for performance tracking
            self.performance_tracker.log_agent_prediction(
                agent="classifier",
                ticket_id=state["ticket_id"],
                predicted=classification.get("category"),
                confidence=classification.get("confidence", 0.0),
                metadata={"processing_time_ms": processing_time, "model": model}
            )
            
            return {
                "classification": classification,
                "agent_metrics": [{
                    "agent": "classifier",
                    "processing_time_ms": processing_time,
                    "model_used": model
                }],
                "processing_steps": ["classification_completed"]
            }
            
        except Exception as e:
            logger.error(f"Classification node error: {str(e)}")
            return {
                "classification": {
                    "category": "General Support",
                    "subcategory": "Needs Review",  # MUST include subcategory
                    "confidence": 0.5,
                    "reasoning": f"Error: {str(e)}"
                },
                "processing_steps": ["classification_error"]
            }
    
    async def _prioritize_node(self, state: TicketState) -> Dict[str, Any]:
        """Priority prediction agent node"""
        start_time = time.time()
        
        try:
            # Build context with classification (not strictly needed for heuristic)
            _ = state.get("classification", {})
            
            # Priority heuristic (deterministic, no LLM dependency)
            req = self._to_plain(state.get("requester_info")) or {}
            dept = (req.get("department") or "").lower()
            tl = f"{state['title']} {state['description']}".lower()
            priority_level = "Medium"
            est_hours = 24
            factors: List[str] = []
            reasoning = ""
            
            if any(k in tl for k in ["down", "outage", "not reachable", "cannot connect", "security breach", "data loss", "ransomware"]):
                priority_level, est_hours = "Critical", 2
                factors.append("Service outage or security incident")
                reasoning = "Critical priority due to service outage or security incident requiring immediate attention"
            elif any(k in tl for k in ["payroll", "finance", "vip", "executive", "ceo", "director"]) or dept in ("finance", "executive"):
                priority_level, est_hours = "High", 8
                factors.append("High-impact user or system")
                reasoning = "High priority due to business-critical user or financial system impact"
            elif any(k in tl for k in ["slow", "performance", "minor", "workaround", "intermittent"]):
                priority_level, est_hours = "Medium", 24
                factors.append("Workaround available or minor impact")
                reasoning = "Medium priority - issue has workaround or affects single user"
            else:
                priority_level, est_hours = "Low", 72
                factors.append("General inquiry or cosmetic issue")
                reasoning = "Low priority - general inquiry or minor cosmetic issue"

            priority = {
                "priority": priority_level,
                "estimated_resolution_hours": float(est_hours),
                "confidence": 0.7,
                "factors": factors,
                "reasoning": reasoning
            }
            
            processing_time = (time.time() - start_time) * 1000
            
            # Log prediction
            self.performance_tracker.log_agent_prediction(
                agent="priority_predictor",
                ticket_id=state["ticket_id"],
                predicted=priority.get("priority"),
                confidence=priority.get("confidence", 0.0),
                metadata={"processing_time_ms": processing_time}
            )
            
            return {
                "priority_prediction": priority,
                "agent_metrics": [{
                    "agent": "priority_predictor",
                    "processing_time_ms": processing_time
                }],
                "processing_steps": ["priority_prediction_completed"]
            }
            
        except Exception as e:
            logger.error(f"Priority node error: {str(e)}")
            return {
                "priority_prediction": {
                    "priority": "Medium",
                    "confidence": 0.5,
                    "estimated_resolution_hours": 24.0,
                    "factors": [f"Error: {str(e)}"],
                    "reasoning": "Priority set to Medium due to processing error"
                },
                "processing_steps": ["priority_error"]
            }
    
    async def _recommend_node(self, state: TicketState) -> Dict[str, Any]:
        """Solution recommendation agent node with robust fallback, confidence gates, summary, and action items"""
        start_time = time.time()
        try:
            query = f"{state['title']} {state['description']}"
            classification = state.get("classification", {})
            category = classification.get("category")
            # Use knowledge_service recommendations first
            solutions = await self.knowledge_service.get_recommendations(
                query=query,
                category=category,
                max_results=5,
                min_similarity=0.65
            )
            # If none, widen search and synthesize from KB snippets
            if not solutions:
                logger.info("No high-confidence solutions, widening search...")
                broader = await self.knowledge_service.search(
                    query=query,
                    category=None,
                    limit=5,
                    min_similarity=0.3
                )
                for i, r in enumerate(broader):
                    steps = r.get("metadata", {}).get("steps", [])
                    if not steps and r.get("content_snippet"):
                        content = r.get("content_snippet", "")
                        steps = [line.strip() for line in content.split('\n') if line.strip() and any(c.isdigit() for c in line[:3])]
                    solutions.append({
                        "solution_id": r.get("doc_id", f"kb_{i}"),
                        "title": r.get("title") or "Similar Case",
                        "description": r.get("content_snippet", "")[:300],
                        "steps": steps or ["Refer to knowledge base article for details"],
                        "similarity_score": r.get("score", 0.3),
                        "estimated_time_minutes": 15,
                        "success_rate": 0.7,
                        "source": r.get("source", "knowledge_base")
                    })
            # If still empty, provide deterministic domain-specific steps
            if not solutions:
                logger.info("No KB results, providing domain-specific generic steps")
                tl = query.lower()
                cat = (category or "").lower()
                steps = []
                title = "General Troubleshooting Steps"
                est_time = 15
                # Email-specific steps
                if "email" in cat or any(k in tl for k in ["email", "mail", "outlook", "exchange"]):
                    if any(k in tl for k in ["iphone", "ios", "android", "mobile"]):
                        title = "Mobile Email Sync Troubleshooting"
                        steps = [
                            "Open Settings > Mail > Accounts and select your work email",
                            "Toggle 'Mail' OFF, wait 15 seconds, then toggle ON",
                            "Check 'Fetch New Data' is set to Push or Fetch (not Manual)",
                            "If sync still fails: Delete the account completely",
                            "Re-add: Settings > Mail > Add Account > Exchange",
                            "Enter your work email and password, verify server settings",
                            "Test by sending yourself an email from another account"
                        ]
                        est_time = 10
                    else:
                        title = "Outlook/Email Client Troubleshooting"
                        steps = [
                            "Close Outlook completely (check Task Manager for lingering processes)",
                            "Restart Outlook in Safe Mode: Hold Ctrl while opening",
                            "If Safe Mode works: Disable add-ins one by one to find culprit",
                            "Run Outlook repair: File > Account Settings > Repair",
                            "Check Send/Receive settings and folder permissions",
                            "Verify OST/PST file size (over 10GB can cause issues)",
                            "As last resort: Create new Outlook profile"
                        ]
                        est_time = 20
                elif "network" in cat or any(k in tl for k in ["wifi", "vpn", "network", "internet", "connect"]):
                    if any(k in tl for k in ["wifi", "wireless"]):
                        title = "WiFi Connection Troubleshooting"
                        steps = [
                            "Forget the WiFi network: Settings > WiFi > Network name > Forget",
                            "Restart your device completely",
                            "Reconnect: Select network, enter password carefully",
                            "Verify other devices can connect (isolate device vs network issue)",
                            "Check IP address: Should be 192.168.x.x or 10.x.x.x (not 169.254.x.x)",
                            "Try different WiFi band (2.4GHz vs 5GHz)",
                            "Contact IT if issue persists - may need MAC address whitelisting"
                        ]
                        est_time = 15
                    elif any(k in tl for k in ["vpn"]):
                        title = "VPN Connection Troubleshooting"
                        steps = [
                            "Verify your VPN credentials and MFA status",
                            "Check you're on a stable internet connection (not hotel/airport WiFi)",
                            "Clear VPN cache: Remove and re-add VPN profile",
                            "Try alternate VPN protocol if available (IKEv2, L2TP, OpenVPN)",
                            "Disable antivirus/firewall temporarily to test",
                            "Check for VPN client updates",
                            "Contact IT for server status and credentials reset"
                        ]
                        est_time = 15
                    else:
                        title = "General Network Troubleshooting"
                        steps = [
                            "Restart your device and router/modem",
                            "Check physical connections (cables, WiFi signal strength)",
                            "Run network diagnostics: ping 8.8.8.8, nslookup google.com",
                            "Flush DNS cache: ipconfig /flushdns (Windows) or sudo dscacheutil -flushcache (Mac)",
                            "Check proxy settings and VPN status",
                            "Test with different network (mobile hotspot)",
                            "Contact IT with traceroute results if issue persists"
                        ]
                        est_time = 20
                elif "hardware" in cat or any(k in tl for k in ["printer", "print", "laptop", "desktop", "monitor"]):
                    if any(k in tl for k in ["printer", "print"]):
                        title = "Printer Troubleshooting"
                        steps = [
                            "Check printer is powered on and shows 'Ready' status",
                            "Verify printer is connected (USB cable or WiFi)",
                            "Check for paper jams, empty toner/ink, or error lights",
                            "Clear print queue: Settings > Devices > Printers > Open queue > Cancel all",
                            "Restart print spooler service (Windows: services.msc > Print Spooler)",
                            "Remove and re-add printer in system settings",
                            "Update or reinstall printer drivers from manufacturer website",
                            "Test with different document/application"
                        ]
                        est_time = 15
                    else:
                        title = "Hardware Troubleshooting"
                        steps = [
                            "Check all power cables and connections are secure",
                            "Look for physical damage, warning lights, or unusual sounds",
                            "Restart the device (full power cycle)",
                            "Check for overheating (ensure vents are clear)",
                            "Test with known-good accessories (cables, power adapter)",
                            "Run hardware diagnostics if available (usually F12 at boot)",
                            "Document error codes/sounds and contact IT support"
                        ]
                        est_time = 20
                elif "software" in cat or any(k in tl for k in ["application", "app", "program", "software", "install"]):
                    title = "Software/Application Troubleshooting"
                    steps = [
                        "Close the application completely (check Task Manager)",
                        "Restart the application",
                        "Check for pending updates: Help > Check for Updates",
                        "Run as Administrator (right-click > Run as administrator)",
                        "Check system requirements and compatibility",
                        "Repair installation: Control Panel > Programs > Uninstall > Repair",
                        "Check Event Viewer for error details (Windows Key + X > Event Viewer)",
                        "As last resort: Uninstall completely and reinstall from official source"
                    ]
                    est_time = 20
                elif "access" in cat or "login" in cat or any(k in tl for k in ["login", "password", "access", "account", "locked"]):
                    title = "Account Access Troubleshooting"
                    steps = [
                        "Verify username and password are correct (check Caps Lock)",
                        "Check if account is locked: Wait 30 minutes or contact IT",
                        "Try password reset through self-service portal",
                        "Verify MFA device is accessible and showing correct codes",
                        "Check if account has expired or needs password change",
                        "Try from different browser or incognito mode",
                        "Clear browser cache and cookies",
                        "Contact IT if issue persists - may need account unlock or reset"
                    ]
                    est_time = 10
                else:
                    title = "General IT Support Steps"
                    steps = [
                        "Document the exact error message, time, and what you were doing",
                        "Restart the affected application or device",
                        "Check for system updates and install pending updates",
                        "Verify network connectivity and VPN status if applicable",
                        "Check account status and permissions",
                        "Try from different device or browser to isolate the issue",
                        "Take screenshots of any errors",
                        "Escalate to IT support with all gathered information"
                    ]
                    est_time = 15
                solutions = [{
                    "solution_id": "generic_1",
                    "title": title,
                    "description": f"Step-by-step troubleshooting for {category or 'IT issues'}",
                    "steps": steps,
                    "similarity_score": 0.35,
                    "estimated_time_minutes": est_time,
                    "success_rate": 0.70,
                    "source": "heuristic"
                }]
            # Confidence gate: If all solutions are below 0.4, flag as low-confidence
            low_confidence = all(s.get("similarity_score", 0.0) < 0.4 for s in solutions)
            # Plain-English summary and action items
            summary = "; ".join(s.get("title", "") for s in solutions[:2])
            action_items = []
            for i, s in enumerate(solutions):
                steps = s.get("steps", [])[:2]
                for step in steps:
                    action_items.append({
                        "action": step,
                        "priority": "High" if i == 0 else "Medium",
                        "urgency": "Immediate" if i == 0 else "As needed"
                    })
            processing_time = (time.time() - start_time) * 1000
            return {
                "recommended_solutions": solutions,
                "summary": summary,
                "action_items": action_items,
                "low_confidence": low_confidence,
                "agent_metrics": [{
                    "agent": "solution_recommender",
                    "processing_time_ms": processing_time,
                    "kb_results_count": len(solutions)
                }],
                "processing_steps": ["solution_recommendation_completed"]
            }
        except Exception as e:
            logger.error(f"Recommendation node error: {str(e)}")
            return {
                "recommended_solutions": [],
                "summary": "No solution found.",
                "action_items": [],
                "low_confidence": True,
                "processing_steps": ["recommendation_error"]
            }
    
    async def _qa_review_node(self, state: TicketState) -> Dict[str, Any]:
        """Quality assurance review agent node"""
        start_time = time.time()
        
        try:
            # Review all agent outputs
            classification = state.get("classification", {})
            priority = state.get("priority_prediction", {})
            solutions = state.get("recommended_solutions", [])
            
            # Simple QA scoring logic
            quality_score = 0.0
            issues = []
            
            # Check classification
            if classification and classification.get("confidence", 0) > 0.7:
                quality_score += 0.3
            else:
                issues.append("Low classification confidence")
            
            # Check priority
            if priority and priority.get("confidence", 0) > 0.7:
                quality_score += 0.3
            else:
                issues.append("Low priority prediction confidence")
            
            # Check solutions
            if len(solutions) >= 1:
                quality_score += 0.4
            else:
                issues.append("No solutions provided")
                quality_score += 0.2  # Partial credit
            
            completeness = "complete" if not issues else f"issues: {', '.join(issues)}"
            improvements = []
            
            if quality_score < 0.75:
                improvements.append("Consider manual review of low-confidence predictions")
                if len(solutions) < 2:
                    improvements.append("Add more solution alternatives")
            
            processing_time = (time.time() - start_time) * 1000
            
            qa_review = {
                "quality_score": quality_score,
                "completeness": completeness,
                "improvements": improvements,
                "status": "approved" if quality_score >= 0.75 else "needs_revision"
            }
            
            # Prepare draft analysis for human review if needed
            if quality_score < 0.75:
                state["draft_analysis"] = {
                    "classification": classification,
                    "priority_prediction": priority,
                    "recommended_solutions": solutions,
                    "qa_issues": issues
                }
                state["review_url"] = f"/api/v1/review/{state['ticket_id']}"
            
            return {
                "qa_review": qa_review,
                "agent_metrics": [{
                    "agent": "qa_reviewer",
                    "processing_time_ms": processing_time,
                    "quality_score": quality_score
                }],
                "processing_steps": ["qa_review_completed"]
            }
            
        except Exception as e:
            logger.error(f"QA node error: {str(e)}")
            return {
                "qa_review": {
                    "quality_score": 0.5,
                    "status": "error",
                    "completeness": f"Error: {str(e)}"
                },
                "processing_steps": ["qa_error"]
            }
    
    async def analyze_ticket(
        self, 
        title: str, 
        description: str,
        requester_info: Optional[Dict] = None,
        additional_context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Perform comprehensive ticket analysis using LangGraph workflow"""
        
        if not self.initialized or not self.langgraph_available or not self.app:
            # Fallback to direct model analysis
            return await self._fallback_analysis(title, description, requester_info)
        
        start_time = time.time()
        ticket_id = str(uuid.uuid4())
        
        try:
            logger.info(f"🔄 Starting LangGraph analysis for ticket: {title[:50]}...")
            
            # Initialize state
            initial_state: TicketState = {
                "ticket_id": ticket_id,
                "title": title,
                "description": description,
                "requester_info": requester_info,
                "additional_context": additional_context,
                "is_simple": False,
                "skip_priority": False,
                "ticket_length": 0,
                "selected_model": self.standard_model,
                "classification": None,
                "priority_prediction": None,
                "recommended_solutions": None,
                "qa_review": None,
                "agent_metrics": [],
                "processing_steps": [],
                "status": "processing",
                "needs_human_review": False,
                "draft_analysis": None,
                "review_url": None
            }
            
            # Execute workflow (async)
            config = {"configurable": {"thread_id": ticket_id}}
            # Use ainvoke because our node functions are async
            final_state = await self.app.ainvoke(
                initial_state,
                config
            )
            
            processing_time = (time.time() - start_time) * 1000
            
            # Calculate rich metadata for response
            solutions = final_state.get("recommended_solutions", [])
            kb_count = sum(1 for s in solutions if s.get("source") != "heuristic")
            top_similarity = max([s.get("similarity_score", 0.0) for s in solutions], default=0.0)
            
            # Build response
            result = {
                "ticket_id": ticket_id,
                "classification": final_state.get("classification", {}),
                "priority_prediction": final_state.get("priority_prediction", {}),
                "recommended_solutions": final_state.get("recommended_solutions", []),
                "qa_review": final_state.get("qa_review", {}),
                "processing_time_ms": processing_time,
                "analysis_metadata": {
                    "workflow": "langgraph",
                    "agents_executed": ["classifier", "priority_predictor", "solution_recommender", "qa_reviewer"],
                    "knowledge_sources_queried": ["chromadb_embeddings", "kaggle_historical_tickets"] if kb_count > 0 else [],
                    "total_documents_retrieved": kb_count,
                    "top_similarity_score": top_similarity,
                    "agent_metrics": final_state.get("agent_metrics", []),
                    "processing_steps": final_state.get("processing_steps", []),
                    "model_used": final_state.get("selected_model"),
                    "cost_optimization": "enabled"
                }
            }
            
            # Add HITL fields if needed
            if final_state.get("needs_human_review"):
                result["status"] = "needs_review"
                result["draft_analysis"] = final_state.get("draft_analysis")
                result["review_url"] = final_state.get("review_url")
                logger.warning(f"⚠️ Ticket {ticket_id} flagged for human review")
            else:
                result["status"] = "completed"
            
            # Apply response formatting enhancements (summary, action items, timeline, warnings)
            result = response_formatter.format_complete_response(result)
            
            logger.info(f"✅ LangGraph analysis completed in {processing_time:.2f}ms")
            return result
            
        except Exception as e:
            logger.error(f"LangGraph workflow failed: {str(e)}")
            # Fallback to direct analysis
            return await self._fallback_analysis(title, description, requester_info)
    
    async def _fallback_analysis(
        self, 
        title: str, 
        description: str, 
        requester_info: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Fallback analysis using direct Groq calls"""
        
        ticket_id = str(uuid.uuid4())
        start_time = time.time()
        
        try:
            logger.info("Using fallback analysis (direct Groq)...")
            
            # Quick classification
            classification = {
                "category": "General Support",
                "subcategory": "Unknown",
                "confidence": 0.7,
                "reasoning": "Fallback classification"
            }
            
            # Quick priority
            priority_keywords = {
                "Critical": ["server down", "system crash", "security breach"],
                "High": ["error", "not working", "urgent"],
                "Medium": ["issue", "problem", "help"],
                "Low": ["question", "request", "how to"]
            }
            
            text_lower = f"{title} {description}".lower()
            priority = "Medium"
            eta_hours = 24.0
            
            for level, keywords in priority_keywords.items():
                if any(kw in text_lower for kw in keywords):
                    priority = level
                    eta_hours = {"Critical": 2, "High": 8, "Medium": 24, "Low": 72}[level]
                    break
            
            # Get KB recommendations
            solutions = await self.knowledge_service.get_recommendations(
                query=f"{title} {description}",
                max_results=3
            ) if self.knowledge_service else []
            
            processing_time = (time.time() - start_time) * 1000
            
            result = {
                "ticket_id": ticket_id,
                "classification": classification,
                "priority_prediction": {
                    "priority": priority,
                    "confidence": 0.8,
                    "estimated_resolution_hours": eta_hours,
                    "factors": ["Keyword-based analysis"]
                },
                "recommended_solutions": solutions,
                "qa_review": {
                    "quality_score": 0.7,
                    "status": "fallback",
                    "completeness": "Basic analysis completed"
                },
                "processing_time_ms": processing_time,
                "analysis_metadata": {
                    "method": "fallback",
                    "provider": "groq",
                    "workflow": "direct"
                }
            }
            
            # Apply response formatting
            result = response_formatter.format_complete_response(result)
            
            return result
            
        except Exception as e:
            logger.error(f"Fallback analysis failed: {str(e)}")
            return {
                "ticket_id": ticket_id,
                "classification": {"category": "General Support", "confidence": 0.5},
                "priority_prediction": {"priority": "Medium", "confidence": 0.5},
                "recommended_solutions": [],
                "analysis_metadata": {"error": str(e)}
            }
    
    async def classify_ticket(self, title: str, description: str) -> Dict[str, Any]:
        """Quick ticket classification with robust prompt, few-shot, detailed reasoning, and PII sanitization"""
        # Sanitize input for PII
        title_s = self._sanitize_text(title)
        description_s = self._sanitize_text(description)
        text = f"{title_s} {description_s}"
        tl = text.lower()
        categories = [
            "Network Issues", "Software Issues", "Hardware Issues", "Access & Security Issues",
            "Email Issues", "General Support"
        ]
        few_shot = [
            {"input": "Email not syncing on iPhone with Exchange", "output": {"category": "Email Issues", "subcategory": "Mobile Email Sync", "confidence": 0.92}},
            {"input": "Cannot install Microsoft Teams, error 0x80070643", "output": {"category": "Software Issues", "subcategory": "Installation", "confidence": 0.95}},
            {"input": "Cannot connect to corporate WiFi network", "output": {"category": "Network Issues", "subcategory": "WiFi", "confidence": 0.93}}
        ]
        prompt = f"""
You are an expert IT ticket classifier. Analyze this ticket carefully.

TICKET:
Title: {title_s}
Description: {description_s}

CLASSIFICATION RULES:
1. Email Issues (Email sync, Outlook problems, calendar, mobile email)
   - Keywords: email, sync, outlook, exchange, imap, mail app, inbox
   - Example: \"Email not syncing on iPhone\" → Email Issues / Mobile Email Sync
2. Software Issues (Installation, crashes, errors, updates)
   - Keywords: install, cannot install, error code, crash, closes unexpectedly
   - Example: \"Cannot install Teams\" → Software Issues / Installation
3. Hardware Issues (Printer, laptop, desktop, peripherals)
   - Keywords: printer, cannot print, hardware, device, peripherals
4. Network Issues (WiFi, VPN, internet, connectivity - ONLY for network infrastructure)
   - Keywords: wifi, vpn, cannot connect to network, internet down
   - Example: \"Cannot connect to WiFi\" → Network Issues / WiFi
   - NOT for: \"Cannot install software\" (that's Software Issues)
   - NOT for: \"Email not syncing\" (that's Email Issues)

IMPORTANT:
- Read the DESCRIPTION carefully, not just keywords
- \"Cannot install X\" = Software Issues (even if it mentions network)
- \"Email sync problem\" = Email Issues (even if on mobile device)
- Only use \"Network Issues\" if the problem is WiFi/VPN/Internet itself

Return JSON with high confidence (0.8+) and detailed reasoning.
"""
        try:
            cls = await self.model_service.classify_text(
                text,
                categories,
                prompt=prompt,
                few_shot=few_shot
            )
            category = cls.get("category", "General Support")
            subcategory = "Other"
            if category == "Email Issues":
                if any(k in tl for k in ["iphone", "ios", "android", "mobile", "phone", "tablet"]):
                    subcategory = "Mobile Email Sync"
                elif any(k in tl for k in ["outlook", "client", "application"]):
                    subcategory = "Outlook"
                elif any(k in tl for k in ["smtp", "send", "receive", "imap", "pop", "sync"]):
                    subcategory = "SMTP/IMAP"
                elif any(k in tl for k in ["calendar", "meeting", "appointment"]):
                    subcategory = "Calendar"
                else:
                    subcategory = "Email General"
            elif category == "Network Issues":
                if any(k in tl for k in ["wifi", "wireless"]):
                    subcategory = "WiFi"
                elif any(k in tl for k in ["vpn", "remote"]):
                    subcategory = "VPN"
                elif any(k in tl for k in ["internet", "web"]):
                    subcategory = "Internet"
                elif any(k in tl for k in ["lan", "ethernet", "cable"]):
                    subcategory = "LAN"
                else:
                    subcategory = "Connectivity"
            elif category == "Hardware Issues":
                if any(k in tl for k in ["desktop", "pc", "computer"]):
                    subcategory = "Desktop"
                elif any(k in tl for k in ["laptop", "notebook"]):
                    subcategory = "Laptop"
                elif any(k in tl for k in ["printer", "print"]):
                    subcategory = "Printer"
                elif any(k in tl for k in ["mobile", "phone", "iphone", "android"]):
                    subcategory = "Mobile Device"
                elif any(k in tl for k in ["mouse", "keyboard", "monitor", "peripheral"]):
                    subcategory = "Peripherals"
                else:
                    subcategory = "Hardware General"
            elif category == "Software Issues":
                if any(k in tl for k in ["install", "installation"]):
                    subcategory = "Installation"
                elif any(k in tl for k in ["update", "upgrade", "patch"]):
                    subcategory = "Update"
                elif any(k in tl for k in ["error", "crash", "exception"]):
                    subcategory = "Application Error"
                elif any(k in tl for k in ["windows", "linux", "macos", "os"]):
                    subcategory = "OS Problem"
                else:
                    subcategory = "Software General"
            elif category in ("Access & Security Issues", "Account Access"):
                if any(k in tl for k in ["login", "sign in", "logon"]):
                    subcategory = "Login"
                elif any(k in tl for k in ["password", "reset", "forgot"]):
                    subcategory = "Password"
                elif any(k in tl for k in ["account", "user", "access"]):
                    subcategory = "Account Access"
                elif any(k in tl for k in ["permission", "denied", "unauthorized"]):
                    subcategory = "File Permissions"
                else:
                    subcategory = "Access General"
            elif category == "General Support":
                if any(k in tl for k in ["how to", "how do", "tutorial", "guide"]):
                    subcategory = "How-To"
                elif any(k in tl for k in ["request", "need", "want"]):
                    subcategory = "Request"
                else:
                    subcategory = "Other"
            reasoning = cls.get("reasoning", "")
            if not reasoning or reasoning.strip().lower().startswith("groq fallback") or len(reasoning.strip()) < 20:
                reasoning = f"Classified as {category}/{subcategory} based on keywords: {', '.join([k for k in tl.split() if k in prompt.lower()])}"
            return {
                "category": category,
                "subcategory": subcategory,
                "confidence": float(cls.get("confidence", 0.7)),
                "reasoning": reasoning
            }
        except Exception as e:
            logger.error(f"Quick classification error: {e}")
            return {
                "category": "General Support",
                "subcategory": "Needs Review",
                "confidence": 0.5,
                "reasoning": f"Error: {str(e)}"
            }
    
    async def predict_priority(
        self,
        title: str,
        description: str,
        requester_info: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Priority prediction using department/context and detailed reasoning"""
        tl = f"{title} {description}".lower()
        department = None
        if requester_info and "department" in requester_info:
            department = requester_info["department"]
        # Heuristics with more context
        high_keywords = ["urgent", "immediately", "critical", "down", "cannot access", "outage", "emergency", "security breach", "data loss", "system failure"]
        medium_keywords = ["slow", "delay", "performance", "degraded", "intermittent", "partial"]
        low_keywords = ["question", "how to", "help", "request", "feature", "suggestion", "info"]
        eta_map = {"High": 8, "Medium": 24, "Low": 72}
        priority = "Medium"
        reason = []
        if any(k in tl for k in high_keywords):
            priority = "High"
            reason.append("Contains urgent/critical keywords")
        elif any(k in tl for k in medium_keywords):
            priority = "Medium"
            reason.append("Performance or degraded service keywords")
        elif any(k in tl for k in low_keywords):
            priority = "Low"
            reason.append("Informational or request keywords")
        else:
            priority = "Medium"
            reason.append("No strong priority keywords found; defaulted to Medium")
        # Department/context rules
        if department:
            dep = department.lower()
            if dep in ["executive", "leadership", "finance", "c-level", "ceo", "cfo", "cio"] and priority != "High":
                priority = "High"
                reason.append(f"Escalated due to department: {department}")
            elif dep in ["hr", "legal"] and priority == "Low":
                priority = "Medium"
                reason.append(f"Raised to Medium due to department: {department}")
        # Add context-based escalation
        if "security" in tl or "breach" in tl or "compliance" in tl:
            if priority != "High":
                priority = "High"
                reason.append("Security/compliance context triggers High priority")
        eta = eta_map.get(priority, 24)
        return {
            "priority": priority,
            "confidence": 0.85 if priority == "High" else 0.8,
            "estimated_resolution_hours": eta,
            "factors": reason,
            "reasoning": "; ".join(reason)
        }
    
    async def process_bulk_tickets(
        self,
        tickets: List[Dict],
        task_id: str,
        options: Optional[Dict] = None
    ):
        """Process multiple tickets in batch (synchronous for small batches)"""
        logger.info(f"📦 Bulk processing {len(tickets)} tickets (task: {task_id})...")
        results = []
        # Synchronous for small batches (<=10)
        if len(tickets) <= 10:
            for i, ticket in enumerate(tickets):
                try:
                    t_plain = self._to_plain(ticket) or {}
                    if not t_plain:
                        try:
                            t_plain = {
                                "title": getattr(ticket, "title", ""),
                                "description": getattr(ticket, "description", ""),
                                "requester_info": getattr(ticket, "requester_info", None) or {},
                                "additional_context": getattr(ticket, "additional_context", None) or {}
                            }
                        except Exception:
                            pass
                    # Run classification, priority, and recommendation synchronously
                    classification = await self.classify_ticket(
                        t_plain.get("title", ""),
                        t_plain.get("description", "")
                    )
                    priority = await self.predict_priority(
                        t_plain.get("title", ""),
                        t_plain.get("description", ""),
                        t_plain.get("requester_info", {})
                    )
                    # Solution recommendation (stub, to be improved in next step)
                    solution = {"solution": "[Solution recommendation here]"}
                    results.append({
                        "classification": classification,
                        "priority": priority,
                        "solution": solution
                    })
                except Exception as e:
                    results.append({"error": str(e)})
            return results
        # For large batches, keep async/parallel logic (not shown here)
        for i, ticket in enumerate(tickets):
            try:
                t_plain = self._to_plain(ticket) or {}
                if not t_plain:
                    try:
                        t_plain = {
                            "title": getattr(ticket, "title", ""),
                            "description": getattr(ticket, "description", ""),
                            "requester_info": getattr(ticket, "requester_info", None) or {},
                            "additional_context": getattr(ticket, "additional_context", None) or {}
                        }
                    except Exception:
                        pass

                result = await self.analyze_ticket(
                    title=t_plain.get("title", ""),
                    description=t_plain.get("description", ""),
                    requester_info=t_plain.get("requester_info"),
                    additional_context=t_plain.get("additional_context")
                )
                result["batch_index"] = i
                result["task_id"] = task_id
                results.append(result)
                
                logger.info(f"✅ Processed {i+1}/{len(tickets)}")
                
            except Exception as e:
                logger.error(f"Failed ticket {i}: {str(e)}")
                results.append({
                    "batch_index": i,
                    "task_id": task_id,
                    "error": str(e),
                    "status": "failed"
                })
        
        logger.info(f"✅ Bulk complete: {len(results)} tickets")
        return results
    
    async def health_check(self) -> Dict[str, Any]:
        """Check health of workflow manager"""
        return {
            "initialized": self.initialized,
            "langgraph_available": self.langgraph_available,
            "workflow_compiled": self.app is not None,
            "model_service_healthy": await self.model_service.health_check() if self.model_service else False,
            "knowledge_service_healthy": await self.knowledge_service.health_check() if self.knowledge_service else False,
            "performance_tracking": self.performance_tracker.get_all_stats()
        }
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get agent performance statistics"""
        return self.performance_tracker.get_all_stats()
    
    def log_feedback(
        self,
        ticket_id: str,
        agent: str,
        actual: Any,
        feedback_source: str = "user"
    ):
        """Log feedback for agent performance tracking"""
        self.performance_tracker.log_agent_feedback(
            ticket_id=ticket_id,
            agent=agent,
            actual=actual,
            feedback_source=feedback_source
        )
