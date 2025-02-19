"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createBatchProduction, getBatchProduction } from "@/app/api/api"

interface BatchProduction {
  id?: number
  business_id: number
  batch_number: string
  manufacturing_date: string
  expiry_date: string
  production_facility: string
  quality_report_url?: string
  supervisor: string
  testing_parameters: string
  storage_conditions: string
}

export function BatchProductionDetails({ businessId }: { businessId: number }) {
  const [batchDetails, setBatchDetails] = useState<BatchProduction[]>([])
  const [newBatch, setNewBatch] = useState<BatchProduction>({
    business_id: businessId,
    batch_number: "",
    manufacturing_date: "",
    expiry_date: "",
    production_facility: "",
    supervisor: "",
    testing_parameters: "",
    storage_conditions: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchBatchProduction = async () => {
      try {
        const response = await getBatchProduction(businessId)
        setBatchDetails(response.data)
      } catch (error) {
        console.error("Failed to fetch batch production details:", error)
      }
    }
    fetchBatchProduction()
  }, [businessId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewBatch((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await createBatchProduction(newBatch)
      setBatchDetails((prev) => [...prev, response.data])
      setNewBatch({
        business_id: businessId,
        batch_number: "",
        manufacturing_date: "",
        expiry_date: "",
        production_facility: "",
        supervisor: "",
        testing_parameters: "",
        storage_conditions: "",
      })
      setIsDialogOpen(false)
      alert("Batch details saved successfully!")
    } catch (error) {
      console.error("Failed to save batch details:", error)
      alert("Failed to save batch details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Batch & Production Details</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Batch</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Batch</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batch_number">Batch Number</Label>
                  <Input
                    id="batch_number"
                    name="batch_number"
                    value={newBatch.batch_number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturing_date">Manufacturing Date</Label>
                  <Input
                    id="manufacturing_date"
                    name="manufacturing_date"
                    type="date"
                    value={newBatch.manufacturing_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    name="expiry_date"
                    type="date"
                    value={newBatch.expiry_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="production_facility">Production Facility Location</Label>
                  <Input
                    id="production_facility"
                    name="production_facility"
                    value={newBatch.production_facility}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quality_report_url">Quality Testing Reports (File/URL)</Label>
                <Input
                  id="quality_report_url"
                  name="quality_report_url"
                  value={newBatch.quality_report_url}
                  onChange={handleInputChange}
                  placeholder="Enter URL or upload file"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supervisor">Production Supervisor/QA Manager</Label>
                <Input
                  id="supervisor"
                  name="supervisor"
                  value={newBatch.supervisor}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="testing_parameters">Testing Parameters & Results</Label>
                <Textarea
                  id="testing_parameters"
                  name="testing_parameters"
                  value={newBatch.testing_parameters}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage_conditions">Storage Conditions</Label>
                <Input
                  id="storage_conditions"
                  name="storage_conditions"
                  value={newBatch.storage_conditions}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Batch Details"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {batchDetails.map((batch) => (
            <div key={batch.id} className="border-b pb-4 last:border-b-0">
              <h3 className="font-semibold">Batch Number: {batch.batch_number}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>Manufacturing Date: {batch.manufacturing_date}</p>
                <p>Expiry Date: {batch.expiry_date}</p>
                <p>Production Facility: {batch.production_facility}</p>
                <p>Supervisor: {batch.supervisor}</p>
              </div>
              <p className="text-sm mt-2">
                <span className="font-medium">Storage Conditions:</span> {batch.storage_conditions}
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                View Full Details
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

