import { NextResponse } from 'next/server'
import { supabase } from "@/app/lib/supabase"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('facility_photos')
      .select('*')
      .eq('business_id', params.id)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching facility photos:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch facility photos' },
      { status: 500 }
    )
  }
} 