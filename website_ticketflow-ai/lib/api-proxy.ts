/**
 * API Proxy Helper
 * Handles forwarding requests from Next.js API routes to FastAPI backend
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ProxyOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  logPrefix?: string;
}

/**
 * Proxy a request to the FastAPI backend
 */
export async function proxyToFastAPI(
  request: NextRequest,
  options: ProxyOptions
): Promise<NextResponse> {
  const {endpoint, method = 'POST', logPrefix = '[FastAPI]'} = options;
  
  try {
    let body: unknown = undefined;
    
    // Only read body for methods that support it
    if (method === 'POST' || method === 'PUT') {
      try {
        body = await request.json();
        console.log(`${logPrefix} Request to ${endpoint}:`, body);
      } catch {
        // No body or invalid JSON
      }
    } else {
      console.log(`${logPrefix} Request to ${endpoint}`);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    // Add query parameters for GET requests
    if (method === 'GET') {
      const { searchParams } = new URL(request.url);
      const queryString = searchParams.toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;
      
      const response = await fetch(fullUrl, fetchOptions);
      return await handleResponse(response, logPrefix);
    }

    const response = await fetch(url, fetchOptions);
    return await handleResponse(response, logPrefix);
    
  } catch (error) {
    console.error(`${logPrefix} Connection error:`, error);
    return NextResponse.json(
      {
        detail: 'Cannot connect to FastAPI backend. Ensure the backend is running on port 8000.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}

/**
 * Handle the response from FastAPI
 */
async function handleResponse(
  response: Response,
  logPrefix: string
): Promise<NextResponse> {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
    }
    console.error(`${logPrefix} Error response:`, errorData);
    return NextResponse.json(errorData, { status: response.status });
  }

  const data = await response.json();
  console.log(`${logPrefix} Success`);
  return NextResponse.json(data);
}
