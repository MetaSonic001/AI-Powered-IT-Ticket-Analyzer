"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Bot,
  Zap,
  Brain,
  BarChart3,
  Users,
  CheckCircle,
  Workflow,
  Network,
  Lock,
  Gauge,
  MessageSquare,
  Target,
  Monitor,
  Smartphone,
  Tablet,
  FileText,
  Mail,
  Phone,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function FeaturesPage() {
  const router = useRouter()
  const handleTrialClick = () => router.push("/signup")

  const handleDemoClick = () => router.push("/login?demo=true")

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
              <Link href="/features" className="text-primary font-medium">
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
              <Link
                href="/resources"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Resources
              </Link>
              <Button variant="ghost" onClick={() => router.push("/login")} className="font-medium">
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
            <Zap className="w-4 h-4 mr-2" />
            Complete Feature Overview
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Every Feature You Need to <span className="text-primary">Transform IT Support</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
            Discover how TicketFlow AI's comprehensive feature set empowers your IT team to deliver exceptional support
            experiences with AI-powered intelligence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleTrialClick} className="px-8 py-3">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={handleDemoClick} className="px-8 py-3 bg-transparent">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Core AI Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">AI-Powered Core Features</h2>
            <p className="text-xl text-muted-foreground">
              Advanced artificial intelligence that transforms how you handle IT support
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden hover:shadow-xl transition-all border-2 hover:border-primary/30">
              <CardHeader>
                <Brain className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Intelligent Ticket Analysis</CardTitle>
                <CardDescription>AI analyzes every ticket for context, urgency, and solution patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    Natural language processing
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    Sentiment analysis
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    Context understanding
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    Multi-language support
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-xl transition-all border-2 hover:border-primary/30">
              <CardHeader>
                <Target className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Smart Categorization</CardTitle>
                <CardDescription>Automatically categorize and prioritize tickets with 95% accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    Auto-categorization
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    Priority assessment
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    Custom categories
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    Business impact scoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-xl transition-all border-2 hover:border-primary/30">
              <CardHeader>
                <Workflow className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Solution Recommendations</CardTitle>
                <CardDescription>Get instant solution suggestions from your knowledge base</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    Historical pattern matching
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    Confidence scoring
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    Step-by-step guides
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    Expert knowledge capture
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Analytics & Reporting */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Advanced Analytics & Reporting</h2>
            <p className="text-xl text-muted-foreground">Gain deep insights into your IT support performance</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <BarChart3 className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Performance Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Track resolution times, satisfaction scores, and team productivity
              </p>
            </Card>

            <Card className="text-center p-6">
              <Gauge className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Real-time Dashboards</h3>
              <p className="text-sm text-muted-foreground">
                Monitor ticket volumes, SLA compliance, and workload distribution
              </p>
            </Card>

            <Card className="text-center p-6">
              <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Custom Reports</h3>
              <p className="text-sm text-muted-foreground">Generate detailed reports for stakeholders and management</p>
            </Card>

            <Card className="text-center p-6">
              <Target className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Predictive Analytics</h3>
              <p className="text-sm text-muted-foreground">Forecast workloads and identify potential bottlenecks</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Integration & Platform Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Platform & Integration Features</h2>
            <p className="text-xl text-muted-foreground">Seamlessly connect with your existing tools and workflows</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <div className="flex items-center mb-6">
                <Network className="w-8 h-8 text-primary mr-3" />
                <h3 className="text-xl font-semibold">50+ Integrations</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-primary mr-3" />
                  ServiceNow, Jira, Zendesk
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-primary mr-3" />
                  Microsoft Teams, Slack
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-primary mr-3" />
                  Active Directory, Okta
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-primary mr-3" />
                  REST API & Webhooks
                </li>
              </ul>
            </Card>

            <Card className="p-8">
              <div className="flex items-center mb-6">
                <Lock className="w-8 h-8 text-primary mr-3" />
                <h3 className="text-xl font-semibold">Enterprise Security</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-primary mr-3" />
                  SOC 2 Type II compliant
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-primary mr-3" />
                  GDPR & HIPAA ready
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-primary mr-3" />
                  End-to-end encryption
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-primary mr-3" />
                  Role-based access control
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Multi-Channel Support */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Multi-Channel Support</h2>
            <p className="text-xl text-muted-foreground">Capture and manage tickets from every communication channel</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Mail className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Email Integration</h3>
              <p className="text-sm text-muted-foreground">Automatic ticket creation from email</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <MessageSquare className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Chat & Messaging</h3>
              <p className="text-sm text-muted-foreground">Teams, Slack, and web chat support</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Phone className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Phone Integration</h3>
              <p className="text-sm text-muted-foreground">VoIP and call center integration</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Monitor className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Self-Service Portal</h3>
              <p className="text-sm text-muted-foreground">User-friendly ticket submission portal</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Mobile & Accessibility */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Mobile & Accessibility</h2>
            <p className="text-xl text-muted-foreground">
              Work from anywhere with full mobile support and accessibility features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <Smartphone className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Mobile Apps</h3>
              <p className="text-muted-foreground mb-4">Native iOS and Android apps with full functionality</p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary mr-2" />
                  Offline capability
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary mr-2" />
                  Push notifications
                </li>
              </ul>
            </Card>

            <Card className="text-center p-8">
              <Tablet className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Responsive Design</h3>
              <p className="text-muted-foreground mb-4">Optimized for all screen sizes and devices</p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary mr-2" />
                  Touch-friendly interface
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary mr-2" />
                  Fast loading times
                </li>
              </ul>
            </Card>

            <Card className="text-center p-8">
              <Users className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Accessibility</h3>
              <p className="text-muted-foreground mb-4">WCAG 2.1 AA compliant for all users</p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary mr-2" />
                  Screen reader support
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary mr-2" />
                  Keyboard navigation
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience All These Features?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start your free trial today and see how TicketFlow AI can transform your IT support operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={handleTrialClick} className="px-8 py-3">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleDemoClick}
              className="px-8 py-3 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
            >
              Schedule Demo
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
