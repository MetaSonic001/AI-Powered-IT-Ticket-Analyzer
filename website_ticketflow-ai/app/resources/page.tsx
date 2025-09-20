"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Bot,
  BookOpen,
  FileText,
  Video,
  Headphones,
  Users,
  Calendar,
  Download,
  ExternalLink,
  Play,
  Star,
  Clock,
  User,
} from "lucide-react"
import Link from "next/link"

export default function ResourcesPage() {
  const handleTrialClick = () => {
    window.location.href = "/signup"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">TicketFlow AI</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/features"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Pricing
              </Link>
              <Link
                href="/solutions"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Solutions
              </Link>
              <Link href="/resources" className="text-primary font-medium">
                Resources
              </Link>
              <Button variant="ghost" onClick={() => (window.location.href = "/login")} className="font-medium">
                Login
              </Button>
              <Button onClick={handleTrialClick} className="shadow-lg hover:shadow-xl transition-shadow">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <BookOpen className="w-4 h-4 mr-2" />
            Knowledge Center
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Everything You Need to <span className="text-primary">Succeed with AI</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
            Explore our comprehensive library of guides, tutorials, webinars, and best practices to maximize your IT
            support transformation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleTrialClick} className="px-8 py-3">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 bg-transparent">
              Browse Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Resource Categories</h2>
            <p className="text-xl text-muted-foreground">Find exactly what you need to get started and grow</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Documentation</h3>
              <p className="text-sm text-muted-foreground mb-4">Complete guides and API references</p>
              <Badge variant="secondary">50+ Articles</Badge>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Video className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Video Tutorials</h3>
              <p className="text-sm text-muted-foreground mb-4">Step-by-step video walkthroughs</p>
              <Badge variant="secondary">25+ Videos</Badge>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Headphones className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Webinars</h3>
              <p className="text-sm text-muted-foreground mb-4">Live and recorded expert sessions</p>
              <Badge variant="secondary">Weekly</Badge>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Users className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-sm text-muted-foreground mb-4">Connect with other users and experts</p>
              <Badge variant="secondary">5000+ Members</Badge>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Resources</h2>
            <p className="text-xl text-muted-foreground">Most popular content to get you started</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary">Guide</Badge>
                  <Badge variant="outline">Popular</Badge>
                </div>
                <CardTitle>Getting Started with AI Ticket Analysis</CardTitle>
                <CardDescription>
                  Complete guide to setting up and optimizing AI-powered ticket categorization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    15 min read
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-primary text-primary" />
                    4.9
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Read Guide
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary">Video</Badge>
                  <Badge variant="outline">New</Badge>
                </div>
                <CardTitle>Dashboard Deep Dive</CardTitle>
                <CardDescription>Comprehensive walkthrough of analytics and reporting features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Play className="w-4 h-4 mr-1" />
                    22 minutes
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    2.1k views
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Watch Video
                  <Play className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary">Webinar</Badge>
                  <Badge variant="outline">Live</Badge>
                </div>
                <CardTitle>Best Practices for Enterprise Deployment</CardTitle>
                <CardDescription>Expert tips for rolling out TicketFlow AI across large organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Dec 15, 2024
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    500+ registered
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Register Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Documentation</h2>
            <p className="text-xl text-muted-foreground">Comprehensive guides for every aspect of TicketFlow AI</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <h3 className="text-xl font-bold mb-4">Quick Start Guides</h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between">
                  <span>Initial Setup & Configuration</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </li>
                <li className="flex items-center justify-between">
                  <span>Connecting Your First Integration</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </li>
                <li className="flex items-center justify-between">
                  <span>Training Your AI Model</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </li>
                <li className="flex items-center justify-between">
                  <span>Setting Up User Roles</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </li>
              </ul>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-bold mb-4">Advanced Features</h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between">
                  <span>Custom Workflow Builder</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </li>
                <li className="flex items-center justify-between">
                  <span>API Integration Guide</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </li>
                <li className="flex items-center justify-between">
                  <span>Advanced Analytics Setup</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </li>
                <li className="flex items-center justify-between">
                  <span>Enterprise Security Configuration</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Get Support</h2>
            <p className="text-xl text-muted-foreground">Multiple ways to get help when you need it</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Help Center</h3>
              <p className="text-muted-foreground mb-6">Search our comprehensive knowledge base for instant answers</p>
              <Button variant="outline" className="w-full bg-transparent">
                Browse Articles
              </Button>
            </Card>

            <Card className="text-center p-8">
              <Users className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Community Forum</h3>
              <p className="text-muted-foreground mb-6">Connect with other users and share best practices</p>
              <Button variant="outline" className="w-full bg-transparent">
                Join Community
              </Button>
            </Card>

            <Card className="text-center p-8">
              <Headphones className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Direct Support</h3>
              <p className="text-muted-foreground mb-6">Get personalized help from our expert support team</p>
              <Button variant="outline" className="w-full bg-transparent">
                Contact Support
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Downloads */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Downloads & Tools</h2>
            <p className="text-xl text-muted-foreground">Useful resources to enhance your experience</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <Download className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Mobile Apps</h3>
              <p className="text-sm text-muted-foreground mb-4">iOS and Android apps for on-the-go support</p>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </Card>

            <Card className="text-center p-6">
              <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">ROI Calculator</h3>
              <p className="text-sm text-muted-foreground mb-4">Calculate potential savings and benefits</p>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </Card>

            <Card className="text-center p-6">
              <BookOpen className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Implementation Guide</h3>
              <p className="text-sm text-muted-foreground mb-4">Step-by-step deployment checklist</p>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </Card>

            <Card className="text-center p-6">
              <Users className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Training Materials</h3>
              <p className="text-sm text-muted-foreground mb-4">Resources for team onboarding</p>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Explore our resources and start your AI-powered IT support transformation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={handleTrialClick} className="px-8 py-3">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-3 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
            >
              Browse Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TicketFlow AI</span>
          </Link>
          <p className="text-sm text-muted-foreground">© 2024 TicketFlow AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
