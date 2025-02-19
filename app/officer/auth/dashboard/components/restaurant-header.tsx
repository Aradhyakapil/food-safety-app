import { QrCode, CalendarDays } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function RestaurantHeader() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <Image src="/placeholder.svg" alt="Restaurant logo" width={48} height={48} className="rounded-full" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">Sample Restaurant</h1>
                <Button variant="outline" size="sm">
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">123 Food Street, Central District, City - 110048</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm">Phone: +1234 567 890</p>
                <p className="text-sm">Email: contact@samplerestaurant.com</p>
                <p className="text-sm flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  Last Inspection: 2025-01-15
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

