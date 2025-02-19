import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (!data.business_id || !data.test_type || !data.report_date) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 })
    }

    const { data: newReport, error: insertError } = await supabase
      .from("lab_reports")
      .insert([data])
      .select()

    if (insertError) throw insertError

    const { data: reports, error: fetchError } = await supabase
      .from("lab_reports")
      .select("*")
      .eq("business_id", data.business_id)
      .order("report_date", { ascending: false })

    if (fetchError) throw fetchError

    return NextResponse.json({ 
      success: true, 
      data: reports 
    })

  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add lab report" 
    }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { businessId: string } }
) {
  try {
    const businessId = parseInt(params.businessId)
    
    const { data, error } = await supabase
      .from("lab_reports")
      .select("*")
      .eq("business_id", businessId)
      .order("report_date", { ascending: false })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: data 
    })

  } catch (error) {
    console.error("Error fetching lab reports:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch lab reports" 
    }, { status: 500 })
  }
} 