"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FALLBACK_TICKET_ANALYSIS, logFallbackUsage } from "@/lib/fallback-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Sparkles, AlertCircle, CheckCircle2, Clock, Target } from "lucide-react"
import { toast } from "sonner"
import type { TicketAnalysisRequest, TicketAnalysisResponse } from "@/lib/types"

export default function AnalyzeTicketPage() {
  const [loading, setLoading] = useState(false)
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
      setAnalysis(data)
      toast.success("Ticket analyzed successfully!")
    } catch (error) {
      logFallbackUsage("/api/v1/tickets/analyze", error)
      setAnalysis(FALLBACK_TICKET_ANALYSIS)
      toast.warning("Using fallback analysis - API unavailable")
      console.error("Analysis error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      Critical: "destructive",
      High: "default",
      Medium: "secondary",
      Low: "outline",
    }
    return colors[priority as keyof typeof colors] || "default"
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">AI Ticket Analyzer</h1>
            <p className="text-muted-foreground">Get instant AI-powered analysis and solutions</p>
          </div>
        </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Ticket for Analysis</CardTitle>
            <CardDescription>Fill in the details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Cannot connect to WiFi"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.requester_info?.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requester_info: { ...(formData.requester_info ?? { name: "", email: "", department: "" }), name: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.requester_info?.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requester_info: { ...(formData.requester_info ?? { name: "", email: "", department: "" }), email: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="IT, Sales, Finance, etc."
                  value={formData.requester_info?.department}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requester_info: { ...(formData.requester_info ?? { name: "", email: "", department: "" }), department: e.target.value },
                    })
                  }
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Analyzing..." : "Analyze Ticket"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <div className="space-y-4">
          {loading && (
            <Card className="border-primary">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-lg font-medium">AI is analyzing your ticket...</p>
                  <p className="text-sm text-muted-foreground">This may take a few seconds</p>
                </div>
              </CardContent>
            </Card>
          )}

          {analysis && (
            <>
              {/* Summary */}
              {analysis.summary && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription className="prose prose-sm dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: analysis.summary }} />
                  </AlertDescription>
                </Alert>
              )}

              {/* Classification */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Classification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Category</span>
                    <Badge variant="default">{analysis.classification.category}</Badge>
                  </div>
                  {analysis.classification.subcategory && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Subcategory</span>
                      <Badge variant="outline">{analysis.classification.subcategory}</Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Confidence</span>
                    <span className="text-sm font-bold">
                      {(analysis.classification.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  {analysis.classification.reasoning && (
                    <p className="text-sm text-muted-foreground pt-2 border-t">
                      {analysis.classification.reasoning}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Priority */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Priority Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Priority Level</span>
                    <Badge variant={getPriorityColor(analysis.priority_prediction.priority) as any}>
                      {analysis.priority_prediction.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Est. Resolution Time</span>
                    <span className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4" />
                      {analysis.priority_prediction.estimated_resolution_hours}h
                    </span>
                  </div>
                  {analysis.priority_prediction.factors && analysis.priority_prediction.factors.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <span className="text-sm font-medium">Key Factors:</span>
                      <ul className="space-y-1">
                        {analysis.priority_prediction.factors.map((factor, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Items */}
              {analysis.action_items && analysis.action_items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommended Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.action_items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                          <Badge className="h-6 w-6 flex items-center justify-center p-0 shrink-0">
                            {item.priority}
                          </Badge>
                          <div className="space-y-1 flex-1">
                            <p className="text-sm font-medium">{item.action}</p>
                            {item.urgency && (
                              <p className="text-xs text-muted-foreground">{item.urgency}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Solutions */}
              {analysis.recommended_solutions && analysis.recommended_solutions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommended Solutions</CardTitle>
                    <CardDescription>
                      {analysis.recommended_solutions.length} solution(s) found
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.recommended_solutions.map((solution, idx) => (
                      <div key={idx} className="space-y-3 p-4 border rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold">{solution.title}</h4>
                          <Badge variant="secondary">{(solution.similarity_score * 100).toFixed(0)}% match</Badge>
                        </div>
                        {solution.description && (
                          <p className="text-sm text-muted-foreground">{solution.description}</p>
                        )}
                        {solution.steps && solution.steps.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Steps:</p>
                            <ol className="space-y-1 ml-4">
                              {solution.steps.map((step, stepIdx) => (
                                <li key={stepIdx} className="text-sm text-muted-foreground list-decimal">
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                        <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
                          {solution.estimated_time_minutes && (
                            <span>⏱ {solution.estimated_time_minutes} min</span>
                          )}
                          {solution.success_rate && (
                            <span>✓ {(solution.success_rate * 100).toFixed(0)}% success</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Warnings */}
              {analysis.warnings && analysis.warnings.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {analysis.warnings.map((warning, idx) => (
                        <p key={idx} className="text-sm">
                          {warning.message}
                        </p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {!loading && !analysis && (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                  <Sparkles className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-lg font-medium text-muted-foreground">No analysis yet</p>
                  <p className="text-sm text-muted-foreground">
                    Fill in the form and click Analyze to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}
