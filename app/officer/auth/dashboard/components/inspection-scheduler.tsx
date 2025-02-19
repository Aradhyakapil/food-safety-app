"use client"

import { useState } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import "react-big-calendar/lib/css/react-big-calendar.css"

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment)

interface Inspection {
  id: string
  title: string
  start: Date
  end: Date
}

export function InspectionScheduler() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [newInspection, setNewInspection] = useState({
    title: "",
    date: "",
    time: "",
  })

  const handleAddInspection = () => {
    const start = new Date(`${newInspection.date}T${newInspection.time}`)
    const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hour duration

    const inspection: Inspection = {
      id: Date.now().toString(),
      title: newInspection.title,
      start,
      end,
    }

    setInspections([...inspections, inspection])
    setNewInspection({ title: "", date: "", time: "" })
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inspection Schedule</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Schedule Inspection</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Inspection</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Business Name
                </Label>
                <Input
                  id="title"
                  value={newInspection.title}
                  onChange={(e) => setNewInspection({ ...newInspection, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newInspection.date}
                  onChange={(e) => setNewInspection({ ...newInspection, date: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={newInspection.time}
                  onChange={(e) => setNewInspection({ ...newInspection, time: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleAddInspection}>Add Inspection</Button>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Calendar
          localizer={localizer}
          events={inspections}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        />
      </CardContent>
    </Card>
  )
}

