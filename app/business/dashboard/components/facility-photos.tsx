"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getFacilityPhotos, createFacilityPhoto } from "@/app/api/api"

interface FacilityPhoto {
  id?: number
  business_id: number
  area_name: string
  photo_url: string
}

export function FacilityPhotos({ businessId }: { businessId: number }) {
  const [photos, setPhotos] = useState<FacilityPhoto[]>([])
  const [newPhoto, setNewPhoto] = useState<FacilityPhoto>({
    business_id: businessId,
    area_name: "",
    photo_url: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchFacilityPhotos = async () => {
      try {
        const response = await getFacilityPhotos(businessId)
        setPhotos(response.data)
      } catch (error) {
        console.error("Failed to fetch facility photos:", error)
      }
    }
    fetchFacilityPhotos()
  }, [businessId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewPhoto((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await createFacilityPhoto(newPhoto)
      setPhotos((prev) => [...prev, response.data])
      setNewPhoto({
        business_id: businessId,
        area_name: "",
        photo_url: "",
      })
      alert("Facility photo added successfully!")
    } catch (error) {
      console.error("Failed to add facility photo:", error)
      alert("Failed to add facility photo. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Facility Photos</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Facility Photo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="area_name">Area Name</Label>
                <Input
                  id="area_name"
                  name="area_name"
                  value={newPhoto.area_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo_url">Photo URL</Label>
                <Input
                  id="photo_url"
                  name="photo_url"
                  value={newPhoto.photo_url}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Photo"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="space-y-2">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <Image
                  src={photo.photo_url || "/placeholder.svg"}
                  alt={photo.area_name}
                  fill
                  className="object-cover"
                />
                <Button size="sm" variant="outline" className="absolute bottom-2 right-2">
                  Edit Area Name
                </Button>
              </div>
              <p className="text-sm font-medium text-center">{photo.area_name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

