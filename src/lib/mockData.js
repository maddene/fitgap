// Mock data for local development
export const MOCK_MODE = import.meta.env.DEV; // Auto-enable in dev mode

export const mockUser = {
  id: 'mock-user-123',
  email: 'demo@example.com',
  user_metadata: {
    full_name: 'Demo User'
  },
  token: {
    access_token: 'mock-token'
  }
};

export const mockAssessments = [
  {
    id: 'assessment_1',
    userId: 'mock-user-123',
    organizationName: 'OpenFIT.care',
    assessorName: 'Enda Madden',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    responses: {
      1: 3,
      2: 2,
      3: 4,
      4: 3,
      5: 2,
      6: 3
    }
  },
  {
    id: 'assessment_2',
    userId: 'mock-user-123',
    organizationName: 'Sample Clinic',
    assessorName: 'Jane Smith',
    status: 'completed',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    responses: {
      1: 4, 2: 3, 3: 4, 4: 3, 5: 4, 6: 3,
      7: 2, 8: 3, 9: 2, 10: 3, 11: 4, 12: 3,
      13: 3, 14: 2, 15: 3, 16: 4, 17: 3, 18: 2,
      19: 3, 20: 4, 21: 3, 22: 2, 23: 3, 24: 4,
      25: 3, 26: 2, 27: 3, 28: 4, 29: 3, 30: 2,
      31: 3, 32: 4, 33: 3, 34: 2, 35: 3, 36: 4,
      37: 3, 38: 2, '38a': 3, '38b': 4, '38c': 3
    }
  },
  {
    id: 'assessment_3',
    userId: 'mock-user-123',
    organizationName: 'Demo Healthcare',
    assessorName: 'Bob Johnson',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    responses: {
      1: 2, 2: 3, 3: 2, 4: 3, 5: 4, 6: 3,
      7: 2, 8: 3, 9: 4
    }
  }
];

// Mock storage functions
let mockStorage = [...mockAssessments];

export const mockStorageApi = {
  async saveAssessment(userId, assessmentId, data) {
    const index = mockStorage.findIndex(a => a.id === assessmentId);
    const assessmentData = {
      ...data,
      id: assessmentId,
      userId,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: data.status || 'in_progress',
    };

    if (index >= 0) {
      mockStorage[index] = assessmentData;
    } else {
      mockStorage.push(assessmentData);
    }

    console.log('[MOCK] Saved assessment:', assessmentId);
    return { success: true, data: assessmentData };
  },

  async getAssessment(userId, assessmentId) {
    const assessment = mockStorage.find(a => a.id === assessmentId && a.userId === userId);
    console.log('[MOCK] Get assessment:', assessmentId, assessment ? 'found' : 'not found');
    return assessment || null;
  },

  async listUserAssessments(userId) {
    const assessments = mockStorage
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    console.log('[MOCK] List assessments:', assessments.length);
    return assessments;
  },

  async deleteAssessment(userId, assessmentId) {
    mockStorage = mockStorage.filter(a => !(a.id === assessmentId && a.userId === userId));
    console.log('[MOCK] Deleted assessment:', assessmentId);
    return { success: true };
  }
};
