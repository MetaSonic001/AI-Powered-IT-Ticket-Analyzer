"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Calendar,
  Clock,
  Download,
  Filter,
  RefreshCw,
  Target,
  Zap,
  Database,
  Brain,
  TrendingUp,
  Share2
} from "lucide-react"
import { toast } from "sonner"
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
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from "recharts"
import type { DashboardMetrics } from "@/lib/types"
import { analyticsMock } from "@/lib/mockTickets"

// --- Theme & Config ---
const COLORS = {
  primary: '#8b5cf6',
  secondary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  slate: '#64748b'
}

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.slate]

// --- Custom Components ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur border border-border p-3 rounded-lg shadow-xl text-xs">
        <p className="font-medium mb-2 text-muted-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="font-semibold text-foreground">{entry.value}</span>
            <span className="capitalize text-muted-foreground">{entry.name}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("30d")
  const router = useRouter()

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === '1'

      if (useMocks) {
        // Use seeded demo data in development
        setData(analyticsMock as DashboardMetrics)
        setLoading(false)
        return
      }

      // Artificial delay for skeleton smoothness
      await new Promise(resolve => setTimeout(resolve, 600));

      const response = await fetch(`${API_URL}/api/v1/analytics/dashboard`)
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      const result = await response.json()
      setData(result)
      toast.success('Dashboard refreshed')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard'
      setError(message)
      toast.error('Failed to connect to analytics service')
      // Fallback to seeded demo data so UI remains functional offline
      setData(analyticsMock as DashboardMetrics)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  // --- Data Processing for Charts ---
  const processedData = useMemo(() => {
    if (!data) return null

    // 1. Category Data
    const categories = (data.category_breakdown || []).map(item => ({ name: item.category, value: item.count }))

    // 2. Priority Data
    const priorities = (data.priority_breakdown || []).map(item => ({ name: item.priority, value: item.count }))

    // 3. AI Efficiency (Radial Data)
    const efficiency = [
      { name: 'Accuracy', value: (data.classification_accuracy || 0) * 100, fill: COLORS.primary },
    ]

    // 4. Weekly Activity (Derived from trends)
    // We group the trend dates by Day of Week to simulate a "Busy Days" chart
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const activityMap = new Array(7).fill(0)

    if (data.trend_data) {
      data.trend_data.forEach((item) => {
        const dayIndex = new Date(item.date).getDay()
        activityMap[dayIndex] += item.count
      })
    }

    const weeklyActivity = daysOfWeek.map((day, index) => ({
      name: day,
      tickets: activityMap[index]
    }))

    return { categories, priorities, efficiency, weeklyActivity }
  }, [data])


  if (loading && !data) return <DashboardSkeleton />

  if (error && !data) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center p-8">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
            <Button variant="outline" onClick={fetchDashboard} className="mt-4">Retry Connection</Button>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  if (!data || !processedData) return null

  return (
    <DashboardLayout>
      {/* Main Container with Padding */}
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics Overview</h1>
            <p className="text-muted-foreground mt-1">
              Performance metrics and system health for the last 30 days.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-background border rounded-lg p-1 shadow-sm">
            <Button
              variant={timeRange === "7d" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTimeRange("7d")}
              className="text-xs h-8"
            >
              7 Days
            </Button>
            <Button
              variant={timeRange === "30d" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTimeRange("30d")}
              className="text-xs h-8"
            >
              30 Days
            </Button>
            <Button
              variant={timeRange === "90d" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTimeRange("90d")}
              className="text-xs h-8"
            >
              90 Days
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchDashboard}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Recent Tickets (seeded demo data) */}
        <div className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Tickets</CardTitle>
                  <CardDescription>Quick access to recently created tickets</CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-xs">{analyticsMock.recent_tickets.length} items</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analyticsMock.recent_tickets.map((t: any) => (
                  <div key={t.ticket_id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/dashboard/tickets/${t.ticket_id}`)}>
                    <div>
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-muted-foreground">{t.category} • {t.priority}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Volume"
            value={data.total_tickets.toLocaleString()}
            icon={Database}
            color={COLORS.primary}
            trend="+12%"
          />
          <KPICard
            title="Avg Resolution"
            value={`${data.avg_processing_time.toFixed(1)}ms`}
            icon={Clock}
            color={COLORS.warning}
            trend="-5%"
            trendUp={false} // Good direction
          />
          <KPICard
            title="AI Accuracy"
            value={`${(data.classification_accuracy * 100).toFixed(1)}%`}
            icon={Brain}
            color={COLORS.success}
            trend="+2.4%"
          />
          <KPICard
            title="SLA Compliance"
            value="98.2%"
            icon={Target}
            color={COLORS.secondary}
            trend="+0.5%"
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 1. Growth Trend (Takes up 2 columns) */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Ticket Growth</CardTitle>
                  <CardDescription>Incoming ticket volume over time</CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-xs">Live Data</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trend_data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      tick={{ fontSize: 12, fill: '#888' }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={30}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#888' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorTrend)"
                      name="Tickets"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 2. AI Efficiency (Radial) */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>AI Efficiency</CardTitle>
              <CardDescription>Model confidence score</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    barSize={20}
                    data={processedData.efficiency}
                    startAngle={180}
                    endAngle={0}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                      background
                      dataKey="value"
                      cornerRadius={10}
                    />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-4xl font-bold translate-y-[-20px]">
                      {processedData.efficiency[0].value.toFixed(0)}%
                    </text>
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-sm translate-y-[10px]">
                      Accuracy Score
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute bottom-6 left-0 w-full text-center px-6">
                <p className="text-sm text-muted-foreground">
                  The AI model is performing <span className="text-green-500 font-medium">optimally</span> based on recent ticket resolutions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* 3. Category Distribution (Donut) */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Issues by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={processedData.categories}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {processedData.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {processedData.categories.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                    <span className="text-muted-foreground truncate">{item.name}</span>
                    <span className="font-bold ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. Weekly Activity (Bar) */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Volume by day of week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processedData.weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#888' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="tickets"
                      fill={COLORS.secondary}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Peak activity observed on <span className="font-medium text-foreground">Wednesday</span>
              </div>
            </CardContent>
          </Card>

          {/* 5. Priority Breakdown (Horizontal Bar) */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Urgency</CardTitle>
              <CardDescription>Ticket priority distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={processedData.priorities}
                    margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted/30" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#888' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      fill={COLORS.danger}
                      radius={[0, 4, 4, 0]}
                      barSize={24}
                      name="Tickets"
                    >
                      {processedData.priorities.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" /> Critical</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-500 rounded-full" /> High</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full" /> Medium</div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </DashboardLayout>
  )
}

// --- Sub-components ---

function KPICard({ title, value, icon: Icon, color, trend, trendUp = true }: any) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div style={{ color: color }} className="p-2 bg-background rounded-full border shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs mt-1">
          <span className={`flex items-center font-medium ${trendUp ? 'text-emerald-600' : 'text-emerald-600'}`}>
            {trend} <TrendingUp className="h-3 w-3 ml-0.5" />
          </span>
          <span className="text-muted-foreground ml-2">from last month</span>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto p-8 space-y-8">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="col-span-2 h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    </DashboardLayout>
  )
}