"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bot,
  ArrowLeft,
  Users,
  Plus,
  MoreHorizontal,
  Mail,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Award,
  Target,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock team data
const teamMembers = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@company.com",
    role: "Senior Network Specialist",
    department: "IT Support",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    expertise: ["Network", "Infrastructure"],
    stats: {
      ticketsResolved: 156,
      avgResolutionTime: "2.1h",
      satisfaction: 4.8,
      activeTickets: 8,
    },
    workload: 75,
    lastActive: "Active now",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "Software Support Engineer",
    department: "IT Support",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    expertise: ["Software", "Applications"],
    stats: {
      ticketsResolved: 142,
      avgResolutionTime: "1.8h",
      satisfaction: 4.9,
      activeTickets: 6,
    },
    workload: 60,
    lastActive: "5 minutes ago",
  },
  {
    id: 3,
    name: "Mike Davis",
    email: "mike.davis@company.com",
    role: "Hardware Technician",
    department: "IT Support",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "away",
    expertise: ["Hardware", "Maintenance"],
    stats: {
      ticketsResolved: 98,
      avgResolutionTime: "3.2h",
      satisfaction: 4.6,
      activeTickets: 12,
    },
    workload: 90,
    lastActive: "2 hours ago",
  },
  {
    id: 4,
    name: "Emily Chen",
    email: "emily.chen@company.com",
    role: "Security Analyst",
    department: "IT Security",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    expertise: ["Security", "Compliance"],
    stats: {
      ticketsResolved: 89,
      avgResolutionTime: "4.1h",
      satisfaction: 4.9,
      activeTickets: 5,
    },
    workload: 45,
    lastActive: "Active now",
  },
]

const teamStats = {
  totalMembers: 12,
  activeMembers: 9,
  avgSatisfaction: 4.8,
  totalTicketsResolved: 1247,
  avgResolutionTime: "2.8h",
}

const recentActivities = [
  {
    user: "John Smith",
    action: "resolved ticket TF-2024-156",
    time: "5 minutes ago",
    type: "resolution",
  },
  {
    user: "Sarah Johnson",
    action: "was assigned ticket TF-2024-157",
    time: "12 minutes ago",
    type: "assignment",
  },
  {
    user: "Emily Chen",
    action: "updated security guidelines",
    time: "1 hour ago",
    type: "update",
  },
  {
    user: "Mike Davis",
    action: "completed hardware maintenance",
    time: "2 hours ago",
    type: "maintenance",
  },
]

export default function TeamManagementPage() {
  const [user, setUser] = useState<any>(null)
  const [selectedTab, setSelectedTab] = useState("overview")
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("ticketflow_user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getWorkloadColor = (workload: number) => {
    if (workload >= 80) return "text-red-600"
    if (workload >= 60) return "text-yellow-600"
    return "text-green-600"
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading team management...</p>
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
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Team Management</h1>
          <p className="text-muted-foreground">
            Monitor team performance, workload distribution, and collaboration efficiency.
          </p>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{teamStats.activeMembers} active</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.avgSatisfaction}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+0.2 from last month</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.totalTicketsResolved}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15% this month</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.avgResolutionTime}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">-12% improvement</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3% this week</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Team Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="workload">Workload</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Current team members and their status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                <AvatarFallback>
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                {member.expertise.map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="w-4 h-4" />
                                <span>{member.stats.ticketsResolved}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{member.stats.avgResolutionTime}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{member.stats.satisfaction}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">{member.lastActive}</span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    View Schedule
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Target className="w-4 h-4 mr-2" />
                                    Assign Ticket
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Individual team member performance analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                <AvatarFallback className="text-xs">
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{member.name}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="text-center">
                                <div className="font-semibold">{member.stats.ticketsResolved}</div>
                                <div className="text-muted-foreground">Resolved</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold">{member.stats.avgResolutionTime}</div>
                                <div className="text-muted-foreground">Avg Time</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold flex items-center">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                                  {member.stats.satisfaction}
                                </div>
                                <div className="text-muted-foreground">Rating</div>
                              </div>
                            </div>
                          </div>
                          <Progress value={(member.stats.ticketsResolved / 200) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="workload" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Workload Distribution</CardTitle>
                    <CardDescription>Active tickets and capacity management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                <AvatarFallback className="text-xs">
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium">{member.name}</span>
                                <div className="text-sm text-muted-foreground">
                                  {member.stats.activeTickets} active tickets
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-semibold ${getWorkloadColor(member.workload)}`}>
                                {member.workload}%
                              </div>
                              <div className="text-sm text-muted-foreground">Capacity</div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Progress value={member.workload} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Available</span>
                              <span>
                                {member.workload >= 90
                                  ? "Overloaded"
                                  : member.workload >= 80
                                    ? "High Load"
                                    : member.workload >= 60
                                      ? "Moderate"
                                      : "Available"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest team actions and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>This month's standout team members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamMembers
                  .sort((a, b) => b.stats.satisfaction - a.stats.satisfaction)
                  .slice(0, 3)
                  .map((member, index) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback className="text-xs">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.name}</p>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">{member.stats.satisfaction}</span>
                        </div>
                      </div>
                      {index === 0 && <Award className="w-4 h-4 text-yellow-500" />}
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Team Member
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <Target className="w-4 h-4 mr-2" />
                  Bulk Assign Tickets
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Performance Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
