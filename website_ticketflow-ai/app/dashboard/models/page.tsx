"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  AlertCircle, RefreshCw, CheckCircle2, XCircle,
  Cpu, Zap, Box, Sparkles, Brain, Server,
  ArrowRight, Activity, ShieldCheck
} from "lucide-react"
import { toast } from "sonner"
import type { ModelStatus } from "@/lib/types"

// --- Types & Helpers ---
type ProviderWithError = {
  available: boolean;
  model?: string;
  models?: string[] | Record<string, string>;
  error?: string | null
}

export default function ModelsPage() {
  const [data, setData] = useState<ModelStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/v1/models/status`)
      if (!response.ok) throw new Error('Failed to fetch model status')
      const result = await response.json()
      setData(result)
      setLastUpdated(new Date())
      toast.success('System health refreshed')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load status'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const runDiagnostics = async () => {
    try {
      setLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      toast.info('Initiating model service reload...')

      const response = await fetch(`${API_URL}/api/v1/models/reload`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to reload models')

      toast.success('Diagnostics complete: Models reloaded')
      await fetchStatus()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Diagnostics failed'
      toast.error(message)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) return <ModelsSkeleton />

  if (error && !data) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Alert variant="destructive" className="max-w-md border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-4">
              <span className="font-semibold">Gateway Connection Failed</span>
              <p className="text-xs opacity-90">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchStatus} className="w-full bg-background hover:bg-accent text-foreground">
                <RefreshCw className="h-4 w-4 mr-2" /> Reconnect
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) return null

  // Safe Data Destructuring
  const providers = data.providers || {}
  const groq: ProviderWithError = providers.groq || { available: false, model: 'N/A' }
  const ollama: ProviderWithError = providers.ollama || { available: false, models: [] }
  const gemini: ProviderWithError = providers.gemini || { available: false, model: 'N/A' }
  const huggingface: ProviderWithError = providers.huggingface || { available: false, models: {} }

  const primaryProvider = data.primary_provider || 'None'
  const fallbackChain = data.fallback_chain || []
  const availableCount = [groq.available, ollama.available, gemini.available, huggingface.available].filter(Boolean).length

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Server className="w-8 h-8 text-primary" />
              Model Gateway
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              Orchestration Layer Status
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-xs text-muted-foreground">Last Scan</p>
              <p className="text-sm font-mono">{lastUpdated.toLocaleTimeString()}</p>
            </div>
            <Button variant="outline" onClick={runDiagnostics} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Run Diagnostics
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* Active Pipeline Visualization */}
          <Card className="md:col-span-3 bg-gradient-to-r from-background to-muted/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Inference Pipeline</CardTitle>
                <Badge variant={availableCount > 0 ? "default" : "destructive"}>
                  {availableCount > 0 ? "Operational" : "System Down"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {fallbackChain.length > 0 ? (
                  fallbackChain.map((provider: string, index: number) => (
                    <div key={provider} className="flex items-center">
                      <div className={`
                               flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all
                               ${index === 0 ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20' : 'bg-background text-muted-foreground'}
                            `}>
                        <span className="text-xs font-bold">{index + 1}</span>
                        <span className="font-medium capitalize">{provider}</span>
                        {index === 0 && <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse ml-1" />}
                      </div>
                      {index < fallbackChain.length - 1 && (
                        <ArrowRight className="w-4 h-4 mx-2 text-muted-foreground/40" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center text-destructive gap-2">
                    <AlertCircle className="w-5 h-5" /> No providers configured in fallback chain
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Provider Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {/* 1. Groq Card */}
          <ProviderCard
            name="Groq"
            icon={Zap}
            available={groq.available}
            isPrimary={primaryProvider === 'groq'}
            color="text-orange-600"
            borderColor="border-l-orange-600"
          >
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Model</span>
                <Badge variant="secondary" className="font-mono text-xs">{groq.model || 'Unknown'}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Latency</span>
                <span className="text-green-600 text-xs font-medium flex items-center gap-1">~150ms <Zap className="w-3 h-3" /></span>
              </div>
              {groq.error && <ErrorDisplay message={groq.error} />}
            </div>
          </ProviderCard>

          {/* 2. Ollama Card */}
          <ProviderCard
            name="Ollama"
            icon={Box}
            available={ollama.available}
            isPrimary={primaryProvider === 'ollama'}
            color="text-sky-600"
            borderColor="border-l-sky-600"
          >
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Loaded Models</span>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(ollama.models) && ollama.models.length > 0 ? (
                    (ollama.models as string[]).map(m => (
                      <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>
                    ))
                  ) : (
                    <span className="text-xs italic text-muted-foreground">No models loaded</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-sm pt-2">
                <span className="text-muted-foreground">Type</span>
                <span className="text-xs font-medium">Local Host</span>
              </div>
              {ollama.error && <ErrorDisplay message={ollama.error} />}
            </div>
          </ProviderCard>

          {/* 3. Gemini Card */}
          <ProviderCard
            name="Gemini"
            icon={Sparkles}
            available={gemini.available}
            isPrimary={primaryProvider === 'gemini'}
            color="text-purple-600"
            borderColor="border-l-purple-600"
          >
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Model</span>
                <Badge variant="secondary" className="font-mono text-xs">{gemini.model || 'Unknown'}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Context Window</span>
                <span className="text-xs font-medium">128k Tokens</span>
              </div>
              {gemini.error && <ErrorDisplay message={gemini.error} />}
            </div>
          </ProviderCard>

          {/* 4. HuggingFace Card */}
          <ProviderCard
            name="HuggingFace"
            icon={Brain}
            available={huggingface.available}
            isPrimary={primaryProvider === 'huggingface'}
            color="text-yellow-500"
            borderColor="border-l-yellow-500"
          >
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Endpoints</span>
                <div className="text-xs font-mono truncate">
                  {typeof huggingface.models === 'object' && huggingface.models
                    ? Object.keys(huggingface.models).length + ' Active'
                    : '0 Active'}
                </div>
              </div>
              <div className="flex justify-between text-sm pt-2">
                <span className="text-muted-foreground">Rate Limit</span>
                <span className="text-xs font-medium">Standard</span>
              </div>
              {huggingface.error && <ErrorDisplay message={huggingface.error} />}
            </div>
          </ProviderCard>

        </div>
      </div>
    </DashboardLayout>
  )
}

// --- Sub Components ---

function ProviderCard({ name, icon: Icon, available, isPrimary, children, color, borderColor }: any) {
  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-md border-l-4 ${available ? borderColor : 'border-l-muted'}`}>
      {isPrimary && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded-bl-lg">
          Primary
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-muted ${available ? color : 'text-muted-foreground'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            <CardDescription className="flex items-center gap-1.5 text-xs mt-0.5">
              {available ? (
                <><CheckCircle2 className="w-3 h-3 text-green-500" /> Operational</>
              ) : (
                <><XCircle className="w-3 h-3 text-destructive" /> Offline</>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive flex gap-2 items-start">
      <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
      <span className="line-clamp-2">{message}</span>
    </div>
  )
}

function ModelsSkeleton() {
  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    </DashboardLayout>
  )
}