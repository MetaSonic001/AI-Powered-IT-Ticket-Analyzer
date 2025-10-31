"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FALLBACK_MODEL_STATUS, logFallbackUsage } from "@/lib/fallback-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle, RefreshCw, CheckCircle2, XCircle, Activity } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import type { ModelStatus } from "@/lib/types"

export default function ModelsPage() {
  const [data, setData] = useState<ModelStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/v1/models/status`)
      if (!response.ok) throw new Error('Failed to fetch model status')
      const result = await response.json()
      setData(result)
      toast.success('Model status loaded')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load status'
      setError(message)
      logFallbackUsage('/api/v1/models/status', err)
      setData(FALLBACK_MODEL_STATUS)
      toast.warning('Using fallback data - API unavailable')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 60000)
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
            <Button variant="outline" size="sm" onClick={fetchStatus}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) return null

  // Safe accessors with defaults - explicitly typed to include error property
  type ProviderWithError = { available: boolean; model?: string; models?: string[] | Record<string, string>; error?: string | null }
  
  const groq: ProviderWithError = data.groq || { available: false, model: 'N/A', error: null }
  const ollama: ProviderWithError = data.ollama || { available: false, models: [], error: null }
  const gemini: ProviderWithError = data.gemini || { available: false, model: 'N/A', error: null }
  const huggingface: ProviderWithError = data.huggingface || { available: false, models: {}, error: null }
  const primaryProvider = data.primary_provider || 'N/A'
  const fallbackChain = data.fallback_chain || []

  const getStatusBadge = (available: boolean) => {
    if (available) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Available
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        <XCircle className="w-3 h-3 mr-1" />
        Unavailable
      </Badge>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Model Status</h1>
            <p className="text-muted-foreground">
              AI model provider status and availability
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {/* Groq */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Groq</CardTitle>
              {getStatusBadge(groq.available)}
            </div>
            <CardDescription>Fast inference LLM provider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Model:</span>
              <span className="font-mono">{groq.model ?? 'N/A'}</span>
            </div>
            {groq.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{groq.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Ollama */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ollama</CardTitle>
              {getStatusBadge(ollama.available)}
            </div>
            <CardDescription>Local LLM provider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Model:</span>
              <span className="font-mono">{Array.isArray(ollama.models) ? (ollama.models as string[]).join(', ') || 'None' : 'None'}</span>
            </div>
            {ollama.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{ollama.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Gemini */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Google Gemini</CardTitle>
              {getStatusBadge(gemini.available)}
            </div>
            <CardDescription>Google's multimodal AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Model:</span>
              <span className="font-mono">{gemini.model ?? 'N/A'}</span>
            </div>
            {gemini.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{gemini.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* HuggingFace */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>HuggingFace</CardTitle>
              {getStatusBadge(huggingface.available)}
            </div>
            <CardDescription>Open-source model hub</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Models:</span>
              <span className="font-mono text-xs">
                {typeof huggingface.models === 'object' && huggingface.models !== null
                  ? Object.keys(huggingface.models).length > 0
                    ? Object.keys(huggingface.models).join(', ')
                    : 'None'
                  : 'None'}
              </span>
            </div>
            {huggingface.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{huggingface.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Active Configuration</CardTitle>
          <CardDescription>Currently active model providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Primary Provider</span>
              <Badge variant="outline">{primaryProvider}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Total Available Providers</span>
              <Badge variant="outline">
                {[groq.available, ollama.available, gemini.available, huggingface.available].filter(Boolean).length} / 4
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
