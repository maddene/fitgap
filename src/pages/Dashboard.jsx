import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { listUserAssessments, deleteAssessment as deleteAssessmentFromStorage } from '../lib/storage';
import { FileText, Plus, LogOut, Eye, Trash2, Clock, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAssessments();
    }
  }, [user]);

  const loadAssessments = async () => {
    try {
      const data = await listUserAssessments(user.id);
      setAssessments(data || []);
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    signOut();
    navigate('/login');
  };

  const createNewAssessment = () => {
    navigate('/assessment/new');
  };

  const deleteAssessment = async (id) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return;

    try {
      await deleteAssessmentFromStorage(user.id, id);
      loadAssessments();
    } catch (error) {
      console.error('Error deleting assessment:', error);
      alert('Error deleting assessment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const inProgressCount = assessments.filter(a => a.status === 'in_progress').length;
  const completedCount = assessments.filter(a => a.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-icce-gray">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-icce-dark tracking-tight">FITGAP Assessment</h1>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                Welcome, <span className="text-icce-teal">{user?.email}</span>
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-soft"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-7 border-l-4 border-icce-teal hover:shadow-medium transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Assessments</p>
                <p className="text-4xl font-bold text-icce-dark mt-2">{assessments.length}</p>
              </div>
              <div className="flex-shrink-0 bg-gradient-to-br from-icce-teal-light to-icce-teal rounded-2xl p-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-7 border-l-4 border-amber-400 hover:shadow-medium transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">In Progress</p>
                <p className="text-4xl font-bold text-icce-dark mt-2">{inProgressCount}</p>
              </div>
              <div className="flex-shrink-0 bg-gradient-to-br from-amber-300 to-amber-400 rounded-2xl p-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-7 border-l-4 border-emerald-500 hover:shadow-medium transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Completed</p>
                <p className="text-4xl font-bold text-icce-dark mt-2">{completedCount}</p>
              </div>
              <div className="flex-shrink-0 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl p-4">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <button
            onClick={createNewAssessment}
            className="flex items-center gap-2 px-7 py-3.5 text-base font-bold text-white bg-gradient-to-r from-icce-teal to-icce-teal-dark rounded-xl hover:from-icce-teal-dark hover:to-icce-teal shadow-medium hover:shadow-strong transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            New Assessment
          </button>
        </div>

        {/* Assessments List */}
        <div className="bg-white shadow-medium rounded-2xl overflow-hidden">
          <div className="px-7 py-6 border-b border-gray-100 bg-gradient-to-r from-icce-teal-light/10 to-icce-teal/10">
            <h2 className="text-2xl font-bold text-icce-dark">My Assessments</h2>
            <p className="text-sm text-gray-600 mt-1">Track and manage your FITGAP assessments over time</p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading assessments...</p>
            </div>
          ) : assessments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-700 mb-2">No assessments yet</p>
              <p className="text-sm">Create your first assessment to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Assessor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{assessment.organizationName || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{assessment.assessorName || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                            assessment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {assessment.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(assessment.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          {assessment.status === 'completed' ? (
                            <button
                              onClick={() => navigate(`/assessment/${assessment.id}/results`)}
                              className="text-blue-600 hover:text-blue-900 transition"
                              title="View Results"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/assessment/${assessment.id}`)}
                              className="text-green-600 hover:text-green-900 transition"
                              title="Continue Assessment"
                            >
                              <FileText className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteAssessment(assessment.id)}
                            className="text-red-600 hover:text-red-900 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
