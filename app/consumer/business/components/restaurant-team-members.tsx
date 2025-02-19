const fetchTeamMembers = async () => {
  try {
    const response = await fetch(`/api/business/team-members/${businessId}`, {
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

    setTeamMembers(data.data);
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    setError('Unable to load team members. Please try again later.');
  } finally {
    setIsLoading(false);
  }
}; 