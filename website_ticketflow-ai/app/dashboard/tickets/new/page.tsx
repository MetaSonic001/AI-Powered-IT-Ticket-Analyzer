"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot, ArrowLeft, Sparkles, Brain, Zap, Upload, X, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const router = useRouter()

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

    // Trigger AI analysis when title and description are filled
    if ((field === "title" || field === "description") && formData.title && formData.description) {
      triggerAIAnalysis()
    }
  }

  const triggerAIAnalysis = () => {
    if (!formData.title || !formData.description) return

    setIsAnalyzing(true)

    // Simulate AI analysis
    setTimeout(() => {
      const analysis = {
        suggestedCategory: "Network",
        suggestedPriority: "High",
        confidence: 87,
        similarTickets: [
          { id: "TF-2023-892", title: "Network connectivity issues", similarity: 94 },
          { id: "TF-2024-045", title: "Building A network problems", similarity: 78 },
        ],
        estimatedResolution: "2.5 hours",
        suggestedAssignee: "John Smith",
        suggestedTags: ["network", "connectivity", "infrastructure"],
      }
      setAiAnalysis(analysis)
      setIsAnalyzing(false)

      // Auto-fill suggestions
      setFormData((prev) => ({
        ...prev,
        category: analysis.suggestedCategory,
        priority: analysis.suggestedPriority,
        assignee: analysis.suggestedAssignee,
        tags: analysis.suggestedTags.join(", "),
      }))
    }, 2000)
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

    // Simulate ticket creation
    setTimeout(() => {
      const ticketId = `TF-2024-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`
      router.push(`/dashboard/tickets/${ticketId}?created=true`)
    }, 1500)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Ticket</h1>
          <p className="text-muted-foreground">
            Our AI will analyze your ticket and provide smart suggestions as you type.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Details</CardTitle>
                <CardDescription>
                  Provide as much detail as possible for better AI analysis and faster resolution.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Brief description of the issue"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed description of the issue, including steps to reproduce, error messages, and any troubleshooting already attempted..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={6}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Network">Network</SelectItem>
                          <SelectItem value="Software">Software</SelectItem>
                          <SelectItem value="Hardware">Hardware</SelectItem>
                          <SelectItem value="Security">Security</SelectItem>
                          <SelectItem value="Access">Access & Permissions</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Critical">Critical</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignee">Preferred Assignee (Optional)</Label>
                    <Select value={formData.assignee} onValueChange={(value) => handleInputChange("assignee", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Auto-assign based on expertise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="John Smith">John Smith (Network Specialist)</SelectItem>
                        <SelectItem value="Sarah Johnson">Sarah Johnson (Software Expert)</SelectItem>
                        <SelectItem value="Mike Davis">Mike Davis (Hardware Technician)</SelectItem>
                        <SelectItem value="Emily Chen">Emily Chen (Security Analyst)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (Optional)</Label>
                    <Input
                      id="tags"
                      placeholder="Comma-separated tags (e.g., urgent, building-a, printer)"
                      value={formData.tags}
                      onChange={(e) => handleInputChange("tags", e.target.value)}
                    />
                  </div>

                  {/* File Attachments */}
                  <div className="space-y-2">
                    <Label>Attachments</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        Choose Files
                      </Button>
                    </div>

                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">{file.name}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(index)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <Button type="submit" disabled={isSubmitting || !formData.title || !formData.description}>
                      {isSubmitting ? "Creating Ticket..." : "Create Ticket"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis Sidebar */}
          <div className="space-y-6">
            {/* AI Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <span>AI Analysis</span>
                </CardTitle>
                <CardDescription>Real-time analysis and suggestions based on your ticket content</CardDescription>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="text-center py-8">
                    <Bot className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse" />
                    <p className="text-sm text-muted-foreground">Analyzing ticket content...</p>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Analysis Confidence</span>
                      <Badge variant="secondary">{aiAnalysis.confidence}%</Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Suggested Category</p>
                        <p className="text-sm">{aiAnalysis.suggestedCategory}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Suggested Priority</p>
                        <Badge variant={aiAnalysis.suggestedPriority === "High" ? "destructive" : "default"}>
                          {aiAnalysis.suggestedPriority}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Est. Resolution Time</p>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-sm">{aiAnalysis.estimatedResolution}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Start typing to get AI-powered suggestions</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Similar Tickets */}
            {aiAnalysis?.similarTickets && (
              <Card>
                <CardHeader>
                  <CardTitle>Similar Tickets</CardTitle>
                  <CardDescription>Previously resolved tickets with similar issues</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiAnalysis.similarTickets.map((ticket: any, index: number) => (
                    <div key={index} className="p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{ticket.id}</span>
                        <Badge variant="outline" className="text-xs">
                          {ticket.similarity}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{ticket.title}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips for Better Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <p className="text-sm">Include specific error messages</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <p className="text-sm">Mention affected systems or locations</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <p className="text-sm">Describe steps already attempted</p>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <p className="text-sm">Attach screenshots or logs when relevant</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
