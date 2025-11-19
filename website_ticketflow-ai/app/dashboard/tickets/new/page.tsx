"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bot, ArrowLeft, Sparkles, Brain, Zap, Upload, X,
  CheckCircle2, Clock, AlertTriangle, FileText, Loader2,
  Save, ChevronRight
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

export default function NewTicketPage() {
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    category: "",
    assignee: "",
    tags: "",
  })

  // UI States
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [analysisProgress, setAnalysisProgress] = useState(0)

  const router = useRouter()
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const userData = localStorage.getItem("ticketflow_user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Debounce AI analysis trigger
    if ((field === "title" || field === "description") && value.length > 40) {
      const timeoutId = setTimeout(() => triggerAIAnalysis(field === "title" ? value : formData.title, field === "description" ? value : formData.description), 1000)
      return () => clearTimeout(timeoutId)
    }
  }

  const triggerAIAnalysis = async (currentTitle?: string, currentDescription?: string) => {
    const title = currentTitle || formData.title
    const description = currentDescription || formData.description

    if (!title || !description || description.length < 10) return

    setIsAnalyzing(true)
    setAnalysisProgress(10)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      // 1. Parallel calls for classification and priority
      const [classRes, prioRes, searchRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/tickets/classify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description })
        }),
        fetch(`${API_URL}/api/v1/tickets/predict-priority`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description })
        }),
        fetch(`${API_URL}/api/v1/solutions/search?q=${encodeURIComponent(title + " " + description)}&limit=3`)
      ])

      setAnalysisProgress(60)

      const classData = await classRes.json()
      const prioData = await prioRes.json()
      const searchData = await searchRes.json()

      setAnalysisProgress(90)

      const analysis = {
        suggestedCategory: classData.classification?.category || "General",
        suggestedPriority: prioData.priority || "Medium",
        confidence: Math.round((classData.classification?.confidence || 0) * 100),
        similarTickets: (searchData.results || []).map((r: any) => ({
          id: r.doc_id,
          title: r.title || "Related Article",
          snippet: r.content_snippet || "No preview available.",
          category: r.category || "General",
          similarity: Math.round((r.score || 0) * 100)
        })),
        estimatedResolution: `${prioData.estimated_resolution_hours || 2} hours`,
        suggestedAssignee: "AI Auto-Assign", // Not provided by these endpoints
        suggestedTags: [classData.classification?.subcategory, prioData.priority].filter(Boolean),
        sentiment: "Neutral" // Not provided
      }

      setAiAnalysis(analysis)

      // Only auto-fill if fields are empty
      setFormData((prev) => ({
        ...prev,
        category: prev.category || analysis.suggestedCategory,
        priority: prev.priority || analysis.suggestedPriority,
        tags: prev.tags || analysis.suggestedTags.join(", "),
      }))

    } catch (error) {
      console.error("AI Analysis failed:", error)
      // Don't show error toast for background analysis to avoid annoyance
    } finally {
      setAnalysisProgress(100)
      setIsAnalyzing(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachments((prev) => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const payload = {
        title: formData.title,
        description: formData.description,
        requester_info: {
          name: user.name || "Unknown User",
          email: user.email || "unknown@example.com",
          department: user.department || "General"
        },
        additional_context: {
          category: formData.category,
          priority: formData.priority,
          tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean)
        }
      }

      const response = await fetch(`${API_URL}/api/v1/tickets/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to submit ticket')

      const result = await response.json()
      const ticketId = result.ticket_id || result.ticket_info?.ticket_id // Handle potential response variations

      toast.success("Ticket created successfully")
      router.push(`/dashboard/tickets/${ticketId}?created=true`)

    } catch (error) {
      console.error("Submission failed:", error)
      toast.error("Failed to create ticket. Please try again.")
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/20">
      {/* Background Texture */}
      <div className="fixed inset-0 -z-50 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-full h-8 w-8 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span className="font-semibold text-sm flex items-center text-muted-foreground">
              Tickets <ChevronRight className="w-4 h-4 mx-1" /> New Ticket
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline-block">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2 animate-pulse"></span>
              AI Agent Online
            </span>
            <Button variant="outline" size="sm" disabled={isSubmitting}>Save Draft</Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: FORM */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Submit a Request</h1>
              <p className="text-muted-foreground text-lg">Describe your issue and let our AI categorize it for you.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Details */}
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-medium">Subject</Label>
                    <Input
                      id="title"
                      placeholder="e.g. VPN connection failing on macOS"
                      className="text-lg h-12 bg-muted/20"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      autoFocus
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-medium">Description</Label>
                    <div className="relative">
                      <Textarea
                        id="description"
                        ref={descriptionRef}
                        placeholder="Please describe the issue in detail..."
                        className="min-h-[250px] resize-y bg-muted/20 text-base leading-relaxed p-4"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        required
                      />
                      {/* Floating AI Hint */}
                      <AnimatePresence>
                        {!formData.description && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-4 right-4 pointer-events-none"
                          >
                            <Badge variant="outline" className="bg-background/80 backdrop-blur text-muted-foreground font-normal">
                              <Sparkles className="w-3 h-3 mr-2 text-primary" />
                              AI is ready to analyze
                            </Badge>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 2: Classification */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Classification</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => handleInputChange("category", v)}>
                      <SelectTrigger className="h-11 bg-muted/20">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Network", "Software", "Hardware", "Access", "Security"].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Urgency</Label>
                    <Select value={formData.priority} onValueChange={(v) => handleInputChange("priority", v)}>
                      <SelectTrigger className="h-11 bg-muted/20">
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low - Can wait</SelectItem>
                        <SelectItem value="Medium">Medium - Business impacted</SelectItem>
                        <SelectItem value="High">High - System down</SelectItem>
                        <SelectItem value="Critical">Critical - Organization halted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>Tags</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        className="pl-10 h-11 bg-muted/20"
                        placeholder="e.g. wifi, floor-3, macbook (comma separated)"
                        value={formData.tags}
                        onChange={(e) => handleInputChange("tags", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 3: Attachments */}
              <div className="space-y-4">
                <Label className="text-lg">Attachments</Label>
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 text-center hover:bg-muted/20 transition-colors cursor-pointer bg-muted/5"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">Click to upload or drag and drop</h3>
                  <p className="text-sm text-muted-foreground mt-1">SVG, PNG, JPG or PDF (max. 10MB)</p>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {attachments.map((file, index) => (
                      <motion.div
                        key={`${file.name}-${index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center justify-between p-3 bg-card border rounded-lg shadow-sm"
                      >
                        <div className="flex items-center truncate">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center mr-3 text-blue-600">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-sm truncate max-w-[100px]">{file.name}</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAttachment(index)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" size="lg" className="w-full md:w-auto px-8" disabled={isSubmitting || !formData.title}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Ticket
                </Button>
              </div>
            </form>
          </motion.div>

          {/* RIGHT COLUMN: STICKY AI SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">

              {/* AI Copilot Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-background shadow-lg overflow-hidden"
              >
                <div className="p-4 border-b border-primary/10 bg-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Bot className="w-5 h-5" />
                    Ticket Copilot
                  </div>
                  {isAnalyzing && <span className="text-xs text-muted-foreground animate-pulse">Thinking...</span>}
                </div>

                <div className="p-5 space-y-6">
                  {/* Empty State */}
                  {!isAnalyzing && !aiAnalysis && (
                    <div className="text-center py-8 px-4">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                        <Zap className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Start typing your description. I'll automatically analyze urgency, categorize the issue, and find similar tickets.
                      </p>
                    </div>
                  )}

                  {/* Loading State */}
                  {isAnalyzing && (
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Analyzing context...</span>
                          <span>{analysisProgress}%</span>
                        </div>
                        <Progress value={analysisProgress} className="h-1.5" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted/50 rounded w-3/4 animate-pulse" />
                        <div className="h-4 bg-muted/50 rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                  )}

                  {/* Results State */}
                  {aiAnalysis && !isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-5"
                    >
                      {/* Confidence Score */}
                      <div className="flex items-center justify-between bg-background/50 p-3 rounded-lg border">
                        <span className="text-sm text-muted-foreground">AI Confidence</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${aiAnalysis.confidence}%` }} />
                          </div>
                          <span className="text-sm font-bold">{aiAnalysis.confidence}%</span>
                        </div>
                      </div>

                      {/* Predictions */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-background border">
                          <div className="text-xs text-muted-foreground mb-1">Suggestion</div>
                          <div className="font-semibold text-sm">{aiAnalysis.suggestedCategory}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-background border">
                          <div className="text-xs text-muted-foreground mb-1">Priority</div>
                          <Badge variant={aiAnalysis.suggestedPriority === 'High' ? 'destructive' : 'default'} className="text-xs">
                            {aiAnalysis.suggestedPriority}
                          </Badge>
                        </div>
                      </div>

                      {/* Time Estimate */}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                        <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Est. Resolution: {aiAnalysis.estimatedResolution}
                          </div>
                          <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            Based on 50+ similar historical tickets.
                          </div>
                        </div>
                      </div>

                      {/* Related Articles */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Related Articles</h4>
                        <div className="space-y-3">
                          {aiAnalysis.similarTickets.map((article: any, i: number) => (
                            <div key={i} className="p-3 rounded-md bg-card border hover:border-primary/50 transition-colors group">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <span className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                                  {article.title}
                                </span>
                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 shrink-0">
                                  {article.category}
                                </Badge>
                              </div>

                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {article.snippet}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                  <span className="text-[10px] font-mono text-muted-foreground">
                                    {article.similarity}% Match
                                  </span>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                                  View Article
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-muted/20 border-t text-xs text-center text-muted-foreground">
                  Powered by TicketFlow LLM-v4
                </div>
              </motion.div>

              {/* Helper Box */}
              <div className="p-4 rounded-xl border bg-card/50 text-sm space-y-2">
                <div className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Pro Tip
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Including error codes (e.g. "Error 503") and screenshots increases auto-resolution success by 40%.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}