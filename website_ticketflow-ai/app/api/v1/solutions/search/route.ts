import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const category = searchParams.get("category") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    console.log("[v0] Searching knowledge base:", { query, category, limit })

    // Simulate search processing time
    await new Promise((resolve) => setTimeout(resolve, 600))

    const mockSolutions = [
      {
        id: "kb_001",
        title: "Network Connectivity Troubleshooting",
        description: "Complete guide for resolving network connectivity issues",
        category: "Network",
        tags: ["network", "connectivity", "troubleshooting", "dns"],
        content: "Step-by-step guide to diagnose and resolve network connectivity problems...",
        author: "IT Support Team",
        lastUpdated: "2024-01-20T10:30:00Z",
        views: 1250,
        rating: 4.8,
        difficulty: "Intermediate",
      },
      {
        id: "kb_002",
        title: "Software Installation Best Practices",
        description: "Guidelines for installing software safely and efficiently",
        category: "Software",
        tags: ["software", "installation", "security", "deployment"],
        content: "Best practices for software installation in enterprise environments...",
        author: "Security Team",
        lastUpdated: "2024-01-18T14:15:00Z",
        views: 890,
        rating: 4.6,
        difficulty: "Beginner",
      },
      {
        id: "kb_003",
        title: "Hardware Diagnostic Procedures",
        description: "Methods for diagnosing hardware failures and issues",
        category: "Hardware",
        tags: ["hardware", "diagnostics", "troubleshooting", "repair"],
        content: "Comprehensive hardware diagnostic procedures and tools...",
        author: "Hardware Team",
        lastUpdated: "2024-01-15T09:45:00Z",
        views: 675,
        rating: 4.7,
        difficulty: "Advanced",
      },
    ]

    // Filter by category if specified
    let filteredSolutions = mockSolutions
    if (category) {
      filteredSolutions = mockSolutions.filter((sol) => sol.category.toLowerCase() === category.toLowerCase())
    }

    // Filter by query if specified
    if (query) {
      filteredSolutions = filteredSolutions.filter(
        (sol) =>
          sol.title.toLowerCase().includes(query.toLowerCase()) ||
          sol.description.toLowerCase().includes(query.toLowerCase()) ||
          sol.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
      )
    }

    // Limit results
    const results = filteredSolutions.slice(0, limit)

    console.log("[v0] Search completed, found", results.length, "results")

    return NextResponse.json({
      success: true,
      data: {
        query,
        category,
        totalResults: results.length,
        results,
        searchTime: "0.6s",
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error searching knowledge base:", error)
    return NextResponse.json({ success: false, error: "Failed to search knowledge base" }, { status: 500 })
  }
}
