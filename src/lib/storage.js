import { getStore } from '@netlify/blobs';

// Get the assessments store
export const getAssessmentsStore = () => {
  return getStore({
    name: 'assessments',
    siteID: import.meta.env.VITE_NETLIFY_SITE_ID,
    token: import.meta.env.VITE_NETLIFY_TOKEN,
  });
};

// Save an assessment
export const saveAssessment = async (userId, assessmentId, data) => {
  const store = getAssessmentsStore();
  const key = `${userId}/${assessmentId}`;

  // Add metadata for tracking
  const assessmentData = {
    ...data,
    id: assessmentId,
    userId,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: data.status || 'in_progress', // in_progress, completed
  };

  await store.set(key, JSON.stringify(assessmentData));
  return { success: true, data: assessmentData };
};

// Get an assessment
export const getAssessment = async (userId, assessmentId) => {
  const store = getAssessmentsStore();
  const key = `${userId}/${assessmentId}`;
  const data = await store.get(key);
  return data ? JSON.parse(data) : null;
};

// List all assessments for a user (sorted by most recent)
export const listUserAssessments = async (userId) => {
  const store = getAssessmentsStore();
  const { blobs } = await store.list({ prefix: `${userId}/` });

  // Fetch full data for each assessment to get metadata
  const assessments = await Promise.all(
    blobs.map(async (blob) => {
      const key = blob.key;
      const data = await store.get(key);
      return data ? JSON.parse(data) : null;
    })
  );

  // Filter out nulls and sort by updatedAt (most recent first)
  return assessments
    .filter(a => a !== null)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

// Delete an assessment
export const deleteAssessment = async (userId, assessmentId) => {
  const store = getAssessmentsStore();
  const key = `${userId}/${assessmentId}`;
  await store.delete(key);
  return { success: true };
};
