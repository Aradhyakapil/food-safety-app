import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json()

    const { data, error } = await supabase.from("users").select().eq("name", name).eq("password", password).single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    // In a real application, you would generate a proper JWT token here
    const token = "dummy_token"

    return NextResponse.json({ success: true, token, user: data })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 })
  }
}

