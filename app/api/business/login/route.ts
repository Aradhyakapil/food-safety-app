import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

export async function POST(request: Request) {
  try {
    const { phoneNumber, licenseNumber, businessType } = await request.json()

    if (!phoneNumber || !licenseNumber || !businessType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Query the business table
    const { data: business, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("phone", phoneNumber)
      .eq("license_number", licenseNumber)
      .eq("business_type", businessType)
      .single()

    if (error || !business) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Generate a simple token
    const token = btoa(JSON.stringify({
      businessId: business.id,
      businessType: business.business_type,
      timestamp: Date.now()
    }))

    return NextResponse.json({
      success: true,
      token,
      businessId: business.id,
      businessType: business.business_type
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process login" },
      { status: 500 }
    )
  }
}

