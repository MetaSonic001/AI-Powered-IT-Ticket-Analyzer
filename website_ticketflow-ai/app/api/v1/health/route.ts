import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    console.log("[FastAPI] Health check requested")

    // Forward request to FastAPI backend
    const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[FastAPI] Health check failed:", error);
      return NextResponse.json(error, { status: response.status });
    }

    const healthData = await response.json();
    console.log("[FastAPI] Health check complete - status:", healthData.status);

    return NextResponse.json(healthData);
  } catch (error) {
    console.error("[FastAPI] Health check connection failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        detail: "Cannot connect to FastAPI backend",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 },
    )
  }
}
