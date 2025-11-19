"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bot,
  ArrowLeft,
  Clock,
  User,
  MessageSquare,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Sparkles,
  Send,
  Paperclip,
  MoreHorizontal,
  Share2,
  History,
  Tag,
  ChevronRight,
  ThumbsUp,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function TicketDetailPage() {
  const [user, setUser] = useState<any>(null)
  const [comment, setComment] = useState("")
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string

  useEffect(() => {
    const userData = localStorage.getItem("ticketflow_user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  useEffect(() => {
    if (!ticketId) return

    const fetchTicket = async () => {
      try {
        setLoading(true)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${API_URL}/api/v1/tickets/${ticketId}`)

        if (!response.ok) {
          if (response.status === 404) throw new Error("Ticket not found")
          throw new Error("Failed to fetch ticket details")
        }

        const data = await response.json()
        setTicket(data)
      } catch (err) {
        console.error("Error fetching ticket:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
        toast.error("Failed to load ticket details")
      } finally {
        setLoading(false)
      }
    }

    fetchTicket()
  }, [ticketId])

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="col-span-4 space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">Ticket Not Found</h2>
          <p className="text-muted-foreground">{error || "The requested ticket could not be loaded."}</p>
          <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    )
  }

  // Derived state for UI rendering
  const aiRecommendations = ticket.recommended_solutions || []
  const ticketHistory = [
    {
      id: 1,
      type: "created",
      user: ticket.requester_info?.name || "Unknown User",
      initials: (ticket.requester_info?.name || "U").charAt(0),
      timestamp: ticket.created_at,
      content: `Ticket created - ${ticket.title}`,
    },
    {
      id: 2,
      type: "ai_analysis",
      user: "TicketFlow AI",
      initials: "AI",
      timestamp: ticket.created_at, // Assuming analysis happens at creation
      content: `Classified as ${ticket.category}/${ticket.priority} priority with ${(ticket.classification_confidence * 100).toFixed(0)}% confidence`,
    }
  ]

  return (
    <div className="min-h-screen bg-background/95 text-foreground selection:bg-primary/10">
      {/* Background Texture */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-border/60" />
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-muted-foreground">{ticket.ticket_id}</span>
              <Badge variant={ticket.status === 'In Progress' ? 'default' : 'secondary'} className="rounded-full">
                {ticket.status}
              </Badge>
              <h1 className="font-semibold text-sm hidden md:block truncate max-w-md">{ticket.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/20">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Resolve
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* LEFT COLUMN: Context & Chat (8 cols) */}
          <div className="xl:col-span-8 space-y-6">

            {/* Main Ticket Card */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
                        {ticket.priority} Priority
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {ticket.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl md:text-2xl leading-tight">
                      {ticket.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </CardContent>
            </Card>

            {/* AI Copilot Section */}
            <div className="relative rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50/50 dark:bg-violet-900/10 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24 text-violet-600" />
              </div>

              <div className="p-6 relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-violet-100 dark:bg-violet-900/50 rounded-lg">
                    <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="font-semibold text-violet-900 dark:text-violet-100">AI Insights</h3>
                  <Badge variant="secondary" className="bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/50 dark:text-violet-300">
                    {(ticket.classification_confidence * 100).toFixed(0)}% Confidence
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {aiRecommendations.map((rec: any, index: number) => (
                    <div key={index} className="bg-background/80 backdrop-blur-sm border border-violet-100 dark:border-violet-900/30 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm group-hover:text-violet-700 transition-colors">{rec.solution || rec.title || "Recommendation"}</h4>
                        <span className="text-xs font-mono text-muted-foreground">{(rec.confidence_score * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{rec.description || "No description available"}</p>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs w-full">Apply Fix</Button>
                      </div>
                    </div>
                  ))}
                  {aiRecommendations.length === 0 && (
                    <div className="col-span-2 text-center text-muted-foreground text-sm py-4">
                      No specific recommendations available.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Activity Stream / Conversation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Activity
                </h3>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                  Filter <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>

              <div className="relative space-y-6 pb-8">
                {/* Vertical Line */}
                <div className="absolute left-6 top-4 bottom-0 w-px bg-border/60 -z-10" />

                {ticketHistory.map((activity) => (
                  <div key={activity.id} className="flex gap-4 group">
                    <div className="relative">
                      <Avatar className={`h-12 w-12 border-4 border-background ${activity.type === 'ai_analysis' ? 'bg-violet-50' : 'bg-muted'}`}>
                        <AvatarFallback className={activity.type === 'ai_analysis' ? 'text-violet-600' : ''}>
                          {activity.type === 'ai_analysis' ? <Bot className="w-5 h-5" /> : activity.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1">
                      <div className="bg-card border rounded-xl p-4 shadow-sm group-hover:border-primary/20 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-sm">{activity.user}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {activity.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <div className="flex gap-4 pt-4 sticky bottom-6 z-10">
                <Avatar className="h-12 w-12 border-4 border-background hidden sm:block">
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-background border rounded-xl shadow-lg p-4 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <Textarea
                    placeholder="Reply to this ticket... (Type / for AI templates)"
                    className="min-h-[80px] border-0 focus-visible:ring-0 p-0 resize-none bg-transparent"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/40">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Zap className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button size="sm" disabled={!comment.trim()} className="rounded-full px-6">
                      Send Reply <Send className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (4 cols) */}
          <div className="xl:col-span-4 space-y-6">

            {/* Quick Actions */}
            <Card className="bg-muted/30 border-none shadow-inner">
              <CardContent className="p-4 grid grid-cols-2 gap-3">
                <Button variant="outline" className="bg-background h-20 flex flex-col gap-2 hover:border-primary/50 hover:text-primary transition-all">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-xs">Escalate</span>
                </Button>
                <Button variant="outline" className="bg-background h-20 flex flex-col gap-2 hover:border-primary/50 hover:text-primary transition-all">
                  <User className="w-5 h-5" />
                  <span className="text-xs">Reassign</span>
                </Button>
                <Button variant="outline" className="bg-background h-20 flex flex-col gap-2 hover:border-primary/50 hover:text-primary transition-all">
                  <History className="w-5 h-5" />
                  <span className="text-xs">Log Time</span>
                </Button>
                <Button variant="outline" className="bg-background h-20 flex flex-col gap-2 hover:border-primary/50 hover:text-primary transition-all">
                  <ThumbsUp className="w-5 h-5" />
                  <span className="text-xs">Approval</span>
                </Button>
              </CardContent>
            </Card>

            {/* People */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">People</h4>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{(ticket.suggested_assignee || "U").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{ticket.suggested_assignee || "Unassigned"}</span>
                    <span className="text-xs text-muted-foreground">Assignee</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs h-7">Change</Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">{(ticket.requester_info?.name || "U").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{ticket.requester_info?.name || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground">Reporter</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7"><MessageSquare className="w-3 h-3" /></Button>
              </div>
            </div>

            <Separator />

            {/* Details Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-card border rounded-lg space-y-1">
                  <span className="text-xs text-muted-foreground block">Est. Time</span>
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {ticket.estimated_resolution_hours ? `${ticket.estimated_resolution_hours} hours` : "N/A"}
                  </span>
                </div>
                <div className="p-3 bg-card border rounded-lg space-y-1">
                  <span className="text-xs text-muted-foreground block">Due Date</span>
                  <span className="text-sm font-medium">Tomorrow, 5PM</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                Tags <Button variant="ghost" size="icon" className="h-5 w-5"><MoreHorizontal className="w-3 h-3" /></Button>
              </h4>
              <div className="flex flex-wrap gap-2">
                {(ticket.tags || []).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs font-normal bg-muted hover:bg-muted-foreground/20 transition-colors cursor-pointer">
                    <Tag className="w-3 h-3 mr-1 opacity-50" />
                    {tag}
                  </Badge>
                ))}
                <button className="text-xs text-muted-foreground hover:text-primary underline decoration-dotted underline-offset-2">
                  + Add Tag
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}