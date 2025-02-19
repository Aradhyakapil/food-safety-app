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

export const getBusiness = async (businessId: number) => {
  try {
    const response = await fetch(`/api/business/${businessId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch business details');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch business details:', error);
    throw error;
  }
};

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
    const token = localStorage.getItem('token');
    const businessId = localStorage.getItem('businessId');

    if (!token || !businessId) {
      throw new Error("Authentication credentials missing");
    }

    formData.append('businessId', businessId);

    const response = await fetch('/api/business/onboard', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to complete business setup');
    }

    const data = await response.json();
    return {
      success: true,
      businessId: data.businessId,
      businessType: localStorage.getItem('businessType'),
      message: data.message
    };
  } catch (error) {
    console.error("Onboarding error:", error);
    throw error;
  }
};


