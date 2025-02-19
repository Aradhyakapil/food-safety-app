"use client"

import { useState, useEffect, useRef } from "react"
import { QrCode } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Upload } from "lucide-react"
import { supabase } from "@/app/lib/supabase"

interface BusinessInformation {
  name: string
  license_number: string
  address: string
  email: string
  phone: string
  logo_url: string
}

export function BusinessHeader({ businessId }: { businessId: number }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [businessInfo, setBusinessInfo] = useState<BusinessInformation>({
    name: "",
    license_number: "",
    address: "",
    email: "",
    phone: "",
    logo_url: "/placeholder.svg"
  })

  const fetchBusinessInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('name, license_number, address, email, phone, logo_url')
        .eq('id', businessId)
        .single()

      if (error) throw error

      setBusinessInfo({
        name: data.name || '',
        license_number: data.license_number || '',
        address: data.address || '',
        email: data.email || '',
        phone: data.phone || '',
        logo_url: data.logo_url || '/placeholder.svg'
      })
    } catch (error) {
      console.error("Failed to fetch business information:", error)
    }
  }

  const handleLogoUpload = async () => {
    if (!selectedLogo) return

    setIsLoading(true)
    try {
      // Upload to Supabase Storage using a folder path
      const fileExt = selectedLogo.name.split('.').pop()
      const fileName = `business-logos/${businessId}-logo-${Date.now()}.${fileExt}`
      const { error: uploadError, data } = await supabase.storage
        .from('food-safety-files')
        .upload(fileName, selectedLogo)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('food-safety-files')
        .getPublicUrl(fileName)

      // Update business record with new logo URL
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ logo_url: publicUrl })
        .eq('id', businessId)

      if (updateError) throw updateError

      await fetchBusinessInfo()
      setIsLogoDialogOpen(false)
      setSelectedLogo(null)
    } catch (error) {
      console.error("Failed to upload logo:", error)
      alert("Failed to upload logo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          name: businessInfo.name,
          license_number: businessInfo.license_number,
          address: businessInfo.address,
          email: businessInfo.email,
          phone: businessInfo.phone
        })
        .eq('id', businessId)

      if (error) throw error

      await fetchBusinessInfo()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to update business info:", error)
      alert("Failed to update business information")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBusinessInfo()
  }, [businessId])

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16">
            <Image
              src={businessInfo.logo_url}
              alt="Business logo"
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{businessInfo.name}</h1>
                <Button variant="outline" size="sm">
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1 mt-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="text-muted-foreground">License:</span>
                <span>{businessInfo.license_number}</span>
              </p>
              <p>Address: {businessInfo.address}</p>
              <p>Phone: {businessInfo.phone}</p>
              <p>Email: {businessInfo.email}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            Apply for License Renewal
          </Button>
          <Button variant="outline" size="sm">
            Apply for New License
          </Button>
          <Button variant="outline" size="sm">
            Apply for Lab Reports
          </Button>
          {businessInfo.name === "restaurant" && (
            <Link href="/business/manufacturing/dashboard">
              <Button variant="outline" size="sm">
                Manufacturing Dashboard
              </Button>
            </Link>
          )}
        </div>
        <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Logo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Business Logo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-4">
                {selectedLogo && (
                  <div className="w-32 h-32 relative">
                    <Image
                      src={URL.createObjectURL(selectedLogo)}
                      alt="Selected logo"
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setSelectedLogo(e.target.files[0])
                    }
                  }}
                />
              </div>
              <Button 
                onClick={handleLogoUpload} 
                disabled={!selectedLogo || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Logo'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Business
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Business Information</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Business Name</Label>
                <Input
                  id="name"
                  value={businessInfo.name}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  value={businessInfo.license_number}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, license_number: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={businessInfo.phone}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Save Changes"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

