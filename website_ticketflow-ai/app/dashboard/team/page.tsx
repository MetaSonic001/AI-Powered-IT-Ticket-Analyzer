"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
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
      if (process.env.NEXT_PUBLIC_USE_MOCKS === "1") {
        const demo = { id: "demo", name: "Demo User", role: "Developer" }
        try {
          localStorage.setItem("ticketflow_user", JSON.stringify(demo))
        } catch (e) {
          console.warn("Could not write demo user to localStorage", e)
        }
        setUser(demo)
        return
      }
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
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Bot className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading team management...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Team Management</h1>

          <Card>
            <CardHeader>
              <CardTitle>Team Members (Demo)</CardTitle>
              <CardDescription>Lightweight list for demo/build verification</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {teamMembers.map((m) => (
                  <li key={m.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{m.name}</div>
                      <div className="text-sm text-muted-foreground">{m.role}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{m.stats.ticketsResolved} resolved</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

