"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createPackagingCompliance, getPackagingCompliance } from "@/app/api/api"

interface PackagingCompliance {
  id?: number
  business_id: number
  material_type: string
  fssai_compliant: boolean
  tamper_proof_method: string
  labeling_details: string
  sustainability_info: string
  barcode: string
  qr_code?: string
  shelf_life_info: string
  regulatory_certification: string
}

export function PackagingCompliance({ businessId }: { businessId: number }) {
  const [compliance, setCompliance] = useState<PackagingCompliance>({
    business_id: businessId,
    material_type: "",
    fssai_compliant: false,
    tamper_proof_method: "",
    labeling_details: "",
    sustainability_info: "",
    barcode: "",
    qr_code: "",
    shelf_life_info: "",
    regulatory_certification: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchPackagingCompliance = async () => {
      try {
        const response = await getPackagingCompliance(businessId)
        if (response.data) {
          setCompliance(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch packaging compliance:", error)
      }
    }
    fetchPackagingCompliance()
  }, [businessId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCompliance((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setCompliance((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setCompliance((prev) => ({ ...prev, fssai_compliant: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await createPackagingCompliance(compliance)
      setCompliance(response.data)
      setIsDialogOpen(false)
      alert("Packaging compliance details saved successfully!")
    } catch (error) {
      console.error("Failed to save packaging compliance details:", error)
      alert("Failed to save packaging compliance details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Packaging Compliance</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Update Compliance</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Packaging Compliance</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material_type">Packaging Material Type</Label>
                  <Select
                    name="material_type"
                    value={compliance.material_type}
                    onValueChange={(value) => handleSelectChange("material_type", value)}
                  >
                    <SelectTrigger id="material_type">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plastic">Plastic</SelectItem>
                      <SelectItem value="glass">Glass</SelectItem>
                      <SelectItem value="biodegradable">Biodegradable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fssai_compliant">FSSAI Packaging Compliance Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="fssai_compliant"
                      checked={compliance.fssai_compliant}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="fssai_compliant">Compliant</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tamper_proof_method">Tamper-Proof Sealing Method</Label>
                <Input
                  id="tamper_proof_method"
                  name="tamper_proof_method"
                  value={compliance.tamper_proof_method}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labeling_details">Labeling Details</Label>
                <Textarea
                  id="labeling_details"
                  name="labeling_details"
                  value={compliance.labeling_details}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sustainability_info">Recycling & Sustainability Information</Label>
                <Textarea
                  id="sustainability_info"
                  name="sustainability_info"
                  value={compliance.sustainability_info}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode for Traceability</Label>
                  <Input id="barcode" name="barcode" value={compliance.barcode} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qr_code">QR Code for Traceability</Label>
                  <Input id="qr_code" name="qr_code" value={compliance.qr_code} onChange={handleInputChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shelf_life_info">Shelf-Life Information</Label>
                <Input
                  id="shelf_life_info"
                  name="shelf_life_info"
                  value={compliance.shelf_life_info}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regulatory_certification">Regulatory Certification for Packaging</Label>
                <Select
                  name="regulatory_certification"
                  value={compliance.regulatory_certification}
                  onValueChange={(value) => handleSelectChange("regulatory_certification", value)}
                >
                  <SelectTrigger id="regulatory_certification">
                    <SelectValue placeholder="Select certification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bis">BIS</SelectItem>
                    <SelectItem value="fssai">FSSAI</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Packaging Details"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Material Type</h3>
              <p>{compliance.material_type}</p>
            </div>
            <div>
              <h3 className="font-semibold">FSSAI Compliant</h3>
              <p>{compliance.fssai_compliant ? "Yes" : "No"}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Tamper-Proof Method</h3>
            <p>{compliance.tamper_proof_method}</p>
          </div>
          <div>
            <h3 className="font-semibold">Labeling Details</h3>
            <p>{compliance.labeling_details}</p>
          </div>
          <div>
            <h3 className="font-semibold">Sustainability Information</h3>
            <p>{compliance.sustainability_info}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Barcode</h3>
              <p>{compliance.barcode}</p>
            </div>
            <div>
              <h3 className="font-semibold">QR Code</h3>
              <p>{compliance.qr_code || "N/A"}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Shelf Life Information</h3>
            <p>{compliance.shelf_life_info}</p>
          </div>
          <div>
            <h3 className="font-semibold">Regulatory Certification</h3>
            <p>{compliance.regulatory_certification}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

