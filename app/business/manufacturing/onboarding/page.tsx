"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

interface TeamMember {
  name: string
  role: string
  image?: File
}

interface FacilityPhoto {
  name: string
  image?: File
}

export default function ManufacturerOnboardingPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [businessLogo, setBusinessLogo] = useState<File | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [facilityPhotos, setFacilityPhotos] = useState<FacilityPhoto[]>([])

  const [formData, setFormData] = useState({
    businessName: "",
    address: "",
    phone: "",
    email: "",
    fssaiLicense: "",
    ownerName: "",
    ownerPhoto: null as File | null,
    description: "",
    manufacturingLicense: "",
    gstNumber: "",
    iso22000Certification: "",
    haccpCertification: "",
    productionCapacity: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      if (field === "businessLogo") {
        setBusinessLogo(e.target.files[0])
      } else if (field === "ownerPhoto") {
        setFormData((prev) => ({ ...prev, ownerPhoto: e.target.files![0] }))
      }
    }
  }

  const handleAddTeamMember = () => {
    setTeamMembers((prev) => [...prev, { name: "", role: "" }])
  }

  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    setTeamMembers((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleTeamMemberPhoto = (index: number, file: File) => {
    setTeamMembers((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], image: file }
      return updated
    })
  }

  const handleAddFacilityPhoto = () => {
    setFacilityPhotos((prev) => [...prev, { name: "" }])
  }

  const handleFacilityPhotoChange = (index: number, field: keyof FacilityPhoto, value: any) => {
    setFacilityPhotos((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Here you would typically upload all files and submit the form data
    // For this example, we'll simulate an API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/business/manufacturing/dashboard")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Manufacturing Unit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessLogo">Business Logo</Label>
                    <Input
                      id="businessLogo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "businessLogo")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Owner Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Owner Information</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input
                      id="ownerName"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerPhoto">Owner Photo</Label>
                    <Input
                      id="ownerPhoto"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "ownerPhoto")}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Licenses & Certifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Licenses & Certifications</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fssaiLicense">FSSAI License Number</Label>
                    <Input
                      id="fssaiLicense"
                      name="fssaiLicense"
                      value={formData.fssaiLicense}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manufacturingLicense">Manufacturing License Number</Label>
                    <Input
                      id="manufacturingLicense"
                      name="manufacturingLicense"
                      value={formData.manufacturingLicense}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input id="gstNumber" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iso22000Certification">ISO 22000 Certification</Label>
                      <Input
                        id="iso22000Certification"
                        name="iso22000Certification"
                        value={formData.iso22000Certification}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="haccpCertification">HACCP Certification</Label>
                    <Input
                      id="haccpCertification"
                      name="haccpCertification"
                      value={formData.haccpCertification}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Manufacturing Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Manufacturing Details</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your manufacturing unit and products"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productionCapacity">Production Capacity</Label>
                    <Input
                      id="productionCapacity"
                      name="productionCapacity"
                      value={formData.productionCapacity}
                      onChange={handleInputChange}
                      placeholder="e.g., 1000 units per day"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Team Members */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <Button type="button" variant="outline" onClick={handleAddTeamMember}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                </div>
                <div className="grid gap-4">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 items-start">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={member.name}
                          onChange={(e) => handleTeamMemberChange(index, "name", e.target.value)}
                          placeholder="Team member name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Input
                          value={member.role}
                          onChange={(e) => handleTeamMemberChange(index, "role", e.target.value)}
                          placeholder="Team member role"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Photo</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleTeamMemberPhoto(index, e.target.files[0])
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Facility Photos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Facility Photos</h3>
                  <Button type="button" variant="outline" onClick={handleAddFacilityPhoto}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Photo
                  </Button>
                </div>
                <div className="grid gap-4">
                  {facilityPhotos.map((photo, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 items-start">
                      <div className="space-y-2">
                        <Label>Area Name</Label>
                        <Input
                          value={photo.name}
                          onChange={(e) => handleFacilityPhotoChange(index, "name", e.target.value)}
                          placeholder="e.g., Production Line, Quality Control Lab"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Photo</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFacilityPhotoChange(index, "image", e.target.files[0])
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-[#2B47FC]" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

