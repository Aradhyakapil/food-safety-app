"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/app/lib/supabase"

interface SignupData {
  name: string
  phoneNumber: string
  password: string
}

export default function VerifyPage() {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupData, setSignupData] = useState<SignupData | null>(null)
  const [timeLeft, setTimeLeft] = useState(30) // Countdown for resend OTP

  useEffect(() => {
    // Get signup data from localStorage
    const data = localStorage.getItem('signupData')
    if (!data) {
      router.push('/consumer/auth')
      return
    }
    setSignupData(JSON.parse(data))

    // Start countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signupData) return

    setIsLoading(true)
    setError(null)

    try {
      // Check if phone number already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('phone_number')
        .eq('phone_number', signupData.phoneNumber)
        .single()

      if (existingUser) {
        throw new Error('Phone number already registered')
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: signupData.phoneNumber,
        token: otp,
        type: 'sms'
      })

      if (error) throw error

      // Create user entry in users table
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user?.id,
            phone_number: signupData.phoneNumber,
            name: signupData.name,
            password: signupData.password,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])

      if (insertError) throw insertError

      // Clear signup data from localStorage
      localStorage.removeItem('signupData')

      // Redirect to verify business page instead of dashboard
      router.push('/consumer/verify-business')
    } catch (error) {
      console.error("Error verifying OTP:", error)
      setError(error instanceof Error ? error.message : "Failed to verify OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!signupData || timeLeft > 0) return

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: signupData.phoneNumber,
        options: {
          data: {
            name: signupData.name
          }
        }
      })

      if (error) throw error

      setTimeLeft(30) // Reset countdown
    } catch (error) {
      console.error("Error resending OTP:", error)
      setError(error instanceof Error ? error.message : "Failed to resend OTP")
    } finally {
      setIsLoading(false)
    }
  }

  if (!signupData) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Verify Your Phone</h1>
          <p className="text-gray-600">
            Enter the code sent to {signupData.phoneNumber}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!otp || isLoading}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleResendOTP}
              disabled={timeLeft > 0 || isLoading}
            >
              {timeLeft > 0 
                ? `Resend OTP in ${timeLeft}s` 
                : "Resend OTP"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

