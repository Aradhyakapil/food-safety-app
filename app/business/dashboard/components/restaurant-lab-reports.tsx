"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { LabReport } from "@/app/types"
import { getLabReports } from "@/app/api/api"

const TEST_TYPES = [
  'Food Safety Analysis',
  'Water Quality Test',
  'Surface Swab Test',
  'Microbiological Analysis',
  'Chemical Analysis'
]

export default function RestaurantLabReports({ businessId }: { businessId: number }) {
  const [reports, setReports] = useState<LabReport[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newReport, setNewReport] = useState<Omit<LabReport, 'id' | 'created_at' | 'updated_at'>>({
    business_id: businessId,
    report_date: '',
    test_type: '',
    result: '',
    notes: '',
    status: 'Pending',
    report_url: ''
  })

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getLabReports(businessId)
        if (response.success) {
          setReports(response.data)
        } else {
          console.error("Failed to fetch lab reports:", response.error)
        }
      } catch (error) {
        console.error("Error fetching lab reports:", error)
      }
    }

    if (businessId) {
      fetchReports()
    }
  }, [businessId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/business/lab-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add lab report')
      }

      setReports(data.data)
      setIsDialogOpen(false)
      setNewReport({
        business_id: businessId,
        report_date: '',
        test_type: '',
        result: '',
        notes: '',
        status: 'Pending',
        report_url: ''
      })
    } catch (error) {
      console.error('Failed to add lab report:', error)
      alert(error instanceof Error ? error.message : 'Failed to add lab report')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lab Reports</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lab Report</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="test_type">Test Type</Label>
                <Select
                  value={newReport.test_type}
                  onValueChange={(value) => setNewReport(prev => ({ ...prev, test_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEST_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="report_date">Report Date</Label>
                <Input
                  type="date"
                  id="report_date"
                  value={newReport.report_date}
                  onChange={(e) => setNewReport(prev => ({ ...prev, report_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="result">Result</Label>
                <Input
                  id="result"
                  value={newReport.result}
                  onChange={(e) => setNewReport(prev => ({ ...prev, result: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newReport.notes}
                  onChange={(e) => setNewReport(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="report_url">Report URL</Label>
                <Input
                  id="report_url"
                  value={newReport.report_url}
                  onChange={(e) => setNewReport(prev => ({ ...prev, report_url: e.target.value }))}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Report'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="text-center text-muted-foreground">No lab reports available</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-medium">{report.test_type}</h3>
                  <p className="text-sm text-muted-foreground">Date: {report.report_date}</p>
                  <p className="text-sm text-muted-foreground">Result: {report.result}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={report.report_url} target="_blank" rel="noopener noreferrer">
                    View Report
                  </a>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 