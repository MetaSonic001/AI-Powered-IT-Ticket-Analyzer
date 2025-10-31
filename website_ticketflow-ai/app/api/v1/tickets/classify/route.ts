import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[FastAPI] Classifying ticket:", body)

    const response = await fetch(`${API_BASE_URL}/api/v1/tickets/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[FastAPI] Error classifying ticket:", error)
    return NextResponse.json(
      { detail: 'Failed to classify ticket' },
      { status: 500 }
    );
  }
}
