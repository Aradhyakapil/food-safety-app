"use client"

import { useState } from "react"
import { Check, Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Report {
  name: string
  date: string
  status: "Passed" | "Failed" | "Pending"
}

export function LabReports() {
  const [isEditing, setIsEditing] = useState(false)
  const [reports, setReports] = useState<Report[]>([
    { name: "Water Quality", date: "2024-01-15", status: "Passed" },
    { name: "Pest Control", date: "2024-01-14", status: "Passed" },
    { name: "Food Safety", date: "2024-01-13", status: "Passed" },
    { name: "Laboratory", date: "2024-01-12", status: "Passed" },
    { name: "FSMS", date: "2024-01-11", status: "Passed" },
    { name: "Kitchen Layout", date: "2024-01-10", status: "Passed" },
    { name: "Health and Hygiene", date: "2024-01-09", status: "Passed" },
    { name: "Waste Management", date: "2024-01-08", status: "Passed" },
  ])

  const toggleStatus = (index: number) => {
    const newReports = [...reports]
    newReports[index] = {
      ...newReports[index],
      status: newReports[index].status === "Passed" ? "Failed" : "Passed",
    }
    setReports(newReports)
  }

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save the changes to your backend
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lab Reports</CardTitle>
        {isEditing ? (
          <Button onClick={handleSave} size="sm">
            Save Changes
          </Button>
        ) : (
          <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Edit Reports
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report, index) => (
            <div key={report.name} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div>
                <h3 className="font-medium">{report.name}</h3>
                <p className="text-sm text-muted-foreground">Date: {report.date}</p>
              </div>
              <div className="flex items-center gap-4">
                {isEditing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatus(index)}
                    className={report.status === "Passed" ? "text-green-600" : "text-red-600"}
                  >
                    {report.status === "Passed" ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                    {report.status}
                  </Button>
                ) : (
                  <span
                    className={`flex items-center text-sm ${
                      report.status === "Passed" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {report.status === "Passed" ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                    {report.status}
                  </span>
                )}
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

