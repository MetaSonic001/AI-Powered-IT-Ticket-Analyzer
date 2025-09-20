"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Filter, User, Sparkles, Brain, History, Bookmark, TrendingUp } from "lucide-react"

interface SearchFilters {
  status?: string
  priority?: string
  category?: string
  assignee?: string
  dateRange?: string
  tags?: string[]
}

interface SearchResult {
  id: string
  type: "ticket" | "knowledge" | "user" | "report"
  title: string
  description: string
  relevance: number
  metadata: Record<string, any>
}

export function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([
    "network connectivity issues",
    "printer setup guide",
    "password reset procedure",
  ])
  const [savedSearches, setSavedSearches] = useState<Array<{ name: string; query: string; filters: SearchFilters }>>([
    { name: "High Priority Open Tickets", query: "", filters: { status: "open", priority: "high" } },
    { name: "Network Issues This Week", query: "network", filters: { category: "network", dateRange: "week" } },
  ])

  const popularSearches = [
    "VPN connection problems",
    "Email configuration",
    "Software installation",
    "Hardware replacement",
    "Security incidents",
    "Network troubleshooting",
  ]

  const smartSuggestions = [
    { query: "printer not working", suggestion: "Try: printer troubleshooting guide", type: "knowledge" },
    { query: "slow internet", suggestion: "Related: network performance optimization", type: "ticket" },
    { query: "password", suggestion: "Quick action: Reset user password", type: "action" },
  ]

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: "TF-2024-001",
      type: "ticket",
      title: "Network connectivity issues in Building A",
      description: "Users reporting intermittent connection drops and slow speeds",
      relevance: 95,
      metadata: { status: "open", priority: "high", assignee: "John Smith" },
    },
    {
      id: "KB-001",
      type: "knowledge",
      title: "Network Troubleshooting Guide",
      description: "Step-by-step guide for diagnosing network connectivity problems",
      relevance: 88,
      metadata: { category: "network", views: 1247, rating: 4.8 },
    },
    {
      id: "john.smith",
      type: "user",
      title: "John Smith",
      description: "Senior Network Administrator - Available",
      relevance: 75,
      metadata: { role: "admin", department: "IT", status: "available" },
    },
  ]

  const performSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    // Add to search history
    if (!searchHistory.includes(searchQuery)) {
      setSearchHistory((prev) => [searchQuery, ...prev.slice(0, 4)])
    }

    // Simulate API call
    setTimeout(() => {
      const filteredResults = mockResults.filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setResults(filteredResults)
      setIsSearching(false)
    }, 500)
  }

  const clearFilters = () => {
    setFilters({})
  }

  const saveCurrentSearch = () => {
    const name = prompt("Enter a name for this search:")
    if (name) {
      setSavedSearches((prev) => [...prev, { name, query: searchQuery, filters }])
    }
  }

  const loadSavedSearch = (savedSearch: (typeof savedSearches)[0]) => {
    setSearchQuery(savedSearch.query)
    setFilters(savedSearch.filters)
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "ticket":
        return "🎫"
      case "knowledge":
        return "📚"
      case "user":
        return "👤"
      case "report":
        return "📊"
      default:
        return "📄"
    }
  }

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 90) return "text-green-600"
    if (relevance >= 70) return "text-yellow-600"
    return "text-gray-600"
  }

  useEffect(() => {
    if (searchQuery) {
      const debounceTimer = setTimeout(performSearch, 300)
      return () => clearTimeout(debounceTimer)
    } else {
      setResults([])
    }
  }, [searchQuery, filters])

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tickets, knowledge base, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-20 text-lg h-12"
              onKeyDown={(e) => e.key === "Enter" && performSearch()}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <Popover open={showFilters} onOpenChange={setShowFilters}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-1" />
                    Filters
                    {Object.keys(filters).length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                        {Object.keys(filters).length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Search Filters</h4>
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear all
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          value={filters.status}
                          onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Priority</label>
                        <Select
                          value={filters.priority}
                          onValueChange={(value) => setFilters((prev) => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <Select
                          value={filters.category}
                          onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="network">Network</SelectItem>
                            <SelectItem value="software">Software</SelectItem>
                            <SelectItem value="hardware">Hardware</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Date Range</label>
                        <Select
                          value={filters.dateRange}
                          onValueChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button size="sm" onClick={performSearch} disabled={isSearching}>
                <Brain className="w-4 h-4 mr-1" />
                {isSearching ? "Searching..." : "AI Search"}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Recent</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {searchHistory.slice(0, 3).map((query, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setSearchQuery(query)}
                    >
                      {query}
                    </Button>
                  ))}
                </div>
              </div>

              {searchQuery && (
                <Button variant="ghost" size="sm" onClick={saveCurrentSearch}>
                  <Bookmark className="w-4 h-4 mr-1" />
                  Save Search
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Popular</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {popularSearches.slice(0, 4).map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs bg-transparent"
                    onClick={() => setSearchQuery(query)}
                  >
                    {query}
                  </Button>
                ))}
              </div>
            </div>

            {savedSearches.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Bookmark className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Saved</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {savedSearches.slice(0, 2).map((saved, index) => (
                    <Button
                      key={index}
                      variant="secondary"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => loadSavedSearch(saved)}
                    >
                      {saved.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results ({results.length})</span>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">AI-powered relevance</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Results</TabsTrigger>
                <TabsTrigger value="tickets">Tickets</TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-4">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">{getResultIcon(result.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-foreground">{result.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {result.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{result.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            {result.metadata.status && (
                              <span className="flex items-center space-x-1">
                                <span>Status:</span>
                                <Badge variant="secondary" className="text-xs">
                                  {result.metadata.status}
                                </Badge>
                              </span>
                            )}
                            {result.metadata.assignee && (
                              <span className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>{result.metadata.assignee}</span>
                              </span>
                            )}
                            {result.metadata.views && <span>{result.metadata.views} views</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getRelevanceColor(result.relevance)}`}>
                          {result.relevance}% match
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Smart Suggestions */}
      {searchQuery && smartSuggestions.some((s) => s.query.toLowerCase().includes(searchQuery.toLowerCase())) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-primary" />
              <span>AI Suggestions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {smartSuggestions
                .filter((s) => s.query.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 bg-primary/5 rounded-lg border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{suggestion.suggestion}</span>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
