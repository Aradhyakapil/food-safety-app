"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { supabase } from "@/app/lib/supabase"

interface OwnerInformation {
  owner_name: string
  owner_photo_url: string
}

export function OwnerInformation({ businessId }: { businessId: number }) {
  const [ownerInfo, setOwnerInfo] = useState<OwnerInformation>({
    owner_name: "",
    owner_photo_url: "/placeholder.svg",
  })
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchOwnerInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('owner_name, owner_photo_url')
        .eq('id', businessId)
        .single()

      if (error) throw error

      setOwnerInfo({
        owner_name: data.owner_name || '',
        owner_photo_url: data.owner_photo_url || '/placeholder.svg',
      })
    } catch (error) {
      console.error("Failed to fetch owner information:", error)
    }
  }

  useEffect(() => {
    fetchOwnerInfo()
  }, [businessId])

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ owner_name: ownerInfo.owner_name })
        .eq('id', businessId)

      if (error) throw error

      setIsNameDialogOpen(false)
    } catch (error) {
      console.error("Failed to update owner name:", error)
      alert("Failed to update owner name")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setIsLoading(true)
    try {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `owner-photos/${businessId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('food-safety-files')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('food-safety-files')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('businesses')
        .update({ owner_photo_url: publicUrl })
        .eq('id', businessId)

      if (updateError) throw updateError

      await fetchOwnerInfo()
      setIsPhotoDialogOpen(false)
      setSelectedFile(null)
    } catch (error) {
      console.error("Failed to upload photo:", error)
      alert("Failed to upload photo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Owner Information</CardTitle>
        <div className="space-x-2">
          <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Edit Owner Info</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Owner Name</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleNameUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="owner_name">Name</Label>
                  <Input
                    id="owner_name"
                    value={ownerInfo.owner_name}
                    onChange={(e) => setOwnerInfo(prev => ({ ...prev, owner_name: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Name"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Update Photo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Profile Photo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePhotoUpload} className="space-y-4">
                <div>
                  <Label htmlFor="photo">Photo</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Uploading..." : "Upload Photo"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12">
            <Image
              src={ownerInfo.owner_photo_url}
              alt="Owner photo"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium">{ownerInfo.owner_name}</h3>
            <p className="text-sm text-muted-foreground">Owner</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

