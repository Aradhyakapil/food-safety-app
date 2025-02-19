"use client"

import { useState } from "react"
import { Pencil, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Score {
  name: string
  score: number
  total: number
}

export function HygieneRating() {
  const [isEditing, setIsEditing] = useState(false)
  const [rating, setRating] = useState(5)
  const [scores, setScores] = useState<Score[]>([
    { name: "Food Handling Practices", score: 25, total: 30 },
    { name: "Maintenance of Premises", score: 18, total: 20 },
    { name: "Legal Compliance", score: 14, total: 15 },
    { name: "Employee Competency/History", score: 9, total: 10 },
  ])

  const handleStarClick = (index: number) => {
    if (isEditing) {
      setRating(index + 1)
    }
  }

  const handleScoreChange = (index: number, value: string) => {
    const newScore = Number.parseInt(value) || 0
    const newScores = [...scores]
    newScores[index] = { ...newScores[index], score: Math.min(newScore, newScores[index].total) }
    setScores(newScores)
  }

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save the changes to your backend
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hygiene Rating</CardTitle>
        {isEditing ? (
          <Button onClick={handleSave} size="sm">
            Save Changes
          </Button>
        ) : (
          <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Edit Rating
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 cursor-pointer ${
                    i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                  } ${isEditing ? "hover:fill-yellow-400 hover:text-yellow-400" : ""}`}
                  onClick={() => handleStarClick(i)}
                />
              ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating === 5
                ? "Excellent hygiene, no violations"
                : rating === 4
                  ? "Good hygiene, minor violations"
                  : rating === 3
                    ? "Average hygiene, some violations"
                    : rating === 2
                      ? "Poor hygiene, major violations"
                      : "Critical violations, immediate action required"}
            </span>
          </div>
          <div className="space-y-2">
            {scores.map((score, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span>{score.name}</span>
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={score.score}
                      onChange={(e) => handleScoreChange(index, e.target.value)}
                      className="w-16 h-8"
                      min="0"
                      max={score.total}
                    />
                  ) : (
                    <span>{score.score}</span>
                  )}
                  <span>/{score.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

