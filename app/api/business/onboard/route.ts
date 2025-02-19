import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const businessId = formData.get("businessId")

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: "Business ID is required" },
        { status: 400 }
      )
    }

    // Upload files with proper categorization
    const [businessLogoUrl, ownerPhotoUrl] = await Promise.all([
      uploadFile(formData.get("business_logo") as File, businessId.toString(), "business-logos"),
      uploadFile(formData.get("owner_photo") as File, businessId.toString(), "owner-photos")
    ])

    if (!businessLogoUrl || !ownerPhotoUrl) {
      return NextResponse.json(
        { success: false, error: "Failed to upload images" },
        { status: 500 }
      )
    }

    // Update business record
    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        logo_url: businessLogoUrl,
        owner_photo_url: ownerPhotoUrl,
        address: formData.get("address"),
        email: formData.get("email"),
        owner_name: formData.get("owner_name"),
        license_number: formData.get("license_number"),  // FSSAI license number
      })
      .eq("id", businessId)

    if (updateError) {
      throw updateError
    }

    // Handle team members
    const teamMemberNames = formData.get("team_member_names")?.toString() || ""
    const teamMemberRoles = formData.get("team_member_roles")?.toString() || ""
    const teamMemberPhotos = formData.getAll("team_member_photos") as File[]

    if (teamMemberNames && teamMemberRoles && teamMemberPhotos.length > 0) {
      const names = teamMemberNames.split(",")
      const roles = teamMemberRoles.split(",")

      for (let i = 0; i < names.length; i++) {
        const photoUrl = await uploadFile(
          teamMemberPhotos[i],
          businessId.toString(),
          "team-members"
        )
        const { error: teamError } = await supabase.from("team_members").insert([
          {
            business_id: businessId,
            name: names[i].trim(),
            role: roles[i].trim(),
            photo_url: photoUrl,
          },
        ])

        if (teamError) {
          console.error("Team member insert error:", teamError)
        }
      }
    }

    // Handle facility photos
    const facilityAreaNames = formData.get("facility_photo_area_names")?.toString() || ""
    const facilityPhotos = formData.getAll("facility_photos") as File[]

    if (facilityAreaNames && facilityPhotos.length > 0) {
      const areaNames = facilityAreaNames.split(",")

      for (let i = 0; i < areaNames.length; i++) {
        const photoUrl = await uploadFile(
          facilityPhotos[i],
          businessId.toString(),
          "facility-photos"
        )
        const { error: facilityError } = await supabase.from("facility_photos").insert([
          {
            business_id: businessId,
            location: areaNames[i].trim(),
            photo_url: photoUrl,
          },
        ])

        if (facilityError) {
          console.error("Facility photo insert error:", facilityError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      businessId: businessId,
      message: "Business onboarded successfully"
    })

  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create business entry" },
      { status: 500 }
    )
  }
}

async function uploadFile(file: File, businessId: string, category: string): Promise<string> {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const fileExt = file.name.split('.').pop();
  const fileName = `${timestamp}-${randomString}.${fileExt}`;
  const filePath = `${category}/${businessId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("food-safety-files")
    .upload(filePath, file);

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from("food-safety-files")
    .getPublicUrl(data.path);
    
  return publicUrl.publicUrl;
}

