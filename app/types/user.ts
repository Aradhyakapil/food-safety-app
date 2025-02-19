export interface User {
  id?: string
  name: string
  phone_number: string
  email: string
  password: string
  user_type: string
  created_at?: string
  updated_at?: string
}

export interface SignUpForm {
  name: string
  email: string
  phoneNumber: string
  password: string
  userType: string
}

export interface SignInForm {
  email: string
  password: string
}

export interface Business {
  id?: number
  name: string
  address: string
  phone: string
  email: string
  license_number: string
  business_type: string
  owner_id: string
  owner_name: string
  owner_photo_url: string
  logo_url: string
  trade_license: string
  gst_number: string
  fire_safety_cert: string
  liquor_license?: string
  music_license?: string
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
  id?: number
  business_id: number
  reviewer_id: number
  rating: number
  comment: string
  date: string
}

