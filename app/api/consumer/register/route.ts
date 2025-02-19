import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

export async function POST(request: Request) {
  try {
    const { name, phoneNumber, otp, password } = await request.json()

    // Insert the new user
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          phone_number: phoneNumber,
          password,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("User registration error:", error)
    return NextResponse.json({ success: false, error: "Registration failed" }, { status: 500 })
  }
}

