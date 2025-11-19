"use client"

import { useState, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  ArrowRight,
  RefreshCw,
  FileCheck,
  FileWarning
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Types based on API models
interface BulkRowError {
  row_index: number
  errors: string[]
}

interface BulkTicketItem {
  title: string
  description: string
  requester_info?: {
    name?: string
    email?: string
    department?: string
  }
  additional_context?: any
}

interface BulkValidationResult {
  is_valid: boolean
  total_rows: number
  valid_rows: number
  invalid_rows: number
  errors: BulkRowError[]
  tickets: BulkTicketItem[]
  missing_headers: string[]
}

interface ProcessingResult {
  task_id: string
  message: string
  status: string
}

export default function BulkTicketPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [validationResult, setValidationResult] = useState<BulkValidationResult | null>(null)
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetFlow = () => {
    setStep(1)
    setFile(null)
    setValidationResult(null)
    setProcessingResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setValidationResult(null)
    }
  }

  const handleValidate = async () => {
    if (!file) {
      toast.error("Please select a file")
      return
    }

    setLoading(true)
    try {
      const text = await file.text()
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = await fetch(`${API_URL}/api/v1/tickets/bulk-validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csv_content: text,
          has_headers: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Validation failed')
      }

      const data: BulkValidationResult = await response.json()
      setValidationResult(data)

      if (data.valid_rows > 0) {
        setStep(2)
        toast.success(`Validated ${data.valid_rows} tickets`)
      } else {
        toast.error("No valid tickets found in file")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Validation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = async () => {
    if (!validationResult || validationResult.tickets.length === 0) return

    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = await fetch(`${API_URL}/api/v1/tickets/bulk-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tickets: validationResult.tickets,
          options: {
            include_solutions: true,
            include_priority: true,
            include_classification: true,
            save_results: true
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Processing failed')
      }

      const data: ProcessingResult = await response.json()
      setProcessingResult(data)
      setStep(3)
      toast.success("Bulk processing started")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Processing failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API_URL}/api/v1/tickets/bulk-template`)
      if (!res.ok) throw new Error('Failed to fetch CSV template')
      const data = await res.json()

      const blob = new Blob([data.content], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = data.filename || 'ticketflow_bulk_template.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Template downloaded')
    } catch (error) {
      toast.error('Failed to download template')
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Ticket Import</h1>
          <p className="text-muted-foreground mt-1">
            Batch process tickets from CSV files with AI analysis
          </p>
        </div>
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-center w-full">
          <div className={cn("flex items-center", step >= 1 ? "text-primary" : "text-muted-foreground")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold", step >= 1 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground")}>1</div>
            <span className="ml-2 font-medium">Upload & Validate</span>
          </div>
          <div className={cn("h-1 w-24 mx-4", step >= 2 ? "bg-primary" : "bg-muted")}></div>
          <div className={cn("flex items-center", step >= 2 ? "text-primary" : "text-muted-foreground")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold", step >= 2 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground")}>2</div>
            <span className="ml-2 font-medium">Review</span>
          </div>
          <div className={cn("h-1 w-24 mx-4", step >= 3 ? "bg-primary" : "bg-muted")}></div>
          <div className={cn("flex items-center", step >= 3 ? "text-primary" : "text-muted-foreground")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold", step >= 3 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground")}>3</div>
            <span className="ml-2 font-medium">Processing</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 max-w-4xl mx-auto">
        {/* Step 1: Upload */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select CSV File</CardTitle>
              <CardDescription>
                Upload a CSV file containing ticket data. The file must have headers: title, description, requester_name, requester_email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="file">Ticket Data (CSV)</Label>
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </div>

              {file && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleValidate} disabled={!file || loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    Validate File
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Review */}
        {step === 2 && validationResult && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Rows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{validationResult.total_rows}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Valid Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{validationResult.valid_rows}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Invalid Rows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{validationResult.invalid_rows}</div>
                </CardContent>
              </Card>
            </div>

            {validationResult.missing_headers.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Missing Headers</AlertTitle>
                <AlertDescription>
                  The following required headers are missing: {validationResult.missing_headers.join(", ")}
                </AlertDescription>
              </Alert>
            )}

            {validationResult.errors.length > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center text-lg">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Validation Errors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {validationResult.errors.map((err, idx) => (
                      <div key={idx} className="text-sm p-2 bg-red-50 rounded border border-red-100 text-red-800">
                        <span className="font-semibold">Row {err.row_index + 1}:</span> {err.errors.join(", ")}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Preview Valid Tickets</CardTitle>
                <CardDescription>Review the tickets that will be processed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="max-h-[300px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-muted sticky top-0">
                        <tr>
                          <th className="px-4 py-3">Title</th>
                          <th className="px-4 py-3">Requester</th>
                          <th className="px-4 py-3">Description Preview</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {validationResult.tickets.slice(0, 10).map((ticket, i) => (
                          <tr key={i} className="bg-card hover:bg-muted/50">
                            <td className="px-4 py-3 font-medium">{ticket.title}</td>
                            <td className="px-4 py-3">{ticket.requester_info?.name || '-'}</td>
                            <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">
                              {ticket.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {validationResult.tickets.length > 10 && (
                    <div className="p-2 text-center text-xs text-muted-foreground bg-muted/20 border-t">
                      Showing 10 of {validationResult.tickets.length} tickets
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleProcess} disabled={loading || validationResult.valid_rows === 0}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Process...
                    </>
                  ) : (
                    <>
                      Start Processing
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 3 && processingResult && (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6 text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-green-800">Processing Started!</h2>
                <p className="text-green-700">
                  Your tickets have been queued for AI analysis.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-green-200 inline-block text-left min-w-[300px]">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Task ID:</span>
                  <span className="font-mono font-medium">{processingResult.task_id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {processingResult.status}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button variant="outline" onClick={resetFlow}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Upload Another File
                </Button>
                <Link href="/dashboard">
                  <Button>
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
