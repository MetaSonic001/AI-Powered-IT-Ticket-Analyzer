// API Types and Interfaces for AI Ticketing System

export const API_BASE_URL = 'https://serve-costa-analog-requesting.trycloudflare.com';
export const API_VERSION = '/api/v1';

// Requester Information
export interface RequesterInfo {
  name: string;
  email: string;
  department?: string;
  role?: string;
  location?: string;
  phone?: string;
}

// Ticket Analysis Request
export interface TicketAnalysisRequest {
  title: string;
  description: string;
  requester_info: RequesterInfo;
  additional_context?: {
    priority_override?: boolean;
    [key: string]: any;
  };
}

// Classification Response
export interface ClassificationResponse {
  category: string;
  subcategory?: string;
  confidence: number;
  reasoning?: string;
}

// Priority Prediction Response
export interface PriorityPredictionResponse {
  priority: string;
  confidence: number;
  estimated_resolution_hours?: number;
  reasoning?: string;
  factors?: string[];
}

// Recommended Solution
export interface RecommendedSolution {
  solution_id?: string;
  title: string;
  description?: string;
  steps?: string[];
  similarity_score?: number;
}

// Full Ticket Analysis Response
export interface TicketAnalysisResponse {
  ticket_id: string;
  classification: ClassificationResponse;
  priority_prediction: PriorityPredictionResponse;
  recommended_solutions: RecommendedSolution[];
  estimated_resolution_time?: string;
  suggested_assignee?: string;
  tags?: string[];
  analysis_metadata?: {
    [key: string]: any;
  };
  processing_time_ms?: number;
  created_at?: string;
  // Enhanced UX fields
  summary?: string;
  action_items?: Array<{
    [key: string]: any;
  }>;
  resolution_timeline?: {
    [key: string]: string;
  };
  warnings?: Array<{
    [key: string]: any;
  }>;
}

// Bulk Process Request
export interface BulkProcessRequest {
  tickets: Array<{
    ticket_id: string;
    title: string;
    description: string;
    requester_info: RequesterInfo;
  }>;
  options?: {
    include_solutions?: boolean;
    include_priority?: boolean;
    include_classification?: boolean;
    max_concurrent?: number;
    save_results?: boolean;
  };
}

// Bulk Process Response
export interface BulkProcessResponse {
  processed_count: number;
  results: Array<{
    ticket_id: string;
    category?: string;
    priority?: string;
    solutions?: RecommendedSolution[];
  }>;
}

// Knowledge Base Search
export interface KnowledgeSearchRequest {
  q: string;
  category?: string;
  limit?: number;
}

export interface KnowledgeSearchResult {
  solution_id: string;
  title: string;
  category: string;
  similarity_score: number;
  description?: string;
}

export interface KnowledgeSearchResponse {
  results: KnowledgeSearchResult[];
}

// Solution Recommendation
export interface SolutionRecommendationRequest {
  query: string;
  category?: string;
  max_results?: number;
  min_similarity?: number;
}

export interface SolutionRecommendationResponse {
  recommendations: RecommendedSolution[];
}

// Knowledge Ledger
export interface KnowledgeLedgerEntry {
  id: string;
  source: string;
  status: string;
  last_updated: string;
}

export interface KnowledgeLedgerResponse {
  total_entries: number;
  synced: number;
  removed: number;
  entries?: KnowledgeLedgerEntry[];
}

// Knowledge Ingest
export interface KnowledgeIngestRequest {
  source: string;
  source_type: string;
  metadata?: {
    uploaded_by?: string;
    notes?: string;
    [key: string]: any;
  };
}

export interface KnowledgeIngestResponse {
  status: string;
  message: string;
  ingested_count: number;
}

// Analytics Dashboard
export interface DashboardMetrics {
  total_tickets_analyzed: number;
  avg_processing_time_ms: number;
  accuracy_rate?: number;
  knowledge_base_size: number;
  active_solutions: number;
}

export interface CategoryStats {
  category: string;
  total_tickets: number;
  avg_resolution_hours?: number;
  priority_distribution: {
    [key: string]: number;
  };
  common_issues: string[];
}

export interface PriorityStats {
  priority: string;
  total_tickets: number;
  avg_resolution_hours?: number;
  categories: {
    [key: string]: number;
  };
}

export interface DashboardTrend {
  date: string;
  ticket_count: number;
  avg_resolution_hours?: number;
  top_category?: string;
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  category_stats: CategoryStats[];
  priority_stats: PriorityStats[];
  trends: DashboardTrend[];
  recent_tickets: Array<{
    [key: string]: any;
  }>;
  generated_at?: string;
}

// Model Status
export interface ModelInfo {
  name: string;
  status: string;
  accuracy?: number;
}

export interface ModelStatusResponse {
  models: ModelInfo[];
}

// Agent Performance
export interface AgentInfo {
  name: string;
  accuracy: number;
  avg_latency_ms: number;
}

export interface AgentPerformanceResponse {
  agents: AgentInfo[];
}

// Agent Feedback
export interface AgentFeedbackRequest {
  ticket_id: string;
  agent: string;
  actual: string;
  feedback_source?: string;
}

export interface AgentFeedbackResponse {
  status: string;
  message: string;
}

// Review (HITL)
export interface ReviewDraftAnalysis {
  category: string;
  priority: string;
  suggested_actions: string[];
}

export interface ReviewResponse {
  ticket_id: string;
  draft_analysis: ReviewDraftAnalysis;
}

// API Error Response
export interface APIError {
  error: string;
  message: string;
  details?: any;
}
