// Fallback data for when API is unavailable
import type {
  DashboardMetrics,
  TicketAnalysisResponse,
  AgentPerformance,
  ModelStatus,
  HealthCheck,
} from "./types"

export const FALLBACK_DASHBOARD_METRICS: DashboardMetrics = {
  total_tickets: 1247,
  avg_processing_time: 324.5,
  classification_accuracy: 0.94,
  knowledge_base_size: 5832,
  categories: {
    Network: 387,
    Software: 298,
    Hardware: 225,
    Security: 187,
    Access: 150,
  },
  priorities: {
    Critical: 45,
    High: 234,
    Medium: 567,
    Low: 401,
  },
  trends: [
    { date: "2024-10-24", count: 45 },
    { date: "2024-10-25", count: 52 },
    { date: "2024-10-26", count: 38 },
    { date: "2024-10-27", count: 61 },
    { date: "2024-10-28", count: 48 },
    { date: "2024-10-29", count: 34 },
    { date: "2024-10-30", count: 28 },
    { date: "2024-10-31", count: 42 },
  ],
}

export const FALLBACK_TICKET_ANALYSIS: TicketAnalysisResponse = {
  ticket_id: "DEMO-001",
  summary: "This appears to be a network connectivity issue affecting VPN access. Priority: High. Recommended immediate investigation of VPN server status and user authentication credentials.",
  classification: {
    category: "Network",
    subcategory: "VPN",
    confidence: 0.92,
    reasoning: "Keywords indicate VPN connection failure with timeout errors, suggesting network infrastructure issues.",
  },
  priority_prediction: {
    priority: "High",
    estimated_resolution_hours: 3,
    confidence: 0.88,
    factors: [
      "Business impact: Critical for remote work",
      "Complexity: Medium - requires network diagnostics",
      "Urgency: High - affecting productivity",
    ],
    eta: "2-4 hours",
  },
  action_items: [
    {
      action: "Check VPN server status and logs",
      priority: 1,
      urgency: "High",
      estimated_time: "15 minutes",
    },
    {
      action: "Verify user authentication credentials",
      priority: 2,
      urgency: "Medium",
      estimated_time: "10 minutes",
    },
    {
      action: "Test VPN connection from different network",
      priority: 3,
      urgency: "Medium",
      estimated_time: "20 minutes",
    },
  ],
  recommended_solutions: [
    {
      solution_id: "SOL-001",
      title: "VPN Connection Timeout Troubleshooting",
      steps: [
        "Check if VPN server is responding to ping requests",
        "Verify firewall rules allow VPN traffic (port 1723/UDP 500)",
        "Review VPN server logs for authentication failures",
        "Reset user VPN credentials if needed",
        "Test connection using VPN client diagnostic mode",
      ],
      similarity_score: 0.91,
      estimated_time_minutes: 150,
      success_rate: 87,
      category: "Network",
    },
    {
      solution_id: "SOL-002",
      title: "Network Connectivity Issues - General",
      steps: [
        "Run network diagnostics (ping, traceroute)",
        "Check DNS resolution",
        "Verify network adapter settings",
        "Restart network services",
      ],
      similarity_score: 0.78,
      estimated_time_minutes: 90,
      success_rate: 82,
      category: "Network",
    },
  ],
  warnings: [],
  analysis_metadata: {
    processing_time_ms: 1234,
    agents_used: ["Classification Agent", "Priority Agent"],
    knowledge_sources: ["VPN Knowledge Base", "Network Troubleshooting Guide"],
  },
};

export const FALLBACK_AGENT_PERFORMANCE: AgentPerformance = {
  agents: {
    classification_agent: {
      total_predictions: 1247,
      correct_predictions: 1172,
      accuracy: 0.94,
      avg_confidence: 0.89,
    },
    priority_agent: {
      total_predictions: 1247,
      correct_predictions: 1135,
      accuracy: 0.91,
      avg_confidence: 0.86,
    },
    solution_agent: {
      total_predictions: 1247,
      correct_predictions: 1097,
      accuracy: 0.88,
      avg_confidence: 0.84,
    },
    coordinator_agent: {
      total_predictions: 1247,
      correct_predictions: 1210,
      accuracy: 0.97,
      avg_confidence: 0.92,
    },
  },
  overall_accuracy: 0.925,
  last_updated: new Date().toISOString(),
}

export const FALLBACK_MODEL_STATUS: ModelStatus = {
  groq: {
    available: true,
    model: "mixtral-8x7b-32768",
  },
  ollama: {
    available: false,
    models: ["llama2", "mistral"],
  },
  gemini: {
    available: true,
    model: "gemini-pro",
  },
  huggingface: {
    available: true,
    models: {
      "text-generation": "mistralai/Mixtral-8x7B-Instruct-v0.1",
      "embeddings": "sentence-transformers/all-MiniLM-L6-v2",
    },
  },
  primary_provider: "groq",
  fallback_chain: ["groq", "gemini", "huggingface", "ollama"],
};

export const FALLBACK_HEALTH_CHECK: HealthCheck = {
  status: "healthy",
  version: "1.0.0",
  timestamp: new Date().toISOString(),
  services: {
    database: "operational",
    knowledge_base: "operational",
    llm_providers: "operational",
  },
  details: {
    uptime: "99.9%",
    last_restart: "2024-10-15T08:00:00Z",
  },
}

export const FALLBACK_SOLUTIONS = [
  {
    title: "VPN Connection Troubleshooting Guide",
    steps: [
      "Check VPN server status",
      "Verify user credentials",
      "Test network connectivity",
      "Review firewall settings",
      "Restart VPN client",
    ],
    similarity_score: 0.89,
    estimated_time: "2-3 hours",
    success_rate: 85,
    category: "Network",
  },
  {
    title: "Password Reset Procedure",
    steps: [
      "Verify user identity",
      "Generate temporary password",
      "Send reset link via email",
      "Confirm password change",
      "Update security questions",
    ],
    similarity_score: 0.82,
    estimated_time: "15-30 minutes",
    success_rate: 95,
    category: "Access",
  },
  {
    title: "Software Installation Guide",
    steps: [
      "Check system requirements",
      "Download installer from official source",
      "Run installer as administrator",
      "Follow installation wizard",
      "Verify successful installation",
    ],
    similarity_score: 0.78,
    estimated_time: "1-2 hours",
    success_rate: 92,
    category: "Software",
  },
]

// Logging utility for fallback usage
export function logFallbackUsage(endpoint: string, error: any) {
  const timestamp = new Date().toISOString()
  const message = `[${timestamp}] ⚠️ USING FALLBACK DATA - API endpoint '${endpoint}' failed: ${
    error?.message || "Unknown error"
  }`
  
  console.warn(message)
  
  // Also log to console for visibility
  console.warn("━".repeat(80))
  console.warn("🔄 FALLBACK MODE ACTIVATED")
  console.warn(`   Endpoint: ${endpoint}`)
  console.warn(`   Error: ${error?.message || "Unknown error"}`)
  console.warn(`   Time: ${timestamp}`)
  console.warn("━".repeat(80))
}
