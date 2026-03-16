// API client for Netlify Functions + Blobs storage
import { MOCK_MODE, mockStorageApi } from './mockData';

const getAuthToken = () => {
  const user = window.netlifyIdentity?.currentUser();
  const token = user?.token?.access_token;

  // Debug logging (can be removed later)
  if (!user) {
    console.warn('[AUTH] netlifyIdentity.currentUser() returned null');
  } else if (!token) {
    console.warn('[AUTH] User exists but no access_token found');
  }

  return token;
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
    console.error('[API Error]', response.status, error);
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

// Save an assessment
export const saveAssessment = async (userId, assessmentId, data) => {
  if (MOCK_MODE) {
    return mockStorageApi.saveAssessment(userId, assessmentId, data);
  }

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
  if (MOCK_MODE) {
    return mockStorageApi.getAssessment(userId, assessmentId);
  }

  const result = await apiCall(`?id=${assessmentId}`);
  return result;
};

// List all assessments for a user (sorted by most recent)
export const listUserAssessments = async (userId) => {
  if (MOCK_MODE) {
    return mockStorageApi.listUserAssessments(userId);
  }

  console.log('[LIST] Fetching assessments for user:', userId);
  const result = await apiCall('');
  console.log('[LIST] Got assessments:', result);
  return result;
};

// Delete an assessment
export const deleteAssessment = async (userId, assessmentId) => {
  if (MOCK_MODE) {
    return mockStorageApi.deleteAssessment(userId, assessmentId);
  }

  return apiCall(`?id=${assessmentId}`, {
    method: 'DELETE',
  });
};
