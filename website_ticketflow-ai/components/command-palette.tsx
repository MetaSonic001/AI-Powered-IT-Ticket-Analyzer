"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Plus,
  Search,
  BarChart3,
  Users,
  BookOpen,
  Settings,
  Ticket,
  Brain,
  Zap,
  Target,
  Home,
  HelpCircle,
} from "lucide-react"

interface CommandPaletteProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function CommandPalette({ open, setOpen }: CommandPaletteProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, setOpen])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  const recentTickets = [
    { id: "TF-2024-001", title: "Network connectivity issues" },
    { id: "TF-2024-002", title: "Software installation request" },
    { id: "TF-2024-003", title: "Printer not responding" },
  ]

  const quickActions = [
    {
      icon: Plus,
      title: "Create New Ticket",
      shortcut: "⌘N",
      action: () => router.push("/dashboard/tickets/new"),
    },
    {
      icon: Search,
      title: "Search Tickets",
      shortcut: "⌘F",
      action: () => router.push("/dashboard/tickets"),
    },
    {
      icon: BarChart3,
      title: "View Analytics",
      shortcut: "⌘A",
      action: () => router.push("/dashboard/analytics"),
    },
    {
      icon: BookOpen,
      title: "Knowledge Base",
      shortcut: "⌘K",
      action: () => router.push("/dashboard/knowledge"),
    },
  ]

  const navigationItems = [
    { icon: Home, title: "Dashboard", path: "/dashboard" },
    { icon: Ticket, title: "Tickets", path: "/dashboard/tickets" },
    { icon: BarChart3, title: "Analytics", path: "/dashboard/analytics" },
    { icon: BookOpen, title: "Knowledge Base", path: "/dashboard/knowledge" },
    { icon: Users, title: "Team", path: "/dashboard/team" },
    { icon: Settings, title: "Settings", path: "/dashboard/settings" },
  ]

  const aiActions = [
    {
      icon: Brain,
      title: "AI Ticket Classification",
      description: "Automatically classify incoming tickets",
    },
    {
      icon: Zap,
      title: "Smart Routing",
      description: "Route tickets to best available agent",
    },
    {
      icon: Target,
      title: "Predictive Analytics",
      description: "Forecast ticket volumes and trends",
    },
  ]

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." value={searchQuery} onValueChange={setSearchQuery} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <CommandItem key={action.title} onSelect={() => runCommand(action.action)}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{action.title}</span>
                <CommandShortcut>{action.shortcut}</CommandShortcut>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem key={item.title} onSelect={() => runCommand(() => router.push(item.path))}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recent Tickets">
          {recentTickets.map((ticket) => (
            <CommandItem
              key={ticket.id}
              onSelect={() => runCommand(() => router.push(`/dashboard/tickets/${ticket.id}`))}
            >
              <Ticket className="mr-2 h-4 w-4" />
              <span>
                {ticket.id}: {ticket.title}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="AI Features">
          {aiActions.map((action) => {
            const Icon = action.icon
            return (
              <CommandItem key={action.title}>
                <Icon className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{action.title}</span>
                  <span className="text-xs text-muted-foreground">{action.description}</span>
                </div>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="System">
          <CommandItem onSelect={() => runCommand(() => router.push("/help"))}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
