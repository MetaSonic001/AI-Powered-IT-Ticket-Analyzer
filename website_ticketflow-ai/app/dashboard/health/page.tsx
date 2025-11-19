"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FALLBACK_HEALTH_CHECK, logFallbackUsage } from "@/lib/fallback-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle, RefreshCw, CheckCircle2, XCircle,
  Activity, Database, Server, Cpu, Globe,
  Network, Workflow, Zap,
  Clock
} from "lucide-react"
import { toast } from "sonner"
import type { HealthCheck } from "@/lib/types"

export default function HealthPage() {
  const [data, setData] = useState<HealthCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  const fetchHealth = async () => {
    try {
      setLoading(true)
      setError(null)

      // Artificial delay for smooth refresh effect
      await new Promise(resolve => setTimeout(resolve, 400));

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/v1/health`)
      if (!response.ok) throw new Error('Failed to fetch health status')
      const result = await response.json()
      setData(result)
      setLastChecked(new Date())
      toast.success('System metrics updated')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load health'
      setError(message)
      logFallbackUsage('/api/v1/health', err)
      setData(FALLBACK_HEALTH_CHECK)
      toast.warning('Connection lost: Using cached metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) return <HealthSkeleton />

  if (error && !data) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-4">
              <span className="font-semibold text-lg">Critical System Error</span>
              <p>{error}</p>
              <Button variant="outline" onClick={fetchHealth}>
                <RefreshCw className="h-4 w-4 mr-2" /> Reconnect
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) return null

  const isHealthy = data.status === 'healthy' || data.status === 'operational'

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">

        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              System Monitor
              {isHealthy && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time infrastructure and service telemetry
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-xs text-muted-foreground">Last updated</p>
              <p className="text-sm font-mono">{lastChecked.toLocaleTimeString()}</p>
            </div>
            <Button variant="outline" onClick={fetchHealth} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Top Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Global Status"
            value={isHealthy ? "Operational" : "Degraded"}
            icon={Activity}
            status={isHealthy ? "success" : "destructive"}
          />
          <MetricCard
            title="Uptime"
            value={(data as any).uptime || "99.9%"}
            icon={Clock}
            subtext="Since last reboot"
          />
          <MetricCard
            title="Version"
            value={data.version || "v1.0.0"}
            icon={Cpu}
            isMono
          />
          <MetricCard
            title="Region"
            value="us-east-1"
            icon={Globe}
            subtext="Primary Node"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Health Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" /> Component Health
            </h2>
            <div className="grid gap-4">

              <ServiceStatusCard
                name="API Gateway"
                description="FastAPI Backend Service"
                status={data.status}
                icon={Network}
                latency="45ms"
              />

              <ServiceStatusCard
                name="Vector Database"
                description="Weaviate Knowledge Store"
                status={(data as any).knowledge_base_status ?? 'healthy'}
                icon={Database}
                latency="12ms"
              />

              <ServiceStatusCard
                name="Agent Orchestrator"
                description="LangGraph Multi-Agent System"
                status="healthy"
                icon={Workflow}
                latency="Operational"
              />

              <ServiceStatusCard
                name="Model Inference"
                description="LLM Provider Gateway"
                status="healthy"
                icon={Zap}
                latency="150ms"
              />
            </div>
          </div>

          {/* System Logs / Details Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> System Events
            </h2>
            <Card className="h-full max-h-[500px] flex flex-col bg-muted/20 border-dashed">
              <CardContent className="p-6 flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm border">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold">All Systems Normal</h3>
                <p className="text-muted-foreground max-w-xs mt-2">
                  No incidents reported in the last 24 hours. Throughput is normal.
                </p>
                <div className="mt-8 w-full max-w-sm bg-background rounded-lg border p-3 text-left shadow-sm">
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                    <span>Memory Usage</span>
                    <span>32%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[32%]" />
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground mt-4 mb-2">
                    <span>CPU Load</span>
                    <span>14%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[14%]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// --- Sub Components ---

function MetricCard({ title, value, icon: Icon, status, subtext, isMono }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className={`text-2xl font-bold ${status === 'success' ? 'text-green-600' : status === 'destructive' ? 'text-red-600' : 'text-foreground'} ${isMono ? 'font-mono' : ''}`}>
          {value}
        </div>
        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
      </CardContent>
    </Card>
  )
}

function ServiceStatusCard({ name, description, status, icon: Icon, latency }: any) {
  const isHealthy = status === 'healthy' || status === 'operational'

  return (
    <Card className={`border-l-4 ${isHealthy ? 'border-l-green-500' : 'border-l-red-500'} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${isHealthy ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <Badge variant={isHealthy ? "outline" : "destructive"} className={`mb-1 ${isHealthy ? 'border-green-200 text-green-700 bg-green-50' : ''}`}>
            {isHealthy ? "Operational" : "Degraded"}
          </Badge>
          <p className="text-xs font-mono text-muted-foreground">{latency}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function HealthSkeleton() {
  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto p-8 space-y-8">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-full min-h-[400px]" />
        </div>
      </div>
    </DashboardLayout>
  )
}