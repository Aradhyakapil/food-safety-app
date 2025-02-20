import { NextResponse } from 'next/server'
import { supabase } from "@/app/lib/supabase"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    // 1. Validate business ID
    const businessId = formData.get("businessId")
    if (!businessId) {
      return NextResponse.json(
        { success: false, error: "Business ID is required" },
        { status: 400 }
      )
    }

    // 2. Get and validate manufacturing details
    const manufacturingDetailsStr = formData.get("manufacturing_details")
    if (!manufacturingDetailsStr) {
      return NextResponse.json(
        { success: false, error: "Manufacturing details are required" },
        { status: 400 }
      )
    }

    let manufacturingDetails
    try {
      manufacturingDetails = JSON.parse(manufacturingDetailsStr as string)
      console.log("Parsed manufacturing details:", manufacturingDetails)
    } catch (error) {
      console.error("Failed to parse manufacturing details:", error)
      return NextResponse.json(
        { success: false, error: "Invalid manufacturing details format" },
        { status: 400 }
      )
    }

    // 3. Validate required manufacturing fields
    if (!manufacturingDetails.production_capacity || !manufacturingDetails.manufacturing_license) {
      return NextResponse.json(
        { success: false, error: "Production capacity and manufacturing license are required" },
        { status: 400 }
      )
    }

    // 4. Insert manufacturing details
    const { data: insertedManufacturing, error: manufacturingError } = await supabase
      .from("manufacturing_details")
      .insert({
        business_id: parseInt(businessId as string),
        production_capacity: manufacturingDetails.production_capacity,
        manufacturing_license: manufacturingDetails.manufacturing_license,
        iso_certification: manufacturingDetails.iso_certification || null,
        haccp_certification: manufacturingDetails.haccp_certification || null,
        description: manufacturingDetails.description || null
      })
      .select()
      .single()

    if (manufacturingError) {
      console.error("Manufacturing details error:", manufacturingError)
      throw new Error(`Failed to save manufacturing details: ${manufacturingError.message}`)
    }

    console.log("Successfully inserted manufacturing details:", insertedManufacturing)

    // 5. Handle file uploads and other data
    const [businessLogoUrl, ownerPhotoUrl] = await Promise.all([
      uploadFile(formData.get("business_logo") as File, businessId.toString(), "business-logos"),
      uploadFile(formData.get("owner_photo") as File, businessId.toString(), "owner-photos")
    ])

    // 6. Update business record
    const { error: businessError } = await supabase
      .from("businesses")
      .update({
        name: formData.get("business_name"),
        address: formData.get("address"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        license_number: formData.get("license_number"),
        owner_name: formData.get("owner_name"),
        owner_photo_url: ownerPhotoUrl,
        logo_url: businessLogoUrl,
      })
      .eq("id", businessId)

    if (businessError) {
      console.error("Business update error:", businessError)
      // Continue execution as manufacturing details are already saved
    }

    // 7. Handle team members
    const teamMemberNames = formData.get("team_member_names")?.toString().split(",") || []
    const teamMemberRoles = formData.get("team_member_roles")?.toString().split(",") || []
    const teamMemberPhotos = formData.getAll("team_member_photos") as File[]

    for (let i = 0; i < teamMemberNames.length; i++) {
      if (!teamMemberNames[i].trim()) continue

      const photoUrl = await uploadFile(
        teamMemberPhotos[i],
        businessId.toString(),
        "team-members"
      )

      const { error: teamError } = await supabase
        .from("team_members")
        .insert([{
          business_id: parseInt(businessId as string),
          name: teamMemberNames[i].trim(),
          role: teamMemberRoles[i].trim(),
          photo_url: photoUrl
        }])

      if (teamError) {
        console.error("Team member insertion error:", teamError)
        // Continue execution as manufacturing details are already saved
      }
    }

    // 8. Handle facility photos
    const facilityAreaNames = formData.get("facility_photo_area_names")?.toString().split(",") || []
    const facilityPhotos = formData.getAll("facility_photos") as File[]

    for (let i = 0; i < facilityAreaNames.length; i++) {
      if (!facilityAreaNames[i].trim()) continue

      const photoUrl = await uploadFile(
        facilityPhotos[i],
        businessId.toString(),
        "facility-photos"
      )

      const { error: facilityError } = await supabase
        .from("facility_photos")
        .insert([{
          business_id: parseInt(businessId as string),
          location: facilityAreaNames[i].trim(),
          photo_url: photoUrl
        }])

      if (facilityError) {
        console.error("Facility photo insertion error:", facilityError)
        // Continue execution as manufacturing details are already saved
      }
    }

    return NextResponse.json({
      success: true,
      businessId: businessId,
      message: "Manufacturing business onboarded successfully",
      manufacturingDetails: insertedManufacturing
    })

  } catch (error) {
    console.error("Manufacturing onboarding error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to complete manufacturing setup"
      },
      { status: 500 }
    )
  }
}

async function uploadFile(file: File, businessId: string, category: string): Promise<string> {
  if (!file) return ""
  
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 10)
  const fileExt = file.name.split('.').pop()
  const fileName = `${timestamp}-${randomString}.${fileExt}`
  const filePath = `${category}/${businessId}/${fileName}`

  const { data, error } = await supabase.storage
    .from("food-safety-files")
    .upload(filePath, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from("food-safety-files")
    .getPublicUrl(data.path)
    
  return publicUrl
} 