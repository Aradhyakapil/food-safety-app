"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getManufacturingDetails, updateManufacturingDetails } from "@/app/api/api"

interface ManufacturingDetails {
  id?: number
  business_id: number
  production_capacity: string
  manufacturing_license: string
  iso_certification: string
  haccp_certification: string
  description: string
}

export function ManufacturingDetails({ businessId }: { businessId: number }) {
  const [details, setDetails] = useState<ManufacturingDetails>({
    business_id: businessId,
    production_capacity: "",
    manufacturing_license: "",
    iso_certification: "",
    haccp_certification: "",
    description: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchManufacturingDetails = async () => {
      try {
        const response = await getManufacturingDetails(businessId)
        setDetails(response.data)
      } catch (error) {
        console.error("Failed to fetch manufacturing details:", error)
      }
    }
    fetchManufacturingDetails()
  }, [businessId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updateManufacturingDetails(businessId, details)
      setIsEditing(false)
      alert("Manufacturing details updated successfully!")
    } catch (error) {
      console.error("Failed to update manufacturing details:", error)
      alert("Failed to update manufacturing details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manufacturing Details</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit Details
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Manufacturing Details</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="production_capacity">Production Capacity</Label>
                <Input
                  id="production_capacity"
                  name="production_capacity"
                  value={details.production_capacity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturing_license">Manufacturing License</Label>
                <Input
                  id="manufacturing_license"
                  name="manufacturing_license"
                  value={details.manufacturing_license}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iso_certification">ISO Certification</Label>
                <Input
                  id="iso_certification"
                  name="iso_certification"
                  value={details.iso_certification}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="haccp_certification">HACCP Certification</Label>
                <Input
                  id="haccp_certification"
                  name="haccp_certification"
                  value={details.haccp_certification}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={details.description}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Details"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Production Capacity:</span>
            <span>{details.production_capacity}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Manufacturing License:</span>
            <span>{details.manufacturing_license}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">ISO Certification:</span>
            <span>{details.iso_certification || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">HACCP Certification:</span>
            <span>{details.haccp_certification || "N/A"}</span>
          </div>
          <div>
            <span className="font-medium">Description:</span>
            <p className="mt-1 text-sm">{details.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

