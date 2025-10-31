"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
  ArrowRight,
  Play,
  Zap,
  Brain,
  TrendingUp,
  Shield,
  Users,
  Clock,
  CheckCircle,
  Star,
  Menu,
  X,
  ChevronRight,
  BarChart3,
  Bot,
  Sparkles,
  Target,
  Globe,
  Award,
  Rocket,
  CloudLightning as Lightning,
  Database,
  Network,
  Lock,
  MessageSquare,
  Sun,
  Moon,
} from "lucide-react"

/* ----------------------------- THEME TOGGLE UI ---------------------------- */

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const isDark = (theme ?? resolvedTheme) === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}

/* ------------------------------- PAGE CONTENT ----------------------------- */

function PageContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [demoStep, setDemoStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setDemoStep((prev) => (prev + 1) % 4)
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const handleDemoClick = () => {
    window.location.href = "/signup?demo=true"
  }

  const handleTrialClick = () => {
    window.location.href = "/signup"
  }

  const handleLoginClick = () => {
    window.location.href = "/login"
  }

  const demoSteps = [
    { title: "Ticket Received", description: "User reports network connectivity issue", icon: MessageSquare },
    { title: "AI Analysis", description: "Categorized as Network • Priority: High • 94% confidence", icon: Brain },
    { title: "Solution Match", description: "Found 3 similar resolved tickets with solutions", icon: Target },
    { title: "Recommendation", description: "Suggested fix: Check DHCP configuration", icon: CheckCircle },
  ]

  /* -------------------------- Anim variants (subtle) -------------------------- */
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.5, delay },
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ================================ NAVBAR ================================ */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">TicketFlow AI</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/features" className="text-muted-foreground hover:text-foreground font-medium">
                Features
              </Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground font-medium">
                Pricing
              </Link>
              <Link href="/solutions" className="text-muted-foreground hover:text-foreground font-medium">
                Solutions
              </Link>
              <Link href="/resources" className="text-muted-foreground hover:text-foreground font-medium">
                Resources
              </Link>

              <ThemeToggle />

              <Button variant="ghost" onClick={handleLoginClick} className="font-medium">
                Login
              </Button>
              <Button onClick={handleTrialClick} className="shadow-lg hover:shadow-xl transition-shadow">
                Start Free Trial
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border shadow-lg">
            <div className="px-4 py-4 space-y-4">
              <Link href="/features" className="block text-muted-foreground hover:text-foreground font-medium">
                Features
              </Link>
              <Link href="/pricing" className="block text-muted-foreground hover:text-foreground font-medium">
                Pricing
              </Link>
              <Link href="/solutions" className="block text-muted-foreground hover:text-foreground font-medium">
                Solutions
              </Link>
              <Link href="/resources" className="block text-muted-foreground hover:text-foreground font-medium">
                Resources
              </Link>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" onClick={handleLoginClick} className="justify-start font-medium">
                  Login
                </Button>
                <Button onClick={handleTrialClick} className="justify-start shadow-lg">
                  Start Free Trial
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ================================ HERO ================================ */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* soft corporate grid glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="absolute inset-0 [mask-image:radial-gradient(600px_300px_at_50%_0%,black,transparent)] bg-[linear-gradient(0deg,transparent_24px,rgba(127,127,127,0.12)_25px),linear-gradient(90deg,transparent_24px,rgba(127,127,127,0.12)_25px)] bg-[size:28px_28px]" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            <motion.div {...fadeUp(0)}>
              <Badge variant="secondary" className="mb-6 px-4 py-2 shadow-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                #1 AI Platform for Enterprise IT Support
              </Badge>
            </motion.div>

            <motion.h1
              {...fadeUp(0.05)}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 text-balance leading-tight"
            >
              Transform Your IT Support with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                AI-Powered Intelligence
              </span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.1)}
              className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto text-pretty leading-relaxed"
            >
              Reduce resolution time by <strong className="text-foreground">60%</strong>, increase team productivity,
              and deliver exceptional IT support with our intelligent ticket analysis platform trusted by{" "}
              <strong className="text-foreground">500+ enterprise teams</strong>.
            </motion.p>

            <motion.div {...fadeUp(0.15)} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                size="lg"
                onClick={handleTrialClick}
                className="px-10 py-4 text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleDemoClick}
                className="px-10 py-4 text-lg bg-transparent hover:bg-muted/50"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Live Demo
              </Button>
            </motion.div>

            <motion.div {...fadeUp(0.2)} className="flex flex-col items-center space-y-6">
              <p className="text-sm text-muted-foreground font-medium">Trusted by IT teams at leading companies</p>
              <div className="flex flex-wrap justify-center items-center gap-12 opacity-80">
                <div className="flex items-center space-x-3 group hover:opacity-100 transition-opacity">
                  <Globe className="w-8 h-8 text-primary" />
                  <span className="font-bold text-lg">TechCorp</span>
                </div>
                <div className="flex items-center space-x-3 group hover:opacity-100 transition-opacity">
                  <Shield className="w-8 h-8 text-primary" />
                  <span className="font-bold text-lg">SecureIT</span>
                </div>
                <div className="flex items-center space-x-3 group hover:opacity-100 transition-opacity">
                  <Award className="w-8 h-8 text-primary" />
                  <span className="font-bold text-lg">InnovateLabs</span>
                </div>
                <div className="flex items-center space-x-3 group hover:opacity-100 transition-opacity">
                  <Target className="w-8 h-8 text-primary" />
                  <span className="font-bold text-lg">DataFlow</span>
                </div>
                <div className="flex items-center space-x-3 group hover:opacity-100 transition-opacity">
                  <Rocket className="w-8 h-8 text-primary" />
                  <span className="font-bold text-lg">CloudScale</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================== DEMO SECTION ============================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <motion.div {...fadeUp(0)} className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">See TicketFlow AI in Action</h2>
            <p className="text-xl text-muted-foreground">Watch how our AI processes tickets in real-time</p>
          </div>

          <Card className="bg-gradient-to-br from-background to-muted/50 border-2 border-primary/20 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center items-center space-x-4 mb-4">
                <Button
                  variant={isPlaying ? "secondary" : "default"}
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-6"
                >
                  {isPlaying ? "Pause Demo" : "Start Demo"}
                  {!isPlaying && <Play className="w-4 h-4 ml-2" />}
                </Button>
                <Badge variant="outline" className="px-3 py-1">
                  Live Processing
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                {demoSteps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = demoStep === index
                  const isCompleted = demoStep > index

                  return (
                    <motion.div
                      key={index}
                      animate={{ scale: isActive ? 1.05 : 1, opacity: isCompleted ? 0.9 : 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <div
                        className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : isCompleted
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-8 h-8" />
                      </div>
                      <h3
                        className={`font-semibold mb-2 transition-colors ${
                          isActive ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {index < demoSteps.length - 1 && (
                        <ChevronRight className="w-6 h-6 text-muted-foreground mx-auto mt-4 hidden md:block" />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* ============================ PROBLEM STATEMENT =========================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp(0)} className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">IT Support Shouldn't Be This Hard</h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Every day, IT teams struggle with overwhelming ticket volumes, inconsistent resolutions, and frustrated
              users waiting for help. The traditional approach is broken.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
              <CardHeader>
                <Clock className="w-16 h-16 text-destructive mx-auto mb-4" />
                <CardTitle className="text-xl">Slow Resolution Times</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Average ticket resolution takes <strong>3-5 days</strong>, leading to frustrated users and decreased
                  productivity across the organization.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
              <CardHeader>
                <Users className="w-16 h-16 text-destructive mx-auto mb-4" />
                <CardTitle className="text-xl">Overwhelmed Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  IT staff spend <strong>70% of their time</strong> on repetitive tasks instead of strategic initiatives
                  that drive business value.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
              <CardHeader>
                <TrendingUp className="w-16 h-16 text-destructive mx-auto mb-4" />
                <CardTitle className="text-xl">Growing Backlogs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Ticket volumes increase <strong>20% yearly</strong> while team sizes remain static, creating
                  unsustainable backlogs.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Card className="bg-destructive/5 border-destructive/20 max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-destructive mb-4">The Cost of Inefficient IT Support</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-destructive">$2.3M</div>
                    <p className="text-sm text-muted-foreground">Average annual cost of IT downtime</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-destructive">40%</div>
                    <p className="text-sm text-muted-foreground">Employee productivity loss</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* ============================ SOLUTION OVERVIEW =========================== */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <motion.div {...fadeUp(0)} className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">AI-Powered IT Support That Actually Works</h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Our intelligent platform transforms how your team handles IT support, delivering faster resolutions,
              happier users, and measurable ROI from day one.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <Card className="relative overflow-hidden hover:shadow-xl transition-all border-2 hover:border-primary/30 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <Zap className="w-16 h-16 text-primary mb-4" />
                <CardTitle className="text-xl">Instant Intelligence</CardTitle>
                <CardDescription className="text-base">
                  AI categorizes and prioritizes tickets in seconds, not hours
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    Auto-categorization with 95% accuracy
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    Smart priority assessment
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    Real-time ticket analysis
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    Automated routing to specialists
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-xl transition-all border-2 hover:border-primary/30 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <Brain className="w-16 h-16 text-primary mb-4" />
                <CardTitle className="text-xl">Smart Recommendations</CardTitle>
                <CardDescription className="text-base">
                  Get solution suggestions from vast knowledge base instantly
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    Contextual solution matching
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    Historical resolution patterns
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    Continuous learning system
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    Expert knowledge capture
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-xl transition-all border-2 hover:border-primary/30 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <BarChart3 className="w-16 h-16 text-primary mb-4" />
                <CardTitle className="text-xl">Predictive Analytics</CardTitle>
                <CardDescription className="text-base">
                  Forecast workloads and prevent bottlenecks before they happen
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    Workload forecasting
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    Resource planning insights
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    Performance trend analysis
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    Proactive issue detection
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Lightning className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Real-time Processing</h3>
              <p className="text-sm text-muted-foreground">Process thousands of tickets simultaneously</p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Database className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Knowledge Base</h3>
              <p className="text-sm text-muted-foreground">Centralized solution repository</p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Network className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Integrations</h3>
              <p className="text-sm text-muted-foreground">Connect with 50+ tools</p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Lock className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Enterprise Security</h3>
              <p className="text-sm text-muted-foreground">SOC 2 Type II compliant</p>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* ============================== HOW IT WORKS ============================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp(0)} className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">How TicketFlow AI Works</h2>
            <p className="text-xl text-muted-foreground">Four simple steps to transform your IT support workflow</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Ticket Ingestion",
                description: "Automatically capture tickets from all channels - email, portal, chat, and integrations",
              },
              {
                step: "2",
                title: "AI Analysis",
                description: "Our AI engine analyzes content, categorizes issues, and assesses priority in real-time",
              },
              {
                step: "3",
                title: "Solution Matching",
                description: "Match tickets with historical solutions and provide ranked recommendations",
              },
              {
                step: "4",
                title: "Continuous Learning",
                description: "System learns from resolutions to improve accuracy and recommendations over time",
              },
            ].map((item, index) => (
              <motion.div key={index} whileHover={{ y: -2 }} className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-sm">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
                {index < 3 && <ChevronRight className="w-6 h-6 text-muted-foreground mx-auto mt-4 hidden md:block" />}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ======================= SOCIAL PROOF & TESTIMONIALS ====================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <motion.div {...fadeUp(0)} className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Trusted by IT Teams Worldwide</h2>
            <p className="text-xl text-muted-foreground">
              See how organizations are transforming their IT support with TicketFlow AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <CardDescription>
                  "TicketFlow AI reduced our average resolution time from 4 days to 1.5 days. Our team can now focus on
                  strategic projects instead of repetitive troubleshooting."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">IT Director, TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <CardDescription>
                  "The AI recommendations are incredibly accurate. We've seen a 60% improvement in first-call resolution
                  rates since implementing TicketFlow AI."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Michael Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Support Manager, SecureIT</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <CardDescription>
                  "The predictive analytics help us plan resources better. We can now anticipate busy periods and staff
                  accordingly. Game-changer for our operations."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Emily Watson</p>
                    <p className="text-sm text-muted-foreground">CIO, InnovateLabs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">60%</div>
              <p className="text-muted-foreground">Faster Resolution Times</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <p className="text-muted-foreground">Classification Accuracy</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">40%</div>
              <p className="text-muted-foreground">Reduction in Escalations</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Enterprise Customers</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================================== CTA ================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:22px_22px] opacity-20" />
        <motion.div {...fadeUp(0)} className="max-w-5xl mx-auto text-center relative">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your IT Support?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Join hundreds of IT teams already using TicketFlow AI to deliver exceptional support experiences. Start your
            free trial today and see results within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              variant="secondary"
              onClick={handleTrialClick}
              className="px-10 py-4 text-lg shadow-xl hover:shadow-2xl"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleDemoClick}
              className="px-10 py-4 text-lg border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm opacity-90">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              14-day free trial
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Setup in minutes
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================================= FOOTER ================================ */}
      <footer className="bg-background border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">TicketFlow AI</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Transforming IT support with AI-powered intelligence for enterprise teams worldwide.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/features" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/integrations" className="hover:text-foreground transition-colors">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-foreground transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="hover:text-foreground transition-colors">
                    Status
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-foreground transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} TicketFlow AI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ------------------------------ PAGE WRAPPER ------------------------------ */
/** Since you don't have a ThemeProvider yet, we mount one here so the dark/light
 *  toggle works immediately. For production, consider moving this to app/layout.tsx.
 */
export default function HomePage() {
  return (
    
      <PageContent />
    
  )
}
