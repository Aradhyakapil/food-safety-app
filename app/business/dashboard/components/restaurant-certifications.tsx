"use client"

import { useState, useEffect } from "react"
import { Check, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCertifications, createCertification } from "@/app/api/api"

interface Certification {
  id?: number
  business_id: number
  certification_type: string
  number: string
  valid_from: string
  valid_to: string
  status: 'Active' | 'Expired'
}

const CERTIFICATION_TYPES = [
  { value: 'FSSAI License', required: true },
  { value: 'Trade License', required: true },
  { value: 'GST Registration', required: true },
  { value: 'Fire Safety Certificate', required: true },
  { value: 'Liquor License', required: false },
  { value: 'Music License', required: false }
]

export default function RestaurantCertifications({ businessId }: { businessId: number }) {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCertification, setNewCertification] = useState<Omit<Certification, 'id' | 'status'>>({
    business_id: businessId,
    certification_type: '',
    number: '',
    valid_from: '',
    valid_to: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const response = await getCertifications(businessId)
        setCertifications(response.data)
      } catch (error) {
        console.error("Failed to fetch certifications:", error)
      }
    }
    fetchCertifications()
  }, [businessId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewCertification((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Log the data we're sending
      console.log("Sending certification data:", {
        ...newCertification,
        status: 'Active'
      })

      const response = await fetch('/api/business/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          certification_type: newCertification.certification_type,
          number: newCertification.number,
          valid_from: newCertification.valid_from,
          valid_to: newCertification.valid_to,
          status: 'Active'
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error("Server response:", data)
        throw new Error(data.error || 'Failed to add certification')
      }

      // Update the certifications list with the new data
      setCertifications(data.data)
      
      // Reset form and close dialog
      setIsDialogOpen(false)
      setNewCertification({
        business_id: businessId,
        certification_type: '',
        number: '',
        valid_from: '',
        valid_to: ''
      })
    } catch (error) {
      console.error('Failed to add certification:', error)
      // Show error to user
      alert(error instanceof Error ? error.message : 'Failed to add certification')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Certifications</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Add New Certification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Certification</DialogTitle>
              <DialogDescription>
                Add a new certification for your business. All fields are required except where noted.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certification_type">Certification Type</Label>
                <Select
                  onValueChange={(value) => 
                    setNewCertification(prev => ({ ...prev, certification_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select certification type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CERTIFICATION_TYPES.map((cert) => (
                      <SelectItem key={cert.value} value={cert.value}>
                        {cert.value} {cert.required ? '(Required)' : '(Optional)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="number">Certificate Number</Label>
                <Input
                  id="number"
                  value={newCertification.number}
                  onChange={(e) => 
                    setNewCertification(prev => ({ ...prev, number: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Valid From</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={newCertification.valid_from}
                    onChange={(e) => 
                      setNewCertification(prev => ({ ...prev, valid_from: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_to">Valid To</Label>
                  <Input
                    id="valid_to"
                    type="date"
                    value={newCertification.valid_to}
                    onChange={(e) => 
                      setNewCertification(prev => ({ ...prev, valid_to: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Certification"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {certifications.map((cert) => (
            <div key={cert.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div>
                <h3 className="font-medium">{cert.certification_type}</h3>
                <p className="text-sm text-muted-foreground">Number: {cert.number}</p>
                <p className="text-sm text-muted-foreground">
                  Valid: {cert.valid_from} to {cert.valid_to}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center text-sm text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  Active
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

