export interface User {
  id?: number
  name: string
  phone_number: string
  password: string
  created_at?: string
  updated_at?: string
  user_type?: string
  email?: string
}

export interface Business {
  id: number
  name: string
  address: string
  fssai_license: string
  business_type: string
  owner_id?: string
  owner_name: string
  owner_photo_url: string
  logo_url: string
  trade_license: string
  gst_number: string
  fire_safety_cert: string
  liquor_license?: string | null
  music_license?: string | null
  phone: string
  email: string
}

export interface Certification {
  id?: number
  business_id: number
  certification_type: string
  issue_date: string
  expiry_date: string
  certificate_number: string
}

export interface LabReport {
  id?: number
  business_id: number
  report_type: string
  date: string
  result: string
  file_url?: string
}

export interface TeamMember {
  id?: number
  business_id: number
  name: string
  role: string
  photo_url?: string
}

export interface FacilityPhoto {
  id?: number
  business_id: number
  area_name: string
  photo_url: string
}

export interface Review {
  id: number
  business_id: number
  reviewer_id: number
  rating: number
  comment: string
  date: string
}

