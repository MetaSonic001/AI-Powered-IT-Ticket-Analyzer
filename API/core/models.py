"""
Pydantic models for request/response schemas
"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
from enum import Enum

# Enums
class TicketCategory(str, Enum):
    NETWORK = "Network Issues"
    SOFTWARE = "Software Problems"
    HARDWARE = "Hardware Failures"
    SECURITY = "Security Incidents"
    ACCESS = "Account Access"
    EMAIL = "Email Issues"
    PRINTER = "Printer Problems"
    APPLICATION = "Application Errors"
    PERFORMANCE = "System Performance"
    MOBILE = "Mobile Device Support"
    DATABASE = "Database Issues"
    BACKUP = "Backup & Recovery"
    GENERAL = "General Support"

class PriorityLevel(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class TicketStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    PENDING = "Pending"
    RESOLVED = "Resolved"
    CLOSED = "Closed"

class SourceType(str, Enum):
    KAGGLE = "kaggle"
    GITHUB = "github"
    STACKOVERFLOW = "stackoverflow"
    DOCUMENTATION = "documentation"
    WEB_SCRAPE = "web_scrape"
    MANUAL = "manual"

# Request Models
class RequesterInfo(BaseModel):
    """Information about the ticket requester"""
    name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None

class TicketAnalysisRequest(BaseModel):
    """Request model for ticket analysis"""
    title: str = Field(..., min_length=1, max_length=200, description="Ticket title")
    description: str = Field(..., min_length=10, description="Detailed ticket description")
    requester_info: Optional[RequesterInfo] = None
    additional_context: Optional[Dict[str, Any]] = None
    
    @validator("title")
    def validate_title(cls, v):
        if not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()
    
    @validator("description")
    def validate_description(cls, v):
        if len(v.strip()) < 10:
            raise ValueError("Description must be at least 10 characters long")
        return v.strip()

class BulkTicketItem(BaseModel):
    """Individual ticket in bulk processing request"""
    ticket_id: Optional[str] = None
    title: str
    description: str
    requester_info: Optional[RequesterInfo] = None
    additional_context: Optional[Dict[str, Any]] = None

class BulkProcessingOptions(BaseModel):
    """Options for bulk ticket processing"""
    include_solutions: bool = True
    include_priority: bool = True
    include_classification: bool = True
    max_concurrent: int = Field(default=5, ge=1, le=20)
    save_results: bool = True

class BulkTicketRequest(BaseModel):
    """Request model for bulk ticket processing"""
    tickets: List[BulkTicketItem] = Field(..., min_items=1, max_items=1000)
    options: Optional[BulkProcessingOptions] = BulkProcessingOptions()

class SolutionRecommendationRequest(BaseModel):
    """Request model for solution recommendations"""
    query: str = Field(..., min_length=5, description="Query for solution search")
    category: Optional[TicketCategory] = None
    max_results: Optional[int] = Field(default=5, ge=1, le=20)
    min_similarity: Optional[float] = Field(default=0.7, ge=0.0, le=1.0)

class KnowledgeIngestRequest(BaseModel):
    """Request model for knowledge ingestion"""
    source: str = Field(..., description="Source URL, file path, or dataset identifier")
    source_type: SourceType
    metadata: Optional[Dict[str, Any]] = None
    
    @validator("source")
    def validate_source(cls, v):
        if not v.strip():
            raise ValueError("Source cannot be empty")
        return v.strip()

# Response Models
class ClassificationResult(BaseModel):
    """Classification result for a ticket"""
    category: TicketCategory
    subcategory: Optional[str] = None
    confidence: float = Field(..., ge=0.0, le=1.0)
    reasoning: Optional[str] = None

class PriorityPrediction(BaseModel):
    """Priority prediction result"""
    priority: PriorityLevel
    confidence: float = Field(..., ge=0.0, le=1.0)
    estimated_resolution_hours: Optional[float] = None
    reasoning: Optional[str] = None
    factors: Optional[List[str]] = None

class SolutionRecommendation(BaseModel):
    """A single solution recommendation"""
    solution_id: str
    title: str
    description: str
    category: Optional[str] = None
    steps: Optional[List[str]] = None
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    source: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class TicketAnalysisResponse(BaseModel):
    """Complete ticket analysis response"""
    ticket_id: str
    classification: ClassificationResult
    priority_prediction: PriorityPrediction
    recommended_solutions: List[SolutionRecommendation]
    estimated_resolution_time: Optional[str] = None
    suggested_assignee: Optional[str] = None
    tags: Optional[List[str]] = None
    analysis_metadata: Dict[str, Any] = {}
    processing_time_ms: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Analytics Models
class CategoryStats(BaseModel):
    """Statistics for a ticket category"""
    category: str
    total_tickets: int
    avg_resolution_hours: Optional[float] = None
    priority_distribution: Dict[str, int] = {}
    common_issues: List[str] = []

class PriorityStats(BaseModel):
    """Statistics for ticket priorities"""
    priority: str
    total_tickets: int
    avg_resolution_hours: Optional[float] = None
    categories: Dict[str, int] = {}

class DashboardMetrics(BaseModel):
    """Main dashboard metrics"""
    total_tickets_analyzed: int
    avg_processing_time_ms: float
    accuracy_rate: Optional[float] = None
    knowledge_base_size: int
    active_solutions: int

class TrendData(BaseModel):
    """Time-series trend data"""
    date: str
    ticket_count: int
    avg_resolution_hours: Optional[float] = None
    top_category: Optional[str] = None

class DashboardResponse(BaseModel):
    """Dashboard data response"""
    metrics: DashboardMetrics
    category_stats: List[CategoryStats]
    priority_stats: List[PriorityStats]
    trends: List[TrendData]
    recent_tickets: List[Dict[str, Any]] = []
    generated_at: datetime = Field(default_factory=datetime.utcnow)

# Knowledge Base Models
class KnowledgeDocument(BaseModel):
    """A document in the knowledge base"""
    doc_id: str
    title: str
    content: str
    category: Optional[str] = None
    tags: List[str] = []
    source: str
    source_type: SourceType
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

class SearchResult(BaseModel):
    """Search result from knowledge base"""
    doc_id: str
    title: str
    content_snippet: str
    score: float = Field(..., ge=0.0, le=1.0)
    category: Optional[str] = None
    tags: List[str] = []
    source: str
    metadata: Dict[str, Any] = {}

# Agent Models
class AgentResponse(BaseModel):
    """Response from an AI agent"""
    agent_name: str
    response: Dict[str, Any]
    confidence: Optional[float] = None
    processing_time_ms: Optional[float] = None
    metadata: Dict[str, Any] = {}

class CrewExecutionResult(BaseModel):
    """Result from crew execution"""
    task_id: str
    status: str  # "success", "failed", "processing"
    results: Dict[str, Any]
    agent_responses: List[AgentResponse] = []
    total_processing_time_ms: float
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Data Processing Models
class DatasetInfo(BaseModel):
    """Information about a dataset"""
    name: str
    description: str
    source: str
    size: int
    columns: List[str] = []
    sample_data: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = {}

class ProcessingStats(BaseModel):
    """Statistics from data processing"""
    total_records: int
    processed_records: int
    failed_records: int
    processing_time_seconds: float
    errors: List[str] = []

# Model Service Models
class ModelInfo(BaseModel):
    """Information about a loaded model"""
    model_name: str
    model_type: str  # "classification", "embedding", "llm"
    provider: str  # "ollama", "huggingface", "groq", etc.
    status: str  # "loaded", "loading", "failed", "not_loaded"
    memory_usage_mb: Optional[float] = None
    last_used: Optional[datetime] = None
    metadata: Dict[str, Any] = {}

class ModelStatus(BaseModel):
    """Overall model service status"""
    total_models: int
    loaded_models: int
    failed_models: int
    models: List[ModelInfo]
    memory_usage_mb: Optional[float] = None
    status: str  # "healthy", "degraded", "failed"

# Error Models
class ErrorDetail(BaseModel):
    """Detailed error information"""
    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class APIError(BaseModel):
    """API error response"""
    error: str
    details: Optional[ErrorDetail] = None
    request_id: Optional[str] = None

# Validation Models
class ValidationResult(BaseModel):
    """Result of data validation"""
    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []
    metadata: Dict[str, Any] = {}

# Configuration Models
class ModelConfig(BaseModel):
    """Configuration for a specific model"""
    provider: str
    model_name: str
    parameters: Dict[str, Any] = {}
    enabled: bool = True

class ServiceHealth(BaseModel):
    """Health status of a service"""
    service_name: str
    status: str  # "healthy", "degraded", "unhealthy"
    checks: Dict[str, bool] = {}
    last_check: datetime = Field(default_factory=datetime.utcnow)
    details: Optional[Dict[str, Any]] = None

# Export all models for easy import
__all__ = [
    # Enums
    "TicketCategory", "PriorityLevel", "TicketStatus", "SourceType",
    # Request Models
    "RequesterInfo", "TicketAnalysisRequest", "BulkTicketItem", 
    "BulkProcessingOptions", "BulkTicketRequest", "SolutionRecommendationRequest",
    "KnowledgeIngestRequest",
    # Response Models
    "ClassificationResult", "PriorityPrediction", "SolutionRecommendation",
    "TicketAnalysisResponse",
    # Analytics Models
    "CategoryStats", "PriorityStats", "DashboardMetrics", "TrendData",
    "DashboardResponse",
    # Knowledge Base Models
    "KnowledgeDocument", "SearchResult",
    # Agent Models
    "AgentResponse", "CrewExecutionResult",
    # Data Models
    "DatasetInfo", "ProcessingStats",
    # Model Service Models
    "ModelInfo", "ModelStatus",
    # Error Models
    "ErrorDetail", "APIError",
    # Validation Models
    "ValidationResult",
    # Configuration Models
    "ModelConfig", "ServiceHealth"
]