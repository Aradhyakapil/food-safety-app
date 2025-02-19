import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Log the incoming data
    console.log("Received certification data:", data)

    // Validate required fields
    if (!data.business_id || !data.certification_type || !data.number || !data.valid_from || !data.valid_to) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 })
    }

    // Insert the certification
    const { data: newCertification, error: insertError } = await supabase
      .from("certifications")
      .insert([{
        business_id: data.business_id,
        certification_type: data.certification_type,
        number: data.number,
        valid_from: data.valid_from,
        valid_to: data.valid_to,
        status: 'Active'
      }])
      .select()

    if (insertError) {
      console.error("Supabase insert error:", insertError)
      throw insertError
    }

    // Fetch all certifications for the business
    const { data: certifications, error: fetchError } = await supabase
      .from("certifications")
      .select("*")
      .eq("business_id", data.business_id)
      .order("certification_type", { ascending: true })

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError)
      throw fetchError
    }

    return NextResponse.json({ 
      success: true, 
      data: certifications 
    })

  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add certification",
      details: error
    }, { status: 500 })
  }
} 