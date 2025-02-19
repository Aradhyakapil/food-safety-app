"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { supabase } from "@/app/lib/supabase"

interface SignUpForm {
  name: string
  password: string
  phoneNumber: string
  otp: string
}

interface SignInForm {
  name: string
  password: string
}

export default function ConsumerAuthPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("signup")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [signInForm, setSignInForm] = useState<SignInForm>({
    name: "",
    password: "",
  })

  const [signUpForm, setSignUpForm] = useState<SignUpForm>({
    name: "",
    password: "",
    phoneNumber: "",
    otp: "",
  })

  const handleSendOTP = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const formattedPhone = signUpForm.phoneNumber.replace(/\s+/g, '').replace(/[-()+]/g, '')

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          data: {
            name: signUpForm.name,
            password: signUpForm.password
          }
        }
      })

      if (error) throw error

      // Store signup data in localStorage for verify page
      localStorage.setItem('signupData', JSON.stringify({
        name: signUpForm.name,
        password: signUpForm.password,
        phoneNumber: formattedPhone
      }))

      router.push('/consumer/verify')
    } catch (error) {
      console.error("Error sending OTP:", error)
      setError(error instanceof Error ? error.message : "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/consumer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signInForm),
      })
      const data = await response.json()
      if (data.success) {
        localStorage.setItem("token", data.token)
        router.push("/consumer/verify-business")
      } else {
        throw new Error(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login failed:", error)
      setError("Login failed. Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/consumer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpForm),
      })
      const data = await response.json()
      if (data.success) {
        localStorage.setItem("token", data.token)
        router.push("/consumer/verify")
      } else {
        throw new Error(data.error || "Registration failed")
      }
    } catch (error) {
      console.error("Registration failed:", error)
      setError(`Registration failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Tabs defaultValue="signup" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={signUpForm.name}
                    onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={signUpForm.phoneNumber}
                      onChange={(e) => setSignUpForm({ ...signUpForm, phoneNumber: e.target.value })}
                      className="flex-1"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendOTP}
                      disabled={!signUpForm.name || !signUpForm.password || !signUpForm.phoneNumber || isLoading}
                    >
                      {isLoading ? "Sending..." : "Send OTP"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Include country code (e.g., +91 for India)
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#2B47FC]"
                  disabled={
                    !signUpForm.name ||
                    !signUpForm.password ||
                    !signUpForm.phoneNumber ||
                    isLoading
                  }
                >
                  {isLoading ? "Signing Up..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-name">Name</Label>
                  <Input
                    id="signin-name"
                    placeholder="Enter your name"
                    value={signInForm.name}
                    onChange={(e) => setSignInForm({ ...signInForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={signInForm.password}
                    onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#2B47FC]"
                  disabled={!signInForm.name || !signInForm.password || isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

