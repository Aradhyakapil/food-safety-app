import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      data 
    })
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch business details' 
      },
      { status: 500 }
    )
  }
} 