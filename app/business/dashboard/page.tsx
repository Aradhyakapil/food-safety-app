"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { Star, Copy, ImageIcon } from 'lucide-react';
import RestaurantCertifications from "./components/restaurant-certifications"
import RestaurantLabReports from "./components/restaurant-lab-reports"
import RestaurantFacilityPhotos from "@/app/consumer/business/components/restaurant-facility-photos"
import RestaurantTeamMembers from "./components/restaurant-team-members"
import { OwnerInformation } from "./components/owner-information"
import { BusinessHeader } from "./components/business-header"

interface BusinessDetails {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  license_number: string;
  business_type: string;
  owner_name: string;
  owner_photo_url: string | null;
  logo_url: string | null;
  trade_license: string;
  gst_number: string;
  fire_safety_cert: string;
  liquor_license?: string;
  music_license?: string;
}

interface LabReport {
  id?: number;
  business_id: number;
  report_date: string;
  test_type: string;
  result: string;
  notes?: string;
  status: 'Pass' | 'Fail' | 'Pending';
  report_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  photo_url: string | null;
}

interface FacilityPhoto {
  id: number;
  area_name: string;
  photo_url: string | null;
}

interface HygieneRating {
  food_handling: number;
  premises_maintenance: number;
  staff_hygiene: number;
  legal_compliance: number;
  customer_complaints: number;
  inspection_date: string;
}

interface Violation {
  id: number;
  date: string;
  description: string;
  severity: string;
}

interface Certification {
  id: number;
  business_id: number;
  type: string;
  number: string;
  valid_from: string;
  valid_to: string;
  status: 'Active' | 'Expired';
}

export default function BusinessDashboard() {
  const router = useRouter();
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [facilityPhotos, setFacilityPhotos] = useState<FacilityPhoto[]>([]);
  const [hygieneRating, setHygieneRating] = useState<HygieneRating | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<number>(0)

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Get the latest business details
        const { data: business, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (businessError) throw businessError;
        setBusinessDetails(business);

        // Using the business ID, fetch all related data
        const businessId = business.id;

        // Fetch lab reports
        const { data: reports } = await supabase
          .from('lab_reports')
          .select('*')
          .eq('business_id', businessId)
          .order('report_date', { ascending: false });
        setLabReports(reports || []);

        // Fetch team members
        const { data: members } = await supabase
          .from('team_members')
          .select('*')
          .eq('business_id', businessId);
        setTeamMembers(members || []);

        // Fetch facility photos
        const { data: photos } = await supabase
          .from('facility_photos')
          .select('*')
          .eq('business_id', businessId);
        setFacilityPhotos(photos || []);

        // Fetch hygiene rating - handle empty result
        const { data: hygieneData, error: hygieneError } = await supabase
          .from('hygiene_ratings')
          .select('*')
          .eq('business_id', businessId)
          .order('inspection_date', { ascending: false })
          .limit(1);
        
        if (!hygieneError && hygieneData && hygieneData.length > 0) {
          setHygieneRating(hygieneData[0]);
        } else {
          // Set default hygiene rating or null
          setHygieneRating({
            food_handling: 0,
            premises_maintenance: 0,
            staff_hygiene: 0,
            legal_compliance: 0,
            customer_complaints: 0,
            inspection_date: new Date().toISOString(),
          });
        }

        // Fetch violations
        const { data: violationData } = await supabase
          .from('violations')
          .select('*')
          .eq('business_id', businessId)
          .order('date', { ascending: false });
        setViolations(violationData || []);

        // Fetch certifications - handle empty result
        const { data: certData, error: certError } = await supabase
          .from('certifications')
          .select('*')
          .eq('business_id', businessId)
          .order('certification_type', { ascending: true });
        
        if (!certError) {
          setCertifications(certData || []);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    // Get businessId from localStorage
    const id = localStorage.getItem('businessId')
    if (id) {
      setBusinessId(parseInt(id))
    }
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="bg-white border border-red-100 shadow-md rounded-lg p-6 text-center text-red-600">
      {error}
    </div>
  );

  if (!businessDetails) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg">
        No business details found
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <BusinessHeader businessId={businessId} />

      {/* Hygiene Rating */}
      <div className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] transition-shadow duration-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Hygiene Rating</h2>
        {hygieneRating ? (
          <>
            <div className="flex items-center gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-6 w-6 ${i < Math.floor((
                    hygieneRating.food_handling +
                    hygieneRating.premises_maintenance +
                    hygieneRating.staff_hygiene +
                    hygieneRating.legal_compliance +
                    hygieneRating.customer_complaints
                  ) / 95 * 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
              <span className="ml-2 text-sm">Excellent hygiene, no violations</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Food Handling Practices</span>
                <span className="font-medium">{hygieneRating.food_handling}/30</span>
              </div>
              <div className="flex justify-between">
                <span>Maintenance of Premises</span>
                <span className="font-medium">{hygieneRating.premises_maintenance}/20</span>
              </div>
              <div className="flex justify-between">
                <span>Staff Hygiene</span>
                <span className="font-medium">{hygieneRating.staff_hygiene}/20</span>
              </div>
              <div className="flex justify-between">
                <span>Legal Compliance</span>
                <span className="font-medium">{hygieneRating.legal_compliance}/15</span>
              </div>
              <div className="flex justify-between">
                <span>Customer Complaints/History</span>
                <span className="font-medium">{hygieneRating.customer_complaints}/10</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center">No hygiene rating available</p>
        )}
      </div>

      {/* Violations */}
      <div className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] transition-shadow duration-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Violations</h2>
        <div className="space-y-4">
          {violations.map((violation) => (
            <div key={violation.id} className="flex justify-between items-start border-b pb-3">
              <div>
                <p className="font-medium">
                  {new Date(violation.date).toLocaleDateString()}
                </p>
                <p className="text-gray-600">{violation.description}</p>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${
                violation.severity === 'Minor' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : violation.severity === 'Major'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {violation.severity}
              </span>
            </div>
          ))}
          {violations.length === 0 && (
            <p className="text-gray-500 text-center">No violations recorded</p>
          )}
        </div>
      </div>

      {/* Restaurant Certifications */}
      <RestaurantCertifications businessId={businessId} />

      {/* Owner Information */}
      <OwnerInformation businessId={businessId} />

      {/* Lab Reports */}
      <RestaurantLabReports businessId={businessId} />

      {/* Our Team */}
      <RestaurantTeamMembers businessId={businessId} />

      {/* Facility Photos */}
      <RestaurantFacilityPhotos businessId={businessId} />
    </div>
  );
}

