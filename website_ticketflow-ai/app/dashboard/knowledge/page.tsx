"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FALLBACK_SOLUTIONS, logFallbackUsage } from "@/lib/fallback-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, ArrowLeft, Search, Brain, BookOpen, Star, Clock, Plus, Filter, Eye, ThumbsUp, Share } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock knowledge base data
const knowledgeArticles = [
  {
    id: "KB-001",
    title: "Resolving Network Connectivity Issues in Office Buildings",
    category: "Network",
    description:
      "Step-by-step guide to diagnose and fix common network connectivity problems in enterprise environments.",
    views: 1247,
    rating: 4.8,
    helpful: 156,
    lastUpdated: "2024-01-10",
    tags: ["network", "connectivity", "troubleshooting"],
    author: "John Smith",
    difficulty: "Intermediate",
  },
  {
    id: "KB-002",
    title: "Software Installation Best Practices",
    category: "Software",
    description:
      "Comprehensive guide for installing and configuring enterprise software applications safely and efficiently.",
    views: 892,
    rating: 4.6,
    helpful: 98,
    lastUpdated: "2024-01-08",
    tags: ["software", "installation", "best-practices"],
    author: "Sarah Johnson",
    difficulty: "Beginner",
  },
  {
    id: "KB-003",
    title: "Hardware Diagnostics and Replacement Procedures",
    category: "Hardware",
    description: "Detailed procedures for diagnosing hardware failures and performing component replacements.",
    views: 634,
    rating: 4.9,
    helpful: 87,
    lastUpdated: "2024-01-05",
    tags: ["hardware", "diagnostics", "replacement"],
    author: "Mike Davis",
    difficulty: "Advanced",
  },
  {
    id: "KB-004",
    title: "Security Incident Response Playbook",
    category: "Security",
    description:
      "Complete playbook for responding to security incidents, including containment and recovery procedures.",
    views: 1456,
    rating: 4.9,
    helpful: 203,
    lastUpdated: "2024-01-12",
    tags: ["security", "incident-response", "playbook"],
    author: "Emily Chen",
    difficulty: "Advanced",
  },
]

const popularSearches = [
  "password reset",
  "printer setup",
  "VPN connection",
  "email configuration",
  "software installation",
  "network troubleshooting",
]

const recentActivity = [
  {
    type: "article_created",
    title: "New article: Email Server Configuration",
    user: "Admin",
    time: "2 hours ago",
  },
  {
    type: "article_updated",
    title: "Updated: Network Security Guidelines",
    user: "Emily Chen",
    time: "4 hours ago",
  },
  {
    type: "solution_rated",
    title: "KB-001 received 5-star rating",
    user: "John Doe",
    time: "6 hours ago",
  },
]

export default function KnowledgeBasePage() {
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filteredArticles, setFilteredArticles] = useState(knowledgeArticles)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("ticketflow_user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  useEffect(() => {
    let filtered = knowledgeArticles

    if (searchQuery) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((article) => article.category === selectedCategory)
    }

    setFilteredArticles(filtered)
  }, [searchQuery, selectedCategory])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading knowledge base...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Knowledge Base</h1>
            <p className="text-muted-foreground">Search and browse IT solutions</p>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative mb-6">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg h-12"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Brain className="w-4 h-4 mr-2" />
                AI Search
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search) => (
                    <Button
                      key={search}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSearch(search)}
                      className="text-xs bg-transparent"
                    >
                      {search}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="all">All Articles</TabsTrigger>
                  <TabsTrigger value="Network">Network</TabsTrigger>
                  <TabsTrigger value="Software">Software</TabsTrigger>
                  <TabsTrigger value="Hardware">Hardware</TabsTrigger>
                  <TabsTrigger value="Security">Security</TabsTrigger>
                </TabsList>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>

              <TabsContent value={selectedCategory} className="space-y-4">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{article.category}</Badge>
                            <Badge variant="secondary" className="text-xs">
                              {article.difficulty}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{article.id}</span>
                          </div>
                          <CardTitle className="text-xl hover:text-primary transition-colors">
                            {article.title}
                          </CardTitle>
                          <CardDescription>{article.description}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{article.rating}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{article.views} views</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{article.helpful} helpful</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Updated {article.lastUpdated}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Share className="w-4 h-4" />
                          </Button>
                          <Button size="sm">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Read
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {article.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Articles</span>
                  <span className="font-semibold">247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="font-semibold text-green-600">+12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Rating</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">4.7</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Views</span>
                  <span className="font-semibold">15.2K</span>
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Contributors</CardTitle>
                <CardDescription>Most active knowledge base authors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Emily Chen", articles: 23, rating: 4.9 },
                  { name: "John Smith", articles: 18, rating: 4.8 },
                  { name: "Sarah Johnson", articles: 15, rating: 4.7 },
                  { name: "Mike Davis", articles: 12, rating: 4.6 },
                ].map((contributor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{contributor.name}</p>
                      <p className="text-xs text-muted-foreground">{contributor.articles} articles</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{contributor.rating}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest knowledge base updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-sm">{activity.title}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span>AI Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm font-medium">Trending Topic</p>
                  <p className="text-sm text-muted-foreground">
                    Network security articles are getting 40% more views this week
                  </p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm font-medium">Content Gap</p>
                  <p className="text-sm text-muted-foreground">Consider adding more beginner-level hardware guides</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </DashboardLayout>
  )
}
