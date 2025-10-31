"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Home,
  BarChart3,
  FileText,
  Database,
  Users,
  Activity,
  Server,
  Settings,
  Menu,
  X,
  Sparkles,
  Upload,
  Search,
  Brain,
  Target,
  TrendingUp,
  Zap,
  AlertCircle,
  ChevronRight,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  disabled?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
    ],
  },
  {
    title: "Tickets",
    items: [
      {
        title: "Analyze Ticket",
        href: "/dashboard/tickets/analyze",
        icon: Sparkles,
      },
      {
        title: "Bulk Upload",
        href: "/dashboard/tickets/bulk",
        icon: Upload,
      },
    ],
  },
  {
    title: "Knowledge",
    items: [
      {
        title: "Search Solutions",
        href: "/dashboard/knowledge",
        icon: Search,
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        title: "Analytics Dashboard",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
      {
        title: "Reports",
        href: "/dashboard/analytics/reports",
        icon: FileText,
        disabled: true,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Agent Performance",
        href: "/dashboard/agents",
        icon: Brain,
      },
      {
        title: "Model Status",
        href: "/dashboard/models",
        icon: Zap,
      },
      {
        title: "System Health",
        href: "/dashboard/health",
        icon: Activity,
      },
    ],
  },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2" onClick={onNavigate}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">TicketFlow AI</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const isDisabled = item.disabled

                  return (
                    <Link
                      key={item.href}
                      href={isDisabled ? "#" : item.href}
                      onClick={(e: { preventDefault: () => void }) => {
                        if (isDisabled) {
                          e.preventDefault()
                          return
                        }
                        onNavigate?.()
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : isDisabled
                          ? "text-muted-foreground/50 cursor-not-allowed"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                          {item.badge}
                        </span>
                      )}
                      {isDisabled && (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {isActive && <ChevronRight className="h-4 w-4" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-muted p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium">System Online</span>
          </div>
          <p className="text-xs text-muted-foreground">
            AI-powered ticket analysis
          </p>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col border-r bg-background">
      <SidebarContent />
    </aside>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
