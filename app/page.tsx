"use client"

import { useRouter } from "next/navigation"
import { User, Building2, BadgeAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Food Safety & Transparency Platform</h1>
        <p className="text-lg text-muted-foreground">
          Connect with verified food businesses and make informed decisions about where you eat
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        <Card className="p-6">
          <CardContent className="flex flex-col items-center text-center space-y-4 pt-6">
            <User className="w-12 h-12 text-[#2B47FC]" />
            <h2 className="text-2xl font-semibold">For Consumers</h2>
            <p className="text-muted-foreground">
              Verify and review food establishments, access safety reports, and make informed choices
            </p>
            <Button className="w-full bg-[#2B47FC] hover:bg-[#2B47FC]/90" onClick={() => router.push("/consumer/auth")}>
              Continue as Consumer
            </Button>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardContent className="flex flex-col items-center text-center space-y-4 pt-6">
            <Building2 className="w-12 h-12 text-[#2B47FC]" />
            <h2 className="text-2xl font-semibold">For Businesses</h2>
            <p className="text-muted-foreground">
              Showcase your commitment to food safety and build trust with your customers
            </p>
            <Button className="w-full bg-[#2B47FC] hover:bg-[#2B47FC]/90" onClick={() => router.push("/business/auth")}>
              Continue as Business
            </Button>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardContent className="flex flex-col items-center text-center space-y-4 pt-6">
            <BadgeAlert className="w-12 h-12 text-[#2B47FC]" />
            <h2 className="text-2xl font-semibold">Food Safety Officer</h2>
            <p className="text-muted-foreground">
              Manage inspections, issue certifications, and ensure compliance with food safety standards
            </p>
            <Button className="w-full bg-[#2B47FC] hover:bg-[#2B47FC]/90" onClick={() => router.push("/officer/auth")}>
              Continue as Officer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

