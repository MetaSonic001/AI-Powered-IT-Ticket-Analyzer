import { type NextRequest } from "next/server"  
import { proxyToFastAPI } from "@/lib/api-proxy"  
  
export async function GET(request: NextRequest) {  
  return proxyToFastAPI(request, {  
    endpoint: '/api/v1/solutions/search',  
    method: 'GET',  
    logPrefix: '[FastAPI Search]'  
  });  
}  
  
export async function POST(request: NextRequest) {  
  return proxyToFastAPI(request, {  
    endpoint: '/api/v1/solutions/search',  
    method: 'POST',  
    logPrefix: '[FastAPI Search]'  
  });  
} 
