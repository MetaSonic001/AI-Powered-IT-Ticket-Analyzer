"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CommandPalette } from "@/components/command-palette"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Bot,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  Sparkles,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Search,
  ArrowUpRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  WifiOff,
  Brain
} from "lucide-react"
import { useRouter } from "next/navigation"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

// --- Types ---
interface DashboardMetrics {
  total_tickets: number
  avg_processing_time: number
  classification_accuracy: number
  knowledge_base_size: number
  category_breakdown: Array<{ category: string; count: number }>
  priority_breakdown: Array<{ priority: string; count: number }>
  trend_data: Array<{ date: string; count: number; avg_resolution_hours: number }>
  recent_tickets: Array<{
    ticket_id: string
    title: string
    category: string
    priority: string
    status: string
    created_at: string
  }>
}

interface AgentPerformance {
  classification_accuracy: number
  priority_accuracy: number
  solution_success_rate: number
  total_predictions: number
}

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  // Data States
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [performance, setPerformance] = useState<AgentPerformance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  useEffect(() => {
    const userData = localStorage.getItem("ticketflow_user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [dashboardRes, performanceRes] = await Promise.all([
        fetch("http://localhost:8000/api/v1/analytics/dashboard"),
        fetch("http://localhost:8000/api/v1/agents/performance")
      ])

      if (!dashboardRes.ok) throw new Error(`Analytics API Error: ${dashboardRes.status}`)
      if (!performanceRes.ok) throw new Error(`Agents API Error: ${performanceRes.status}`)

      const dashboardData = await dashboardRes.json()
      const performanceData = await performanceRes.json()

      setMetrics(dashboardData)
      setPerformance(performanceData)
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err)
      setError(err.message || "Failed to connect to TicketFlow API")
    } finally {
      setLoading(false)
    }
  }

  // Transform API data for Recharts
  const chartData = metrics?.trend_data ? metrics.trend_data.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    tickets: item.count,
  })) : []

  const categoryChartData = metrics?.category_breakdown ? metrics.category_breakdown.map((item, index) => ({
    name: item.category,
    value: item.count,
    color: COLORS[index % COLORS.length]
  })) : []

  return (
    <DashboardLayout>
      <CommandPalette open={commandPaletteOpen} setOpen={setCommandPaletteOpen} />

      <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto">

        {/* --- Top Action Bar --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" /> {currentDate}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tickets..." className="pl-8" onClick={() => setCommandPaletteOpen(true)} />
            </div>
            <Button onClick={() => router.push("/dashboard/tickets/new")} className="shrink-0 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </div>

        {/* --- Error State --- */}
        {error && (
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription className="flex items-center gap-4">
              {error}
              <Button variant="outline" size="sm" onClick={fetchDashboardData} className="bg-background text-foreground border-border">
                <RefreshCcw className="w-3 h-3 mr-2" /> Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* --- Metrics Grid --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Tickets"
            value={metrics?.total_tickets}
            icon={Activity}
            color="text-blue-600"
            bgColor="bg-blue-100 dark:bg-blue-900/20"
            loading={loading}
            subtext={loading ? undefined : "Total tickets processed"}
          />
          <MetricCard
            title="Avg Resolution"
            value={metrics ? `${metrics.avg_processing_time.toFixed(1)}h` : undefined}
            icon={Clock}
            color="text-orange-600"
            bgColor="bg-orange-100 dark:bg-orange-900/20"
            loading={loading}
            subtext={loading ? undefined : "Average handling time"}
          />

          {/* AI Featured Card */}
          <Card className="relative overflow-hidden border-primary/50 bg-gradient-to-br from-background to-primary/5">
            {loading ? (
              <CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent>
            ) : metrics ? (
              <>
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Brain className="w-24 h-24 text-primary" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Classification</CardTitle>
                  <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/30 text-primary">
                    <Sparkles className="w-3 h-3 mr-1" /> AI Active
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {((metrics.classification_accuracy || 0) * 100).toFixed(0)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Confidence Score
                  </p>
                  <Progress value={(metrics.classification_accuracy || 0) * 100} className="h-1 mt-3 bg-primary/20" />
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No Data</div>
            )}
          </Card>

          <MetricCard
            title="Knowledge Base"
            value={metrics?.knowledge_base_size}
            subtext="Articles Indexed"
            icon={Bot}
            color="text-purple-600"
            bgColor="bg-purple-100 dark:bg-purple-900/20"
            loading={loading}
          />
        </div>

        {/* --- Main Content Area --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

          {/* Main Chart */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Ticket Volume</CardTitle>
              <CardDescription>Overview of incoming support requests over time.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {loading ? (
                <Skeleton className="h-[300px] w-full rounded-lg" />
              ) : metrics ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <Area
                      type="monotone"
                      dataKey="tickets"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorTickets)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No chart data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance & Category Split */}
          <div className="col-span-3 grid gap-4 grid-rows-2">
            {/* AI Stats */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Agent Performance</CardTitle>
                  <Zap className="w-4 h-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? <Skeleton className="h-[150px]" /> : performance ? (
                  <>
                    <PerformanceItem label="Classification Accuracy" value={performance.classification_accuracy} />
                    <PerformanceItem label="Priority Prediction" value={performance.priority_accuracy} />
                    <PerformanceItem label="Auto-Resolution Rate" value={performance.solution_success_rate} />
                  </>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">No performance data</div>
                )}
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Issue Categories</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                {loading ? <Skeleton className="h-[120px] w-full" /> : metrics && categoryChartData.length > 0 ? (
                  <>
                    <div className="h-[120px] w-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            innerRadius={40}
                            outerRadius={55}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 pl-4 space-y-1">
                      {categoryChartData.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-muted-foreground">{item.name}</span>
                          </div>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="w-full text-center text-sm text-muted-foreground py-8">No category data</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- Recent Tickets Table --- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>Latest tickets processed by the system.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/tickets")}>
              View All <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : metrics?.recent_tickets && metrics.recent_tickets.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.recent_tickets.map((ticket) => (
                    <TableRow key={ticket.ticket_id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/dashboard/tickets/${ticket.ticket_id}`)}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{ticket.ticket_id.substring(0, 8)}...</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {ticket.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">{ticket.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={ticket.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/tickets/${ticket.ticket_id}`) }}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation() }}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation() }}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <div className="mb-2">No tickets found</div>
                <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/tickets/new")}>Create your first ticket</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

// --- Sub Components ---

function MetricCard({ title, value, icon: Icon, color, bgColor, loading, subtext }: any) {
  if (loading) return <Card><CardHeader className="pb-2"><Skeleton className="h-4 w-[100px]" /></CardHeader><CardContent><Skeleton className="h-8 w-[60px] mb-2" /><Skeleton className="h-3 w-[40px]" /></CardContent></Card>

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-md ${bgColor}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value !== undefined ? value : "—"}</div>
        {subtext && (
          <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        )}
      </CardContent>
    </Card>
  )
}

function PerformanceItem({ label, value }: { label: string, value: number | undefined }) {
  const val = (value || 0) * 100
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{val.toFixed(0)}%</span>
      </div>
      <Progress value={val} className="h-2" />
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    Critical: "text-red-600 bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900",
    High: "text-orange-600 bg-orange-100 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900",
    Medium: "text-blue-600 bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900",
    Low: "text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  }

  return (
    <Badge variant="outline" className={`${styles[priority] || ""} border font-normal`}>
      {priority}
    </Badge>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Resolved":
      return <div className="flex items-center text-emerald-600 text-sm"><CheckCircle2 className="w-3 h-3 mr-1.5" /> Resolved</div>
    case "In Progress":
      return <div className="flex items-center text-blue-600 text-sm"><Activity className="w-3 h-3 mr-1.5" /> In Progress</div>
    case "Open":
      return <div className="flex items-center text-slate-500 text-sm"><AlertCircle className="w-3 h-3 mr-1.5" /> Open</div>
    default:
      return <span className="text-sm text-muted-foreground">{status}</span>
  }
}