import type { Business, Certification, LabReport, TeamMember, FacilityPhoto, Review } from "@/app/types"
import { supabase } from "@/app/lib/supabase"

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

//const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const API_URL = "http://localhost:8000"
export const fetchApi = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Clone the response before reading
    const clonedResponse = response.clone();
    
    try {
      return await clonedResponse.json();
    } catch (error) {
      // If JSON parsing fails, try reading the original response as text
      const textResponse = await response.text();
      throw new Error(textResponse || 'Failed to parse response');
    }
  } catch (error) {
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  return await fetchApi("/login", "POST", { email, password })
}

export const register = async (name: string, email: string, password: string, userType: string) => {
  return await fetchApi("/register", "POST", { name, email, password, userType })
}

export const loginBusiness = async (phoneNumber: string, licenseNumber: string, businessType: string) => {
  try {
    if (!phoneNumber || !licenseNumber || !businessType) {
      throw new Error('Phone number, license number, and business type are required');
    }

    const response = await fetch('/api/business/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        phoneNumber, 
        licenseNumber, 
        businessType 
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    if (data.businessId) {
      localStorage.setItem('businessId', data.businessId.toString());
      localStorage.setItem('businessType', businessType);
      localStorage.setItem('token', data.token);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

export const registerBusiness = async (
  businessName: string,
  licenseNumber: string,
  phoneNumber: string,
  otp: string
) => {
  try {
    const response = await fetch("/api/business/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessName,
        licenseNumber,
        phoneNumber,
        otp,
        businessType: localStorage.getItem("businessType") || "restaurant"
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

export const sendOTP = async (phoneNumber: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: phoneNumber
  });
  
  if (error) throw error;
  
  return { success: true, message: "OTP sent successfully" };
}

export const getBusiness = async (businessId: string | number) => {
  try {
    const response = await fetch(`/api/business/${businessId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch business details')
    }
    const data = await response.json()
    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Error fetching business:', error)
    throw new Error('Failed to fetch business details')
  }
}

export const getHygieneRatings = async (businessId: number) => {
  try {
    const response = await fetch(`/api/business/${businessId}/hygiene-ratings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hygiene ratings');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch hygiene ratings:', error);
    throw error;
  }
};

export const getCertifications = async (businessId: number) => {
  try {
    const response = await fetch(`/api/business/certifications/${businessId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch certifications');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch certifications:', error);
    throw error;
  }
};

export const createCertification = async (certificationData: Partial<Certification>): Promise<Certification> => {
  return await fetchApi(`/certification`, "POST", certificationData)
}

export const getLabReports = async (businessId: number) => {
  try {
    const response = await fetch(`/api/business/lab-reports/${businessId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch lab reports');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch lab reports:', error);
    throw error;
  }
};

export const getTeamMembers = async (businessId: number) => {
  try {
    const response = await fetch(`/api/business/${businessId}/team-members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch team members');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    throw error;
  }
};

export const getFacilityPhotos = async (businessId: string) => {
  try {
    const response = await fetch(`/api/business/facility-photos/${businessId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch facility photos');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch facility photos:', error);
    throw error;
  }
};

export const getReviews = async (businessId: number) => {
  try {
    const response = await fetch(`/api/business/${businessId}/reviews`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    throw error;
  }
};

export const updateBusiness = async (businessId: number, updatedData: Partial<Business>): Promise<Business> => {
  return await fetchApi(`/business/${businessId}`, "PUT", updatedData)
}

export const createLabReport = async (businessId: number, reportData: Partial<LabReport>): Promise<LabReport> => {
  return await fetchApi(`/lab-reports/${businessId}`, "POST", reportData)
}

export const createTeamMember = async (
  businessId: number,
  teamMemberData: Partial<TeamMember>,
): Promise<TeamMember> => {
  return await fetchApi(`/team-members/${businessId}`, "POST", teamMemberData)
}

export const createFacilityPhoto = async (
  businessId: number,
  photoData: Partial<FacilityPhoto>,
): Promise<FacilityPhoto> => {
  return await fetchApi(`/facility-photos/${businessId}`, "POST", photoData)
}

export const onboardBusiness = async (formData: FormData) => {
  try {
    const response = await fetch('/api/business/onboard', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to complete business setup')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Onboarding error:", error)
    throw error
  }
}

export const getManufacturingDetails = async (businessId: string | number) => {
  try {
    const { data, error } = await supabase
      .from('manufacturing_details')
      .select('*')
      .eq('business_id', businessId)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    throw new Error('Failed to fetch manufacturing details')
  }
}

export const updateManufacturingDetails = async (businessId: string, details: any) => {
  try {
    const { data, error } = await supabase
      .from('manufacturing_details')
      .update(details)
      .eq('business_id', businessId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating manufacturing details:', error)
    throw new Error('Failed to update manufacturing details')
  }
}

export const getBatchProduction = async (businessId: string) => {
  try {
    const { data, error } = await supabase
      .from('batch_production')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching batch production:', error)
    throw new Error('Failed to fetch batch production details')
  }
}

export const createBatchProduction = async (batchData: any) => {
  try {
    const { data, error } = await supabase
      .from('batch_production')
      .insert(batchData)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating batch production:', error)
    throw new Error('Failed to create batch production')
  }
}

export const getPackagingCompliance = async (businessId: string) => {
  try {
    const { data, error } = await supabase
      .from('packaging_compliance')
      .select('*')
      .eq('business_id', businessId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching packaging compliance:', error)
    throw new Error('Failed to fetch packaging compliance')
  }
}

export const createPackagingCompliance = async (data: any) => {
  try {
    const { data: result, error } = await supabase
      .from('packaging_compliance')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return { success: true, data: result }
  } catch (error) {
    throw new Error('Failed to create packaging compliance')
  }
}

export const getRawMaterialSuppliers = async (businessId: string | number) => {
  try {
    const { data, error } = await supabase
      .from('raw_material_suppliers')
      .select('*')
      .eq('business_id', businessId)

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    throw new Error('Failed to fetch raw material suppliers')
  }
}

export const createRawMaterialSupplier = async (data: any) => {
  try {
    const { data: result, error } = await supabase
      .from('raw_material_suppliers')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return { success: true, data: result }
  } catch (error) {
    throw new Error('Failed to create raw material supplier')
  }
}


