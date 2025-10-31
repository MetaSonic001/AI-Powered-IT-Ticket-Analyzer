import { type NextRequest } from "next/server"
import { proxyToFastAPI } from "@/lib/api-proxy"

export async function POST(request: NextRequest) {
  return proxyToFastAPI(request, {
    endpoint: '/api/v1/solutions/recommend',
    method: 'POST',
    logPrefix: '[FastAPI Solutions]'
  });
}
