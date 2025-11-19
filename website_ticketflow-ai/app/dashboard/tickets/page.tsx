"use client"

import { useEffect, useState, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  Loader2,
  Plus,
  Upload,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Types matching the API response
interface Ticket {
  ticket_id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  created_at: string
  requester_name?: string
  requester_department?: string
}

interface TicketHistoryResponse {
  tickets: Ticket[]
  total: number
  limit: number
  offset: number
}

export default function TicketsIndexPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  // Filters & Pagination
  const [limit] = useState(10)
  const [offset, setOffset] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

      // Build query params
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      })

      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter)
      if (priorityFilter && priorityFilter !== "all") params.append("priority", priorityFilter)
      if (categoryFilter && categoryFilter !== "all") params.append("category", categoryFilter)

      const res = await fetch(`${API_URL}/api/v1/tickets/history?${params}`)

      if (!res.ok) {
        throw new Error(`Failed to fetch tickets: ${res.statusText}`)
      }

      const data: TicketHistoryResponse = await res.json()
      setTickets(data.tickets)
      setTotal(data.total)
    } catch (err) {
      console.error("Error fetching tickets:", err)
      setError("Failed to load tickets. Please try again later.")
    } finally {
      setLoading(false)
    }
  }, [limit, offset, statusFilter, priorityFilter, categoryFilter])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleNextPage = () => {
    if (offset + limit < total) {
      setOffset(prev => prev + limit)
    }
  }

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(prev => Math.max(0, prev - limit))
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive' // Orange/Red
      case 'medium': return 'default' // Blue/Primary
      case 'low': return 'secondary' // Grey
      default: return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20'
      case 'in_progress': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20'
      case 'resolved': return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 border-gray-500/20'
      case 'closed': return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 border-gray-500/20'
      default: return 'outline'
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
            <p className="text-muted-foreground mt-1">Manage and track all support tickets</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/tickets/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </Link>
            <Link href="/dashboard/tickets/bulk">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="w-full sm:w-[200px]">
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setOffset(0); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-[200px]">
                <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setOffset(0); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-[200px]">
                <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setOffset(0); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Network">Network</SelectItem>
                    <SelectItem value="Access">Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="ghost" onClick={() => {
                setStatusFilter("all")
                setPriorityFilter("all")
                setCategoryFilter("all")
                setOffset(0)
              }}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading tickets...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-destructive">
                <AlertCircle className="w-8 h-8 mb-4" />
                <p>{error}</p>
                <Button variant="outline" className="mt-4" onClick={fetchTickets}>Retry</Button>
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="w-8 h-8 mb-4 opacity-50" />
                <p>No tickets found matching your filters.</p>
              </div>
            ) : (
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead className="min-w-[300px]">Subject</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.ticket_id} className="group hover:bg-muted/50">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {ticket.ticket_id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[300px]">{ticket.title}</span>
                            {ticket.requester_name && (
                              <span className="text-xs text-muted-foreground">
                                by {ticket.requester_name}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {ticket.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(ticket.priority) as any}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                          {ticket.created_at ? formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true }) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/tickets/${ticket.ticket_id}`}>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && total > 0 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing <strong>{offset + 1}-{Math.min(offset + limit, total)}</strong> of <strong>{total}</strong> tickets
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={offset === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={offset + limit >= total}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
