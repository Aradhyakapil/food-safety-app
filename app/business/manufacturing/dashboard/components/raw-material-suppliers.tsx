"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createRawMaterialSupplier, getRawMaterialSuppliers } from "@/app/api/api"

interface Supplier {
  id?: number
  business_id: number
  supplier_name: string
  supplier_certification: string
  contact_info: string
  materials_provided: string
  origin_country: string
  traceability_info: string
  compliance_status: string
}

export function RawMaterialSuppliers({ businessId }: { businessId: number }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [newSupplier, setNewSupplier] = useState<Supplier>({
    business_id: businessId,
    supplier_name: "",
    supplier_certification: "",
    contact_info: "",
    materials_provided: "",
    origin_country: "",
    traceability_info: "",
    compliance_status: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await getRawMaterialSuppliers(businessId)
        setSuppliers(response.data)
      } catch (error) {
        console.error("Failed to fetch raw material suppliers:", error)
      }
    }
    fetchSuppliers()
  }, [businessId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewSupplier((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewSupplier((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await createRawMaterialSupplier(newSupplier)
      setSuppliers((prev) => [...prev, response.data])
      setNewSupplier({
        business_id: businessId,
        supplier_name: "",
        supplier_certification: "",
        contact_info: "",
        materials_provided: "",
        origin_country: "",
        traceability_info: "",
        compliance_status: "",
      })
      setIsDialogOpen(false)
      alert("Supplier added successfully!")
    } catch (error) {
      console.error("Failed to add supplier:", error)
      alert("Failed to add supplier. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Raw Material Suppliers</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Supplier</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_name">Supplier Name</Label>
                  <Input
                    id="supplier_name"
                    name="supplier_name"
                    value={newSupplier.supplier_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier_certification">Supplier Certification</Label>
                  <Select
                    name="supplier_certification"
                    value={newSupplier.supplier_certification}
                    onValueChange={(value) => handleSelectChange("supplier_certification", value)}
                  >
                    <SelectTrigger id="supplier_certification">
                      <SelectValue placeholder="Select certification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="organic">Organic</SelectItem>
                      <SelectItem value="fssai">FSSAI Approved</SelectItem>
                      <SelectItem value="iso">ISO Certified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_info">Supplier Contact Information</Label>
                <Textarea
                  id="contact_info"
                  name="contact_info"
                  value={newSupplier.contact_info}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materials_provided">Raw Materials Provided</Label>
                <Textarea
                  id="materials_provided"
                  name="materials_provided"
                  value={newSupplier.materials_provided}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin_country">Country/Region of Origin</Label>
                  <Input
                    id="origin_country"
                    name="origin_country"
                    value={newSupplier.origin_country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="traceability_info">Supply Chain Traceability</Label>
                  <Input
                    id="traceability_info"
                    name="traceability_info"
                    value={newSupplier.traceability_info}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="compliance_status">Compliance with Food Safety Standards</Label>
                <Select
                  name="compliance_status"
                  value={newSupplier.compliance_status}
                  onValueChange={(value) => handleSelectChange("compliance_status", value)}
                >
                  <SelectTrigger id="compliance_status">
                    <SelectValue placeholder="Select compliance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fssai">FSSAI</SelectItem>
                    <SelectItem value="haccp">HACCP</SelectItem>
                    <SelectItem value="iso22000">ISO 22000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Supplier"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="border-b pb-4 last:border-b-0">
              <h3 className="font-semibold">{supplier.supplier_name}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>Certification: {supplier.supplier_certification}</p>
                <p>Origin: {supplier.origin_country}</p>
                <p>Compliance: {supplier.compliance_status}</p>
              </div>
              <p className="text-sm mt-2">
                <span className="font-medium">Materials:</span> {supplier.materials_provided}
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

