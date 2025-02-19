import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

export async function POST(request: Request) {
  try {
    const { businessName, phoneNumber, licenseNumber, businessType } = await request.json()

    console.log("Received registration request:", { businessName, phoneNumber, licenseNumber, businessType })

    if (!businessName || !phoneNumber || !licenseNumber || !businessType) {
      throw new Error("Missing required fields")
    }

    const { data, error } = await supabase
      .from("businesses")
      .insert([{ name: businessName, phone: phoneNumber, license_number: licenseNumber, business_type: businessType }])
      .select()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    if (!data || data.length === 0) {
      throw new Error("No data returned from database")
    }

    console.log("Registration successful:", data[0])

    return NextResponse.json({ 
      success: true, 
      business: data[0],
      businessId: data[0].id,
      token: "dummy_token"
    })
  } catch (error) {
    console.error("Business registration error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }, { status: 500 })
  }
}

