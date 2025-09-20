import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching AI model status")

    const modelStatus = {
      models: [
        {
          id: "classification_v2.1",
          name: "Ticket Classification Model",
          status: "online",
          version: "2.1.4",
          accuracy: 94.2,
          lastTrained: "2024-01-15T08:30:00Z",
          trainingDataSize: 125000,
          inferenceTime: 0.3,
          memoryUsage: "2.1GB",
          requestsProcessed: 15420,
          errorRate: 0.008,
        },
        {
          id: "recommendation_v1.8",
          name: "Solution Recommendation Engine",
          status: "online",
          version: "1.8.2",
          accuracy: 87.5,
          lastTrained: "2024-01-12T14:15:00Z",
          trainingDataSize: 89000,
          inferenceTime: 0.8,
          memoryUsage: "3.4GB",
          requestsProcessed: 8930,
          errorRate: 0.012,
        },
        {
          id: "priority_v1.3",
          name: "Priority Prediction Model",
          status: "online",
          version: "1.3.1",
          accuracy: 91.8,
          lastTrained: "2024-01-18T11:45:00Z",
          trainingDataSize: 67000,
          inferenceTime: 0.2,
          memoryUsage: "1.8GB",
          requestsProcessed: 12340,
          errorRate: 0.005,
        },
        {
          id: "sentiment_v0.9",
          name: "Sentiment Analysis Model",
          status: "updating",
          version: "0.9.3",
          accuracy: 89.1,
          lastTrained: "2024-01-20T16:20:00Z",
          trainingDataSize: 45000,
          inferenceTime: 0.4,
          memoryUsage: "1.2GB",
          requestsProcessed: 5670,
          errorRate: 0.015,
        },
      ],
      systemMetrics: {
        totalGpuMemory: "24GB",
        usedGpuMemory: "8.5GB",
        cpuUsage: 0.45,
        averageInferenceTime: 0.42,
        totalRequests: 42360,
        successRate: 0.991,
      },
      performance: {
        throughput: 150, // requests per minute
        latency: {
          p50: 0.3,
          p95: 0.8,
          p99: 1.2,
        },
        availability: 99.8,
      },
    }

    console.log("[v0] Model status retrieved for", modelStatus.models.length, "models")

    return NextResponse.json({
      success: true,
      data: modelStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error fetching model status:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch model status" }, { status: 500 })
  }
}
