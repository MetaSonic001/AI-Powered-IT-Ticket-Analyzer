"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Download,
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  AlertTriangle,
  Filter,
  FileText,
  BarChart3,
  PieChart as PieIcon,
  Printer,
  Loader2
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

// Theme Colors
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

// Types
interface DashboardMetrics {
  total_tickets: number
  avg_processing_time: number
  classification_accuracy: number
  knowledge_base_size: number
  category_breakdown: Array<{ category: string; count: number }>
  priority_breakdown: Array<{ priority: string; count: number }>
  trend_data: Array<{ date: string; count: number; avg_resolution_hours: number }>
}

interface AgentStats {
  total_predictions: number
  correct_predictions: number
  accuracy: number
  avg_confidence: number
}

interface AgentPerformanceResponse {
  agents: Record<string, AgentStats>
  overall_accuracy: number
  last_updated: string
}

export default function ReportsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformanceResponse | null>(null)
  const [exportLoading, setExportLoading] = useState(false)

  // Custom Report State
  const [reportType, setReportType] = useState("trends")
  const [reportDays, setReportDays] = useState("30")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const [dashboardRes, agentsRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/analytics/dashboard`),
        fetch(`${API_URL}/api/v1/agents/performance`)
      ])

      if (!dashboardRes.ok) throw new Error("Failed to fetch dashboard metrics")
      if (!agentsRes.ok) throw new Error("Failed to fetch agent performance")

      const dashboardData = await dashboardRes.json()
      const agentsData = await agentsRes.json()

      setMetrics(dashboardData)
      setAgentPerformance(agentsData)
    } catch (error) {
      console.error("Error fetching reports data:", error)
      toast.error("Failed to load reports data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${API_URL}/api/v1/analytics/export?export_type=${reportType}&days=${reportDays}`)

      if (!response.ok) throw new Error("Export failed")

      const data = await response.json()

      // Create download link
      const blob = new Blob([data.content], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = data.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Report downloaded successfully")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export report")
    } finally {
      setExportLoading(false)
    }
  }

  // Transform data for charts
  const ticketVolumeData = metrics?.trend_data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tickets: item.count,
    resolved: Math.floor(item.count * 0.9) // Mocking resolved count as it's not in trend_data yet
  })) || []

  const categoryData = metrics?.category_breakdown.map((item, index) => ({
    name: item.category,
    value: item.count,
    color: COLORS[index % COLORS.length]
  })) || []

  const resolutionTimeData = metrics?.trend_data.slice(-7).map(item => ({
    day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    avgTime: Number(item.avg_resolution_hours.toFixed(1))
  })) || []

  // Transform agent data for list
  const agentList = agentPerformance?.agents ? Object.entries(agentPerformance.agents).map(([name, stats]) => ({
    name: name.replace('_agent', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    resolved: stats.total_predictions,
    rate: Number((stats.accuracy * 100).toFixed(1)),
    trend: 0 // Mock trend
  })).sort((a, b) => b.rate - a.rate) : []

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto p-6 space-y-8">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports Center</h1>
            <p className="text-muted-foreground mt-1">
              Analyze performance metrics and generate custom insights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 border-dashed">
                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>

            <div className="h-6 w-px bg-border mx-1 hidden md:block" />

            <Button variant="outline" size="sm" className="h-9">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            <Button size="sm" className="h-9 shadow-md" onClick={() => setReportType('trends')} disabled={exportLoading}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Tickets"
            value={metrics?.total_tickets || 0}
            trend="+12.5%"
            trendUp={true}
            icon={FileText}
            color="text-blue-600"
            bg="bg-blue-50 dark:bg-blue-900/20"
          />
          <MetricCard
            title="Avg Resolution"
            value={`${metrics?.avg_processing_time.toFixed(1)}h`}
            trend="-8.3%"
            trendUp={true} // Down is good for time
            inverseTrend
            icon={Clock}
            color="text-orange-600"
            bg="bg-orange-50 dark:bg-orange-900/20"
          />
          <MetricCard
            title="AI Accuracy"
            value={`${((metrics?.classification_accuracy || 0) * 100).toFixed(1)}%`}
            trend="+2.1%"
            trendUp={true}
            icon={Users}
            color="text-green-600"
            bg="bg-green-50 dark:bg-green-900/20"
          />
          <MetricCard
            title="Open Backlog"
            value={metrics?.total_tickets ? Math.floor(metrics.total_tickets * 0.15) : 0} // Mock backlog
            trend="+4"
            trendUp={false}
            icon={AlertTriangle}
            color="text-red-600"
            bg="bg-red-50 dark:bg-red-900/20"
          />
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-[500px] grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="performance">Agents</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-7">

              {/* Volume Chart */}
              <Card className="md:col-span-4">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Ticket Volume</CardTitle>
                      <CardDescription>Created vs. Resolved tickets over time</CardDescription>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                      <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pl-0">
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={ticketVolumeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                      />
                      <Area type="monotone" dataKey="tickets" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTickets)" name="Created" />
                      <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Donut */}
              <Card className="md:col-span-3">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Ticket Categories</CardTitle>
                      <CardDescription>Distribution by issue type</CardDescription>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                      <PieIcon className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {categoryData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Resolution Heatmap</CardTitle>
                <CardDescription>Average resolution time (hours) by day of the week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={resolutionTimeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="avgTime" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} name="Avg Hours">
                      {resolutionTimeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.avgTime > 5 ? '#ef4444' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                    <span>Standard Performance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-sm" />
                    <span>Above Average (Need Attention)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Top Performing Agents</CardTitle>
                  <Button variant="outline" size="sm">View Full Leaderboard</Button>
                </div>
                <CardDescription>Ranked by resolution volume and satisfaction rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {agentList.length > 0 ? agentList.map((agent, index) => (
                    <div key={agent.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`
                           flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                           ${index === 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                            index === 1 ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                              index === 2 ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-muted text-muted-foreground'}
                        `}>
                          {index + 1}
                        </div>
                        <Avatar>
                          <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.resolved} tickets closed</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="w-32 hidden md:block">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Accuracy</span>
                            <span className="font-bold">{agent.rate}%</span>
                          </div>
                          <Progress value={agent.rate} className="h-2" />
                        </div>
                        <Badge variant={agent.rate > 95 ? "default" : "secondary"}>
                          {agent.rate > 95 ? "Top Tier" : "Standard"}
                        </Badge>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">No agent performance data available.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Reports Tab */}
          <TabsContent value="custom" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">

              {/* Builder */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Report Builder</CardTitle>
                  <CardDescription>Generate specific datasets for deep analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Report Name</Label>
                      <Input placeholder="e.g. Q3 Network Outages" />
                    </div>
                    <div className="space-y-2">
                      <Label>Report Type</Label>
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trends">Trends Analysis</SelectItem>
                          <SelectItem value="categories">Category Breakdown</SelectItem>
                          <SelectItem value="priorities">Priority Stats</SelectItem>
                          <SelectItem value="tickets">Recent Tickets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <Select value={reportDays} onValueChange={setReportDays}>
                        <SelectTrigger><SelectValue placeholder="Last 30 Days" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">Last 7 Days</SelectItem>
                          <SelectItem value="30">Last 30 Days</SelectItem>
                          <SelectItem value="90">Last Quarter</SelectItem>
                          <SelectItem value="365">Year to Date</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 border-primary bg-primary/5 text-primary">CSV</Button>
                        <Button variant="outline" className="flex-1" disabled>Excel</Button>
                        <Button variant="outline" className="flex-1" disabled>PDF</Button>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline">Preview</Button>
                    <Button onClick={handleExport} disabled={exportLoading}>
                      {exportLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                      Generate & Download
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Saved Reports */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Exports</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {["Monthly SLA Report", "Agent KPI Q3", "Network Incidents Log"].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{item}</p>
                              <p className="text-xs text-muted-foreground">Generated 2d ago</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

// --- Reusable Components ---

function MetricCard({ title, value, trend, trendUp, inverseTrend, icon: Icon, color, bg }: any) {
  // If inverseTrend is true, "Down" is actually "Good" (e.g., resolution time)
  const isPositive = inverseTrend ? !trendUp : trendUp

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-md ${bg}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs mt-1">
          <span className={`${isPositive ? 'text-emerald-600' : 'text-red-600'} flex items-center font-medium`}>
            {trendUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {trend}
          </span>
          <span className="text-muted-foreground ml-2">vs last period</span>
        </div>
      </CardContent>
    </Card>
  )
}