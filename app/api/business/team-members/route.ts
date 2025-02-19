import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (!data.business_id || !data.name || !data.role || !data.photo_url) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 })
    }

    const { data: newMember, error: insertError } = await supabase
      .from("team_members")
      .insert([data])
      .select()

    if (insertError) throw insertError

    const { data: members, error: fetchError } = await supabase
      .from("team_members")
      .select("*")
      .eq("business_id", data.business_id)
      .order("created_at", { ascending: false })

    if (fetchError) throw fetchError

    return NextResponse.json({ 
      success: true, 
      data: members 
    })

  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add team member" 
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
      .from("team_members")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: data 
    })

  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch team members" 
    }, { status: 500 })
  }
} 