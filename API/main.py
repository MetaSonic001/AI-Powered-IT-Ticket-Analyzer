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
    KnowledgeIngestRequest,
    DashboardResponse
)
from agents.crew_manager import CrewManager
from services.knowledge_service import KnowledgeService
from services.data_service import DataService
from services.model_service import ModelService
from utils.logger import setup_logger
from utils.ledger_sqlite import SqliteLedger
from scripts.datasets import ingest_folder, Embedder

# Setup logging
logger = setup_logger(__name__)

# Global services
crew_manager: CrewManager = None
knowledge_service: KnowledgeService = None
data_service: DataService = None
model_service: ModelService = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events"""
    global crew_manager, knowledge_service, data_service, model_service
    
    logger.info("🚀 Starting IT Ticket Analyzer API...")
    
    try:
        # Initialize settings
        settings = get_settings()
        
        # Initialize services
        logger.info("Initializing services...")
        model_service = ModelService(settings)
        await model_service.initialize()
        
        knowledge_service = KnowledgeService(settings)
        await knowledge_service.initialize()
        
        data_service = DataService(settings)
        await data_service.initialize()
        
        crew_manager = CrewManager(settings, model_service, knowledge_service)
        await crew_manager.initialize()
        
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
async def get_crew_manager() -> CrewManager:
    if not crew_manager:
        raise HTTPException(status_code=503, detail="Crew manager not initialized")
    return crew_manager

async def get_knowledge_service() -> KnowledgeService:
    if not knowledge_service:
        raise HTTPException(status_code=503, detail="Knowledge service not initialized")
    return knowledge_service

async def get_data_service() -> DataService:
    if not data_service:
        raise HTTPException(status_code=503, detail="Data service not initialized")
    return data_service
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
            "crew_manager": crew_manager is not None,
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
    crew: CrewManager = Depends(get_crew_manager)
):
    """
    Comprehensive ticket analysis using multi-agent system
    """
    try:
        logger.info(f"Analyzing ticket: {request.title[:50]}...")
        
        # Run multi-agent analysis
        analysis_result = await crew.analyze_ticket(
            title=request.title,
            description=request.description,
            requester_info=request.requester_info,
            additional_context=request.additional_context
        )
        
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
    crew: CrewManager = Depends(get_crew_manager)
):
    """
    Classify ticket category and subcategory only
    """
    try:
        classification = await crew.classify_ticket(
            title=request.title,
            description=request.description
        )
        
        return {
            "category": classification["category"],
            "subcategory": classification["subcategory"],
            "confidence": classification["confidence"],
            "reasoning": classification.get("reasoning", "")
        }
        
    except Exception as e:
        logger.error(f"Ticket classification failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

# Priority prediction
@app.post("/api/v1/tickets/predict-priority")
async def predict_priority(
    request: TicketAnalysisRequest,
    crew: CrewManager = Depends(get_crew_manager)
):
    """
    Predict ticket priority and estimated resolution time
    """
    try:
        priority_info = await crew.predict_priority(
            title=request.title,
            description=request.description,
            requester_info=request.requester_info
        )
        
        return priority_info
        
    except Exception as e:
        logger.error(f"Priority prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Priority prediction failed: {str(e)}")

# Bulk ticket processing
@app.post("/api/v1/tickets/bulk-process")
async def bulk_process_tickets(
    request: BulkTicketRequest,
    background_tasks: BackgroundTasks,
    crew: CrewManager = Depends(get_crew_manager)
):
    """
    Process multiple tickets in batch
    """
    try:
        # Start background processing
        task_id = f"bulk_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        background_tasks.add_task(
            crew.process_bulk_tickets,
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
            min_similarity=request.min_similarity or 0.7
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
@app.get("/api/v1/analytics/dashboard", response_model=DashboardResponse)
async def get_dashboard_data(
    days: int = 30,
    data_service: DataService = Depends(get_data_service)
):
    """
    Get dashboard analytics data
    """
    try:
        dashboard_data = await data_service.get_dashboard_analytics(days=days)
        return DashboardResponse(**dashboard_data)
        
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

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )