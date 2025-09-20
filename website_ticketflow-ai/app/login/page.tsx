"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Bot, Eye, EyeOff, ArrowLeft, Sparkles, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemo = searchParams.get("demo") === "true"

  useEffect(() => {
    if (isDemo) {
      setEmail("demo@ticketflow.ai")
      setPassword("demo123")
    }
  }, [isDemo])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate authentication
    setTimeout(() => {
      if (email === "demo@ticketflow.ai" && password === "demo123") {
        localStorage.setItem(
          "ticketflow_user",
          JSON.stringify({
            email: "demo@ticketflow.ai",
            name: "Demo User",
            role: "admin",
            isDemo: true,
          }),
        )
        router.push("/dashboard")
      } else if (email && password) {
        localStorage.setItem(
          "ticketflow_user",
          JSON.stringify({
            email,
            name: email.split("@")[0],
            role: "user",
            isDemo: false,
          }),
        )
        router.push("/dashboard")
      } else {
        setError("Please enter valid credentials")
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleDemoLogin = () => {
    console.log("[v0] Demo login clicked")
    setIsLoading(true)
    setError("")

    const demoUser = {
      email: "demo@ticketflow.ai",
      name: "Demo User",
      role: "admin",
      isDemo: true,
    }

    console.log("[v0] Setting demo user in localStorage:", demoUser)
    localStorage.setItem("ticketflow_user", JSON.stringify(demoUser))

    // Verify it was stored
    const stored = localStorage.getItem("ticketflow_user")
    console.log("[v0] Verified stored user:", stored)

    // Try multiple redirect methods for reliability
    setTimeout(() => {
      console.log("[v0] Attempting redirect to dashboard")

      // Try router first
      router.push("/dashboard")

      // Fallback to window.location after a short delay
      setTimeout(() => {
        console.log("[v0] Fallback redirect using window.location")
        window.location.href = "/dashboard"
      }, 100)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center space-x-2 mb-8">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">TicketFlow AI</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">Welcome to the Future of IT Support</h1>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of IT professionals who trust TicketFlow AI to transform their support operations.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <span>60% faster ticket resolution</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span>Enterprise-grade security</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>AI-powered intelligence</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm opacity-75">
            "TicketFlow AI has revolutionized how we handle IT support. Our team is more productive than ever."
          </p>
          <p className="text-sm font-semibold mt-2">- Sarah Chen, IT Director at TechCorp</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="text-center">
              <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">TicketFlow AI</span>
              </div>

              <CardTitle className="text-2xl">{isDemo ? "Demo Access" : "Welcome Back"}</CardTitle>
              <CardDescription>
                {isDemo
                  ? "Experience TicketFlow AI with our interactive demo"
                  : "Sign in to your TicketFlow AI account"}
              </CardDescription>

              {isDemo && (
                <Badge variant="secondary" className="mx-auto">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Demo Mode
                </Badge>
              )}
            </CardHeader>

            <CardContent>
              {error && (
                <Alert className="mb-4" variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form id="login-form" onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : isDemo ? "Access Demo" : "Sign In"}
                </Button>
              </form>

              {!isDemo && (
                <>
                  <div className="relative my-6">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                      OR
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isLoading ? "Accessing Demo..." : "Try Demo Access"}
                  </Button>
                </>
              )}

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>

              {!isDemo && (
                <div className="mt-4 text-center">
                  <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
                    Forgot your password?
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>
              By signing in, you agree to our{" "}
              <Link href="/terms" className="hover:text-foreground">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
