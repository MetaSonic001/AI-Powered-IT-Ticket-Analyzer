import { type NextRequest } from "next/server"  
import { proxyToFastAPI } from "@/lib/api-proxy"  
  
export async function GET(request: NextRequest) {  
  return proxyToFastAPI(request, {  
    endpoint: '/api/v1/analytics/dashboard',  
    method: 'GET',  
    logPrefix: '[FastAPI Analytics]'  
  });  
} 
