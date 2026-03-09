// API client for Netlify Functions + Blobs storage
import { MOCK_MODE, mockStorageApi } from './mockData';

const getAuthToken = () => {
  const user = window.netlifyIdentity?.currentUser();
  return user?.token?.access_token;
};

const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }

  try {
    const response = await fetch(`/.netlify/functions/assessments${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
        throw new Error('Your session has expired. Please log in again.');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to perform this action.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again in a few moments.');
      }

      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
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
