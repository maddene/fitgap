// API client for Netlify Functions + Blobs storage
import { MOCK_MODE, mockStorageApi } from './mockData';

const getAuthToken = () => {
  if (MOCK_MODE) {
    return 'mock-token';
  }

  const user = window.netlifyIdentity?.currentUser();
  if (!user) {
    console.warn('[AUTH] No current user found via netlifyIdentity.currentUser()');
    console.warn('[AUTH] netlifyIdentity exists:', !!window.netlifyIdentity);
    return null;
  }

  console.log('[AUTH] User object:', {
    hasUser: !!user,
    hasToken: !!user.token,
    hasAccessToken: !!user.token?.access_token,
    tokenKeys: user.token ? Object.keys(user.token) : []
  });

  const token = user.token?.access_token;
  if (!token) {
    console.error('[AUTH] User found but no access token. User structure:', JSON.stringify(user, null, 2));
  }

  return token;
};

const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();

  // Don't throw error client-side - let the server respond with 401 if token is invalid
  // This prevents false positives from timing issues with netlifyIdentity initialization
  if (!token && !MOCK_MODE) {
    console.warn('[AUTH] No token available for API call - request will likely fail with 401');
  }

  try {
    const response = await fetch(`/.netlify/functions/assessments${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (parseError) {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || errorMessage;
      }

      // Handle specific error cases
      if (response.status === 401) {
        console.error('[AUTH] Received 401 Unauthorized from server');
        throw new Error('Your session has expired. Please log in again.');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to perform this action.');
      } else if (response.status >= 500) {
        console.error('[SERVER] Server error:', errorMessage);
        throw new Error('Server error. Please try again in a few moments.');
      }

      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('[NETWORK] Network error:', error);
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    throw error;
  }
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

  return apiCall('');
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
