"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  ArrowLeft,
  Clock,
  User,
  MessageSquare,
  Zap,
  CheckCircle,
  AlertTriangle,
  Brain,
  Sparkles,
  Send,
  Paperclip,
  MoreHorizontal,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

// Mock ticket data
const ticketDetails = {
  id: "TF-2024-001",
  title: "Network connectivity issues in Building A",
  description:
    "Users in Building A are experiencing intermittent network connectivity issues. The problem started around 9:00 AM and affects approximately 50 users across multiple departments. Initial troubleshooting shows potential switch configuration issues.",
  priority: "High",
  status: "In Progress",
  category: "Network",
  assignee: "John Smith",
  requester: "Alice Johnson",
  created: "2024-01-15T09:15:00Z",
  updated: "2024-01-15T11:30:00Z",
  estimatedResolution: "2.5 hours",
  aiConfidence: 94,
  tags: ["network", "connectivity", "building-a", "switch"],
}

const aiRecommendations = [
  {
    id: 1,
    title: "Check Switch Configuration",
    description: "Review VLAN configuration on Building A network switch",
    confidence: 94,
    similarity: "Similar to TF-2023-892",
    steps: [
      "Access switch management interface",
      "Review VLAN configuration",
      "Check port assignments",
      "Verify trunk configurations",
    ],
  },
  {
    id: 2,
    title: "Restart Network Services",
    description: "Restart DHCP and DNS services on the affected network segment",
    confidence: 87,
    similarity: "Similar to TF-2024-045",
    steps: ["Connect to network server", "Restart DHCP service", "Restart DNS service", "Monitor service status"],
  },
]

const ticketHistory = [
  {
    id: 1,
    type: "created",
    user: "Alice Johnson",
    timestamp: "2024-01-15T09:15:00Z",
    content: "Ticket created - Network connectivity issues reported",
  },
  {
    id: 2,
    type: "ai_analysis",
    user: "TicketFlow AI",
    timestamp: "2024-01-15T09:16:00Z",
    content: "AI analysis completed - Classified as Network/High priority with 94% confidence",
  },
  {
    id: 3,
    type: "assigned",
    user: "System",
    timestamp: "2024-01-15T09:17:00Z",
    content: "Ticket assigned to John Smith based on expertise matching",
  },
  {
    id: 4,
    type: "comment",
    user: "John Smith",
    timestamp: "2024-01-15T10:30:00Z",
    content: "Initial investigation shows switch configuration issues. Working on resolution.",
  },
  {
    id: 5,
    type: "status_change",
    user: "John Smith",
    timestamp: "2024-01-15T11:30:00Z",
    content: "Status changed from Open to In Progress",
  },
]

export default function TicketDetailPage() {
  const [user, setUser] = useState<any>(null)
  const [comment, setComment] = useState("")
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("ticketflow_user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const handleAddComment = () => {
    if (comment.trim()) {
      // Add comment logic here
      setComment("")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading ticket...</p>
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
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-muted-foreground">{ticketDetails.id}</span>
                      <Badge
                        variant={
                          ticketDetails.priority === "Critical"
                            ? "destructive"
                            : ticketDetails.priority === "High"
                              ? "destructive"
                              : "default"
                        }
                      >
                        {ticketDetails.priority}
                      </Badge>
                      <Badge variant="outline">{ticketDetails.category}</Badge>
                    </div>
                    <CardTitle className="text-2xl">{ticketDetails.title}</CardTitle>
                    <CardDescription>{ticketDetails.description}</CardDescription>
                  </div>
                  <Badge variant={ticketDetails.status === "Resolved" ? "default" : "secondary"} className="ml-4">
                    {ticketDetails.status}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <span>AI Recommendations</span>
                  <Badge variant="secondary" className="ml-2">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {ticketDetails.aiConfidence}% Confidence
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Smart solution suggestions based on historical data and pattern matching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiRecommendations.map((rec) => (
                  <div key={rec.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {rec.confidence}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                    <p className="text-xs text-muted-foreground mb-3">{rec.similarity}</p>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Suggested Steps:</p>
                      <ol className="text-sm text-muted-foreground space-y-1">
                        {rec.steps.map((step, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-primary font-medium">{index + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm">Apply Solution</Button>
                      <Button size="sm" variant="outline">
                        Mark Helpful
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Complete history of ticket updates and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ticketHistory.map((activity, index) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {activity.type === "ai_analysis" ? (
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        ) : activity.type === "comment" ? (
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="font-medium">{activity.user}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{formatDate(activity.timestamp)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{activity.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add Comment */}
            <Card>
              <CardHeader>
                <CardTitle>Add Comment</CardTitle>
                <CardDescription>Share updates or ask questions about this ticket</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your comment here..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                  />
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm">
                      <Paperclip className="w-4 h-4 mr-2" />
                      Attach File
                    </Button>
                    <Button onClick={handleAddComment} disabled={!comment.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      Add Comment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assignee</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">JS</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{ticketDetails.assignee}</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Requester</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">AJ</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{ticketDetails.requester}</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm mt-1">{formatDate(ticketDetails.created)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm mt-1">{formatDate(ticketDetails.updated)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Est. Resolution</p>
                  <p className="text-sm mt-1">{ticketDetails.estimatedResolution}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {ticketDetails.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" size="sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Resolved
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Reassign Ticket
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Escalate Priority
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Run AI Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
