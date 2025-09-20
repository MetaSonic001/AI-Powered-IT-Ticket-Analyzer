"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CommandPalette } from "@/components/command-palette"
import { NotificationCenter } from "@/components/notification-center"
import {
  Bot,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Brain,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Activity,
  Target,
  Sparkles,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Home,
  Ticket,
  BookOpen,
  PiIcon as PieIcon,
  HelpCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data
const ticketData = [
  { name: "Mon", tickets: 45, resolved: 38 },
  { name: "Tue", tickets: 52, resolved: 48 },
  { name: "Wed", tickets: 38, resolved: 35 },
  { name: "Thu", tickets: 61, resolved: 55 },
  { name: "Fri", tickets: 48, resolved: 42 },
  { name: "Sat", tickets: 23, resolved: 21 },
  { name: "Sun", tickets: 18, resolved: 16 },
]

const categoryData = [
  { name: "Network", value: 35, color: "#8b5cf6" },
  { name: "Software", value: 28, color: "#06b6d4" },
  { name: "Hardware", value: 22, color: "#10b981" },
  { name: "Security", value: 15, color: "#f59e0b" },
]

const recentTickets = [
  {
    id: "TF-2024-001",
    title: "Network connectivity issues in Building A",
    priority: "High",
    status: "In Progress",
    assignee: "John Smith",
    created: "2 hours ago",
    category: "Network",
  },
  {
    id: "TF-2024-002",
    title: "Software installation request - Adobe Creative Suite",
    priority: "Medium",
    status: "Pending",
    assignee: "Sarah Johnson",
    created: "4 hours ago",
    category: "Software",
  },
  {
    id: "TF-2024-003",
    title: "Printer not responding in Marketing department",
    priority: "Low",
    status: "Resolved",
    assignee: "Mike Davis",
    created: "6 hours ago",
    category: "Hardware",
  },
  {
    id: "TF-2024-004",
    title: "Security alert - Suspicious login attempts",
    priority: "Critical",
    status: "Open",
    assignee: "Emily Chen",
    created: "1 hour ago",
    category: "Security",
  },
]

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isWelcome, setIsWelcome] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const router = useRouter()

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home, current: true },
    { name: "Tickets", href: "/dashboard/tickets", icon: Ticket, current: false },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, current: false },
    { name: "Knowledge Base", href: "/dashboard/knowledge", icon: BookOpen, current: false },
    { name: "Team", href: "/dashboard/team", icon: Users, current: false },
    { name: "Reports", href: "/dashboard/reports", icon: PieIcon, current: false },
  ]

  useEffect(() => {
    const userData = localStorage.getItem("ticketflow_user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Check for welcome parameter
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("welcome") === "true") {
      setIsWelcome(true)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("ticketflow_user")
    router.push("/")
  }

  const handleCreateTicket = () => {
    router.push("/dashboard/tickets/new")
  }

  const handleViewTicket = (ticketId: string) => {
    router.push(`/dashboard/tickets/${ticketId}`)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Command Palette */}
      <CommandPalette open={commandPaletteOpen} setOpen={setCommandPaletteOpen} />

      {/* Welcome Banner */}
      {isWelcome && (
        <div className="bg-primary text-primary-foreground p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Welcome to TicketFlow AI!</h3>
                <p className="text-sm opacity-90">Your account has been created successfully. Let's get started!</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsWelcome(false)}
              className="bg-primary-foreground/20 hover:bg-primary-foreground/30"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">TicketFlow AI</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        item.current
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <div className="space-y-2">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    href="/help"
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <HelpCircle className="w-5 h-5" />
                    <span>Help & Support</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsSidebarOpen(false)
                      handleLogout()
                    }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>

              {user.isDemo && (
                <div className="mt-8 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Demo Mode</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You're exploring TicketFlow AI. Start your free trial to unlock all features.
                  </p>
                  <Button size="sm" className="w-full mt-3" onClick={() => router.push("/signup")}>
                    Start Free Trial
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="bg-background border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden hover:bg-muted"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground hidden sm:block">TicketFlow AI</span>
              </Link>

              {user.isDemo && (
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Demo Mode
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  className="pl-10 pr-4 py-2 bg-muted rounded-lg border-0 focus:ring-2 focus:ring-primary focus:outline-none w-64"
                  onFocus={() => setCommandPaletteOpen(true)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                  ⌘K
                </div>
              </div>

              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setCommandPaletteOpen(true)}>
                <Search className="w-5 h-5" />
              </Button>

              <Button size="sm" onClick={handleCreateTicket}>
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">New Ticket</span>
              </Button>

              <NotificationCenter />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your IT support operations today.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">285</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12%
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">2.4h</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -18%
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2.1%
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productivity</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5%
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Ticket Volume & Resolution Trends</CardTitle>
                <CardDescription>Daily ticket creation and resolution over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={ticketData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="tickets"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                      name="Created"
                    />
                    <Area
                      type="monotone"
                      dataKey="resolved"
                      stackId="2"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Resolved"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* AI Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">AI Performance Metrics</CardTitle>
                <CardDescription>Real-time AI analysis and recommendation accuracy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Classification Accuracy</span>
                    <span className="font-medium">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Solution Match Rate</span>
                    <span className="font-medium">87.5%</span>
                  </div>
                  <Progress value={87.5} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Auto-Resolution Rate</span>
                    <span className="font-medium">23.8%</span>
                  </div>
                  <Progress value={23.8} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Categories</CardTitle>
                <CardDescription>Distribution by issue type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  {/* Pie Chart Component */}
                  <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                    {/* Placeholder for Pie Chart */}
                    Placeholder for Pie Chart
                  </div>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" onClick={handleCreateTicket}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Ticket
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/dashboard/analytics")}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/dashboard/knowledge")}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Knowledge Base
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/dashboard/team")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Team Management
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>AI models and integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Classification Model</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Recommendation Engine</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-sm">Analytics Pipeline</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Updating
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Tickets */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle>Recent Tickets</CardTitle>
                <CardDescription>Latest support requests and their status</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/tickets")}>
                  View All
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer space-y-3 sm:space-y-0"
                  onClick={() => handleViewTicket(ticket.id)}
                >
                  <div className="flex flex-col space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">{ticket.id}</span>
                      <Badge
                        variant={
                          ticket.priority === "Critical"
                            ? "destructive"
                            : ticket.priority === "High"
                              ? "destructive"
                              : ticket.priority === "Medium"
                                ? "default"
                                : "secondary"
                        }
                        className="text-xs"
                      >
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {ticket.category}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-foreground">{ticket.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>Assigned to {ticket.assignee}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{ticket.created}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-2">
                    <Badge
                      variant={
                        ticket.status === "Resolved"
                          ? "default"
                          : ticket.status === "In Progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {ticket.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewTicket(ticket.id)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Ticket
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
