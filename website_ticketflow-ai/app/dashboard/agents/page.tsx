"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FALLBACK_AGENT_PERFORMANCE, logFallbackUsage } from "@/lib/fallback-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle, RefreshCw, Target, Brain, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import type { AgentPerformance } from "@/lib/types"

export default function AgentsPage() {
  const [data, setData] = useState<AgentPerformance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPerformance = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/v1/agents/performance')
      if (!response.ok) throw new Error('Failed to fetch agent performance')
      const result = await response.json()
      setData(result)
      toast.success('Agent performance loaded')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load performance'
      setError(message)
      logFallbackUsage('/api/v1/agents/performance', err)
      setData(FALLBACK_AGENT_PERFORMANCE)
      toast.warning('Using fallback data - API unavailable')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerformance()
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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
            <Button variant="outline" size="sm" onClick={fetchPerformance}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) return null

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Agent Performance</h1>
            <p className="text-muted-foreground">
              Multi-agent system performance metrics and accuracy
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPerformance}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Accuracy Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.overall_accuracy * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-2">Overall system performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(data.agents || {}).length}</div>
            <p className="text-xs text-muted-foreground mt-2">Active agents in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(data.last_updated).toLocaleDateString()}</div>
            <p className="text-xs text-muted-foreground mt-2">{new Date(data.last_updated).toLocaleTimeString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Breakdown</CardTitle>
          <CardDescription>Individual agent performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.agents || {}).map(([agent, metrics]) => (
              <div key={agent} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold capitalize">{agent.replace(/_/g, ' ')}</h3>
                  <Badge variant="outline">
                    Accuracy: {(metrics.accuracy * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Predictions</p>
                    <p className="font-semibold">{metrics.total_predictions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Correct</p>
                    <p className="font-semibold">{metrics.correct_predictions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Accuracy</p>
                    <p className="font-semibold">{(metrics.accuracy * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Confidence</p>
                    <p className="font-semibold">{(metrics.avg_confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
