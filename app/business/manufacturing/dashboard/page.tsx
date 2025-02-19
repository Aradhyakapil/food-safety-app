"use client"

import { useState, useEffect } from "react"
import { BusinessHeader } from "../../dashboard/components/business-header"
import { ManufacturingDetails } from "./components/manufacturing-details"
import { BatchProductionDetails } from "./components/batch-production-details"
import { RawMaterialSuppliers } from "./components/raw-material-suppliers"
import { PackagingCompliance } from "./components/packaging-compliance"
import { HygieneRating } from "../../dashboard/components/hygiene-rating"
import { OwnerInformation } from "../../dashboard/components/owner-information"
import { LabReports } from "../../dashboard/components/lab-reports"
import { RestaurantCertifications } from "../../dashboard/components/restaurant-certifications"
import { TeamSection } from "../../dashboard/components/team-section"
import { FacilityPhotos } from "../../dashboard/components/facility-photos"
import { ReviewsSection } from "../../dashboard/components/reviews-section"
import { getBusiness } from "@/app/api/api"

export default function ManufacturingDashboard() {
  const [businessId, setBusinessId] = useState<number | null>(null)

  useEffect(() => {
    const fetchBusinessId = async () => {
      try {
        // This is a placeholder. In a real app, you'd get the business ID from the user's session or URL
        const response = await getBusiness(1)
        setBusinessId(response.data.id)
      } catch (error) {
        console.error("Failed to fetch business details:", error)
      }
    }
    fetchBusinessId()
  }, [])

  if (!businessId) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 space-y-6">
        <BusinessHeader businessId={businessId} />
        <div className="grid md:grid-cols-2 gap-6">
          <ManufacturingDetails businessId={businessId} />
          <HygieneRating businessId={businessId} />
        </div>
        <BatchProductionDetails businessId={businessId} />
        <RawMaterialSuppliers businessId={businessId} />
        <PackagingCompliance businessId={businessId} />
        <OwnerInformation businessId={businessId} />
        <LabReports businessId={businessId} />
        <RestaurantCertifications businessId={businessId} />
        <TeamSection businessId={businessId} />
        <FacilityPhotos businessId={businessId} />
        <ReviewsSection businessId={businessId} />
      </div>
    </div>
  )
}

