/**
 * API Client Configuration for FastAPI Backend
 * Connects Next.js frontend (port 3000) to FastAPI backend (port 8000)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Ticket Analysis
  ANALYZE_TICKET: '/api/v1/tickets/analyze',
  CLASSIFY_TICKET: '/api/v1/tickets/classify',
  PREDICT_PRIORITY: '/api/v1/tickets/predict-priority',
  BULK_PROCESS: '/api/v1/tickets/bulk-process',
  
  // Solutions
  RECOMMEND_SOLUTIONS: '/api/v1/solutions/recommend',
  SEARCH_SOLUTIONS: '/api/v1/solutions/search',
  
  // Knowledge Base
  INGEST_KNOWLEDGE: '/api/v1/knowledge/ingest',
  KNOWLEDGE_LEDGER: '/api/v1/knowledge/ledger',
  KB_DEBUG: '/api/v1/debug/knowledge-base-status',
  
  // Analytics
  DASHBOARD: '/api/v1/analytics/dashboard',
  REPORTS: '/api/v1/analytics/reports',
  
  // Agents
  AGENT_PERFORMANCE: '/api/v1/agents/performance',
  AGENT_FEEDBACK: '/api/v1/agents/feedback',
  
  // System
  HEALTH: '/api/v1/health',
  MODELS_STATUS: '/api/v1/models/status',
} as const;

export interface ApiError {
  detail: string;
  status?: number;
}

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

/**
 * API Client methods
 */
export const apiClient = {
  // GET request
  get: <T>(endpoint: string) => 
    apiFetch<T>(endpoint, { method: 'GET' }),

  // POST request
  post: <T>(endpoint: string, data?: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  // PUT request
  put: <T>(endpoint: string, data?: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  // DELETE request
  delete: <T>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' }),
};

// Health check helper
export async function checkApiHealth() {
  try {
    const health = await apiClient.get(API_ENDPOINTS.HEALTH);
    return { status: 'ok', data: health };
  } catch (error) {
    return { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
