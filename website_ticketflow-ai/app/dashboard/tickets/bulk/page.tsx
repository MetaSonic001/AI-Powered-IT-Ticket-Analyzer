"use client"

import { useState, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { logFallbackUsage } from "@/lib/fallback-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Play,
  X,
  FileUp,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// Stepper Component
const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, name: "Upload CSV" },
    { id: 2, name: "Validate & Preview" },
    { id: 3, name: "Process" }
  ]

  return (
    <div className="w-full py-4 mb-8">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-sm transition-colors",
              currentStep >= step.id
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground text-muted-foreground"
            )}>
              {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
            </div>
            <span className={cn(
              "ml-2 text-sm font-medium",
              currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.name}
            </span>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-12 h-0.5 mx-4",
                currentStep > step.id ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BulkTicketPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [processingResult, setProcessingResult] = useState<any>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [step, setStep] = useState(1)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile)
        setValidationResult(null)
        setProcessingResult(null)
        setStep(1)
      } else {
        toast.error("Please upload a CSV file")
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setValidationResult(null)
      setProcessingResult(null)
      setStep(1)
    }
  }

  const handleReset = () => {
    setFile(null)
    setValidationResult(null)
    setProcessingResult(null)
    setStep(1)
  }

  const handleValidate = async () => {
    if (!file) {
      toast.error("Please select a file")
      return
    }

    setLoading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result
      if (typeof text !== 'string') {
        setLoading(false)
        toast.error("Failed to read file")
        return
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${API_URL}/api/v1/tickets/bulk-validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            csv_content: text,
            has_headers: true,
            delimiter: "auto"
          })
        })

        if (!response.ok) throw new Error('Validation failed')

        const data = await response.json()
        setValidationResult(data)
        setStep(2)

        if (data.is_valid) {
          toast.success(`Validated ${data.valid_rows} tickets successfully`)
        } else {
          toast.error(`Found ${data.invalid_rows} errors in CSV`)
        }
      } catch (error) {
        console.error("Validation error:", error)
        toast.error("Failed to validate CSV")
      } finally {
        setLoading(false)
      }
    }
    reader.readAsText(file)
  }

  const handleProcess = async () => {
    if (!validationResult?.tickets || validationResult.tickets.length === 0) {
      toast.error("No valid tickets to process")
      return
    }

    try {
      setLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = await fetch(`${API_URL}/api/v1/tickets/bulk-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tickets: validationResult.tickets,
          options: {
            auto_approve: true,
            priority_override: null
          }
        })
      })

      if (!response.ok) throw new Error('Bulk processing failed')

      const data = await response.json()
      setProcessingResult(data)
      setStep(3)
      toast.success(`Started processing ${validationResult.tickets.length} tickets`)
    } catch (error) {
      logFallbackUsage('/api/v1/tickets/bulk-process', error)
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
      const filename = data.filename || 'ticketflow_bulk_template.csv'
      const content = data.content as string

      // Trigger client-side download
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('CSV template downloaded')
    } catch (error) {
      logFallbackUsage('/api/v1/tickets/bulk-template', error)
      toast.error(error instanceof Error ? error.message : 'Download failed - API unavailable')
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between px-8  py-4">
        <div className="border-b border-gray-200 w-full pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Bulk Ticket Upload</h1>
          <p className="text-muted-foreground mt-1">Upload CSV files for batch processing</p>
        </div>
        {step > 1 && (
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        )}
      </div>

      <Stepper currentStep={step} />

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-2 border-dashed shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Drag and drop your CSV file here or click to browse.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-colors cursor-pointer bg-muted/5",
                  isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                  file ? "border-green-500/50 bg-green-50/50 dark:bg-green-900/10" : ""
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {file ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="font-medium text-lg">{file.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                    <Button variant="ghost" size="sm" className="mt-4 text-destructive hover:text-destructive" onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}>
                      <X className="w-4 h-4 mr-2" />
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileUp className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-medium text-lg">Drop CSV file here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-6">
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>

                <Button onClick={handleValidate} disabled={loading || !file} size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Validation Results */}
      {step === 2 && validationResult && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Validation Results</CardTitle>
                  <CardDescription>
                    Review the parsed tickets before creating them.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={validationResult.is_valid ? "default" : "destructive"} className="text-sm px-3 py-1">
                    {validationResult.is_valid ? (
                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Valid CSV</>
                    ) : (
                      <><AlertCircle className="w-3 h-3 mr-1" /> Invalid CSV</>
                    )}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {validationResult.valid_rows} Valid Rows
                  </Badge>
                  {validationResult.invalid_rows > 0 && (
                    <Badge variant="destructive" className="text-sm px-3 py-1">
                      {validationResult.invalid_rows} Invalid Rows
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Errors List */}
              {validationResult.errors && validationResult.errors.length > 0 && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Please fix the following errors:</AlertTitle>
                  <AlertDescription className="mt-2">
                    <ul className="list-disc pl-4 space-y-1 max-h-40 overflow-y-auto">
                      {validationResult.errors.map((err: any, i: number) => (
                        <li key={i}>
                          Row {err.row_index}: {err.errors.join(", ")}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview Table */}
              {validationResult.tickets && validationResult.tickets.length > 0 && (
                <div className="border rounded-md mb-6 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Requester</TableHead>
                        <TableHead>Department</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResult.tickets.slice(0, 5).map((t: any, i: number) => (
                        <TableRow key={i} className="hover:bg-muted/5">
                          <TableCell className="font-medium">{t.title}</TableCell>
                          <TableCell>{t.requester_info?.name || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{t.requester_info?.department || "N/A"}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {validationResult.tickets.length > 5 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-4 bg-muted/20">
                            ...and {validationResult.tickets.length - 5} more tickets
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleProcess}
                  disabled={loading || !validationResult.is_valid}
                  size="lg"
                  className="min-w-[150px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Process Tickets
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Processing Success */}
      {step === 3 && processingResult && (
        <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900">
            <CardContent className="pt-6 text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">Processing Started!</h2>
              <p className="text-green-700 dark:text-green-400 mb-6 max-w-md mx-auto">
                Your tickets have been queued for processing. The AI is analyzing them and will categorize them shortly.
              </p>

              <div className="bg-white dark:bg-black/20 rounded-lg p-4 mb-8 inline-block text-left">
                <p className="text-sm text-muted-foreground mb-1">Task ID</p>
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{processingResult.task_id}</code>
              </div>

              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={handleReset} className="bg-white dark:bg-transparent">
                  Upload More
                </Button>
                <Link href="/dashboard/tickets">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
