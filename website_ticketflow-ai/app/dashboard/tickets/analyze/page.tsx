"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Loader2, Sparkles, AlertCircle, CheckCircle2, Clock, Target,
  Brain, Zap, ArrowRight, Lightbulb, ShieldAlert, FileText,
  User, Building, Mail
} from "lucide-react"
import { toast } from "sonner"
import type { TicketAnalysisRequest, TicketAnalysisResponse } from "@/lib/types"

export default function AnalyzeTicketPage() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [formData, setFormData] = useState<TicketAnalysisRequest>({
    title: "",
    description: "",
    requester_info: {
      name: "",
      email: "",
      department: "",
    },
  })
  const [analysis, setAnalysis] = useState<TicketAnalysisResponse | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setAnalysis(null)
    setProgress(0)

    // Simulate progress for better UX while fetching
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10))
    }, 200)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = await fetch(`${API_URL}/api/v1/tickets/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze ticket")
      }

      const data: TicketAnalysisResponse = await response.json()

      clearInterval(interval)
      setProgress(100)

      // Small delay to show 100% completion before showing data
      setTimeout(() => {
        setAnalysis(data)
        setLoading(false)
        toast.success("Analysis complete")
      }, 500)

    } catch (error) {
      clearInterval(interval)
      console.error("Analysis error:", error)
      toast.error("Failed to connect to Analysis Engine")
      setLoading(false)
    }
  }

  const getPriorityStyles = (priority: string) => {
    const styles: Record<string, string> = {
      Critical: "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800",
      High: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800",
      Medium: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800",
      Low: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700",
    }
    return styles[priority] || styles.Low
  }

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-background relative selection:bg-primary/20">
        {/* Background Grids */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="max-w-[1600px] mx-auto p-6 lg:p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                Ticket Analyzer
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Paste your ticket details below. Our LLM engine will categorize, prioritize, and suggest solutions instantly.
              </p>
            </div>
            {!loading && !analysis && (
              <Badge variant="outline" className="hidden md:flex px-3 py-1 text-sm border-primary/20 bg-primary/5 text-primary">
                <Sparkles className="w-3 h-3 mr-2" /> AI Model V4.2 Ready
              </Badge>
            )}
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">

            {/* LEFT COLUMN: INPUT FORM */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Ticket Details</CardTitle>
                  <CardDescription>Required information for analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="font-medium">Subject Line</Label>
                      <Input
                        id="title"
                        placeholder="e.g. VPN failing for Sales team"
                        className="bg-background/50"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        autoFocus
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="font-medium">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Paste full ticket content, error logs, or user message..."
                        className="min-h-[200px] resize-y bg-background/50 font-mono text-sm leading-relaxed"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      />
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <Label className="mb-4 block text-muted-foreground text-xs uppercase tracking-wider font-semibold">Requester Context (Optional)</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Name"
                              className="pl-9 bg-background/50"
                              value={formData.requester_info?.name}
                              onChange={(e) => setFormData({ ...formData, requester_info: { ...formData.requester_info, name: e.target.value } as any })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="relative">
                            <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Department"
                              className="pl-9 bg-background/50"
                              value={formData.requester_info?.department}
                              onChange={(e) => setFormData({ ...formData, requester_info: { ...formData.requester_info, department: e.target.value } as any })}
                            />
                          </div>
                        </div>
                        <div className="col-span-2 space-y-2">
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Email Address"
                              className="pl-9 bg-background/50"
                              value={formData.requester_info?.email}
                              onChange={(e) => setFormData({ ...formData, requester_info: { ...formData.requester_info, email: e.target.value } as any })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full shadow-lg shadow-primary/20" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Request...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" /> Run Analysis
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN: ANALYSIS RESULTS (STICKY) */}
            <div className="lg:col-span-7">
              <div className="sticky top-6 space-y-6">

                {/* 1. EMPTY STATE */}
                {!loading && !analysis && (
                  <div className="h-[600px] border-2 border-dashed border-muted-foreground/20 rounded-xl flex flex-col items-center justify-center text-center p-8 bg-muted/5">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                      <Sparkles className="h-10 w-10 text-primary/40" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground/80">Ready to Analyze</h3>
                    <p className="text-muted-foreground max-w-sm mt-2 mb-8">
                      The AI engine is standing by. Submit a ticket details to generate classification, priority scoring, and resolution steps.
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground/60">
                      <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Classification</div>
                      <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Sentiment</div>
                      <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Solutions</div>
                    </div>
                  </div>
                )}

                {/* 2. LOADING STATE */}
                {loading && (
                  <Card className="border-primary/20 bg-gradient-to-b from-background to-primary/5 overflow-hidden">
                    <CardContent className="p-12 text-center space-y-8">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-4 border-muted rounded-full" />
                        <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin" />
                        <Brain className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium animate-pulse">Analyzing Context & Semantics...</h3>
                        <Progress value={progress} className="h-2 w-64 mx-auto" />
                        <p className="text-xs text-muted-foreground pt-2">Connecting to Inference Engine...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 3. RESULTS STATE */}
                <AnimatePresence mode="wait">
                  {analysis && !loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Top Summary Alert */}
                      {analysis.summary && (
                        <Alert className="bg-primary/5 border-primary/20">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <AlertTitle className="text-primary font-medium mb-2">AI Summary</AlertTitle>
                          <AlertDescription className="text-foreground/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: analysis.summary }} />
                        </Alert>
                      )}

                      {/* Main Metrics Grid */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Classification Card */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Classification</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="text-2xl font-bold text-foreground">{analysis.classification.category}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <ArrowRight className="w-3 h-3" /> {analysis.classification.subcategory || "General"}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Confidence Score</span>
                                <span className="font-bold">{(analysis.classification.confidence * 100).toFixed(0)}%</span>
                              </div>
                              <Progress value={analysis.classification.confidence * 100} className="h-1.5" />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Priority Card */}
                        <Card className="relative overflow-hidden">
                          <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full ${analysis.priority_prediction.priority === 'Critical' ? 'bg-red-500' : 'bg-blue-500'}`} />
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Priority</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className={`px-3 py-1 text-base font-semibold ${getPriorityStyles(analysis.priority_prediction.priority)}`}>
                                {analysis.priority_prediction.priority}
                              </Badge>
                              <div className="flex items-center text-sm font-medium text-muted-foreground">
                                <Clock className="w-4 h-4 mr-1" />
                                {analysis.priority_prediction.estimated_resolution_hours}h est.
                              </div>
                            </div>

                            {/* Factors */}
                            {analysis.priority_prediction.factors && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {analysis.priority_prediction.factors.slice(0, 2).map((factor, i) => (
                                  <span key={i} className="text-xs bg-muted px-2 py-1 rounded border truncate max-w-[150px]">
                                    {factor}
                                  </span>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Recommended Actions */}
                      {analysis.action_items && analysis.action_items.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                              <Target className="w-4 h-4 text-primary" /> Recommended Actions
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                              {analysis.action_items.map((item, idx) => (
                                <div key={idx} className="p-4 flex gap-4 hover:bg-muted/30 transition-colors">
                                  <div className="mt-0.5">
                                    <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center p-0 border-primary/30 text-primary bg-primary/5">
                                      {idx + 1}
                                    </Badge>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium">{item.action}</p>
                                    {item.urgency && <p className="text-xs text-muted-foreground">{item.urgency}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Suggested Solutions (Expandable) */}
                      {analysis.recommended_solutions && analysis.recommended_solutions.length > 0 && (
                        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                              <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Suggested Solutions
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {analysis.recommended_solutions.map((solution, idx) => (
                              <div key={idx} className="bg-background border rounded-lg p-4 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-semibold text-sm">{solution.title}</h4>
                                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                    {(solution.similarity_score * 100).toFixed(0)}% Match
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{solution.description}</p>

                                {solution.steps && (
                                  <div className="bg-muted/30 rounded p-3">
                                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Execution Steps</p>
                                    <ol className="space-y-1 list-decimal list-inside text-sm">
                                      {solution.steps.map((step, sIdx) => (
                                        <li key={sIdx} className="text-foreground/90">{step}</li>
                                      ))}
                                    </ol>
                                  </div>
                                )}
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {/* Warnings */}
                      {analysis.warnings && analysis.warnings.length > 0 && (
                        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 p-4 flex gap-3">
                          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">Analysis Warnings</h4>
                            <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-300">
                              {analysis.warnings.map((w, i) => <li key={i}>{w.message}</li>)}
                            </ul>
                          </div>
                        </div>
                      )}

                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}