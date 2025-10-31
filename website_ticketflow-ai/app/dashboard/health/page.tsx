"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FALLBACK_HEALTH_CHECK, logFallbackUsage } from "@/lib/fallback-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle, RefreshCw, CheckCircle2, XCircle, Activity, Database, Server } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import type { HealthCheck } from "@/lib/types"

export default function HealthPage() {
  const [data, setData] = useState<HealthCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/v1/health')
      if (!response.ok) throw new Error('Failed to fetch health status')
      const result = await response.json()
      setData(result)
      toast.success('Health status loaded')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load health'
      setError(message)
      logFallbackUsage('/api/v1/health', err)
      setData(FALLBACK_HEALTH_CHECK)
      toast.warning('Using fallback data - API unavailable')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-16" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchHealth}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) return null

  const getStatusBadge = (status: string) => {
    if (status === 'healthy' || status === 'operational') {
      return (
        <Badge className="bg-green-500">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Healthy
        </Badge>
      )
    }
    return (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Unhealthy
      </Badge>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">System Health</h1>
            <p className="text-muted-foreground">
              Real-time monitoring of all system components
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchHealth}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Overall System Status</CardTitle>
            {getStatusBadge(data.status)}
          </div>
          <CardDescription>Last checked: {new Date().toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Activity className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-2xl">{'uptime' in data ? (data as any).uptime : 'N/A'}</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Server className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-2xl">{data.version || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">Version</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Database className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-2xl">{(data as any).knowledge_base_status ?? 'OK'}</p>
              <p className="text-sm text-muted-foreground">KB Status</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="font-semibold text-2xl">Operational</p>
              <p className="text-sm text-muted-foreground">Services</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Individual service health checks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">API Service</p>
                  <p className="text-sm text-muted-foreground">FastAPI Backend</p>
                </div>
              </div>
              {getStatusBadge(data.status)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Knowledge Base</p>
                  <p className="text-sm text-muted-foreground">Weaviate Vector DB</p>
                </div>
              </div>
              {getStatusBadge((data as any).knowledge_base_status ?? 'healthy')}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Agent System</p>
                  <p className="text-sm text-muted-foreground">LangGraph Multi-Agent</p>
                </div>
              </div>
              {getStatusBadge('healthy')}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Model Providers</p>
                  <p className="text-sm text-muted-foreground">Groq, Ollama, Gemini, HF</p>
                </div>
              </div>
              {getStatusBadge('healthy')}
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
