export interface LabReport {
  id?: number
  business_id: number
  report_date: string
  test_type: string
  result: string
  notes?: string
  status: 'Pass' | 'Fail' | 'Pending'
  report_url?: string
  created_at?: string
  updated_at?: string
}

export interface FacilityPhoto {
  id: number
  business_id: number
  photo_url: string
  area_name: string
  created_at: string
} 