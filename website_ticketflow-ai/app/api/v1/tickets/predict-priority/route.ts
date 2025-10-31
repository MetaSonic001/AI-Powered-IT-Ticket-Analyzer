import { type NextRequest, NextResponse } from "next/server"
import { proxyToFastAPI } from "@/lib/api-proxy"

export async function POST(request: NextRequest) {
  try {
    // If you prefer to forward the request to FastAPI, uncomment the following line:
    // return proxyToFastAPI(request, { endpoint: '/api/v1/tickets/predict-priority', method: 'POST', logPrefix: '[FastAPI Priority]' });

    // Safely parse JSON body and extract title/description with fallbacks
    const body = await request.json().catch(() => ({}))
    const title = typeof body.title === "string" ? body.title : ""
    const description = typeof body.description === "string" ? body.description : ""

    // Simulate AI priority prediction processing time
    await new Promise((resolve) => setTimeout(resolve, 400))

    const combinedText = `${title} ${description}`.trim()

    const priorityPrediction = {
      ticketId: `TF-${Date.now()}`,
      priority: {
        level: determinePriority(combinedText),
        confidence: Math.random() * 0.2 + 0.8, // 80-100% confidence
        reasoning: generatePriorityReasoning(combinedText),
        factors: analyzePriorityFactors(combinedText),
      },
      escalation: {
        required: Math.random() > 0.7,
        timeframe: Math.random() > 0.5 ? "immediate" : "within 4 hours",
        stakeholders: ["IT Manager", "Security Team"],
      },
      slaImpact: {
        targetResolution: calculateSLATarget(determinePriority(combinedText)),
        riskLevel: Math.random() > 0.6 ? "high" : "medium",
        businessImpact: Math.random() > 0.5 ? "critical" : "moderate",
      },
      recommendations: {
        assignTo: "Senior Technician",
        urgencyLevel: Math.floor(Math.random() * 5) + 1, // 1-5 scale
        resourcesNeeded: ["Network Access", "Admin Rights"],
      },
    }

    console.log("[v0] Priority prediction complete:", priorityPrediction.priority.level)

    return NextResponse.json({
      success: true,
      data: priorityPrediction,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error predicting priority:", error)
    return NextResponse.json({ success: false, error: "Failed to predict ticket priority" }, { status: 500 })
  }
}

function determinePriority(text: string): string {
  const urgentKeywords = ["critical", "urgent", "down", "outage", "security", "breach", "server", "network down"]
  const highKeywords = ["important", "asap", "priority", "manager", "client", "deadline", "production"]
  const mediumKeywords = ["issue", "problem", "help", "support", "question"]

  const lowerText = text.toLowerCase()

  if (urgentKeywords.some((keyword) => lowerText.includes(keyword))) {
    return "Critical"
  } else if (highKeywords.some((keyword) => lowerText.includes(keyword))) {
    return "High"
  } else if (mediumKeywords.some((keyword) => lowerText.includes(keyword))) {
    return "Medium"
  } else {
    return "Low"
  }
}

function generatePriorityReasoning(text: string): string {
  const reasons = [
    "Contains critical system keywords indicating potential service disruption",
    "Business impact assessment suggests high priority classification",
    "Historical pattern analysis indicates urgent attention required",
    "Security-related content detected requiring immediate response",
    "Multiple users affected based on description analysis",
    "Standard priority based on content analysis and keywords",
  ]
  return reasons[Math.floor(Math.random() * reasons.length)]
}

function analyzePriorityFactors(text: string) {
  return {
    urgencyKeywords: Math.floor(Math.random() * 5) + 1,
    businessImpact: Math.random() * 0.4 + 0.6, // 60-100%
    userCount: Math.floor(Math.random() * 50) + 1,
    systemCriticality: Math.random() * 0.5 + 0.5, // 50-100%
    timeConstraints: Math.random() > 0.7,
  }
}

function calculateSLATarget(priority: string): string {
  const slaTargets = {
    Critical: "1 hour",
    High: "4 hours",
    Medium: "24 hours",
    Low: "72 hours",
  }
  return slaTargets[priority as keyof typeof slaTargets] || "24 hours"
}
