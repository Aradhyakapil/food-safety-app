import { NextResponse } from 'next/server'
import { supabase } from "@/app/lib/supabase"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const photo = formData.get('photo') as File
    const location = formData.get('location') as string
    const businessId = formData.get('business_id') as string

    if (!photo || !location || !businessId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Upload photo to Supabase Storage
    const fileExt = photo.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `facility-photos/${businessId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('food-safety-files')
      .upload(filePath, photo)

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('food-safety-files')
      .getPublicUrl(filePath)

    // Save to database
    const { data, error: dbError } = await supabase
      .from('facility_photos')
      .insert([
        {
          business_id: parseInt(businessId),
          location: location,
          photo_url: publicUrl
        }
      ])
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error uploading facility photo:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
} 