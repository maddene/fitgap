// API client for Netlify Functions + Blobs storage

const getAuthToken = () => {
  const user = window.netlifyIdentity?.currentUser();
  return user?.token?.access_token;
};

const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const response = await fetch(`/.netlify/functions/assessments${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

// Save an assessment
export const saveAssessment = async (userId, assessmentId, data) => {
  return apiCall('', {
    method: 'POST',
    body: JSON.stringify({
      assessmentId,
      ...data,
    }),
  });
};

// Get an assessment
export const getAssessment = async (userId, assessmentId) => {
  const result = await apiCall(`?id=${assessmentId}`);
  return result;
};

// List all assessments for a user (sorted by most recent)
export const listUserAssessments = async (userId) => {
  return apiCall('');
};

// Delete an assessment
export const deleteAssessment = async (userId, assessmentId) => {
  return apiCall(`?id=${assessmentId}`, {
    method: 'DELETE',
  });
};
