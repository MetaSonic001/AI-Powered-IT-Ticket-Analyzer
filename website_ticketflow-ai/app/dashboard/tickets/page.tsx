"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { DetailedTicket, fallbackTickets } from "@/lib/mockTickets"
import { fetchWithFallback } from "@/lib/apiClient"

type Ticket = DetailedTicket

export default function TicketsIndexPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const url = `${apiBase}/api/v1/tickets`
    const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "1"

    async function load() {
      try {
        setLoading(true)
          if (useMocks) {
            setTickets(fallbackTickets)
            setError(null)
            return
          }

          const { data, fromMock } = await fetchWithFallback<Ticket[]>(url, fallbackTickets)
          if (fromMock) {
            setError("API returned no data or could not be reached — showing fallback data.")
          } else {
            setError(null)
          }
          setTickets(data || fallbackTickets)
      } catch (err: any) {
        console.error("Failed to load tickets", err)
        setError(err.message || "Failed to load tickets")
        // Use fallback tickets on error so the UI remains populated
        setTickets(fallbackTickets)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tickets</h1>
            <p className="text-sm text-muted-foreground">All tickets processed by TicketFlow</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/tickets/new">
              <Button>New Ticket</Button>
            </Link>
            <Link href="/dashboard/tickets/bulk">
              <Button variant="outline">Bulk Upload</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading tickets…</div>
            ) : tickets && tickets.length > 0 ? (
              <>
                {error && (
                  <div className="text-sm text-destructive mb-3">{error} — showing fallback data.</div>
                )}
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
                  {tickets.map((t) => (
                    <TableRow key={t.ticket_id} className="hover:bg-muted/50 cursor-pointer">
                      <TableCell className="font-mono text-xs text-muted-foreground">{t.ticket_id?.slice(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell>{t.category || "—"}</TableCell>
                      <TableCell>{t.priority || "—"}</TableCell>
                      <TableCell>{t.status || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/tickets/${t.ticket_id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </>
            ) : error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : (
              <div className="text-sm text-muted-foreground">No tickets found.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
