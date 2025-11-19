"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
  ArrowRight, Play, Zap, Brain, TrendingUp, Shield, Users, Clock,
  CheckCircle2, Star, Menu, X, ChevronRight, BarChart3, Bot, Sparkles,
  Target, Globe, Rocket, Database, Network, MessageSquare,
  Sun, Moon, LineChart, Slack, Layers, Code2, Lock, Terminal,
  Workflow, Mail, Search, HelpCircle, AlertCircle, Laptop, Wifi, AlertTriangle,
  FileText, Lightbulb, UserCheck, ShieldCheck, Settings2, Handshake,
  Paperclip
} from "lucide-react"

/* -------------------------- ANIMATION VARIANTS -------------------------- */

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.33, 1, 0.68, 1] } // Custom ease for smoother feel
  })
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay, ease: [0.33, 1, 0.68, 1] }
  })
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    rotate: [-2, 2, -2],
    transition: {
      duration: 6,
      ease: "easeInOut",
      repeat: Infinity,
    }
  }
}


/* -------------------------- SUB-COMPONENTS -------------------------- */

// The "Ticket Stack" mimicking the schedule list in the reference image
const TicketStack = () => {
  return (
    <motion.div
      variants={floatAnimation}
      initial="initial"
      animate="animate"
      className="absolute -bottom-12 -right-4 md:bottom-12 md:right-12 z-20 hidden md:block"
    >
      <div className="relative w-72">
        {/* Paperclip Visual */}
        <div className="absolute -top-4 left-8 z-30 text-muted-foreground/50 rotate-[-15deg]">
          <Paperclip className="w-12 h-12" />
        </div>

        {/* Ticket 3 (Bottom) */}
        <div className="absolute top-4 left-4 w-full bg-background border border-border/60 p-4 rounded-xl shadow-sm rotate-6 opacity-60 scale-95">
          <div className="h-2 w-20 bg-muted rounded mb-2"></div>
          <div className="h-2 w-32 bg-muted rounded"></div>
        </div>

        {/* Ticket 2 (Middle) */}
        <div className="absolute top-2 left-2 w-full bg-background border border-border/80 p-4 rounded-xl shadow-md rotate-3 opacity-80 scale-95">
          <div className="flex justify-between mb-2">
            <div className="h-2 w-12 bg-yellow-500/20 rounded"></div>
            <div className="h-2 w-4 bg-muted rounded"></div>
          </div>
          <div className="h-3 w-3/4 bg-muted-foreground/20 rounded mb-1"></div>
          <div className="h-2 w-1/2 bg-muted-foreground/10 rounded"></div>
        </div>

        {/* Ticket 1 (Top - Hero) */}
        <div className="relative bg-background/80 backdrop-blur-xl border border-primary/20 p-5 rounded-xl shadow-2xl -rotate-2 hover:rotate-0 transition-transform duration-300">
          <div className="flex items-center gap-3 mb-3 border-b pb-3 border-border/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Bot size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-primary">TicketFlow AI</div>
              <div className="text-[10px] text-muted-foreground">Just now • Auto-Triage</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-500 bg-red-500/5">Critical</Badge>
              <span className="text-xs font-medium">Database Timeout</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Detected high latency in US-East-1. Logs indicate connection pool exhaustion.
            </p>
            <div className="pt-2 flex gap-2">
              <Button size="sm" className="h-6 text-[10px] w-full bg-primary/10 text-primary hover:bg-primary/20 border-0">Fix Automatically</Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// The "Integrations" card mimicking the bottom left card
const IntegrationCard = () => {
  return (
    <motion.div
      initial={{ y: 0, rotate: 6 }}
      animate={{
        y: [-5, 5, -5],
        rotate: [6, 4, 6],
      }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute -bottom-6 -left-6 md:bottom-16 md:left-16 z-10 hidden md:block"
    >
      <div className="bg-background/60 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl max-w-[240px]">
        <p className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Powered by your stack</p>
        <div className="flex flex-wrap gap-4">
          {/* Mock Icons */}
          <div className="w-10 h-10 rounded-xl bg-[#4A154B] flex items-center justify-center text-white shadow-lg"><Slack size={20} /></div>
          <div className="w-10 h-10 rounded-xl bg-[#0052CC] flex items-center justify-center text-white shadow-lg"><Layers size={20} /></div> {/* Jira-ish */}
          <div className="w-10 h-10 rounded-xl bg-[#5E6AD2] flex items-center justify-center text-white shadow-lg"><Code2 size={20} /></div> {/* Linear-ish */}
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg"><Database size={20} /></div>
        </div>
      </div>
    </motion.div>
  )
}

// The Top Left Badge
const TopLeftBadge = () => {
  return (
    <motion.div
      initial={{ y: 0, rotate: -12 }}
      animate={{
        y: [10, -10, 10],
        rotate: [-12, -15, -12],
      }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-12 left-12 z-10 hidden lg:block"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-background to-muted border border-border rounded-2xl shadow-xl flex items-center justify-center">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-inner">
          <Bot size={28} />
        </div>
      </div>
    </motion.div>
  )
}

/* -------------------------- SUB-COMPONENTS -------------------------- */

const FloatingTicket = ({ delay, x, y, rotate, content, type }) => {
  // Theme-matched styles
  const styles = {
    critical: "border-red-500/30 bg-red-950/5 text-red-400 shadow-lg",
    warning: "border-orange-500/30 bg-orange-950/5 text-orange-400 shadow-lg",
    success: "border-green-500/30 bg-green-950/5 text-green-400 shadow-lg",
    default: "border-blue-500/30 bg-blue-950/5 text-blue-400 shadow-lg"
  }

  const badgeStyles = {
    critical: "bg-red-500/10 text-red-400 border-red-500/20",
    warning: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    default: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  }

  const progressStyles = {
    critical: "bg-red-500",
    warning: "bg-orange-500",
    success: "bg-green-500",
    default: "bg-blue-500"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: y + 50 }}
      animate={{
        opacity: [0, 1, 1, 0], // Fade in, stay, fade out (to allow new tickets)
        y: [y, y - 20, y - 20, y - 50],
        rotate: [rotate, rotate + 2, rotate - 2, rotate + 5]
      }}
      transition={{
        duration: 12, // Longer duration for full cycle
        repeat: Infinity,
        repeatType: "loop", // loop means it will restart from initial
        ease: "easeInOut",
        delay: delay
      }}
      className={`absolute hidden lg:flex flex-col gap-2 p-4 w-60 rounded-xl border backdrop-blur-md z-0 select-none ${styles[type] || styles.default}`}
      style={{ left: x, top: y }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] bg-background/50 text-foreground">JD</AvatarFallback>
          </Avatar>
          <span className="text-xs font-semibold opacity-80 text-foreground">John Doe</span>
        </div>
        <Badge variant="outline" className={`text-[10px] h-5 backdrop-blur-xl ${badgeStyles[type] || badgeStyles.default}`}>
          {type === 'critical' ? 'P1 - High' : 'Ticket #402'}
        </Badge>
      </div>
      <div className="text-sm font-medium leading-tight text-foreground/90">
        {content}
      </div>
      <div className="h-1 w-full bg-foreground/10 rounded-full mt-2 overflow-hidden">
        <motion.div
          className={`h-full ${progressStyles[type] || progressStyles.default}`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, delay: delay + 0.5, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>
    </motion.div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full">
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}

function LogoMarquee() {
  return (
    <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
      <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <li key={i} className="flex items-center gap-2 font-bold text-xl opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default text-muted-foreground">
            <Globe className="w-6 h-6" /> Acme Corp {i}
          </li>
        ))}
      </ul>
      <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <li key={`duplicate-${i}`} className="flex items-center gap-2 font-bold text-xl opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default text-muted-foreground">
            <Globe className="w-6 h-6" /> Acme Corp {i}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------- MAIN PAGE ----------------------------- */

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true, amount: 0.5 })

  const featuresRef = useRef(null)
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.3 })

  const problemRef = useRef(null)
  const problemInView = useInView(problemRef, { once: true, amount: 0.3 })

  const solutionsRef = useRef(null)
  const solutionsInView = useInView(solutionsRef, { once: true, amount: 0.3 })


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">

      {/* Scroll Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-500 z-[100] origin-left" style={{ scaleX }} />

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
        <div className="absolute right-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/10 opacity-20 blur-[100px]" />
      </div>

      {/* NAVBAR - Floating Island Style */}
      <nav className={`fixed top-6 left-0 right-0 z-50 mx-auto max-w-5xl transition-all duration-300 ${scrolled ? "px-4" : "px-0"}`}>
        <div className={`flex items-center justify-between rounded-full border px-6 py-3 backdrop-blur-xl transition-all duration-300 ${scrolled ? "bg-background/80 shadow-lg border-border" : "bg-transparent border-transparent"
          }`}>
          <div className="flex items-center space-x-2 font-bold text-lg tracking-tight cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-tr from-primary to-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5" />
            </div>
            <span>TicketFlow</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {["Features", "Solutions", "Pricing"].map((item) => (
              <Link key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm">Log in</Button>
            <Button size="sm" className="rounded-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-white shadow-lg shadow-primary/20">
              Get Started
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-4 right-4 mt-4 p-4 bg-background/95 backdrop-blur-lg rounded-2xl border shadow-xl flex flex-col gap-4 md:hidden"
            >
              {["Features", "Solutions", "Pricing", "Login"].map((item) => (
                <Link key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} className="p-2 font-medium border-b last:border-0 border-border/50">{item}</Link>
              ))}
              <Button className="w-full">Get Started</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION with Floating Tickets */}
      <section className="pt-28 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* The Hero Container Card */}
          <div className="relative bg-muted/30 border border-border/50 rounded-[40px] md:rounded-[60px] overflow-hidden min-h-[700px] flex flex-col items-center justify-center text-center p-8 md:p-20 shadow-sm">

            {/* Dot Pattern Background */}
            <div className="absolute inset-0 opacity-[0.6] bg-[radial-gradient(#a1a1aa_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

            {/* Floating Elements */}
            <TopLeftBadge />
            <IntegrationCard />
            <TicketStack />

            {/* Main Content */}
            <div className="relative z-30 max-w-4xl mx-auto">
              <motion.div
                initial="hidden" animate="visible" variants={fadeIn}
                className="inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground mb-8 shadow-sm"
              >
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                <span>TicketFlow 2.0 is now live</span>
              </motion.div>

              <motion.h1
                initial="hidden" animate="visible" variants={fadeIn} custom={0.1}
                className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-foreground mb-8 leading-[1.1]"
              >
                Turn Chaos Into <br />
                <span className="text-primary">Zero Backlog.</span>
              </motion.h1>

              <motion.p
                initial="hidden" animate="visible" variants={fadeIn} custom={0.2}
                className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                From triage to resolution, we build the AI agent that moves fast and lasts.
                Automate 60% of your IT support in 28 days.
              </motion.p>

              <motion.div
                initial="hidden" animate="visible" variants={fadeIn} custom={0.3}
              >
                <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-105">
                  Automate my Helpdesk <Zap className="w-5 h-5 ml-2" />
                </Button>
                <p className="mt-4 text-xs text-muted-foreground font-medium">No credit card required • Cancel anytime</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM STATEMENT SECTION */}
      <section ref={problemRef} className="py-24 bg-gradient-to-b from-background to-muted/30 border-y border-border/40 relative">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_50%_70%_at_50%_0%,#000_30%,transparent_100%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" animate={problemInView ? "visible" : "hidden"} variants={fadeIn}>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Is your IT team stuck in the <br />
                <span className="text-destructive decoration-wavy underline underline-offset-8">Ticket Black Hole?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Ticket volumes are growing 20% YoY, but headcount isn't. The traditional "first-in, first-out" queue is broken.
              </p>

              <div className="space-y-6">
                {[
                  { title: "Slow Resolution", desc: "3-5 days average turnaround kills productivity.", icon: Clock },
                  { title: "Agent Burnout", desc: "Talented engineers quit because of repetitive tasks.", icon: AlertCircle },
                  { title: "Data Silos", desc: "Solutions are buried in Slack threads, not documentation.", icon: Database },
                ].map((item, i) => (
                  <motion.div key={i} className="flex gap-4" initial="hidden" animate={problemInView ? "visible" : "hidden"} variants={fadeIn} custom={i * 0.1}>
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial="hidden" animate={problemInView ? "visible" : "hidden"} variants={scaleIn} custom={0.3} className="relative">
              {/* Abstract Visualization of Chaos */}
              <div className="absolute inset-0 bg-gradient-to-tr from-destructive/20 to-orange-500/20 blur-3xl rounded-full opacity-40" />
              <Card className="relative border-border shadow-2xl bg-background/80 backdrop-blur overflow-hidden">
                <CardHeader className="border-b bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">UNASSIGNED TICKETS (99+)</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col divide-y">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-4 h-4 text-destructive" />
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">Urgent: VPN Down for Sales</span>
                            <span className="text-xs text-muted-foreground">Opened 4 days ago • High Priority</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">View</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BENTO GRID FEATURES */}
      <section id="features" ref={featuresRef} className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2 initial="hidden" animate={featuresInView ? "visible" : "hidden"} variants={fadeIn} className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Not just a chatbot.<br />A full agent.</motion.h2>
            <motion.p initial="hidden" animate={featuresInView ? "visible" : "hidden"} variants={fadeIn} custom={0.1} className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Most AI tools guess. TicketFlow acts. It connects to your infrastructure to diagnose and resolve.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Card */}
            <motion.div initial="hidden" animate={featuresInView ? "visible" : "hidden"} variants={scaleIn} custom={0.2} className="md:col-span-2 row-span-2">
              <Card className="h-full overflow-hidden relative group border-muted-foreground/10 bg-gradient-to-br from-muted/50 to-transparent backdrop-blur-sm hover:border-primary/30 transition-all duration-500">
                <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Core Intelligence</Badge>
                  <CardTitle className="text-3xl">Context-Aware Triage</CardTitle>
                  <p className="text-muted-foreground text-lg">Reads the ticket, checks the logs, and routes it to the exact person needed. No more "L1 Ping Pong".</p>
                </CardHeader>
                <CardContent className="relative mt-10">
                  <div className="bg-background/80 border rounded-t-xl shadow-2xl p-6 translate-y-4 group-hover:translate-y-2 transition-transform duration-500">
                    <div className="flex gap-4 mb-4 border-b pb-4">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500"><AlertCircle size={20} /></div>
                      <div>
                        <div className="font-semibold">VPN Connection Failed</div>
                        <div className="text-sm text-muted-foreground">Ticket #3922 • 2 mins ago</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-green-500"><CheckCircle2 size={14} /> <span>Analyzed user logs</span></div>
                      <div className="flex items-center gap-2 text-sm text-green-500"><CheckCircle2 size={14} /> <span>Identified expired certificate</span></div>
                      <div className="flex items-center gap-2 text-sm text-blue-500 animate-pulse"><Bot size={14} /> <span>Drafting renewal instructions...</span></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Side Card 1 */}
            <motion.div initial="hidden" animate={featuresInView ? "visible" : "hidden"} variants={scaleIn} custom={0.3}>
              <Card className="h-full group overflow-hidden border-muted-foreground/10 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-primary"><Zap /></div>
                  <CardTitle>Instant Resolutions</CardTitle>
                  <p className="text-muted-foreground">Auto-reset passwords, clear caches, and provision access without human touch.</p>
                </CardHeader>
                <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:opacity-20 transition-opacity">
                  <Zap size={120} />
                </div>
              </Card>
            </motion.div>

            {/* Side Card 2 */}
            <motion.div initial="hidden" animate={featuresInView ? "visible" : "hidden"} variants={scaleIn} custom={0.4}>
              <Card className="h-full group overflow-hidden border-muted-foreground/10 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-purple-500"><Brain /></div>
                  <CardTitle>Self-Learning Knowledge</CardTitle>
                  <p className="text-muted-foreground">Turns every solved ticket into a documentation article automatically.</p>
                </CardHeader>
                <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:opacity-20 transition-opacity">
                  <Database size={120} />
                </div>
              </Card>
            </motion.div>

            {/* Wide Bottom Card */}
            <motion.div initial="hidden" animate={featuresInView ? "visible" : "hidden"} variants={scaleIn} custom={0.5} className="md:col-span-3">
              <Card className="h-full overflow-hidden border-muted-foreground/10 bg-gradient-to-br from-background/50 to-muted/20 relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute top-0 right-0 p-12 opacity-20"><LineChart size={200} /></div>
                <div className="relative z-10 grid md:grid-cols-2 gap-8 p-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Analytics that predict the future</h3>
                    <p className="text-muted-foreground">Spot trends before they become outages. "Why is WiFi slow on Tuesdays?" We'll tell you.</p>
                  </div>
                  <div className="bg-background/50 border border-border/50 rounded-lg p-4 font-mono text-xs text-green-400">
                    <div className="flex justify-between border-b border-border/50 pb-2 mb-2 text-muted-foreground"><span>METRIC</span><span>TREND</span></div>
                    <div className="flex justify-between mb-1"><span>Ticket Volume</span><span><span className="text-red-500">▼</span> 32%</span></div>
                    <div className="flex justify-between mb-1"><span>Response Time</span><span><span className="text-green-500">▲</span> 85%</span></div>
                    <div className="flex justify-between text-blue-400"><span>CSAT Score</span><span><span className="text-green-500">▲</span> 12%</span></div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SOLUTIONS SECTION */}
      <section id="solutions" ref={solutionsRef} className="py-24 bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 initial="hidden" animate={solutionsInView ? "visible" : "hidden"} variants={fadeIn} className="text-4xl md:text-5xl font-bold mb-6">Solutions for every IT challenge</motion.h2>
            <motion.p initial="hidden" animate={solutionsInView ? "visible" : "hidden"} variants={fadeIn} custom={0.1} className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tailored workflows to automate the most common (and annoying) IT requests.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: UserCheck,
                title: "Onboarding Automation",
                desc: "Create accounts across G-Suite, Slack, and Jira instantly when HR adds a new hire."
              },
              {
                icon: Lock,
                title: "Access Management",
                desc: "Handle password resets and 2FA unlocks via chat without agent intervention."
              },
              {
                icon: Laptop,
                title: "Hardware Lifecycle",
                desc: "Streamline laptop requests, approvals, and return shipping logistics."
              },
              {
                icon: Code2,
                title: "Software Provisioning",
                desc: "Auto-grant GitHub repository access or AWS permissions based on role."
              },
              {
                icon: Wifi,
                title: "Network Diagnostics",
                desc: "Guide users through troubleshooting steps before flagging network engineers."
              },
              {
                icon: ShieldCheck,
                title: "Security Triage",
                desc: "Automatically classify phishing reports and isolate affected devices."
              },
            ].map((solution, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                custom={i * 0.1}
              >
                <Card className="h-full hover:bg-muted/50 transition-colors border-border/50 hover:border-primary/20 group">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <solution.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl">{solution.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{solution.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRATION SECTION */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 bg-primary/5 text-primary border-primary/20">Seamless Integration</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">We live where your team lives.</h2>
            <p className="text-lg text-muted-foreground mb-8">
              TicketFlow isn't another portal to log into. It's an invisible layer that connects your chat apps to your infrastructure.
            </p>

            <div className="space-y-4">
              {[
                { title: "Slack & Teams Native", desc: "Users chat naturally. We handle the tickets behind the scenes." },
                { title: "Bi-directional Sync", desc: "Update in Jira? It updates in Slack. Comment in Slack? It goes to Linear." },
                { title: "Zero-Config Webhooks", desc: "Connect to AWS, Azure, and GCP monitoring in one click." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative Gradient behind image */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-20"></div>

            {/* Mockup Window */}
            <div className="relative bg-card rounded-xl overflow-hidden shadow-2xl border border-border/50">
              <div className="flex items-center px-4 py-3 border-b border-border/50 bg-muted/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-4 text-xs text-muted-foreground font-mono flex items-center gap-2">
                  <Slack className="w-3 h-3" /> #engineering-support
                </div>
              </div>
              <div className="p-6 font-mono text-sm bg-background/50 backdrop-blur-sm">
                {/* User Message */}
                <div className="flex gap-4 mb-6">
                  <Avatar className="w-8 h-8 rounded bg-orange-500 text-white">
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-foreground">Sarah Jenkins</span>
                      <span className="text-xs text-muted-foreground">10:23 AM</span>
                    </div>
                    <div className="text-foreground/80">
                      Production is throwing 500 errors on the checkout service. Can someone check?
                    </div>
                  </div>
                </div>

                {/* Bot Reply */}
                <div className="flex gap-4 mb-4 pl-4 border-l-2 border-primary/30">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                    <Bot size={16} />
                  </div>
                  <div className="space-y-2 w-full">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-foreground">TicketFlow AI</span>
                      <span className="text-xs text-muted-foreground bg-muted px-1 rounded">APP</span>
                    </div>
                    <div className="text-foreground/80">
                      I've analyzed the logs. Recent deployment <code>v2.4.1</code> triggered a memory leak in the payment controller.
                    </div>

                    <div className="bg-muted/50 p-3 rounded border border-border/50 text-xs grid grid-cols-2 gap-2">
                      <div><span className="text-muted-foreground">Severity:</span> <span className="text-red-500 font-bold">Critical</span></div>
                      <div><span className="text-muted-foreground">Impact:</span> <span className="text-foreground">Checkout Service</span></div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="default" className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white border-0">
                        <Rocket className="w-3 h-3 mr-2" /> Rollback v2.4.1
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs">View Logs</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 px-4 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              Ready to unclog your backlog?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join 500+ engineering teams who reclaimed their time. Set up takes 15 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full text-lg px-8 h-12 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                Get Started for Free
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-lg px-8 h-12 bg-background/50 backdrop-blur">
                Talk to Sales
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> No credit card required</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> 14-day free trial</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Cancel anytime</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-16 bg-muted/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 font-bold text-xl mb-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <span>TicketFlow</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                The intelligent service desk for modern engineering teams.
              </p>
              <div className="flex gap-4 text-muted-foreground">
                <Link href="#" className="hover:text-primary transition-colors"><Slack className="w-5 h-5" /></Link>
                <Link href="#" className="hover:text-primary transition-colors"><Globe className="w-5 h-5" /></Link>
                <Link href="#" className="hover:text-primary transition-colors"><Mail className="w-5 h-5" /></Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground">Integrations</Link></li>
                <li><Link href="#" className="hover:text-foreground">Security</Link></li>
                <li><Link href="#" className="hover:text-foreground">Enterprise</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Documentation</Link></li>
                <li><Link href="#" className="hover:text-foreground">API Reference</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Community</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-foreground">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <div>© 2024 TicketFlow AI Inc. All rights reserved.</div>
            <div className="flex gap-8">
              <span>Made with ❤️ by Enigma Trio</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}