"use client"

import { useState, useEffect } from "react"
import { Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/app/lib/supabase"

interface TeamMember {
  id?: number
  business_id: number
  name: string
  role: string
  photo_url: string
  created_at?: string
  updated_at?: string
}

export default function RestaurantTeamMembers({ businessId }: { businessId: number }) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [newMember, setNewMember] = useState<Omit<TeamMember, 'id' | 'created_at' | 'updated_at' | 'photo_url'>>({
    business_id: businessId,
    name: '',
    role: ''
  })

  useEffect(() => {
    fetchTeamMembers()
  }, [businessId])

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`/api/business/team-members/${businessId}`)
      const data = await response.json()
      if (data.success) {
        setMembers(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error)
    }
  }

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
        throw new Error('Please select a photo')
      }

      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }

      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `team-members/${businessId}/${fileName}`

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

      // Save team member data to database
      const response = await fetch('/api/business/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMember,
          photo_url: publicUrl
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add team member')
      }

      setMembers(data.data)
      setIsDialogOpen(false)
      setSelectedFile(null)
      setNewMember({
        business_id: businessId,
        name: '',
        role: ''
      })
    } catch (error) {
      console.error('Failed to add team member:', error)
      alert(error instanceof Error ? error.message : 'Failed to add team member')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Members</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  required
                  value={newMember.role}
                  onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                />
              </div>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Add Member'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {members.map((member) => (
            <div key={member.id} className="text-center">
              <div className="aspect-square w-20 h-20 mx-auto rounded-full overflow-hidden mb-2">
                <img
                  src={member.photo_url}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-medium">{member.name}</h3>
              <p className="text-muted-foreground">{member.role}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 