"use client"

import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { getHygieneRatings } from "@/app/api/api"

type Score = {
  name: string
  score: number
  total: number
}

export function HygieneRating() {
  const [rating, setRating] = useState(0)
  const [scores, setScores] = useState<Score[]>([])

  useEffect(() => {
    const fetchHygieneRatings = async () => {
      try {
        const response = await getHygieneRatings(businessId) // Replace 1 with the actual business ID
        const latestRating = response.data[response.data.length - 1]
        setRating(latestRating.rating)
        // Assuming the scores are stored in the 'scores' field of the rating object
        setScores(latestRating.scores)
      } catch (error) {
        console.error("Failed to fetch hygiene ratings:", error)
      }
    }
    fetchHygieneRatings()
  }, [])

  const violations = [
    {
      date: "2024-01-15",
      description: "Minor deviation in temperature control for raw material storage",
      severity: "Minor",
    },
    {
      date: "2024-02-01",
      description: "Delayed equipment maintenance schedule",
      severity: "Minor",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hygiene Rating</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="ml-2 text-sm">Excellent hygiene, minor violations</span>
        </div>

        <div className="space-y-2">
          {scores.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{item.name}</span>
              <span>
                {item.score}/{item.total}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Violations</h3>
          {violations.map((violation, index) => (
            <div
              key={index}
              className={`p-2 rounded text-sm ${violation.severity === "Minor" ? "bg-yellow-50" : "bg-red-50"}`}
            >
              <div className="flex justify-between">
                <span>{violation.date}</span>
                <span className="text-yellow-600">{violation.severity}</span>
              </div>
              <p className="mt-1">{violation.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

