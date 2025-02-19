"use client"

import { useState, useRef } from "react"
import { AlertTriangle, Ban, FileWarning, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type ActionType = "warning" | "suspension" | "revocation"

interface ComplianceAction {
  id: string
  type: ActionType
  reason: string
  date: string
  duration?: string
  mediaUrl?: string
}

export function ComplianceActions() {
  const [actions, setActions] = useState<ComplianceAction[]>([])
  const [newAction, setNewAction] = useState<ComplianceAction>({
    id: "",
    type: "warning",
    reason: "",
    date: "",
    duration: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedAction, setSelectedAction] = useState<ComplianceAction | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddAction = () => {
    const action: ComplianceAction = {
      ...newAction,
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
    }
    if (selectedFile) {
      // In a real application, you would upload the file to a server here
      // and set the returned URL to action.mediaUrl
      action.mediaUrl = URL.createObjectURL(selectedFile)
    }
    setActions([...actions, action])
    setNewAction({ id: "", type: "warning", reason: "", date: "", duration: "" })
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleViewDetails = (action: ComplianceAction) => {
    setSelectedAction(action)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Compliance Actions</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Take Action</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Compliance Action</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Action Type</Label>
                <RadioGroup
                  defaultValue="warning"
                  onValueChange={(value) => setNewAction({ ...newAction, type: value as ActionType })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="warning" id="warning" />
                    <Label htmlFor="warning">Warning</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="suspension" id="suspension" />
                    <Label htmlFor="suspension">License Suspension</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="revocation" id="revocation" />
                    <Label htmlFor="revocation">License Revocation</Label>
                  </div>
                </RadioGroup>
              </div>
              {newAction.type === "suspension" && (
                <div className="grid gap-2">
                  <Label htmlFor="duration">Suspension Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newAction.duration}
                    onChange={(e) => setNewAction({ ...newAction, duration: e.target.value })}
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={newAction.reason}
                  onChange={(e) => setNewAction({ ...newAction, reason: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="media">Upload Media (optional)</Label>
                <Input id="media" type="file" onChange={handleFileChange} ref={fileInputRef} accept="image/*,video/*" />
                {selectedFile && <p className="text-sm text-muted-foreground">Selected file: {selectedFile.name}</p>}
              </div>
            </div>
            <Button onClick={handleAddAction}>Issue Action</Button>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.map((action) => (
            <div key={action.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                {action.type === "warning" && <FileWarning className="text-yellow-500" />}
                {action.type === "suspension" && <AlertTriangle className="text-orange-500" />}
                {action.type === "revocation" && <Ban className="text-red-500" />}
                <div>
                  <h3 className="font-medium">
                    {action.type === "warning" && "Warning Issued"}
                    {action.type === "suspension" && "License Suspended"}
                    {action.type === "revocation" && "License Revoked"}
                  </h3>
                  <p className="text-sm text-muted-foreground">Date: {action.date}</p>
                  {action.type === "suspension" && (
                    <p className="text-sm text-muted-foreground">Duration: {action.duration} days</p>
                  )}
                  {action.mediaUrl && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Upload className="h-4 w-4" />
                      Media attached
                    </p>
                  )}
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(action)}>
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {action.type === "warning" && "Warning Details"}
                      {action.type === "suspension" && "Suspension Details"}
                      {action.type === "revocation" && "Revocation Details"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Date</h4>
                      <p>{action.date}</p>
                    </div>
                    {action.type === "suspension" && (
                      <div>
                        <h4 className="font-semibold">Duration</h4>
                        <p>{action.duration} days</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold">Reason</h4>
                      <p>{action.reason}</p>
                    </div>
                    {action.mediaUrl && (
                      <div>
                        <h4 className="font-semibold">Attached Media</h4>
                        <div className="mt-2 max-w-full">
                          {action.mediaUrl.includes("image") ? (
                            <img
                              src={action.mediaUrl || "/placeholder.svg"}
                              alt="Compliance action evidence"
                              className="max-w-full h-auto rounded-lg"
                            />
                          ) : (
                            <video src={action.mediaUrl} controls className="max-w-full h-auto rounded-lg">
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogClose asChild>
                    <Button className="mt-4">Close</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

