"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Bot,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  CalendarIcon,
  Filter,
  Brain,
  Sparkles,
  Clock,
  Users,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts"

// Mock analytics data
const ticketVolumeData = [
  { date: "2024-01-01", created: 45, resolved: 38, pending: 7 },
  { date: "2024-01-02", created: 52, resolved: 48, pending: 11 },
  { date: "2024-01-03", created: 38, resolved: 35, pending: 14 },
  { date: "2024-01-04", created: 61, resolved: 55, pending: 20 },
  { date: "2024-01-05", created: 48, resolved: 42, pending: 26 },
  { date: "2024-01-06", created: 23, resolved: 21, pending: 28 },
  { date: "2024-01-07", created: 18, resolved: 16, pending: 30 },
  { date: "2024-01-08", created: 67, resolved: 58, pending: 39 },
  { date: "2024-01-09", created: 54, resolved: 49, pending: 44 },
  { date: "2024-01-10", created: 41, resolved: 38, pending: 47 },
  { date: "2024-01-11", created: 59, resolved: 52, pending: 54 },
  { date: "2024-01-12", created: 43, resolved: 41, pending: 56 },
  { date: "2024-01-13", created: 29, resolved: 27, pending: 58 },
  { date: "2024-01-14", created: 35, resolved: 33, pending: 60 },
]

const resolutionTimeData = [
  { category: "Network", avgTime: 2.4, target: 3.0, improvement: -18 },
  { category: "Software", avgTime: 1.8, target: 2.5, improvement: -12 },
  { category: "Hardware", avgTime: 3.2, target: 4.0, improvement: -8 },
  { category: "Security", avgTime: 4.1, target: 5.0, improvement: -15 },
  { category: "Access", avgTime: 0.9, target: 1.5, improvement: -22 },
]

const satisfactionData = [
  { month: "Oct", score: 4.2 },
  { month: "Nov", score: 4.4 },
  { month: "Dec", score: 4.6 },
  { month: "Jan", score: 4.8 },
]

const categoryDistribution = [
  { name: "Network", value: 35, color: "#8b5cf6" },
  { name: "Software", value: 28, color: "#06b6d4" },
  { name: "Hardware", value: 22, color: "#10b981" },
  { name: "Security", value: 15, color: "#f59e0b" },
]

const aiInsights = [
  {
    type: "trend",
    title: "Network Issues Trending Up",
    description: "Network-related tickets increased by 23% this week. Consider proactive monitoring.",
    severity: "warning",
    confidence: 87,
  },
  {
    type: "efficiency",
    title: "Resolution Time Improving",
    description: "Average resolution time decreased by 18% compared to last month.",
    severity: "positive",
    confidence: 94,
  },
  {
    type: "workload",
    title: "Team Capacity Alert",
    description: "Mike Davis is at 90% capacity. Consider redistributing workload.",
    severity: "alert",
    confidence: 96,
  },
  {
    type: "prediction",
    title: "Weekend Volume Forecast",
    description: "Expecting 40% lower ticket volume this weekend based on historical patterns.",
    severity: "info",
    confidence: 78,
  },
]

const performanceMetrics = [
  { name: "First Call Resolution", value: 68, target: 75, trend: 5 },
  { name: "Customer Satisfaction", value: 4.8, target: 4.5, trend: 0.2 },
  { name: "SLA Compliance", value: 94, target: 95, trend: -1 },
  { name: "Team Utilization", value: 78, target: 80, trend: 3 },
]

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null)
  const [dateRange, setDateRange] = useState<any>({ from: new Date(2024, 0, 1), to: new Date(2024, 0, 14) })
  const [selectedMetric, setSelectedMetric] = useState("volume")
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("ticketflow_user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "positive":
        return "text-green-600 bg-green-50 border-green-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "alert":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-blue-600 bg-blue-50 border-blue-200"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "positive":
        return <CheckCircle className="w-4 h-4" />
      case "warning":
        return <AlertTriangle className="w-4 h-4" />
      case "alert":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading analytics...</p>
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your IT support operations with AI-powered analytics.
          </p>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {performanceMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.name === "Customer Satisfaction" ? metric.value : `${metric.value}%`}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>Target: {metric.name === "Customer Satisfaction" ? metric.target : `${metric.target}%`}</span>
                  <span className={`flex items-center ${metric.trend > 0 ? "text-green-600" : "text-red-600"}`}>
                    {metric.trend > 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(metric.trend)}
                    {metric.name === "Customer Satisfaction" ? "" : "%"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Charts */}
          <div className="lg:col-span-3 space-y-8">
            <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="volume">Ticket Volume</TabsTrigger>
                  <TabsTrigger value="resolution">Resolution Times</TabsTrigger>
                  <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <TabsContent value="volume">
                <Card>
                  <CardHeader>
                    <CardTitle>Ticket Volume Trends</CardTitle>
                    <CardDescription>Daily ticket creation, resolution, and pending volumes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={ticketVolumeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), "MMM dd")} />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) => format(new Date(value), "MMM dd, yyyy")}
                          formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                        />
                        <Area
                          type="monotone"
                          dataKey="created"
                          stackId="1"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="resolved"
                          stackId="2"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="pending"
                          stackId="3"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resolution">
                <Card>
                  <CardHeader>
                    <CardTitle>Resolution Time Analysis</CardTitle>
                    <CardDescription>Average resolution times by category vs targets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={resolutionTimeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value, name) => [`${value}h`, name === "avgTime" ? "Actual" : "Target"]} />
                        <Bar dataKey="avgTime" fill="#8b5cf6" name="avgTime" />
                        <Bar dataKey="target" fill="#e5e7eb" name="target" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="satisfaction">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Satisfaction Trends</CardTitle>
                    <CardDescription>Monthly satisfaction scores and improvement trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={satisfactionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[3.5, 5]} />
                        <Tooltip formatter={(value) => [`${value}/5.0`, "Satisfaction Score"]} />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="categories">
                <Card>
                  <CardHeader>
                    <CardTitle>Ticket Category Distribution</CardTitle>
                    <CardDescription>Breakdown of tickets by issue category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-4">
                        {categoryDistribution.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{item.value}%</div>
                              <div className="text-sm text-muted-foreground">
                                {Math.round((item.value / 100) * 285)} tickets
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Detailed Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
                <CardDescription>Detailed performance metrics across different dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Resolution Efficiency</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="90%" data={[{ value: 87 }]}>
                        <RadialBar dataKey="value" cornerRadius={10} fill="#8b5cf6" />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="text-center">
                      <div className="text-2xl font-bold">87%</div>
                      <div className="text-sm text-muted-foreground">Efficiency Score</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Team Utilization</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="90%" data={[{ value: 78 }]}>
                        <RadialBar dataKey="value" cornerRadius={10} fill="#10b981" />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="text-center">
                      <div className="text-2xl font-bold">78%</div>
                      <div className="text-sm text-muted-foreground">Utilization Rate</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">AI Accuracy</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="90%" data={[{ value: 94 }]}>
                        <RadialBar dataKey="value" cornerRadius={10} fill="#06b6d4" />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="text-center">
                      <div className="text-2xl font-bold">94%</div>
                      <div className="text-sm text-muted-foreground">AI Accuracy</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <span>AI Insights</span>
                </CardTitle>
                <CardDescription>Smart recommendations based on data analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(insight.severity)}`}>
                    <div className="flex items-start space-x-2 mb-2">
                      {getSeverityIcon(insight.severity)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <p className="text-xs mt-1">{insight.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Key metrics at a glance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Avg Response Time</span>
                  </div>
                  <span className="font-semibold">12 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Active Agents</span>
                  </div>
                  <span className="font-semibold">9/12</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">SLA Breaches</span>
                  </div>
                  <span className="font-semibold text-red-600">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Auto-Resolved</span>
                  </div>
                  <span className="font-semibold text-green-600">23.8%</span>
                </div>
              </CardContent>
            </Card>

            {/* Report Builder */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Reports</CardTitle>
                <CardDescription>Generate tailored reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Performance Report
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Team Utilization
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <Clock className="w-4 h-4 mr-2" />
                  SLA Compliance
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <Target className="w-4 h-4 mr-2" />
                  Custom Report Builder
                </Button>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>Download reports in various formats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export as Excel
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export as CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
