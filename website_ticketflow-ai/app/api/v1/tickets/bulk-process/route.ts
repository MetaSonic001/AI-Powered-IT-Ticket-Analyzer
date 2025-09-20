import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tickets, operation } = body

    console.log("[v0] Bulk processing", tickets?.length, "tickets with operation:", operation)

    // Simulate bulk processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const processedTickets =
      tickets?.map((ticket: any, index: number) => ({
        id: ticket.id || `TF-${Date.now()}-${index}`,
        originalData: ticket,
        processed: true,
        classification: {
          category: determineCategory(ticket.title + " " + ticket.description),
          confidence: Math.random() * 0.3 + 0.7,
          priority: determinePriority(ticket.title + " " + ticket.description),
        },
        processingTime: Math.random() * 2 + 0.5, // 0.5-2.5 seconds
        status: "completed",
      })) || []

    const result = {
      operation,
      totalTickets: tickets?.length || 0,
      processedTickets: processedTickets.length,
      failedTickets: 0,
      processingTime: "2.0s",
      results: processedTickets,
      summary: {
        categories: {
          Network: processedTickets.filter((t) => t.classification.category === "Network").length,
          Software: processedTickets.filter((t) => t.classification.category === "Software").length,
          Hardware: processedTickets.filter((t) => t.classification.category === "Hardware").length,
          Security: processedTickets.filter((t) => t.classification.category === "Security").length,
        },
        priorities: {
          Critical: processedTickets.filter((t) => t.classification.priority === "Critical").length,
          High: processedTickets.filter((t) => t.classification.priority === "High").length,
          Medium: processedTickets.filter((t) => t.classification.priority === "Medium").length,
          Low: processedTickets.filter((t) => t.classification.priority === "Low").length,
        },
      },
    }

    console.log("[v0] Bulk processing completed:", result.summary)

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error in bulk processing:", error)
    return NextResponse.json({ success: false, error: "Failed to process tickets in bulk" }, { status: 500 })
  }
}

function determineCategory(text: string): string {
  const categories = {
    network: ["network", "connection", "internet", "wifi", "ethernet"],
    software: ["software", "application", "install", "update", "license"],
    hardware: ["hardware", "printer", "computer", "laptop", "monitor"],
    security: ["security", "virus", "malware", "password", "access"],
  }

  const lowerText = text.toLowerCase()

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      return category.charAt(0).toUpperCase() + category.slice(1)
    }
  }

  return "General"
}

function determinePriority(text: string): string {
  const urgentKeywords = ["critical", "urgent", "down", "outage", "security"]
  const highKeywords = ["important", "asap", "priority", "manager"]

  const lowerText = text.toLowerCase()

  if (urgentKeywords.some((keyword) => lowerText.includes(keyword))) {
    return "Critical"
  } else if (highKeywords.some((keyword) => lowerText.includes(keyword))) {
    return "High"
  } else if (Math.random() > 0.6) {
    return "Medium"
  } else {
    return "Low"
  }
}
