"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { registerBusiness, sendOTP, loginBusiness} from "@/app/api/api";

interface SignInForm {
  phoneNumber: string;
  licenseNumber: string;
  otp: string;
  businessType: "restaurant" | "manufacturer";
}

interface SignUpForm {
  businessName: string;
  licenseNumber: string;
  phoneNumber: string;
  otp: string;
  businessType: "restaurant" | "manufacturer";
}

export default function BusinessAuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signInForm, setSignInForm] = useState<SignInForm>({
    phoneNumber: "",
    licenseNumber: "",
    otp: "",
    businessType: "restaurant",
  });
  const [signUpForm, setSignUpForm] = useState<SignUpForm>({
    businessName: "",
    licenseNumber: "",
    phoneNumber: "",
    otp: "",
    businessType: "restaurant",
  });
  const [showOTP, setShowOTP] = useState(false);

  const handleSendOTP = async (type: "signin" | "signup") => {
    setIsLoading(true);
    setError(null);

    try {
      const phoneNumber = type === "signin" ? signInForm.phoneNumber : signUpForm.phoneNumber;
      const response = await sendOTP(phoneNumber);

      if (!response.success) {
        throw new Error(response.error || "Failed to send OTP");
      }

      setShowOTP(true);
    } catch (error) {
      setError(`Failed to send OTP: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginBusiness(
        signInForm.phoneNumber,
        signInForm.licenseNumber,
        signInForm.businessType
      );

      if (response.success) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("businessType", signInForm.businessType);
        router.push("/business/dashboard");
      } else {
        throw new Error(response.error || "Login failed");
      }
    } catch (error) {
      setError(`Login failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await registerBusiness(
        signUpForm.businessName,
        signUpForm.licenseNumber,
        signUpForm.phoneNumber,
        signUpForm.otp
      );

      if (response.success) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("businessId", response.businessId.toString());
        localStorage.setItem("businessType", signUpForm.businessType);

        // Redirect based on business type
        const onboardingPath = signUpForm.businessType === "restaurant" 
          ? `/business/onboarding` 
          : `/business/manufacturing/onboarding`;
        
        router.push(onboardingPath);
      } else {
        throw new Error(response.error || "Registration failed");
      }
    } catch (error) {
      setError(`Registration failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>Enter your business details to sign in</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-phone">Phone Number</Label>
                    <Input
                      id="signin-phone"
                      type="tel"
                      placeholder="+91 9999999999"
                      value={signInForm.phoneNumber}
                      onChange={(e) => setSignInForm({ ...signInForm, phoneNumber: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-license">FSSAI License Number</Label>
                    <Input
                      id="signin-license"
                      placeholder="Enter your FSSAI license number"
                      value={signInForm.licenseNumber}
                      onChange={(e) => setSignInForm({ ...signInForm, licenseNumber: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <RadioGroup
                      value={signInForm.businessType}
                      onValueChange={(value) =>
                        setSignInForm({ ...signInForm, businessType: value as "restaurant" | "manufacturer" })
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="restaurant" id="signin-restaurant" />
                        <Label htmlFor="signin-restaurant">Restaurant</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="manufacturer" id="signin-manufacturer" />
                        <Label htmlFor="signin-manufacturer">Manufacturer</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {showOTP && (
                    <div className="space-y-2">
                      <Label htmlFor="signin-otp">OTP</Label>
                      <Input
                        id="signin-otp"
                        placeholder="Enter OTP"
                        value={signInForm.otp}
                        onChange={(e) => setSignInForm({ ...signInForm, otp: e.target.value })}
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  {!showOTP ? (
                    <Button 
                      className="w-full" 
                      onClick={() => handleSendOTP("signin")}
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send OTP"}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={handleSignIn}
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={signUpForm.businessName}
                    onChange={(e) =>
                      setSignUpForm({ ...signUpForm, businessName: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="licenseNumber">FSSAI License Number</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    value={signUpForm.licenseNumber}
                    onChange={(e) =>
                      setSignUpForm({ ...signUpForm, licenseNumber: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={signUpForm.phoneNumber}
                    onChange={(e) =>
                      setSignUpForm({ ...signUpForm, phoneNumber: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Business Type</Label>
                  <RadioGroup
                    value={signUpForm.businessType}
                    onValueChange={(value) =>
                      setSignUpForm({ ...signUpForm, businessType: value as "restaurant" | "manufacturer" })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="restaurant" id="restaurant" />
                      <Label htmlFor="restaurant">Restaurant</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manufacturer" id="manufacturer" />
                      <Label htmlFor="manufacturer">Manufacturer</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  onClick={() => handleSendOTP("signup")}
                  disabled={!signUpForm.phoneNumber || isLoading}
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>

                {showOTP && (
                  <div>
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      name="otp"
                      value={signUpForm.otp}
                      onChange={(e) =>
                        setSignUpForm({ ...signUpForm, otp: e.target.value })
                      }
                      required
                    />
                    <Button onClick={handleSignUp} disabled={isLoading}>
                      {isLoading ? "Signing Up..." : "Sign Up"}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};