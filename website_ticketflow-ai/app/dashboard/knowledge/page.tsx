"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bot, Search, Brain, BookOpen, Star, Clock, Plus, Filter, Eye,
  ThumbsUp, Share2, FileText, Sparkles, TrendingUp, User,
  ArrowRight, GraduationCap, Laptop, ShieldCheck, Wifi
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface KnowledgeArticle {
  doc_id: string
  title: string
  content_snippet: string
  category?: string
  score: number
  source: string
  metadata?: any
  tags?: string[]
}

export default function KnowledgeBasePage() {
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("ticketflow_user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const fetchKnowledgeBase = async () => {
    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const params = new URLSearchParams()

      // If no query, use a generic term to get initial content or "recent"
      const queryTerm = searchQuery || "common issues"
      params.append("q", queryTerm)

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }
      params.append("limit", "20")

      const response = await fetch(`${API_URL}/api/v1/solutions/search?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch knowledge base")
      }

      const data = await response.json()
      setArticles(data.results || [])
    } catch (error) {
      console.error("KB fetch error:", error)
      toast.error("Failed to load knowledge base articles")
    } finally {
      setLoading(false)
    }
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        fetchKnowledgeBase()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedCategory, user])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Helper to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'network': return <Wifi className="w-4 h-4" />;
      case 'security': return <ShieldCheck className="w-4 h-4" />;
      case 'hardware': return <Laptop className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Bot className="w-16 h-16 text-primary relative z-10" />
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading Knowledge Base...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-background relative selection:bg-primary/10">
        {/* Background Grid */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Hero Search Header */}
        <div className="w-full bg-gradient-to-b from-primary/5 to-background border-b border-border/40 pt-12 pb-16 px-4 md:px-8 mb-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="outline" className="bg-background/50 backdrop-blur border-primary/20 text-primary mb-4">
              <Sparkles className="w-3 h-3 mr-2" /> AI-Powered Search
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              How can we help you today?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Search over 500+ articles, troubleshooting guides, and documentation.
            </p>

            <div className="relative max-w-2xl mx-auto mt-8 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative flex items-center">
                <Search className="w-5 h-5 absolute left-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Describe your issue (e.g. 'VPN connection failed')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-xl border-border/60 bg-background/80 backdrop-blur shadow-sm focus-visible:ring-primary/30"
                />
                <div className="absolute right-2">
                  <Button size="sm" className="h-10 rounded-lg px-4" onClick={() => fetchKnowledgeBase()} disabled={loading}>
                    {loading ? <Bot className="w-4 h-4 animate-spin" /> : "Search"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <span className="text-sm text-muted-foreground mr-2 py-1">Popular:</span>
              {["Password Reset", "VPN Setup", "Printer Config", "Outlook Error"].map((term) => (
                <Badge
                  key={term}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors font-normal"
                  onClick={() => handleSearch(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-12">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

            {/* Main Content Area */}
            <div className="xl:col-span-9 space-y-6">

              {/* Tabs & Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background/50 backdrop-blur sticky top-[64px] z-10 py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                  <div className="flex items-center justify-between w-full">
                    <TabsList className="bg-muted/50 p-1">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="Network">Network</TabsTrigger>
                      <TabsTrigger value="Software">Software</TabsTrigger>
                      <TabsTrigger value="Hardware">Hardware</TabsTrigger>
                      <TabsTrigger value="Security">Security</TabsTrigger>
                    </TabsList>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Showing {articles.length} results</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Tabs>
              </div>

              {/* Results Grid */}
              <div className="grid gap-4">
                {loading ? (
                  // Skeleton State
                  [1, 2, 3].map(i => (
                    <Card key={i} className="border-border/50">
                      <CardContent className="p-6">
                        <div className="h-6 bg-muted rounded w-1/3 mb-4 animate-pulse" />
                        <div className="h-4 bg-muted rounded w-3/4 mb-2 animate-pulse" />
                        <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                      </CardContent>
                    </Card>
                  ))
                ) : articles.length === 0 ? (
                  // Empty State
                  <div className="text-center py-20 border-2 border-dashed border-muted rounded-xl bg-muted/5">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No articles found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or category filters.</p>
                  </div>
                ) : (
                  // Article Cards
                  articles.map((article) => (
                    <Card key={article.doc_id} className="group hover:shadow-md hover:border-primary/30 transition-all cursor-pointer overflow-hidden border-border/60">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Left: Content */}
                          <div className="flex-1 p-6">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge variant="outline" className="flex items-center gap-1 font-normal text-xs">
                                {getCategoryIcon(article.category || "")}
                                {article.category || "General"}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center">
                                <Sparkles className="w-3 h-3 text-primary mr-1" />
                                {(article.score * 100).toFixed(0)}% Match
                              </span>
                            </div>

                            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed mb-4">
                              {article.content_snippet}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.metadata?.views || 245}</span>
                                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {article.metadata?.helpful || 12}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 5m read</span>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Share2 className="w-4 h-4" /></Button>
                                <Button size="sm" variant="secondary" className="h-8 text-xs">Read Article <ArrowRight className="w-3 h-3 ml-1" /></Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Pagination / Load More */}
              {articles.length > 0 && (
                <div className="flex justify-center pt-8">
                  <Button variant="outline" className="w-full max-w-xs">Load More Articles</Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-3 space-y-6">

              {/* Create New */}
              <Button className="w-full shadow-lg shadow-primary/20 h-12 text-base">
                <Plus className="w-5 h-5 mr-2" /> Contribution Request
              </Button>

              {/* Quick Stats */}
              <Card className="bg-muted/30 border-none shadow-inner">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overview</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="bg-background p-3 rounded-lg border shadow-sm">
                    <div className="text-2xl font-bold text-primary">{articles.length + 243}</div>
                    <div className="text-xs text-muted-foreground">Total Articles</div>
                  </div>
                  <div className="bg-background p-3 rounded-lg border shadow-sm">
                    <div className="text-2xl font-bold text-green-600">4.8</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">Avg Rating <Star className="w-3 h-3 fill-current" /></div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card className="border-violet-200 dark:border-violet-900 bg-violet-50/50 dark:bg-violet-900/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-violet-700 dark:text-violet-300">
                    <Brain className="w-5 h-5" /> Knowledge Gaps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-background/80 rounded-lg text-sm border border-violet-100 dark:border-violet-900/30">
                    <p className="font-medium text-foreground mb-1">High Demand: "VPN"</p>
                    <p className="text-muted-foreground text-xs">Search volume up 40%. Consider adding troubleshooting guides for Mac OS.</p>
                  </div>
                  <div className="p-3 bg-background/80 rounded-lg text-sm border border-violet-100 dark:border-violet-900/30">
                    <p className="font-medium text-foreground mb-1">Outdated: "Printer Setup"</p>
                    <p className="text-muted-foreground text-xs">Content hasn't been updated in 6 months.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Contributors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" /> Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Emily Chen", role: "Network Spec.", score: 1240 },
                      { name: "Mark Davis", role: "Sys Admin", score: 980 },
                      { name: "Sarah J.", role: "Support Lead", score: 850 },
                    ].map((user, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{user.role}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="font-mono text-xs">{user.score}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}