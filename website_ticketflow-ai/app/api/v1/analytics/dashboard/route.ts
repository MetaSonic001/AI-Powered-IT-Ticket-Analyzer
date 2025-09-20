import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching dashboard analytics")

    // Simulate API processing time
    await new Promise((resolve) => setTimeout(resolve, 800))

    const dashboardData = {
      metrics: {
        totalTickets: {
          current: 285,
          previous: 254,
          change: 12.2,
          trend: "up",
        },
        avgResolutionTime: {
          current: 2.4,
          previous: 2.9,
          change: -17.2,
          trend: "down",
          unit: "hours",
        },
        aiAccuracy: {
          current: 94.2,
          previous: 92.1,
          change: 2.3,
          trend: "up",
          unit: "percent",
        },
        productivity: {
          current: 87,
          previous: 82,
          change: 6.1,
          trend: "up",
          unit: "percent",
        },
      },
      ticketVolume: [
        { date: "2024-01-15", created: 45, resolved: 38, pending: 7 },
        { date: "2024-01-16", created: 52, resolved: 48, pending: 11 },
        { date: "2024-01-17", created: 38, resolved: 35, pending: 14 },
        { date: "2024-01-18", created: 61, resolved: 55, pending: 20 },
        { date: "2024-01-19", created: 48, resolved: 42, pending: 26 },
        { date: "2024-01-20", created: 23, resolved: 21, pending: 28 },
        { date: "2024-01-21", created: 18, resolved: 16, pending: 30 },
      ],
      categoryDistribution: [
        { category: "Network", count: 98, percentage: 34.4 },
        { category: "Software", count: 79, percentage: 27.7 },
        { category: "Hardware", count: 63, percentage: 22.1 },
        { category: "Security", count: 28, percentage: 9.8 },
        { category: "Email", count: 17, percentage: 6.0 },
      ],
      teamPerformance: [
        { name: "John Smith", resolved: 45, avgTime: 2.1, accuracy: 96 },
        { name: "Sarah Johnson", resolved: 38, avgTime: 2.3, accuracy: 94 },
        { name: "Mike Davis", resolved: 42, avgTime: 1.9, accuracy: 97 },
        { name: "Emily Chen", resolved: 35, avgTime: 2.8, accuracy: 92 },
      ],
      systemHealth: {
        classificationModel: { status: "online", uptime: 99.8, lastUpdate: "2024-01-21T10:30:00Z" },
        recommendationEngine: { status: "online", uptime: 99.5, lastUpdate: "2024-01-21T09:15:00Z" },
        analyticsService: { status: "updating", uptime: 98.2, lastUpdate: "2024-01-21T08:45:00Z" },
      },
    }

    console.log("[v0] Dashboard data prepared")

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error fetching dashboard data:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
