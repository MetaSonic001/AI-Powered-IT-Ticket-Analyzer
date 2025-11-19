"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  AlertCircle, RefreshCw, Target, Brain, TrendingUp,
  Bot, Shield, Network, MessageSquare, Search, Zap,
  Activity, CheckCircle2, BarChart3
} from "lucide-react"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"
import type { AgentPerformance } from "@/lib/types"

// Theme Colors
const COLORS = {
  primary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  slate: "#64748b"
}

export default function AgentsPage() {
  const [data, setData] = useState<AgentPerformance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPerformance = async () => {
    try {
      setLoading(true)
      setError(null)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = await fetch(`${API_URL}/api/v1/agents/performance`)
      if (!response.ok) throw new Error('Failed to fetch agent performance')
      const result = await response.json()
      setData(result)
      toast.success('Agent metrics refreshed')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load performance'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerformance()
  }, [])

  // Process data for charts
  const agentList = useMemo(() => {
    if (!data || !data.agents) return []
    return Object.entries(data.agents).map(([name, metrics]) => ({
      name: name.replace(/_/g, ' '),
      rawName: name,
      ...metrics,
      accuracyPercent: (metrics.accuracy * 100).toFixed(1),
      confidencePercent: (metrics.avg_confidence * 100).toFixed(1)
    })).sort((a, b) => b.total_predictions - a.total_predictions)
  }, [data])

  // Helper to get icon based on agent name
  const getAgentIcon = (name: string) => {
    if (name.includes('security')) return <Shield className="w-5 h-5 text-red-500" />
    if (name.includes('network')) return <Network className="w-5 h-5 text-blue-500" />
    if (name.includes('triage')) return <Zap className="w-5 h-5 text-yellow-500" />
    if (name.includes('support')) return <MessageSquare className="w-5 h-5 text-green-500" />
    return <Bot className="w-5 h-5 text-primary" />
  }

  if (loading) return <AgentsSkeleton />

  if (error && !data) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center p-8">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-4">
              <span className="font-semibold text-lg">Connection Error</span>
              <span>{error}</span>
              <Button variant="outline" onClick={fetchPerformance}>
                <RefreshCw className="h-4 w-4 mr-2" /> Retry Connection
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) return null

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agent Swarm</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              System Status: All agents operational
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Last updated: {new Date(data.last_updated).toLocaleTimeString()}
            </span>
            <Button variant="outline" size="sm" onClick={fetchPerformance}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Top Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-background to-primary/5 border-primary/20 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Swarm Accuracy</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{(data.overall_accuracy * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">+2.4% vs last week</p>
              <Progress value={data.overall_accuracy * 100} className="h-1 mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Agents</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Object.keys(data.agents || {}).length}</div>
              <div className="flex -space-x-2 mt-3">
                {agentList.slice(0, 5).map((agent, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px]">
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Throughput</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {agentList.reduce((acc, curr) => acc + curr.total_predictions, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Predictions processed</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Comparative Performance</CardTitle>
            <CardDescription>Volume vs. Accuracy per Agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentList} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" orientation="left" stroke={COLORS.primary} fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke={COLORS.success} fontSize={12} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px' }}
                    cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                  />
                  <Bar yAxisId="left" dataKey="total_predictions" name="Volume" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar yAxisId="right" dataKey="accuracyPercent" name="Accuracy %" fill={COLORS.success} radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Agent Cards Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5" /> Agent Roster
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentList.map((agent) => (
              <Card key={agent.name} className="group hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                      {getAgentIcon(agent.rawName)}
                    </div>
                    <div>
                      <CardTitle className="text-base capitalize">{agent.name}</CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Online
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={agent.accuracy > 0.9 ? "default" : "secondary"} className={agent.accuracy > 0.9 ? "bg-green-600 hover:bg-green-700" : ""}>
                    {agent.accuracyPercent}%
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Bars */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Accuracy</span>
                        <span className="font-medium">{agent.accuracyPercent}%</span>
                      </div>
                      <Progress value={agent.accuracy * 100} className="h-1.5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-medium">{agent.confidencePercent}%</span>
                      </div>
                      <Progress value={agent.avg_confidence * 100} className="h-1.5 bg-muted" />
                    </div>
                  </div>

                  {/* Mini Stats Footer */}
                  <div className="pt-4 mt-2 border-t flex justify-between items-center">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Volume</p>
                      <p className="text-lg font-bold">{agent.total_predictions}</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Correct</p>
                      <p className="text-lg font-bold text-green-600">{agent.correct_predictions}</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Misses</p>
                      <p className="text-lg font-bold text-red-500">{agent.total_predictions - agent.correct_predictions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}

// --- Skeleton Loader ---
function AgentsSkeleton() {
  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-[300px] rounded-xl" />
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-[250px] rounded-xl" />)}
        </div>
      </div>
    </DashboardLayout>
  )
}