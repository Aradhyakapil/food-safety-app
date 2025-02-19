"use client"

import { Check, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { getLabReports, createLabReport } from "@/app/api/api"

interface Report {
  name: string
  date: string
  status: string
}

export function LabReports() {
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    const fetchLabReports = async () => {
      try {
        const response = await getLabReports(businessId) // Replace 1 with the actual business ID
        setReports(response.data)
      } catch (error) {
        console.error("Failed to fetch lab reports:", error)
      }
    }
    fetchLabReports()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lab Reports</CardTitle>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add New Report
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.name} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div>
                <h3 className="font-medium">{report.name}</h3>
                <p className="text-sm text-muted-foreground">Date: {report.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center text-sm text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  {report.status}
                </span>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const handleSave = async () => {
  //setIsEditing(false);
  try {
    await Promise.all(
      reports.map((report) =>
        createLabReport({
          business_id: 1, // Replace with the actual business ID
          report_type: report.name,
          date: report.date,
          result: report.status,
        }),
      ),
    )
    // Optionally, you can fetch the updated reports here
  } catch (error) {
    console.error("Failed to save lab reports:", error)
    // Handle error (e.g., show error message to user)
  }
}

