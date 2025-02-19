import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('business_id', params.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      data 
    })
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch team members' 
      },
      { status: 500 }
    )
  }
} 