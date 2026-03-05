import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { listUserAssessments, deleteAssessment as deleteAssessmentFromStorage } from '../lib/storage';
import { FileText, Plus, LogOut, Eye, Trash2, Clock, CheckCircle2, BarChart3 } from 'lucide-react';

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

  // Group assessments by organization
  const groupedAssessments = assessments.reduce((acc, assessment) => {
    const orgName = assessment.organizationName || 'Unnamed Organization';
    if (!acc[orgName]) {
      acc[orgName] = [];
    }
    acc[orgName].push(assessment);
    return acc;
  }, {});

  // Sort organizations alphabetically and sort assessments within each org by date
  const sortedOrgs = Object.keys(groupedAssessments).sort();
  sortedOrgs.forEach(orgName => {
    groupedAssessments[orgName].sort((a, b) =>
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  });

  const createNewAssessmentForOrg = (orgName) => {
    navigate('/assessment/new', { state: { organizationName: orgName } });
  };

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
            <div className="p-6 space-y-6">
              {sortedOrgs.map((orgName) => {
                const orgAssessments = groupedAssessments[orgName];
                return (
                  <div key={orgName} className="border-l-4 border-icce-teal bg-gray-50 rounded-r-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-icce-dark">{orgName}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {orgAssessments.length} assessment{orgAssessments.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {orgAssessments.filter(a => a.status === 'completed').length >= 2 && (
                          <button
                            onClick={() => navigate(`/organization/${encodeURIComponent(orgName)}/compare`)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-purple-600 bg-white border-2 border-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all"
                          >
                            <BarChart3 className="w-4 h-4" />
                            Compare Results
                          </button>
                        )}
                        <button
                          onClick={() => createNewAssessmentForOrg(orgName)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-icce-teal bg-white border-2 border-icce-teal rounded-lg hover:bg-icce-teal hover:text-white transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Add Assessment
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {orgAssessments.map((assessment) => (
                        <div
                          key={assessment.id}
                          className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                  assessment.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {assessment.status === 'completed' ? 'Completed' : 'In Progress'}
                              </span>
                              <span className="text-sm text-gray-600">
                                by <span className="font-medium text-gray-900">{assessment.assessorName}</span>
                              </span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{formatDate(assessment.updatedAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {assessment.status === 'completed' ? (
                              <button
                                onClick={() => navigate(`/assessment/${assessment.id}/results`)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
                              >
                                <Eye className="w-4 h-4" />
                                View Results
                              </button>
                            ) : (
                              <button
                                onClick={() => navigate(`/assessment/${assessment.id}`)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-600 hover:text-green-800 transition"
                              >
                                <FileText className="w-4 h-4" />
                                Continue
                              </button>
                            )}
                            <button
                              onClick={() => deleteAssessment(assessment.id)}
                              className="p-2 text-red-600 hover:text-red-800 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center pb-6">
          <p className="text-sm text-gray-500 mb-2">
            Built for <span className="font-semibold text-icce-teal">The International Center for Clinical Excellence</span> by{' '}
            <a
              href="https://openfit.care"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-icce-teal hover:text-icce-teal-dark transition-colors"
            >
              OpenFIT.care
            </a>
          </p>
          <p className="text-xs text-gray-400">
            <Link to="/privacy" className="hover:text-icce-teal transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
