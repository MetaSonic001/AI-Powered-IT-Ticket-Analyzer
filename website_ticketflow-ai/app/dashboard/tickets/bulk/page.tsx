"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { logFallbackUsage } from "@/lib/fallback-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, File, CheckCircle, AlertCircle, Loader2, Download } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useState as useFileState } from "react"

export default function BulkTicketPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file")
      return
    }

    try {
      setLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}/api/v1/tickets/bulk-process`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Bulk processing failed')

      const data = await response.json()
      setResults(data)
      toast.success(`Successfully processed ${data.results?.length || 0} tickets`)
    } catch (error) {
      logFallbackUsage('/api/v1/tickets/bulk-process', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed - API unavailable')
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bulk Ticket Upload</h1>
        <p className="text-muted-foreground">Upload CSV files for batch processing</p>
      </div>

      {/* Upload Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            File should contain columns: title, description, requester_name, requester_email, requester_department
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file">Select File</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button variant="secondary" onClick={handleDownloadTemplate} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Download CSV template
              </Button>
              <Button onClick={handleUpload} disabled={loading || !file}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>

          {file && (
            <Alert>
              <File className="h-4 w-4" />
              <AlertDescription>
                <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
            <CardDescription>
              {results.results?.length || 0} tickets processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.results?.map((result: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{result.ticket_title}</h4>
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  {result.classification && (
                    <div className="flex gap-2 flex-wrap">
                      <Badge>{result.classification.category}</Badge>
                      <Badge variant="outline">{result.classification.subcategory}</Badge>
                      <Badge variant="secondary">
                        Priority: {result.priority?.level || 'N/A'}
                      </Badge>
                    </div>
                  )}
                  {result.error && (
                    <p className="text-sm text-destructive mt-2">{result.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}
