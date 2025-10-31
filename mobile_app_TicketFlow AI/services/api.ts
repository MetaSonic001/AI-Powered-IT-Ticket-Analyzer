// API Service for AI Ticketing System
import {
  API_BASE_URL,
  API_VERSION,
  TicketAnalysisRequest,
  TicketAnalysisResponse,
  ClassificationResponse,
  PriorityPredictionResponse,
  BulkProcessRequest,
  BulkProcessResponse,
  KnowledgeSearchRequest,
  KnowledgeSearchResponse,
  SolutionRecommendationRequest,
  SolutionRecommendationResponse,
  KnowledgeLedgerResponse,
  KnowledgeIngestRequest,
  KnowledgeIngestResponse,
  DashboardResponse,
  ModelStatusResponse,
  AgentPerformanceResponse,
  AgentFeedbackRequest,
  AgentFeedbackResponse,
  ReviewResponse,
} from '../types/api';

class APIService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = `${API_BASE_URL}${API_VERSION}`;
  }

  setToken(token: string) {
    this.token = token;
  }

  // Generic request handler with enhanced error handling
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${API_VERSION}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    console.log('API Request:', {
      method: options.method || 'GET',
      url,
      body: options.body ? JSON.parse(options.body as string) : undefined
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = `API Error: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          
          // Handle Pydantic validation errors
          if (errorData.detail && Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((e: any) => 
              `${e.loc?.join('.')}: ${e.msg}`
            ).join(', ');
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Response is not JSON
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // ========== System & Utility Endpoints ==========

  async healthCheck(): Promise<any> {
    return this.request<any>('/health');
  }

  async getRootInfo(): Promise<any> {
    return this.request<any>('/');
  }

  async getKnowledgeBaseStatus(): Promise<any> {
    return this.request<any>('/debug/knowledge-base-status');
  }

  // ========== Knowledge Base Endpoints ==========

  async getKnowledgeLedger(params?: {
    include_entries?: boolean;
    limit?: number;
    status?: string;
  }): Promise<KnowledgeLedgerResponse> {
    const queryParams = new URLSearchParams();
    if (params?.include_entries !== undefined) {
      queryParams.append('include_entries', String(params.include_entries));
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', String(params.limit));
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }

    const query = queryParams.toString();
    return this.request<KnowledgeLedgerResponse>(
      `/knowledge/ledger${query ? `?${query}` : ''}`
    );
  }

  async ingestKnowledge(
    data: KnowledgeIngestRequest
  ): Promise<KnowledgeIngestResponse> {
    return this.request<KnowledgeIngestResponse>('/knowledge/ingest', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ========== Knowledge Base Search & Recommendation ==========

  async searchKnowledgeBase(
    params: KnowledgeSearchRequest
  ): Promise<KnowledgeSearchResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', params.q);
    if (params.category) {
      queryParams.append('category', params.category);
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', String(params.limit));
    }

    return this.request<KnowledgeSearchResponse>(
      `/solutions/search?${queryParams.toString()}`
    );
  }

  async recommendSolutions(
    data: SolutionRecommendationRequest
  ): Promise<SolutionRecommendationResponse> {
    return this.request<SolutionRecommendationResponse>(
      '/solutions/recommend',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  // ========== Ticket Intelligence Endpoints ==========

  async analyzeTicket(
    data: TicketAnalysisRequest
  ): Promise<TicketAnalysisResponse> {
    return this.request<TicketAnalysisResponse>('/tickets/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async classifyTicket(
    data: TicketAnalysisRequest
  ): Promise<ClassificationResponse> {
    return this.request<ClassificationResponse>('/tickets/classify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async predictPriority(
    data: TicketAnalysisRequest
  ): Promise<PriorityPredictionResponse> {
    return this.request<PriorityPredictionResponse>('/tickets/predict-priority', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkProcessTickets(
    data: BulkProcessRequest
  ): Promise<BulkProcessResponse> {
    return this.request<BulkProcessResponse>('/tickets/bulk-process', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ========== Analytics Endpoints ==========

  async getDashboardMetrics(days: number = 30): Promise<DashboardResponse> {
    return this.request<DashboardResponse>(
      `/analytics/dashboard?days=${days}`
    );
  }

  async getReports(params: {
    report_type: 'summary' | 'category' | 'priority';
    start_date?: string;
    end_date?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    queryParams.append('report_type', params.report_type);
    if (params.start_date) {
      queryParams.append('start_date', params.start_date);
    }
    if (params.end_date) {
      queryParams.append('end_date', params.end_date);
    }

    return this.request<any>(`/analytics/reports?${queryParams.toString()}`);
  }

  // ========== AI & Agent Endpoints ==========

  async getModelStatus(): Promise<ModelStatusResponse> {
    return this.request<ModelStatusResponse>('/models/status');
  }

  async reloadModels(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/models/reload', {
      method: 'POST',
    });
  }

  async getAgentPerformance(): Promise<AgentPerformanceResponse> {
    return this.request<AgentPerformanceResponse>('/agents/performance');
  }

  async submitAgentFeedback(
    data: AgentFeedbackRequest
  ): Promise<AgentFeedbackResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('ticket_id', data.ticket_id);
    queryParams.append('agent', data.agent);
    queryParams.append('actual', data.actual);
    if (data.feedback_source) {
      queryParams.append('feedback_source', data.feedback_source);
    }

    return this.request<AgentFeedbackResponse>(
      `/agents/feedback?${queryParams.toString()}`,
      {
        method: 'POST',
      }
    );
  }

  // ========== Review Endpoint (HITL) ==========

  async getTicketReview(ticketId: string): Promise<ReviewResponse> {
    return this.request<ReviewResponse>(`/review/${ticketId}`);
  }
}

// Export singleton instance
export const apiService = new APIService();
export default apiService;
