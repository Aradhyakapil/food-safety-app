"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/app/lib/supabase"

export default function VerifyBusinessPage() {
  const router = useRouter()
  const [licenseNumber, setLicenseNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('license_number', licenseNumber)
        .single()

      if (error) throw error

      if (data) {
        router.push(`/consumer/business/${data.id}`)
      } else {
        setError('No business found with this license number')
      }
    } catch (error) {
      console.error('Error searching business:', error)
      setError('Failed to search business')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">
            Verify Food Business License
          </h1>
          <p className="text-gray-600 mt-2">
            Enter the license number of any food business to view their safety records, certifications, and compliance status.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-1">
              License Number
            </label>
            <Input
              id="license"
              type="text"
              placeholder="Enter business license number"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search Business"}
          </Button>

          {error && (
            <p className="text-sm text-red-600 text-center">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
} 