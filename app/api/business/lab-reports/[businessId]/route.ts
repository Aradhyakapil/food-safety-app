import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

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
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    })

  } catch (error) {
    console.error("Error fetching lab reports:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch lab reports" 
    }, { status: 500 })
  }
} 