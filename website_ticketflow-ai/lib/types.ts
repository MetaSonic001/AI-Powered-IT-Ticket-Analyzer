/**
 * TypeScript types matching FastAPI Pydantic models
 */

// ============= Request Types =============

export interface RequesterInfo {
  name: string;
  email?: string;
  department?: string;
  location?: string;
}

export interface TicketAnalysisRequest {
  title: string;
  description: string;
  requester_info?: RequesterInfo;
}

export interface ClassificationRequest {
  title: string;
  description: string;
}

export interface PriorityPredictionRequest {
  title: string;
  description: string;
  requester_info?: RequesterInfo;
}

export interface SolutionRecommendRequest {
  query: string;
  category?: string;
  max_results?: number;
  min_similarity?: number;
}

export interface KnowledgeIngestRequest {
  content: string;
  metadata?: Record<string, unknown>;
  category?: string;
  source?: string;
}

export interface AgentFeedbackRequest {
  ticket_id: string;
  agent: string;
  predicted: string;
  actual: string;
  feedback_source?: string;
}

// ============= Response Types =============

export interface Classification {
  category: string;
  subcategory?: string;
  confidence: number;
  reasoning?: string;
}

export interface PriorityPrediction {
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  estimated_resolution_hours: number;
  confidence: number;
  factors?: string[];
  eta?: string;
}

export interface Solution {
  solution_id: string;
  title: string;
  description?: string;
  steps: string[];
  category?: string;
  similarity_score: number;
  estimated_time_minutes?: number;
  success_rate?: number;
  source?: string;
  successful_resolutions?: number;
}

export interface ActionItem {
  priority: number;
  action: string;
  urgency?: string;
  estimated_time?: string;
}

export interface ResolutionTimeline {
  estimated_start: string;
  estimated_completion: string;
  sla: string;
}

export interface Warning {
  type: string;
  message: string;
}

export interface QualityReview {
  quality_score: number;
  completeness: string;
  improvements?: string[];
  status: string;
}

export interface TicketAnalysisResponse {
  ticket_id?: string;
  classification: Classification;
  priority_prediction: PriorityPrediction;
  recommended_solutions: Solution[];
  quality_review?: QualityReview;
  summary?: string;
  action_items?: ActionItem[];
  resolution_timeline?: ResolutionTimeline;
  warnings?: Warning[];
  analysis_metadata?: {
    processing_time_ms?: number;
    agents_used?: string[];
    knowledge_sources?: string[];
  };
}

export interface RecommendResponse {
  recommendations: Solution[];
  query: string;
  total_found: number;
}

export interface SearchResponse {
  results: Array<{
    id: string;
    content: string;
    metadata: Record<string, unknown>;
    score: number;
  }>;
  total: number;
}

export interface KnowledgeIngestResponse {
  success: boolean;
  message: string;
  document_id?: string;
}

export interface LedgerEntry {
  id: number;
  file_path: string;
  file_hash: string;
  category: string;
  source: string;
  status: string;
  synced_at: string;
  removed_at?: string;
}

export interface LedgerResponse {
  total: number;
  entries: LedgerEntry[];
}

export interface KBDebugResponse {
  backend: string;
  collection_name?: string;
  total_documents: number;
  sample_document?: {
    id: string;
    content_preview: string;
    metadata: Record<string, unknown>;
  };
  embedding_model: string;
  status: string;
}

// ============= Analytics Types =============

export interface DashboardMetrics {
  total_tickets: number;
  avg_processing_time: number;
  classification_accuracy: number;
  knowledge_base_size: number;
  categories: Record<string, number>;
  priorities: Record<string, number>;
  trends: Array<{
    date: string;
    count: number;
    avg_resolution_time?: number;
  }>;
}

export interface ReportData {
  report_type: string;
  generated_at: string;
  summary: {
    total_tickets: number;
    resolved: number;
    pending: number;
    avg_resolution_time: number;
  };
  category_breakdown: Record<string, number>;
  priority_distribution: Record<string, number>;
  trends: Array<{
    period: string;
    metrics: Record<string, number>;
  }>;
}

export interface AgentPerformance {
  agents: Record<string, {
    total_predictions: number;
    correct_predictions: number;
    accuracy: number;
    avg_confidence: number;
  }>;
  overall_accuracy: number;
  last_updated: string;
}

// ============= System Types =============

export interface HealthCheck {
  status: string;
  version: string;
  timestamp: string;
  services: {
    database: string;
    knowledge_base: string;
    llm_providers: string;
  };
  details?: Record<string, unknown>;
}

export interface ModelStatus {
  groq: {
    available: boolean;
    model: string;
  };
  gemini: {
    available: boolean;
    model: string;
  };
  ollama: {
    available: boolean;
    models: string[];
  };
  huggingface: {
    available: boolean;
    models: Record<string, string>;
  };
  primary_provider: string;
  fallback_chain: string[];
}
