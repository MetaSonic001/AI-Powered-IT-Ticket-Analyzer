import { type NextRequest, NextResponse } from "next/server"

// Ensure this route is always dynamic (no prerender) and not cached
export const dynamic = "force-dynamic"
export const revalidate = 0

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log("[FastAPI] Analyzing ticket:", body)

    // Forward request to FastAPI backend
    const response = await fetch(`${API_BASE_URL}/api/v1/tickets/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[FastAPI] Error response:", error);
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log("[FastAPI] Analysis complete");

    return NextResponse.json(data);
  } catch (error) {
    console.error("[FastAPI] Error analyzing ticket:", error)
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Failed to analyze ticket' },
      { status: 500 }
    );
  }
}

function determineCategory(text: string): string {
  const categories = {
    network: ["network", "connection", "internet", "wifi", "ethernet", "vpn"],
    software: ["software", "application", "install", "update", "license", "program"],
    hardware: ["hardware", "printer", "computer", "laptop", "monitor", "keyboard"],
    security: ["security", "virus", "malware", "password", "access", "login"],
    email: ["email", "outlook", "mail", "smtp", "exchange"],
  }

  const lowerText = text.toLowerCase()

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      return category.charAt(0).toUpperCase() + category.slice(1)
    }
  }

  return "General"
}

function determineSubcategory(text: string): string {
  const subcategories = [
    "Connectivity Issues",
    "Software Installation",
    "Hardware Failure",
    "Security Incident",
    "User Access",
    "Performance Issues",
    "Configuration",
  ]
  return subcategories[Math.floor(Math.random() * subcategories.length)]
}

function determinePriority(text: string): string {
  const urgentKeywords = ["critical", "urgent", "down", "outage", "security", "breach"]
  const highKeywords = ["important", "asap", "priority", "manager", "client"]

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

function generateSolutionRecommendations(text: string) {
  const solutions = [
    {
      id: 1,
      title: "Restart Network Services",
      description: "Restart the network adapter and flush DNS cache",
      confidence: 0.85,
      steps: [
        "Open Command Prompt as Administrator",
        "Run 'ipconfig /flushdns'",
        "Run 'netsh winsock reset'",
        "Restart the computer",
      ],
      estimatedTime: "10 minutes",
      successRate: "78%",
    },
    {
      id: 2,
      title: "Update Network Drivers",
      description: "Download and install latest network drivers",
      confidence: 0.72,
      steps: [
        "Open Device Manager",
        "Locate Network Adapters",
        "Right-click and select 'Update Driver'",
        "Choose 'Search automatically for drivers'",
      ],
      estimatedTime: "15 minutes",
      successRate: "65%",
    },
    {
      id: 3,
      title: "Check Network Configuration",
      description: "Verify IP settings and network configuration",
      confidence: 0.68,
      steps: [
        "Open Network and Sharing Center",
        "Click 'Change adapter settings'",
        "Right-click connection and select 'Properties'",
        "Verify TCP/IP settings",
      ],
      estimatedTime: "5 minutes",
      successRate: "82%",
    },
  ]

  return solutions.sort((a, b) => b.confidence - a.confidence)
}

function generateSimilarTickets() {
  return [
    {
      id: "TF-2024-156",
      title: "Network connectivity issues in Building B",
      similarity: 0.92,
      resolution: "Resolved by restarting network services",
      resolutionTime: "45 minutes",
    },
    {
      id: "TF-2024-134",
      title: "Internet connection dropping frequently",
      similarity: 0.87,
      resolution: "Updated network drivers",
      resolutionTime: "1.2 hours",
    },
    {
      id: "TF-2024-098",
      title: "Cannot access company network",
      similarity: 0.81,
      resolution: "Reconfigured network settings",
      resolutionTime: "30 minutes",
    },
  ]
}
