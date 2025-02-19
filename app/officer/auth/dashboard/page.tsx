"use client"

import { RestaurantHeader } from "./components/restaurant-header"
import { HygieneRating } from "./components/hygiene-rating"
import { LabReports } from "./components/lab-reports"
import { InspectionScheduler } from "./components/inspection-scheduler"
import { ComplianceActions } from "./components/compliance-actions"
import { LicenseTracker } from "./components/license-tracker"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <RestaurantHeader />
      <div className="grid gap-6 md:grid-cols-2">
        <HygieneRating />
        <LabReports />
      </div>
      <InspectionScheduler />
      <ComplianceActions />
      <LicenseTracker />
    </div>
  )
}

