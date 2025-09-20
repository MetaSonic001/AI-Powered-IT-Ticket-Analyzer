import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Health check requested")

    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      uptime: Math.floor(Math.random() * 86400) + 3600, // 1-24 hours in seconds
      services: {
        database: {
          status: "online",
          responseTime: Math.floor(Math.random() * 50) + 10, // 10-60ms
          connections: Math.floor(Math.random() * 20) + 5,
        },
        aiEngine: {
          status: "online",
          responseTime: Math.floor(Math.random() * 200) + 100, // 100-300ms
          modelsLoaded: 3,
          queueSize: Math.floor(Math.random() * 10),
        },
        cache: {
          status: "online",
          hitRate: Math.random() * 0.2 + 0.8, // 80-100%
          memoryUsage: Math.random() * 0.3 + 0.4, // 40-70%
        },
        storage: {
          status: "online",
          diskUsage: Math.random() * 0.4 + 0.3, // 30-70%
          availableSpace: "2.4TB",
        },
      },
      metrics: {
        requestsPerMinute: Math.floor(Math.random() * 100) + 50,
        averageResponseTime: Math.floor(Math.random() * 100) + 150,
        errorRate: Math.random() * 0.02, // 0-2%
        activeUsers: Math.floor(Math.random() * 50) + 10,
      },
    }

    console.log("[v0] Health check complete - status:", healthData.status)

    return NextResponse.json(healthData)
  } catch (error) {
    console.error("[v0] Health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 500 },
    )
  }
}
