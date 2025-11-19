export interface DetailedTicket {
  ticket_id: string
  title: string
  status?: string
  priority?: string
  category?: string
  description?: string
  classification_confidence?: number
  recommended_solutions?: {
    solution?: string
    title?: string
    description?: string
    explanation_steps?: string[]
    full_explanation?: string
    confidence_score?: number
  }[]
  requester_info?: { name?: string }
  suggested_assignee?: string
  estimated_resolution_hours?: number
  tags?: string[]
  created_at?: string
  messages?: { from: string; text: string; at?: string }[]
}

// Shared fallback/mock tickets used by index and detail pages.
export const fallbackTickets: DetailedTicket[] = [
  {
    ticket_id: "ticket-0001",
    title: "Can't access VPN from home",
    category: "Network",
    priority: "High",
    status: "Open",
    created_at: "2025-11-18T09:12:00Z",
    description:
      "User reports inability to establish VPN connection from home network. Works from office. Tried restarting the WAN router and VPN client without success.",
    classification_confidence: 0.92,
    recommended_solutions: [
      {
        title: "Check public IP and firewall",
            description: "Confirm the user's public IP isn't blocked and check firewall / ISP restrictions.",
            confidence_score: 0.88,
            explanation_steps: [
              "Ask the user to visit https://whatismyip.live and copy their public IP.",
              "Check the company's firewall allowlist for that IP or any geoblocking rules.",
              "Request temporary VPN logs from the user's client and inspect tunnel negotiation errors.",
              "If ISP-level blocking is suspected, ask the user to try a mobile hotspot for comparison.",
              "Apply temporary firewall allowlist entry and test the VPN connection."
            ],
            full_explanation: "Start by collecting the user's public IP and any client logs. Verify there are no firewall deny rules for that IP and rule out ISP blocking by testing alternate networks. Inspect VPN negotiation errors for authentication or routing failures, and apply a temporary allowlist entry if needed to confirm the root cause."
      },
    ],
    requester_info: { name: "Alex Morgan" },
    suggested_assignee: "NetOps Team",
    estimated_resolution_hours: 2,
    tags: ["vpn", "remote-work", "network"],
    messages: [
      { from: "Alex Morgan", text: "VPN times out after 30s when connecting.", at: "2025-11-18T09:13:00Z" },
      { from: "NetOps Agent", text: "Please provide your public IP and router model.", at: "2025-11-18T09:21:00Z" },
    ],
  },
  {
    ticket_id: "ticket-0002",
    title: "Printer shows paper jam but clear",
    category: "Hardware",
    priority: "Low",
    status: "In Progress",
    created_at: "2025-11-17T14:05:00Z",
    description:
      "Printer reports paper jam even after all trays are cleared. Intermittent; usually resolved by power-cycling but recurs.",
    classification_confidence: 0.75,
    recommended_solutions: [
      {
        title: "Run maintenance cycle",
        description: "Run manufacturer's maintenance cycle and replace pickup rollers if worn.",
        confidence_score: 0.6,
        explanation_steps: [
          "Power-cycle the printer and run the built-in maintenance/cleaning cycle.",
          "Inspect the pickup rollers for wear or glazing; replace if the surface is smooth or cracked.",
          "Check paper type and tray settings to ensure correct pickup path.",
          "If issue persists, escalate for on-site hardware replacement."
        ],
        full_explanation: "Intermittent paper jams that clear with a power-cycle often indicate worn pickup rollers or sensor issues. Run the maintenance cycle and visually inspect rollers; replace parts as needed and confirm tray settings match paper type."
      },
    ],
    requester_info: { name: "Priya Sharma" },
    suggested_assignee: "Hardware Team",
    estimated_resolution_hours: 4,
    tags: ["printer", "hardware"],
    messages: [{ from: "Priya Sharma", text: "Tried clearing and still shows jam.", at: "2025-11-17T14:06:00Z" }],
  },
  {
    ticket_id: "ticket-0003",
    title: "Email delivery delayed to external domains",
    category: "Email",
    priority: "Medium",
    status: "Closed",
    created_at: "2025-11-16T08:30:00Z",
    description: "Outbound email to some external domains delayed. Root cause: SMTP relay throttling; rule reverted.",
    classification_confidence: 0.84,
    recommended_solutions: [
      {
        title: "Remove throttling rule",
        description: "Throttle rule on SMTP relay was causing queuing; removed and deliveries resumed.",
        confidence_score: 0.95,
        explanation_steps: [
          "Review SMTP relay configuration for any recent throttling or greylisting rules.",
          "Check the relay queue for backlogged messages and timestamps.",
          "If throttling is identified, remove or relax the rule and monitor delivery rates.",
          "Notify affected teams and confirm external domains are receiving mail."
        ],
        full_explanation: "The SMTP relay had a throttling rule that queued outbound mail causing delays. Inspecting relay rules and the message queue confirms the bottleneck. Removing the throttle restores normal outbound flow; monitor for any spike in traffic afterwards."
      },
    ],
    requester_info: { name: "IT Support" },
    suggested_assignee: "Mail Team",
    estimated_resolution_hours: 1,
    tags: ["email", "smtp"],
    messages: [{ from: "Mail Team", text: "Throttle rule removed; monitor for 24h.", at: "2025-11-16T09:10:00Z" }],
  },
]

export function getMockTicketById(id: string) {
  return fallbackTickets.find((t) => t.ticket_id === id) || null
}

// --- Additional mock fixtures for analytics and models pages ---
export const analyticsMock = {
  total_tickets: 1245,
  avg_processing_time: 342.5,
  classification_accuracy: 0.89,
  knowledge_base_size: 512,
  category_breakdown: [
    { category: 'Network', count: 420, avg_resolution_hours: 3.2, priorities: { High: 120, Medium: 250, Low: 50 } },
    { category: 'Hardware', count: 310, avg_resolution_hours: 4.6, priorities: { High: 60, Medium: 180, Low: 70 } },
    { category: 'Email', count: 180, avg_resolution_hours: 1.8, priorities: { High: 40, Medium: 120, Low: 20 } },
  ],
  priority_breakdown: [
    { priority: 'High', count: 220, avg_resolution_hours: 2.5, categories: { Network: 120, Hardware: 60 } },
    { priority: 'Medium', count: 700, avg_resolution_hours: 3.9, categories: { Network: 250, Hardware: 180 } },
    { priority: 'Low', count: 325, avg_resolution_hours: 5.1, categories: { Hardware: 70, Email: 20 } },
  ],
  trend_data: Array.from({ length: 30 }).map((_, i) => ({ date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(), count: Math.floor(30 + Math.random() * 80) })),
  recent_tickets: fallbackTickets.slice(0, 3).map(t => ({ ticket_id: t.ticket_id, title: t.title, category: t.category || '', priority: t.priority || '', status: t.status || '', created_at: t.created_at || '' })),
}

export const modelsMock = {
  initialized: true,
  primary_provider: 'ollama',
  fallback_chain: ['ollama', 'gemini', 'huggingface'],
  providers: {
    groq: { available: false, model: undefined },
    gemini: { available: true, model: 'gpt-5-mini' },
    ollama: { available: true, models: ['local-qa-v1'] },
    huggingface: { available: true, models: { 'hf-runner': 'v1.2.3' } },
  }
}

export const reportsMock = {
  report_type: 'monthly-summary',
  generated_at: new Date().toISOString(),
  summary: { total_tickets: 1245, resolved: 1180, pending: 65, avg_resolution_time: 3.8 },
  category_breakdown: { Network: 420, Hardware: 310, Email: 180 },
  priority_distribution: { High: 220, Medium: 700, Low: 325 },
  trends: [
    {
      period: '30d',
      metrics: { tickets: 1245, resolved: 1180 },
      daily: Array.from({ length: 30 }).map((_, i) => {
        const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString()
        return {
          date,
          created: Math.floor(20 + Math.random() * 80),
          resolved: Math.floor(15 + Math.random() * 70),
          avg_resolution_hours: +(2 + Math.random() * 6).toFixed(2),
          sla_percent: +(90 + Math.random() * 9).toFixed(2),
        }
      })
    }
  ]
}

// --- Additional mock fixtures for other dashboard pages ---
export const knowledgeMock = {
  total_articles: 512,
  recent_searches: ["VPN", "Printer", "Outlook error", "Password reset"],
  articles: Array.from({ length: 8 }).map((_, i) => ({
    doc_id: `kb-${i + 1}`,
    title: i === 0 ? "How to troubleshoot VPN connection issues" : `Knowledge Article ${i + 1}`,
    content_snippet: i === 0 ? "Step-by-step guide to collect logs, check firewall rules, and test alternate networks." : "Helpful troubleshooting steps and context.",
    category: i % 3 === 0 ? "Network" : i % 3 === 1 ? "Hardware" : "Software",
    score: +(0.6 + Math.random() * 0.4).toFixed(2),
    source: "internal",
    metadata: { views: Math.floor(100 + Math.random() * 200), helpful: Math.floor(5 + Math.random() * 50) },
    tags: ["troubleshooting", "how-to"],
  })),
}

export const searchMock = {
  suggestions: ["VPN", "Printer", "Outlook", "Password"],
  results: fallbackTickets.slice(0, 5).map((t) => ({ id: t.ticket_id, type: "ticket", title: t.title, snippet: t.description?.slice(0, 120) })),
}

export const integrationsMock = {
  integrations: [
    { name: "Slack", connected: true, last_synced: new Date().toISOString(), category: "Communication" },
    { name: "Jira", connected: true, last_synced: new Date().toISOString(), category: "Project Management" },
    { name: "ServiceNow", connected: false, last_synced: null, category: "ITSM" },
  ],
}

export const teamMock = {
  members: [
    { id: 1, name: "John Smith", role: "Senior Network Specialist", email: "john.smith@company.com", workload: 72 },
    { id: 2, name: "Sarah Johnson", role: "Software Support Engineer", email: "sarah.johnson@company.com", workload: 58 },
  ],
  stats: { total: 12, active: 9, avg_satisfaction: 4.8 },
}

export const settingsMock = {
  organization: { name: "Acme Corporation", domain: "acme.com", description: "Leading technology company" },
  ai: { auto_resolution: true, smart_routing: true, confidence_threshold: 0.9 },
}

export const agentsMock = {
  agents: [
    { id: "a1", name: "NetOps Agent", active: true, score: 4.7, resolved: 412 },
    { id: "a2", name: "Hardware Agent", active: false, score: 4.3, resolved: 198 },
  ],
}
