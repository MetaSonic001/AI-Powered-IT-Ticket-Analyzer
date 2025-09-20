import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body

    console.log("[v0] Classifying ticket text:", text)

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500))

    const categories = [
      { name: "Network", confidence: Math.random() * 0.4 + 0.6 },
      { name: "Software", confidence: Math.random() * 0.4 + 0.6 },
      { name: "Hardware", confidence: Math.random() * 0.4 + 0.6 },
      { name: "Security", confidence: Math.random() * 0.4 + 0.6 },
      { name: "Email", confidence: Math.random() * 0.4 + 0.6 },
    ]

    // Sort by confidence and return top result
    categories.sort((a, b) => b.confidence - a.confidence)

    const result = {
      primaryCategory: categories[0],
      allCategories: categories,
      processingTime: "0.5s",
    }

    console.log("[v0] Classification result:", result)

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error classifying ticket:", error)
    return NextResponse.json({ success: false, error: "Failed to classify ticket" }, { status: 500 })
  }
}
