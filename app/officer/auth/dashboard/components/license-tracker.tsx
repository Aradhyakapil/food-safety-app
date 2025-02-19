"use client"

import { useState } from "react"
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type LicenseStatus = "active" | "suspended" | "revoked"

interface License {
  id: string
  licenseName: string
  licenseNumber: string
  status: LicenseStatus
  expirationDate: string
}

export function LicenseTracker() {
  const [licenses, setLicenses] = useState<License[]>([
    {
      id: "1",
      licenseName: "Sample Restaurant",
      licenseNumber: "FSL-2025-001",
      status: "active",
      expirationDate: "2025-12-31",
    },
  ])

  const [newLicense, setNewLicense] = useState<License>({
    id: "",
    licenseName: "",
    licenseNumber: "",
    status: "active",
    expirationDate: "",
  })

  const handleAddLicense = () => {
    const license: License = {
      ...newLicense,
      id: Date.now().toString(),
    }
    setLicenses([...licenses, license])
    setNewLicense({
      id: "",
      licenseName: "",
      licenseNumber: "",
      status: "active",
      expirationDate: "",
    })
  }

  const getStatusIcon = (status: LicenseStatus) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "suspended":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case "revoked":
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>License Tracker</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add License</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New License</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="licenseName" className="text-right">
                  License Name
                </Label>
                <Input
                  id="licenseName"
                  value={newLicense.licenseName}
                  onChange={(e) => setNewLicense({ ...newLicense, licenseName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="licenseNumber" className="text-right">
                  License Number
                </Label>
                <Input
                  id="licenseNumber"
                  value={newLicense.licenseNumber}
                  onChange={(e) => setNewLicense({ ...newLicense, licenseNumber: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expirationDate" className="text-right">
                  Expiration Date
                </Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={newLicense.expirationDate}
                  onChange={(e) => setNewLicense({ ...newLicense, expirationDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <RadioGroup
                  defaultValue="active"
                  onValueChange={(value) => setNewLicense({ ...newLicense, status: value as LicenseStatus })}
                  className="col-span-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="active" id="active" />
                    <Label htmlFor="active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="suspended" id="suspended" />
                    <Label htmlFor="suspended">Suspended</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="revoked" id="revoked" />
                    <Label htmlFor="revoked">Revoked</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <Button onClick={handleAddLicense}>Add License</Button>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>License Name</TableHead>
              <TableHead>License Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiration Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {licenses.map((license) => (
              <TableRow key={license.id}>
                <TableCell>{license.licenseName}</TableCell>
                <TableCell>{license.licenseNumber}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(license.status)}
                    <span className="capitalize">{license.status}</span>
                  </div>
                </TableCell>
                <TableCell>{license.expirationDate}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

