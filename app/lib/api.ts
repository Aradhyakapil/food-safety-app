//const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const API_URL = "http://localhost:8000"
export const fetchApi = async (path: string, method: "GET" | "POST" | "PUT" | "DELETE" = "GET", body?: any) => {
  const url = `${API_URL}${path}`
  const headers = {
    "Content-Type": "application/json",
  }

  const options: RequestInit = {
    method,
    headers,
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching data:", error)
    throw error // Re-throw the error to be handled by the caller
  }
}

export const login = async (phoneNumber: string, licenseNumber: string) => {
  return await fetchApi("/login", "POST", { phoneNumber, licenseNumber })
}

export const register = async (
  businessName: string,
  phoneNumber: string,
  licenseNumber: string,
  businessType: string,
) => {
  return await fetchApi("/register", "POST", { businessName, phoneNumber, licenseNumber, businessType })
}

export async function getBusiness(businessId: number) {
  try {
    const response = await fetch(`/api/business/${businessId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch business details');
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch business details');
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch business details:', error);
    throw error;
  }
}

export async function getHygieneRatings(businessId: number) {
  try {
    const response = await fetch(`/api/business/${businessId}/hygiene-ratings`);
    if (!response.ok) {
      throw new Error('Failed to fetch hygiene ratings');
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch hygiene ratings');
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch hygiene ratings:', error);
    throw error;
  }
}

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
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch team members');
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    throw error;
  }
};

export async function getFacilityPhotos(businessId: number) {
  if (!businessId) {
    throw new Error('Business ID is required')
  }

  const response = await fetch(`/api/business/facility-photos/${businessId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch facility photos')
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch facility photos')
  }

  return data
}

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
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch reviews');
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    throw error;
  }
};

