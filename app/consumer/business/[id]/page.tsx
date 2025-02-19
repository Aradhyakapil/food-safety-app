"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Star, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getBusiness,
  getHygieneRatings,
  getCertifications,
  getLabReports,
  getTeamMembers,
  getFacilityPhotos,
  getReviews,
} from "@/app/api/api"
import RestaurantFacilityPhotos from '@/app/consumer/business/components/restaurant-facility-photos'
import Image from "next/image"

interface BusinessDetails {
  id: number
  name: string
  address: string
  license_number: string
  business_type: string
}

interface HygieneRating {
  rating: number
  date: string
}

interface Certification {
  certification_type: string
  issue_date: string
  expiry_date: string
}

interface LabReport {
  report_type: string
  date: string
  result: string
}

interface TeamMember {
  name: string
  role: string
  photo_url: string
}

interface FacilityPhoto {
  area_name: string
  photo_url: string
}

interface Review {
  reviewer_id: number
  rating: number
  comment: string
  date: string
}

export default function BusinessProfilePage() {
  const { id } = useParams()
  const businessId = parseInt(id as string)
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null)
  const [hygieneRatings, setHygieneRatings] = useState<HygieneRating[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [labReports, setLabReports] = useState<LabReport[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [facilityPhotos, setFacilityPhotos] = useState<FacilityPhoto[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBusinessData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [
          businessResponse,
          hygieneResponse,
          certificationsResponse,
          labReportsResponse,
          teamMembersResponse,
          facilityPhotosResponse,
          reviewsResponse,
        ] = await Promise.all([
          getBusiness(Number(id)),
          getHygieneRatings(Number(id)),
          getCertifications(Number(id)),
          getLabReports(Number(id)),
          getTeamMembers(Number(id)),
          getFacilityPhotos(Number(id)),
          getReviews(Number(id)),
        ])

        setBusinessDetails(businessResponse.data)
        setHygieneRatings(hygieneResponse.data)
        setCertifications(certificationsResponse.data)
        setLabReports(labReportsResponse.data)
        setTeamMembers(teamMembersResponse.data)
        setFacilityPhotos(facilityPhotosResponse.data)
        setReviews(reviewsResponse.data)
      } catch (error) {
        console.error("Error fetching business data:", error)
        setError("Unable to load business details. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBusinessData()
  }, [id])

  const renderHygieneRating = (rating: number) => {
    let color = "text-yellow-500"
    let icon = <AlertTriangle className="h-6 w-6" />

    if (rating >= 4) {
      color = "text-green-500"
      icon = <CheckCircle className="h-6 w-6" />
    } else if (rating <= 2) {
      color = "text-red-500"
      icon = <XCircle className="h-6 w-6" />
    }

    return (
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="font-semibold">Hygiene Rating: {rating}/5</span>
      </div>
    )
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!businessDetails) {
    return <div className="min-h-screen flex items-center justify-center">Business not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{businessDetails.name}</CardTitle>
            <p className="text-muted-foreground">{businessDetails.address}</p>
            <p className="text-sm">
              <span className="font-medium">License Number:</span> {businessDetails.license_number}
            </p>
            <p className="text-sm">
              <span className="font-medium">Business Type:</span> {businessDetails.business_type}
            </p>
            {hygieneRatings.length > 0 && renderHygieneRating(hygieneRatings[hygieneRatings.length - 1].rating)}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="certifications">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="certifications">Certifications</TabsTrigger>
                <TabsTrigger value="lab-reports">Lab Reports</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="facility">Facility</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="certifications">
                <h3 className="text-xl font-semibold mb-4">Certifications</h3>
                {certifications.length > 0 ? (
                  <ul className="space-y-2">
                    {certifications.map((cert, index) => (
                      <li key={index} className="bg-white p-4 rounded-lg shadow">
                        <p className="font-medium">{cert.certification_type}</p>
                        <p className="text-sm text-muted-foreground">
                          Valid from {cert.issue_date} to {cert.expiry_date}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No certifications found.</p>
                )}
              </TabsContent>
              <TabsContent value="lab-reports">
                <h3 className="text-xl font-semibold mb-4">Lab Reports</h3>
                {labReports.length > 0 ? (
                  <ul className="space-y-2">
                    {labReports.map((report, index) => (
                      <li key={index} className="bg-white p-4 rounded-lg shadow">
                        <p className="font-medium">{report.report_type}</p>
                        <p className="text-sm text-muted-foreground">Date: {report.date}</p>
                        <p className="text-sm">Result: {report.result}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No lab reports found.</p>
                )}
              </TabsContent>
              <TabsContent value="team">
                <h3 className="text-xl font-semibold mb-4">Team Members</h3>
                {teamMembers.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg shadow text-center">
                        <img
                          src={member.photo_url || "/placeholder-user.jpg"}
                          alt={member.name}
                          className="w-24 h-24 rounded-full mx-auto mb-2"
                        />
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No team members found.</p>
                )}
              </TabsContent>
              <TabsContent value="facility">
                <h3 className="text-xl font-semibold mb-4">Facility Photos</h3>
                <RestaurantFacilityPhotos businessId={businessId} />
              </TabsContent>
              <TabsContent value="reviews">
                <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                {reviews.length > 0 ? (
                  <ul className="space-y-4">
                    {reviews.map((review, index) => (
                      <li key={index} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <p>{review.comment}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No reviews found.</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

