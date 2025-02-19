'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

interface FacilityPhoto {
  id: number
  business_id: number
  photo_url: string
  location: string
  created_at: string
}

export default function RestaurantFacilityPhotos({ businessId }: { businessId: number }) {
  const [photos, setPhotos] = useState<FacilityPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [location, setLocation] = useState('')

  const fetchFacilityPhotos = async () => {
    try {
      const response = await fetch(`/api/business/facility-photos/${businessId}`)
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch photos')
      }
      console.log('Fetched photos:', data.data)
      setPhotos(data.data)
    } catch (error) {
      console.error('Failed to fetch photos:', error)
      setError('Unable to load photos. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFacilityPhotos()
  }, [businessId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!selectedFile) {
        throw new Error('Please select a file')
      }

      const formData = new FormData()
      formData.append('photo', selectedFile)
      formData.append('location', location)
      formData.append('business_id', businessId.toString())

      const response = await fetch('/api/business/facility-photos', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to upload photo')
      }

      await fetchFacilityPhotos()
      setIsDialogOpen(false)
      setSelectedFile(null)
      setLocation('')
    } catch (error) {
      console.error('Error uploading photo:', error)
      setError('Failed to upload photo. Please try again.')
    }
  }

  if (isLoading) {
    return <div className="text-center p-4">Loading facility photos...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Facility Photos</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Photo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Facility Photo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="photo">Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <Button type="submit">Upload Photo</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="space-y-2">
              <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                <Image
                  src={photo.photo_url || "/placeholder.svg"}
                  alt={photo.location || 'Facility photo'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-2 bg-muted/50 rounded-md">
                <p className="text-sm font-medium text-center">
                  {photo.location || 'No location provided'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 