"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getTeamMembers, createTeamMember } from "@/app/api/api"

interface TeamMember {
  id?: number
  business_id: number
  name: string
  role: string
  photo_url: string
}

export function TeamSection({ businessId }: { businessId: number }) {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [newMember, setNewMember] = useState<TeamMember>({
    business_id: businessId,
    name: "",
    role: "",
    photo_url: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await getTeamMembers(businessId)
        setTeam(response.data)
      } catch (error) {
        console.error("Failed to fetch team members:", error)
      }
    }
    fetchTeamMembers()
  }, [businessId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewMember((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await createTeamMember(newMember)
      setTeam((prev) => [...prev, response.data])
      setNewMember({
        business_id: businessId,
        name: "",
        role: "",
        photo_url: "",
      })
      alert("Team member added successfully!")
    } catch (error) {
      console.error("Failed to add team member:", error)
      alert("Failed to add team member. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Our Team</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={newMember.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" value={newMember.role} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo_url">Photo URL</Label>
                <Input id="photo_url" name="photo_url" value={newMember.photo_url} onChange={handleInputChange} />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Team Member"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member) => (
            <div key={member.id} className="flex flex-col items-center text-center space-y-2">
              <div className="relative">
                <Image
                  src={member.photo_url || "/placeholder.svg"}
                  alt={member.name}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <div>
                <h3 className="font-medium">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

