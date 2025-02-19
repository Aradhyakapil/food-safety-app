"use client"

import { useState } from "react"
import { Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/app/lib/supabase"

interface FacilityPhoto {
  id?: number
  business_id: number
  photo_url: string
  description: string
  location: string
  created_at?: string
  updated_at?: string
}

export default function RestaurantFacilityPhotos({ businessId }: { businessId: number }) {
  const [photos, setPhotos] = useState<FacilityPhoto[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [newPhoto, setNewPhoto] = useState<Omit<FacilityPhoto, 'id' | 'created_at' | 'updated_at' | 'photo_url'>>({
    business_id: businessId,
    description: '',
    location: ''
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (!selectedFile) {
        throw new Error('Please select a file')
      }

      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }

      // Validate file size (e.g., 5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `facility-photos/${businessId}/${fileName}`

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('food-safety-files')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error('Failed to upload image')
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('food-safety-files')
        .getPublicUrl(filePath)

      // Save photo data to database
      const response = await fetch('/api/business/facility-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPhoto,
          photo_url: publicUrl
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add photo')
      }

      setPhotos(data.data)
      setIsDialogOpen(false)
      setSelectedFile(null)
      setNewPhoto({
        business_id: businessId,
        description: '',
        location: ''
      })
    } catch (error) {
      console.error('Failed to add photo:', error)
      alert(error instanceof Error ? error.message : 'Failed to add photo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Facility Photos</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Facility Photo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="photo">Photo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                  {selectedFile && (
                    <div className="text-sm text-muted-foreground">
                      {selectedFile.name}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  required
                  value={newPhoto.location}
                  onChange={(e) => setNewPhoto(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPhoto.description}
                  onChange={(e) => setNewPhoto(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Add Photo'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
              <img
                src={photo.photo_url}
                alt={photo.description}
                className="object-cover w-full h-full"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                <p className="font-medium">{photo.location}</p>
                <p className="text-sm">{photo.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 