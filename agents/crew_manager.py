"""
CrewAI Multi-Agent Manager for IT Ticket Analysis - FIXED
"""

import asyncio
from typing import Dict, List, Any, Optional
import time
import logging
from datetime import datetime
import uuid
from pydantic import Field

try:
    from crewai import Agent, Task, Crew, Process
    from crewai.tools import BaseTool
    from crewai_tools import SerperDevTool, WebsiteSearchTool
    CREWAI_AVAILABLE = True
except ImportError:
    # Fallback if CrewAI is not available
    print("CrewAI not available, using fallback implementation")
    CREWAI_AVAILABLE = False
    
    # Create mock classes for fallback
    class BaseTool:
        def __init__(self, **kwargs):
            pass
    class Agent:
        def __init__(self, **kwargs):
            pass
    class Task:
        def __init__(self, **kwargs):
            pass
    class Crew:
        def __init__(self, **kwargs):
            pass

from core.config import Settings
from services.model_service import ModelService
from services.knowledge_service import KnowledgeService
from utils.logger import setup_logger

logger = setup_logger(__name__)

class KnowledgeSearchTool(BaseTool):
    """Custom tool for searching the knowledge base"""
    
    name: str = "knowledge_search"
    description: str = "Search the IT knowledge base for solutions and documentation. Input should be a search query string."
    
    # Fix: Properly define the knowledge_service as a Field
    knowledge_service: Any = Field(description="Knowledge service instance")
    
    def __init__(self, knowledge_service: 'KnowledgeService', **kwargs):
        # Fix: Pass knowledge_service through kwargs
        super().__init__(knowledge_service=knowledge_service, **kwargs)
    
    def _run(self, query: str) -> str:
        """Search the knowledge base"""
        try:
            # Fix: Use asyncio.run properly and handle the async call
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                results = loop.run_until_complete(
                    self.knowledge_service.search(
                        query=query,
                        category=None,
                        limit=5
                    )
                )
            finally:
                loop.close()
            
            if not results:
                return "No relevant solutions found in the knowledge base."
            
            formatted_results = []
            for result in results:
                formatted_results.append(
                    f"Title: {result['title']}\n"
                    f"Category: {result.get('category', 'N/A')}\n"
                    f"Content: {result['content_snippet']}\n"
                    f"Score: {result['score']:.2f}\n"
                    f"---"
                )
            
            return "\n".join(formatted_results)
            
        except Exception as e:
            logger.error(f"Knowledge search tool error: {str(e)}")
            return f"Error searching knowledge base: {str(e)}"

class SimilarTicketTool(BaseTool):
    """Tool for finding similar historical tickets"""
    
    name: str = "similar_tickets"
    description: str = "Find similar historical tickets and their resolutions. Input should be a ticket description string."
    
    # Fix: Properly define the knowledge_service as a Field
    knowledge_service: Any = Field(description="Knowledge service instance")
    
    def __init__(self, knowledge_service: 'KnowledgeService', **kwargs):
        # Fix: Pass knowledge_service through kwargs
        super().__init__(knowledge_service=knowledge_service, **kwargs)
    
    def _run(self, ticket_description: str) -> str:
        """Find similar tickets"""
        try:
            # Fix: Use asyncio.run properly
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                results = loop.run_until_complete(
                    self.knowledge_service.search(
                        query=ticket_description,
                        category=None,
                        limit=3
                    )
                )
            finally:
                loop.close()
            
            if not results:
                return "No similar tickets found."
            
            formatted_results = []
            for result in results:
                if result.get('metadata', {}).get('type') == 'ticket':
                    formatted_results.append(
                        f"Similar Ticket: {result['title']}\n"
                        f"Resolution: {result['content_snippet']}\n"
                        f"Similarity: {result['score']:.2f}\n"
                        f"---"
                    )
            
            return "\n".join(formatted_results) if formatted_results else "No similar tickets found."
            
        except Exception as e:
            logger.error(f"Similar tickets tool error: {str(e)}")
            return f"Error finding similar tickets: {str(e)}"

class CrewManager:
    """Manages the multi-agent crew for ticket analysis"""
    
    def __init__(
        self, 
        settings: Settings,
        model_service: ModelService,
        knowledge_service: KnowledgeService
    ):
        self.settings = settings
        self.model_service = model_service
        self.knowledge_service = knowledge_service
        self.agents = {}
        self.tools = {}
        self.crew = None
        self.initialized = False
        self.crewai_available = CREWAI_AVAILABLE
        
    async def initialize(self):
        """Initialize the crew and agents"""
        try:
            logger.info("Initializing CrewAI agents...")
            
            if not self.crewai_available:
                logger.warning("CrewAI not available, using fallback mode")
                self.initialized = True
                return
            
            # Initialize tools
            await self._initialize_tools()
            
            # Create agents
            await self._create_agents()
            
            # Create crew
            await self._create_crew()
            
            self.initialized = True
            logger.info("✅ CrewAI agents initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize CrewAI: {str(e)}")
            # Don't raise, just use fallback
            self.initialized = True
    
    async def _initialize_tools(self):
        """Initialize tools for agents"""
        try:
            # Fix: Only create tools if we have knowledge service
            if self.knowledge_service and self.knowledge_service.initialized:
                self.tools = {
                    'knowledge_search': KnowledgeSearchTool(self.knowledge_service),
                    'similar_tickets': SimilarTicketTool(self.knowledge_service)
                }
                
                # Add web search if available
                try:
                    if hasattr(self.settings, 'serper_api_key') and self.settings.serper_api_key:
                        self.tools['web_search'] = SerperDevTool()
                    else:
                        logger.info("SerperDevTool API key not configured")
                except Exception as serper_error:
                    logger.warning(f"SerperDevTool not available: {serper_error}")
                    
                logger.info(f"Initialized {len(self.tools)} tools")
            else:
                logger.warning("Knowledge service not available, skipping tool creation")
                self.tools = {}
                
        except Exception as e:
            logger.error(f"Tool initialization error: {str(e)}")
            self.tools = {}
    
    async def _create_agents(self):
        """Create AI agents for different tasks"""
        try:
            # Fix: Check if we have valid tools before creating agents
            available_tools = list(self.tools.values())
            knowledge_tool = self.tools.get('knowledge_search')
            similar_tickets_tool = self.tools.get('similar_tickets')
            
            # Ticket Classifier Agent
            self.agents['classifier'] = Agent(
                role="Ticket Classification Specialist",
                goal="Accurately classify IT support tickets into appropriate categories and subcategories",
                backstory="""You are an experienced IT support specialist with deep knowledge of 
                technical issues. You excel at quickly identifying the root cause category of problems 
                based on user descriptions. You have years of experience in IT helpdesk operations.""",
                tools=[knowledge_tool] if knowledge_tool else [],  # Fix: Only add valid tools
                verbose=getattr(self.settings, 'crew_verbose', True),
                allow_delegation=False,
                max_iter=3
            )
            
            # Priority Predictor Agent  
            self.agents['priority_predictor'] = Agent(
                role="Priority Assessment Expert",
                goal="Determine ticket priority levels and estimate resolution times accurately",
                backstory="""You are a seasoned IT manager who excels at triaging support requests.
                You understand business impact, urgency factors, and resource allocation. You can 
                quickly assess which issues need immediate attention and estimate realistic resolution times.""",
                tools=[similar_tickets_tool] if similar_tickets_tool else [],  # Fix: Only add valid tools
                verbose=getattr(self.settings, 'crew_verbose', True),
                allow_delegation=False,
                max_iter=3
            )
            
            # Solution Recommender Agent
            self.agents['solution_recommender'] = Agent(
                role="Solution Architecture Specialist", 
                goal="Provide accurate, step-by-step solutions for IT issues",
                backstory="""You are a senior technical support engineer with extensive troubleshooting
                experience across all IT domains. You excel at providing clear, actionable solutions
                and can adapt your recommendations based on user technical skill levels.""",
                tools=[tool for tool in [knowledge_tool, similar_tickets_tool] if tool],  # Fix: Filter None tools
                verbose=getattr(self.settings, 'crew_verbose', True),
                allow_delegation=False,
                max_iter=5
            )
            
            # Analytics Agent
            self.agents['analyst'] = Agent(
                role="IT Analytics Specialist",
                goal="Analyze patterns, trends, and generate insights from ticket data",
                backstory="""You are a data analyst specializing in IT operations. You identify
                trends, bottlenecks, and opportunities for improvement in IT support processes.
                You provide actionable insights for management decision-making.""",
                tools=[],  # No tools needed for analytics
                verbose=getattr(self.settings, 'crew_verbose', True),
                allow_delegation=False,
                max_iter=3
            )
            
            # Quality Assurance Agent
            self.agents['qa_reviewer'] = Agent(
                role="Quality Assurance Reviewer",
                goal="Review and validate the analysis results for accuracy and completeness",
                backstory="""You are a quality assurance specialist with expertise in IT support
                processes. You ensure that all analysis results meet quality standards and provide
                comprehensive, accurate information.""",
                tools=[knowledge_tool] if knowledge_tool else [],  # Fix: Only add valid tools
                verbose=getattr(self.settings, 'crew_verbose', True),
                allow_delegation=False,
                max_iter=2
            )
            
            logger.info(f"Created {len(self.agents)} agents successfully")
            
        except Exception as e:
            logger.error(f"Agent creation error: {str(e)}")
            # Fallback to empty agents dict
            self.agents = {}
    
    async def _create_crew(self):
        """Create the crew with defined processes"""
        try:
            if not self.agents:
                logger.warning("No agents available, skipping crew creation")
                return
            
            # Define the crew (we'll create tasks dynamically)
            agent_list = list(self.agents.values())
            
            # Fix: Add proper process configuration
            self.crew = Crew(
                agents=agent_list,
                tasks=[],  # Tasks will be added dynamically
                process=Process.sequential,
                memory=getattr(self.settings, 'crew_memory', True),
                verbose=getattr(self.settings, 'crew_verbose', True)
            )
            
            logger.info("Crew created successfully")
            
        except Exception as e:
            logger.error(f"Crew creation error: {str(e)}")
            self.crew = None
    
    async def analyze_ticket(
        self, 
        title: str, 
        description: str,
        requester_info: Optional[Dict] = None,
        additional_context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Perform comprehensive ticket analysis using multi-agent system"""
        
        if not self.initialized or not self.crew or not self.crewai_available:
            # Fallback to direct model analysis
            return await self._fallback_analysis(title, description, requester_info)
        
        start_time = time.time()
        ticket_id = str(uuid.uuid4())
        
        try:
            logger.info(f"Starting multi-agent analysis for ticket: {title[:50]}...")
            
            # Create tasks for the crew
            tasks = await self._create_analysis_tasks(
                title, description, requester_info, additional_context
            )
            
            if not tasks:
                logger.warning("No tasks created, falling back to direct analysis")
                return await self._fallback_analysis(title, description, requester_info)
            
            # Update crew with tasks
            self.crew.tasks = tasks
            
            # Execute the crew
            result = await self._execute_crew()
            
            # Process results
            analysis_result = await self._process_crew_results(result, ticket_id)
            
            processing_time = (time.time() - start_time) * 1000
            analysis_result['processing_time_ms'] = processing_time
            
            logger.info(f"✅ Ticket analysis completed in {processing_time:.2f}ms")
            return analysis_result
            
        except Exception as e:
            logger.error(f"Multi-agent analysis failed: {str(e)}")
            # Fallback to direct analysis
            return await self._fallback_analysis(title, description, requester_info)
    
    async def _create_analysis_tasks(
        self, 
        title: str, 
        description: str,
        requester_info: Optional[Dict] = None,
        additional_context: Optional[Dict] = None
    ) -> List[Task]:
        """Create tasks for ticket analysis"""
        
        context = f"Title: {title}\nDescription: {description}"
        if requester_info:
            context += f"\nRequester: {requester_info}"
        if additional_context:
            context += f"\nAdditional Context: {additional_context}"
        
        tasks = []
        
        # Get default categories and priorities
        ticket_categories = getattr(self.settings, 'ticket_categories', [
            'Hardware', 'Software', 'Network', 'Security', 'Access', 'General Support'
        ])
        priority_levels = getattr(self.settings, 'priority_levels', [
            'Critical', 'High', 'Medium', 'Low'
        ])
        
        # Classification Task
        if 'classifier' in self.agents:
            try:
                classification_task = Task(
                    description=f"""
                    Analyze the following IT support ticket and classify it:
                    
                    {context}
                    
                    Provide:
                    1. Primary category from: {', '.join(ticket_categories)}
                    2. Subcategory (specific technical area)
                    3. Confidence score (0.0-1.0)
                    4. Brief reasoning for the classification
                    
                    Format your response as JSON with keys: category, subcategory, confidence, reasoning
                    """,
                    agent=self.agents['classifier'],
                    expected_output="JSON formatted classification result"
                )
                tasks.append(classification_task)
            except Exception as e:
                logger.error(f"Failed to create classification task: {e}")
        
        # Priority Prediction Task
        if 'priority_predictor' in self.agents:
            try:
                priority_task = Task(
                    description=f"""
                    Analyze the following IT support ticket and predict its priority:
                    
                    {context}
                    
                    Consider:
                    1. Business impact
                    2. Urgency level
                    3. Number of affected users
                    4. Workaround availability
                    
                    Provide:
                    1. Priority level from: {', '.join(priority_levels)}
                    2. Estimated resolution time in hours
                    3. Confidence score (0.0-1.0)
                    4. Key factors influencing the priority
                    
                    Format your response as JSON with keys: priority, estimated_hours, confidence, factors
                    """,
                    agent=self.agents['priority_predictor'],
                    expected_output="JSON formatted priority prediction"
                )
                tasks.append(priority_task)
            except Exception as e:
                logger.error(f"Failed to create priority task: {e}")
        
        # Solution Recommendation Task
        if 'solution_recommender' in self.agents:
            try:
                solution_task = Task(
                    description=f"""
                    Analyze the following IT support ticket and recommend solutions:
                    
                    {context}
                    
                    Provide:
                    1. Step-by-step troubleshooting solutions
                    2. Alternative approaches if the first doesn't work
                    3. Preventive measures
                    4. Estimated difficulty level
                    
                    Use the knowledge search tool to find relevant solutions if available.
                    
                    Format your response as JSON with keys: solutions, alternatives, prevention, difficulty
                    """,
                    agent=self.agents['solution_recommender'],
                    expected_output="JSON formatted solution recommendations"
                )
                tasks.append(solution_task)
            except Exception as e:
                logger.error(f"Failed to create solution task: {e}")
        
        logger.info(f"Created {len(tasks)} analysis tasks")
        return tasks
    
    async def _execute_crew(self) -> Any:
        """Execute the crew and handle any errors"""
        try:
            # Since CrewAI might not support async execution directly
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, self.crew.kickoff)
            return result
            
        except Exception as e:
            logger.error(f"Crew execution failed: {str(e)}")
            raise
    
    async def _process_crew_results(self, crew_result: Any, ticket_id: str) -> Dict[str, Any]:
        """Process the results from crew execution"""
        try:
            # Parse crew results (this will depend on CrewAI's output format)
            analysis_result = {
                "ticket_id": ticket_id,
                "classification": {
                    "category": "General Support",
                    "subcategory": "Unknown",
                    "confidence": 0.5,
                    "reasoning": "Analysis completed"
                },
                "priority_prediction": {
                    "priority": "Medium",
                    "confidence": 0.7,
                    "estimated_resolution_hours": 24.0,
                    "factors": ["Standard support request"]
                },
                "recommended_solutions": [
                    {
                        "solution_id": "sol_001",
                        "title": "General Troubleshooting Steps",
                        "description": "Standard troubleshooting approach",
                        "steps": ["Identify the issue", "Apply standard fix", "Verify resolution"],
                        "similarity_score": 0.8,
                        "source": "knowledge_base"
                    }
                ],
                "analysis_metadata": {
                    "agents_used": list(self.agents.keys()),
                    "crew_result": str(crew_result) if crew_result else "No result"
                }
            }
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Result processing failed: {str(e)}")
            # Return basic structure
            return {
                "ticket_id": ticket_id,
                "classification": {"category": "General Support", "confidence": 0.5},
                "priority_prediction": {"priority": "Medium", "confidence": 0.5},
                "recommended_solutions": [],
                "analysis_metadata": {"error": str(e)}
            }
    
    async def _fallback_analysis(
        self, 
        title: str, 
        description: str, 
        requester_info: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Fallback analysis using direct model calls"""
        
        ticket_id = str(uuid.uuid4())
        start_time = time.time()
        
        try:
            logger.info("Using fallback analysis method...")
            
            # Use model service for direct analysis
            classification = await self.model_service.classify_text(
                f"{title} {description}", 
                getattr(self.settings, 'ticket_categories', ['General Support'])
            )
            
            # Simple priority prediction logic
            priority_keywords = {
                "Critical": ["server down", "system crash", "security breach", "urgent"],
                "High": ["slow", "error", "not working", "important"],
                "Medium": ["question", "help", "support", "issue"],
                "Low": ["request", "information", "how to"]
            }
            
            text_lower = f"{title} {description}".lower()
            priority = "Medium"  # default
            
            for level, keywords in priority_keywords.items():
                if any(keyword in text_lower for keyword in keywords):
                    priority = level
                    break
            
            # Get solution recommendations
            solutions = await self.knowledge_service.get_recommendations(
                query=f"{title} {description}",
                max_results=3
            )
            
            processing_time = (time.time() - start_time) * 1000
            
            return {
                "ticket_id": ticket_id,
                "classification": {
                    "category": classification.get("category", "General Support"),
                    "subcategory": classification.get("subcategory"),
                    "confidence": classification.get("confidence", 0.7),
                    "reasoning": "Direct model classification"
                },
                "priority_prediction": {
                    "priority": priority,
                    "confidence": 0.8,
                    "estimated_resolution_hours": 24.0,
                    "factors": ["Keyword-based analysis"]
                },
                "recommended_solutions": solutions,
                "processing_time_ms": processing_time,
                "analysis_metadata": {
                    "method": "fallback",
                    "agents_available": len(self.agents) > 0
                }
            }
            
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
        """Quick ticket classification only"""
        if 'classifier' in self.agents:
            # Use classifier agent
            pass
        
        # Fallback classification
        return await self.model_service.classify_text(
            f"{title} {description}", 
            getattr(self.settings, 'ticket_categories', ['General Support'])
        )
    
    async def predict_priority(
        self, 
        title: str, 
        description: str, 
        requester_info: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Quick priority prediction only"""
        # Implement priority prediction logic
        return {
            "priority": "Medium",
            "confidence": 0.8,
            "estimated_resolution_hours": 24.0,
            "factors": ["Standard analysis"]
        }
    
    async def process_bulk_tickets(
        self, 
        tickets: List[Dict], 
        task_id: str, 
        options: Optional[Dict] = None
    ):
        """Process multiple tickets in batch"""
        logger.info(f"Starting bulk processing for {len(tickets)} tickets...")
        
        results = []
        for i, ticket in enumerate(tickets):
            try:
                result = await self.analyze_ticket(
                    title=ticket["title"],
                    description=ticket["description"],
                    requester_info=ticket.get("requester_info"),
                    additional_context=ticket.get("additional_context")
                )
                results.append(result)
                
                if i % 10 == 0:
                    logger.info(f"Processed {i+1}/{len(tickets)} tickets")
                    
            except Exception as e:
                logger.error(f"Failed to process ticket {i}: {str(e)}")
                results.append({"error": str(e), "ticket_index": i})
        
        logger.info(f"✅ Bulk processing completed. {len(results)} results")
        return results
    
    async def health_check(self) -> Dict[str, Any]:
        """Check health of crew manager and agents"""
        return {
            "initialized": self.initialized,
            "crewai_available": self.crewai_available,
            "agents_count": len(self.agents),
            "tools_count": len(self.tools),
            "crew_available": self.crew is not None,
            "model_service_healthy": await self.model_service.health_check() if self.model_service else False,
            "knowledge_service_healthy": await self.knowledge_service.health_check() if self.knowledge_service else False
        }