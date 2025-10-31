"""
AI-Powered IT Ticket Analyzer & Auto-Suggester
Enterprise-grade FastAPI application with multi-agent architecture
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import uvicorn
from contextlib import asynccontextmanager
from typing import Optional
from pathlib import Path
from datetime import datetime, timezone

# Import our custom modules
from core.config import get_settings
from core.models import (
    TicketAnalysisRequest, 
    TicketAnalysisResponse,
    BulkTicketRequest,
    SolutionRecommendationRequest,
    KnowledgeIngestRequest
)
from agents.workflow_manager import WorkflowManager
from services.knowledge_service import KnowledgeService
from services.data_service import DataService
from services.model_service import ModelService
from utils.logger import setup_logger
from utils.ledger_sqlite import SqliteLedger
from utils.database import TicketDatabase
from scripts.datasets import ingest_folder, Embedder

# Setup logging
logger = setup_logger(__name__)

# Global services
workflow_manager: WorkflowManager = None
knowledge_service: KnowledgeService = None
data_service: DataService = None
model_service: ModelService = None
ticket_db: TicketDatabase = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events"""
    global workflow_manager, knowledge_service, data_service, model_service, ticket_db
    
    logger.info("🚀 Starting IT Ticket Analyzer API...")
    
    try:
        # Initialize settings
        settings = get_settings()
        
        # Initialize database
        logger.info("Initializing database...")
        db_path = Path(settings.data_dir) / "tickets.db"
        ticket_db = TicketDatabase(str(db_path))
        
        # Initialize services
        logger.info("Initializing services...")
        model_service = ModelService(settings)
        await model_service.initialize()
        
        knowledge_service = KnowledgeService(settings)
        await knowledge_service.initialize()
        
        data_service = DataService(settings)
        await data_service.initialize()
        
        workflow_manager = WorkflowManager(settings, model_service, knowledge_service)
        await workflow_manager.initialize()
        
        # Start background auto-sync of local data folders into vector DB (idempotent via ledger)
        async def _auto_sync_data_folders():
            try:
                data_dir = Path(getattr(settings, 'data_dir', './data'))
                ledger = SqliteLedger(Path(getattr(settings, 'ledger_db_path', './data/ledger.db')))

                embedder = Embedder()
                folders = [
                    data_dir / 'kaggle',
                    data_dir / 'scraped',
                    data_dir / 'processed',
                    data_dir / 'imports',
                    data_dir / 'exports',
                ]
                total = 0
                for folder in folders:
                    if folder.exists():
                        added = await ingest_folder(folder, 'Documentation', 'auto', knowledge_service, embedder, ledger)
                        if added:
                            logger.info(f"Auto-sync: ingested {added} docs from {folder}")
                        total += added

                # Mark removed: entries whose files no longer exist
                removed = 0
                for entry in ledger.iter_entries():
                    p = Path(entry.get('path') or '')
                    if entry.get('source_type') in ('auto', 'manual') and entry.get('status') != 'removed':
                        if not p.exists():
                            try:
                                ledger.mark_removed(entry['doc_id'])
                                removed += 1
                            except Exception:
                                pass
                health = await knowledge_service.health_check()
                logger.info(f"Auto-sync complete. Added {total}, removed {removed}. Backend={health.get('backend')} Count={health.get('document_count')}")
            except Exception as e:
                logger.warning(f"Auto-sync skipped or failed: {e}")

        asyncio.create_task(_auto_sync_data_folders())

        logger.info("✅ All services initialized successfully!")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {str(e)}")
        raise
    
    yield
    
    # Cleanup
    logger.info("🔄 Shutting down services...")
    if knowledge_service:
        await knowledge_service.close()
    if model_service:
        await model_service.cleanup()
    logger.info("✅ Cleanup completed")

# Create FastAPI app
app = FastAPI(
    title="AI-Powered IT Ticket Analyzer",
    description="Enterprise-grade IT ticket analysis with multi-agent AI system",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get services
async def get_workflow_manager() -> WorkflowManager:
    if not workflow_manager:
        raise HTTPException(status_code=503, detail="Workflow manager not initialized")
    return workflow_manager

async def get_knowledge_service() -> KnowledgeService:
    if not knowledge_service:
        raise HTTPException(status_code=503, detail="Knowledge service not initialized")
    return knowledge_service

async def get_data_service() -> DataService:
    if not data_service:
        raise HTTPException(status_code=503, detail="Data service not initialized")
    return data_service

def get_database() -> TicketDatabase:
    if not ticket_db:
        raise HTTPException(status_code=503, detail="Database not initialized")
    return ticket_db
# Ledger stats endpoint
@app.get("/api/v1/knowledge/ledger")
async def get_ledger(
    include_entries: bool = False,
    limit: int = 0,
    status: Optional[str] = None,
):
    """Return ledger stats and optionally entries.

    Query params:
    - include_entries: when true, include entries payload (be mindful, may be large)
    - limit: maximum number of entries to return (0 = no limit)
    - status: filter by status (e.g., 'synced' or 'removed') when including entries
    """
    settings = get_settings()
    ledger = SqliteLedger(Path(getattr(settings, 'ledger_db_path', './data/ledger.db')))
    stats = ledger.stats()
    resp = {"stats": stats}
    if include_entries:
        entries = []
        for e in ledger.iter_entries():
            if status and e.get("status") != status:
                continue
            entries.append(e)
            if limit and len(entries) >= limit:
                break
        resp["entries"] = entries
    return resp


# Knowledge base debug/status endpoint
@app.get("/api/v1/debug/knowledge-base-status")
async def knowledge_base_status(knowledge: KnowledgeService = Depends(get_knowledge_service)):
    """Return debug info about the knowledge base so we can quickly verify content exists."""
    try:
        health = await knowledge.health_check()
        count = await knowledge.get_document_count()

        backend = health.get("backend")
        chroma_info = None
        weaviate_info = None
        sample = None

        # Try to fetch a sample document depending on backend
        if getattr(knowledge, "chroma_collection", None) is not None:
            try:
                # Chroma collections support .get with a limit
                raw = knowledge.chroma_collection.get(limit=1)
                if raw and raw.get("ids"):
                    ids = raw.get("ids", [])
                    metadatas = raw.get("metadatas", [])
                    documents = raw.get("documents", [])

                    # Handle both shapes: flat lists (get) and list-of-lists (query)
                    id0 = ids[0] if ids else None
                    meta0 = None
                    doc0 = None
                    if metadatas:
                        if isinstance(metadatas[0], dict):
                            meta0 = metadatas[0]
                        elif isinstance(metadatas[0], list) and metadatas[0]:
                            meta0 = metadatas[0][0]
                    if documents:
                        if isinstance(documents[0], str):
                            doc0 = documents[0]
                        elif isinstance(documents[0], list) and documents[0]:
                            doc0 = documents[0][0]

                    sample = {
                        "id": id0,
                        "title": (meta0 or {}).get("title"),
                        "category": (meta0 or {}).get("category"),
                        "snippet": (doc0 or "")[:200]
                    }
            except Exception:
                # As a fallback, try searching anything with min_similarity=0
                try:
                    srch = await knowledge.search(query="sample", category=None, limit=1, min_similarity=0.0)
                    if srch:
                        r0 = srch[0]
                        sample = {
                            "id": r0.get("doc_id"),
                            "title": r0.get("title"),
                            "category": r0.get("category"),
                            "snippet": r0.get("content_snippet")[:200] if r0.get("content_snippet") else None
                        }
                except Exception:
                    pass
            chroma_info = {
                "collection_name": getattr(knowledge.chroma_collection, "name", "it_knowledge_base"),
                "persist_dir": str(getattr(knowledge, "_chroma_path", "./data/chroma_db"))
            }
        elif getattr(knowledge, "client", None) and getattr(knowledge, "collection", None):
            # Weaviate info
            weaviate_info = {
                "class_name": getattr(get_settings(), 'weaviate_class_name', 'ITKnowledge'),
                "host": getattr(get_settings(), 'weaviate_host', 'http://localhost:8080')
            }
            try:
                srch = await knowledge.search(query="sample", category=None, limit=1, min_similarity=0.0)
                if srch:
                    r0 = srch[0]
                    sample = {
                        "id": r0.get("doc_id"),
                        "title": r0.get("title"),
                        "category": r0.get("category"),
                        "snippet": r0.get("content_snippet")[:200] if r0.get("content_snippet") else None
                    }
            except Exception:
                pass

        return {
            "backend": backend,
            "document_count": count,
            "chroma": chroma_info,
            "weaviate": weaviate_info,
            "sample": sample,
        }
    except Exception as e:
        logger.error(f"KB status failed: {e}")
        raise HTTPException(status_code=500, detail=f"KB status failed: {str(e)}")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AI-Powered IT Ticket Analyzer API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/api/v1/health"
    }

# Health check endpoints
@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    try:
        services_status = {
            "workflow_manager": workflow_manager is not None,
            "knowledge_service": knowledge_service is not None and await knowledge_service.health_check(),
            "data_service": data_service is not None,
            "model_service": model_service is not None and await model_service.health_check()
        }
        
        all_healthy = all(services_status.values())
        
        return JSONResponse(
            status_code=200 if all_healthy else 503,
            content={
                "status": "healthy" if all_healthy else "degraded",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "services": services_status
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
            }
        )

# Main ticket analysis endpoint
@app.post("/api/v1/tickets/analyze", response_model=TicketAnalysisResponse)
async def analyze_ticket(
    request: TicketAnalysisRequest,
    workflow: WorkflowManager = Depends(get_workflow_manager),
    db: TicketDatabase = Depends(get_database)
):
    """
    Comprehensive ticket analysis using LangGraph multi-agent workflow
    Saves results to database for history and analytics
    """
    try:
        logger.info(f"Analyzing ticket: {request.title[:50]}...")
        
        # Run LangGraph workflow analysis
        analysis_result = await workflow.analyze_ticket(
            title=request.title,
            description=request.description,
            requester_info=request.requester_info,
            additional_context=request.additional_context
        )
        
        # Prepare data for database storage
        requester_info = request.requester_info
        db_ticket_data = {
            'ticket_id': analysis_result['ticket_id'],
            'title': request.title,
            'description': request.description,
            'category': analysis_result['classification']['category'],
            'subcategory': analysis_result['classification'].get('subcategory'),
            'classification_confidence': analysis_result['classification']['confidence'],
            'classification_reasoning': analysis_result['classification'].get('reasoning'),
            'priority': analysis_result['priority_prediction']['priority'],
            'priority_confidence': analysis_result['priority_prediction']['confidence'],
            'estimated_resolution_hours': analysis_result['priority_prediction'].get('estimated_resolution_hours'),
            'priority_reasoning': analysis_result['priority_prediction'].get('reasoning'),
            'requester_name': requester_info.name if requester_info else None,
            'requester_email': requester_info.email if requester_info else None,
            'requester_department': requester_info.department if requester_info else None,
            'requester_info': requester_info.model_dump() if requester_info else None,
            'processing_time_ms': analysis_result.get('processing_time_ms'),
            'summary': analysis_result.get('summary'),
            'suggested_assignee': analysis_result.get('suggested_assignee'),
            'tags': analysis_result.get('tags'),
            'recommended_solutions': analysis_result.get('recommended_solutions', []),
            'track_performance': True  # Enable performance tracking
        }
        
        # Save to database
        ticket_id = db.create_ticket(db_ticket_data)
        logger.info(f"✅ Ticket {ticket_id} saved to database")
        
        # Return a plain dict so direct function calls in tests receive a subscriptable result.
        # FastAPI will validate/serialize this against TicketAnalysisResponse for HTTP clients.
        return analysis_result
        
    except Exception as e:
        logger.error(f"Ticket analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Ticket classification only
@app.post("/api/v1/tickets/classify")
async def classify_ticket(
    request: TicketAnalysisRequest,
    workflow: WorkflowManager = Depends(get_workflow_manager)
):
    """
    Classify ticket category and subcategory only
    """
    try:
        classification = await workflow.classify_ticket(
            title=request.title,
            description=request.description
        )

        # Defensive validation: ensure all required fields are present
        defaults = {
            "category": "General Support",
            "subcategory": "Needs Review",
            "confidence": 0.3,
            "reasoning": "Incomplete classification result"
        }
        for k, v in defaults.items():
            if k not in classification or classification.get(k) in (None, ""):
                classification[k] = v

        # Normalize confidence to float
        try:
            classification["confidence"] = float(classification.get("confidence", 0.3))
        except Exception:
            classification["confidence"] = 0.3
        
        # Return structured response per guide
        return {
            "classification": classification,
            "ticket_info": {
                "title": request.title,
                "description": request.description
            }
        }
        
    except Exception as e:
        logger.error(f"Ticket classification failed: {str(e)}")
        # Return safe fallback instead of raw 500 where possible
        return {
            "classification": {
                "category": "General Support",
                "subcategory": "System Error",
                "confidence": 0.2,
                "reasoning": f"Classification system error: {str(e)}"
            },
            "ticket_info": {
                "title": request.title,
                "description": request.description
            }
        }

# Priority prediction
@app.post("/api/v1/tickets/predict-priority")
async def predict_priority(
    request: TicketAnalysisRequest,
    workflow: WorkflowManager = Depends(get_workflow_manager)
):
    """
    Predict ticket priority and estimated resolution time
    """
    try:
        priority_info = await workflow.predict_priority(
            title=request.title,
            description=request.description,
            requester_info=request.requester_info
        )
        
        return priority_info
        
    except Exception as e:
        logger.error(f"Priority prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Priority prediction failed: {str(e)}")

# Get ticket history
@app.get("/api/v1/tickets/history")
async def get_ticket_history(
    limit: int = 50,
    offset: int = 0,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    days: Optional[int] = None,
    db: TicketDatabase = Depends(get_database)
):
    """
    Get ticket history with filtering and pagination
    """
    try:
        tickets, total_count = db.get_tickets(
            limit=limit,
            offset=offset,
            category=category,
            priority=priority,
            status=status,
            days=days
        )
        
        return {
            "tickets": tickets,
            "total": total_count,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Ticket history retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get ticket history: {str(e)}")

# Get single ticket
@app.get("/api/v1/tickets/{ticket_id}")
async def get_ticket_details(
    ticket_id: str,
    db: TicketDatabase = Depends(get_database)
):
    """
    Get detailed information for a specific ticket
    """
    try:
        ticket = db.get_ticket(ticket_id)
        
        if not ticket:
            raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
        
        return ticket
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ticket retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get ticket: {str(e)}")

# Bulk ticket processing
@app.post("/api/v1/tickets/bulk-process")
async def bulk_process_tickets(
    request: BulkTicketRequest,
    background_tasks: BackgroundTasks,
    workflow: WorkflowManager = Depends(get_workflow_manager)
):
    """
    Process multiple tickets in batch
    """
    try:
        # Start background processing
        task_id = f"bulk_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        background_tasks.add_task(
            workflow.process_bulk_tickets,
            tickets=request.tickets,
            task_id=task_id,
            options=request.options
        )
        
        return {
            "task_id": task_id,
            "message": f"Started processing {len(request.tickets)} tickets",
            "status": "processing"
        }
        
    except Exception as e:
        logger.error(f"Bulk processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Bulk processing failed: {str(e)}")

# Solution recommendations
@app.post("/api/v1/solutions/recommend")
async def recommend_solutions(
    request: SolutionRecommendationRequest,
    knowledge: KnowledgeService = Depends(get_knowledge_service)
):
    """
    Get solution recommendations from knowledge base
    """
    try:
        recommendations = await knowledge.get_recommendations(
            query=request.query,
            category=request.category,
            max_results=request.max_results or 5,
            min_similarity=request.min_similarity or 0.4
        )
        
        return {
            "recommendations": recommendations,
            "query": request.query,
            "total_results": len(recommendations)
        }
        
    except Exception as e:
        logger.error(f"Solution recommendation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")

# Knowledge base search
@app.get("/api/v1/solutions/search")
async def search_knowledge_base(
    q: str,
    category: Optional[str] = None,
    limit: int = 10,
    knowledge: KnowledgeService = Depends(get_knowledge_service)
):
    """
    Search the knowledge base
    """
    try:
        results = await knowledge.search(
            query=q,
            category=category,
            limit=limit
        )
        
        return {
            "results": results,
            "query": q,
            "total_results": len(results)
        }
        
    except Exception as e:
        logger.error(f"Knowledge base search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

# Knowledge ingestion
@app.post("/api/v1/knowledge/ingest")
async def ingest_knowledge(
    request: KnowledgeIngestRequest,
    background_tasks: BackgroundTasks,
    knowledge: KnowledgeService = Depends(get_knowledge_service)
):
    """
    Ingest new knowledge into the system
    """
    try:
        task_id = f"ingest_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        background_tasks.add_task(
            knowledge.ingest_knowledge,
            source=request.source,
            source_type=request.source_type,
            metadata=request.metadata,
            task_id=task_id
        )
        
        return {
            "task_id": task_id,
            "message": "Knowledge ingestion started",
            "status": "processing"
        }
        
    except Exception as e:
        logger.error(f"Knowledge ingestion failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

# Analytics dashboard
@app.get("/api/v1/analytics/dashboard")
async def get_dashboard_data(
    days: int = 30,
    db: TicketDatabase = Depends(get_database)
):
    """
    Get dashboard analytics data from database
    """
    try:
        # Get metrics from database
        metrics = db.get_dashboard_metrics(days=days)
        category_stats = db.get_category_stats(days=days)
        priority_stats = db.get_priority_stats(days=days)
        trend_data = db.get_trend_data(days=days)
        
        # Get recent tickets
        recent_tickets, _ = db.get_tickets(limit=10, days=days)
        
        # Format response
        return {
            "total_tickets": metrics["total_tickets"],
            "avg_processing_time": metrics["avg_processing_time"],
            "classification_accuracy": metrics["classification_accuracy"],
            "knowledge_base_size": metrics["knowledge_base_size"],
            "category_breakdown": category_stats,
            "priority_breakdown": priority_stats,
            "trend_data": trend_data,
            "recent_tickets": [
                {
                    "ticket_id": t["ticket_id"],
                    "title": t["title"],
                    "category": t["category"],
                    "priority": t["priority"],
                    "status": t["status"],
                    "created_at": t["created_at"]
                }
                for t in recent_tickets
            ]
        }
        
    except Exception as e:
        logger.error(f"Dashboard data retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Dashboard failed: {str(e)}")

# Analytics reports
@app.get("/api/v1/analytics/reports")
async def generate_reports(
    report_type: str = "summary",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    data_service: DataService = Depends(get_data_service)
):
    """
    Generate analytical reports
    """
    try:
        report_data = await data_service.generate_report(
            report_type=report_type,
            start_date=start_date,
            end_date=end_date
        )
        
        return report_data
        
    except Exception as e:
        logger.error(f"Report generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

# Model management endpoints
@app.get("/api/v1/models/status")
async def get_model_status():
    """Get status of all AI models"""
    try:
        if not model_service:
            raise HTTPException(status_code=503, detail="Model service not initialized")
            
        status = await model_service.get_model_status()
        return status
        
    except Exception as e:
        logger.error(f"Model status check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Model status failed: {str(e)}")

@app.post("/api/v1/models/reload")
async def reload_models():
    """Reload AI models"""
    try:
        if not model_service:
            raise HTTPException(status_code=503, detail="Model service not initialized")
            
        await model_service.reload_models()
        return {"message": "Models reloaded successfully"}
        
    except Exception as e:
        logger.error(f"Model reload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Model reload failed: {str(e)}")

# Agent performance tracking endpoints
@app.get("/api/v1/agents/performance")
async def get_agent_performance(
    days: int = 30,
    db: TicketDatabase = Depends(get_database)
):
    """Get performance statistics for all agents from database"""
    try:
        stats = db.get_agent_performance(days=days)
        return {
            "classification_accuracy": stats["classification_accuracy"],
            "priority_accuracy": stats["priority_accuracy"],
            "solution_success_rate": stats["solution_success_rate"],
            "total_predictions": stats["total_predictions"],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Performance stats retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get performance stats: {str(e)}")

@app.post("/api/v1/agents/feedback")
async def log_agent_feedback(
    ticket_id: str,
    agent: str,
    actual: str,
    feedback_source: str = "user",
    db: TicketDatabase = Depends(get_database)
):
    """Log feedback for agent performance tracking (for ROI/accuracy measurement)"""
    try:
        db.log_agent_feedback(
            ticket_id=ticket_id,
            agent_name=agent,
            actual_value=actual,
            feedback_source=feedback_source
        )
        return {
            "message": "Feedback logged successfully",
            "ticket_id": ticket_id,
            "agent": agent
        }
    except Exception as e:
        logger.error(f"Feedback logging failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to log feedback: {str(e)}")

# Human review endpoint for low-confidence tickets
@app.get("/api/v1/review/{ticket_id}")
async def get_ticket_review(ticket_id: str):
    """Get draft analysis for human review (HITL)"""
    try:
        # In production, this would fetch from a database
        return {
            "ticket_id": ticket_id,
            "status": "needs_review",
            "message": "This ticket has been flagged for human review due to low confidence scores",
            "review_url": f"/api/v1/review/{ticket_id}/submit"
        }
    except Exception as e:
        logger.error(f"Review retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve review: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )