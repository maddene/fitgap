import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { saveAssessment, getAssessment } from '../lib/storage';
import { assessmentData } from '../data/assessmentQuestions';
import { ArrowLeft, ArrowRight, Save, Send, CheckCircle } from 'lucide-react';

export default function AssessmentForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentRealmIndex, setCurrentRealmIndex] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [assessmentId, setAssessmentId] = useState(id || `assessment_${Date.now()}`);
  const [saving, setSaving] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [assessorName, setAssessorName] = useState('');
  const [showInfoForm, setShowInfoForm] = useState(!id);

  const currentRealm = assessmentData.realms[currentRealmIndex];
  const currentSection = currentRealm?.sections[currentSectionIndex];
  const totalSections = currentRealm?.sections.length || 0;

  useEffect(() => {
    if (id && user) {
      loadAssessment();
    }
  }, [id, user]);

  const loadAssessment = async () => {
    try {
      const data = await getAssessment(user.id, id);
      if (data) {
        setResponses(data.responses || {});
        setOrganizationName(data.organizationName || '');
        setAssessorName(data.assessorName || '');
        setShowInfoForm(false);
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
    }
  };

  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSave = async () => {
    if (!organizationName || !assessorName) {
      alert('Please enter organization and assessor information');
      return;
    }

    setSaving(true);
    try {
      await saveAssessment(user.id, assessmentId, {
        organizationName,
        assessorName,
        responses,
        status: 'in_progress',
        currentRealmIndex,
        currentSectionIndex
      });
      alert('Progress saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving assessment');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!organizationName || !assessorName) {
      alert('Please enter organization and assessor information');
      return;
    }

    setSaving(true);
    try {
      await saveAssessment(user.id, assessmentId, {
        organizationName,
        assessorName,
        responses,
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      navigate(`/assessment/${assessmentId}/results`);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Error submitting assessment');
      setSaving(false);
    }
  };

  const nextSection = () => {
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else if (currentRealmIndex < assessmentData.realms.length - 1) {
      setCurrentRealmIndex(currentRealmIndex + 1);
      setCurrentSectionIndex(0);
    }
  };

  const previousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    } else if (currentRealmIndex > 0) {
      setCurrentRealmIndex(currentRealmIndex - 1);
      const prevRealm = assessmentData.realms[currentRealmIndex - 1];
      setCurrentSectionIndex(prevRealm.sections.length - 1);
    }
  };

  const isFirstSection = currentRealmIndex === 0 && currentSectionIndex === 0;
  const isLastSection =
    currentRealmIndex === assessmentData.realms.length - 1 &&
    currentSectionIndex === totalSections - 1;

  const getProgress = () => {
    let totalQuestions = 0;
    let answeredQuestions = 0;

    assessmentData.realms.forEach(realm => {
      realm.sections.forEach(section => {
        section.questions.forEach(question => {
          totalQuestions++;
          if (responses[question.id] !== undefined && responses[question.id] !== '') {
            answeredQuestions++;
          }
        });
      });
    });

    return { total: totalQuestions, answered: answeredQuestions };
  };

  const progress = getProgress();
  const progressPercentage = Math.round((progress.answered / progress.total) * 100);

  if (showInfoForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">New FITGAP Assessment</h2>
            <p className="text-gray-600 mb-8">
              Feedback-Informed Treatment GAP Assessment Tool by Scott D. Miller
            </p>

            <div className="space-y-6">
              <div>
                <label htmlFor="organizationName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  id="organizationName"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter your organization name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="assessorName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Assessor Name *
                </label>
                <input
                  id="assessorName"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter your name"
                  value={assessorName}
                  onChange={(e) => setAssessorName(e.target.value)}
                />
              </div>

              <button
                onClick={() => {
                  if (organizationName && assessorName) {
                    setShowInfoForm(false);
                  } else {
                    alert('Please fill in all required fields');
                  }
                }}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
              >
                Begin Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">FITGAP Assessment</h1>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <span className="font-medium">{organizationName}</span> • {assessorName}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">{progress.answered} / {progress.total} questions</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">{progressPercentage}% Complete</p>
            </div>
          </div>
        </div>

        {/* Realm & Section Info */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="border-l-4 border-blue-600 pl-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentRealm.name}
              <span className="text-sm font-normal text-gray-500 ml-3">Version {currentRealm.version}</span>
            </h2>
            <h3 className="text-lg font-semibold text-blue-600 mt-2">{currentSection.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Section {currentSectionIndex + 1} of {totalSections} in this realm
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {currentSection.questions.map((question, idx) => (
              <div key={question.id} className="border-b border-gray-100 pb-6 last:border-0">
                <label className="block mb-3">
                  <span className="text-sm font-semibold text-gray-700 mb-2 block">
                    Question {idx + 1}
                  </span>
                  <p className="text-gray-900 mb-4">{question.text}</p>

                  <div className="flex items-center gap-3">
                    {[
                      { value: 0, label: 'Not at all', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
                      { value: 1, label: 'Minimally', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
                      { value: 2, label: 'Moderately', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
                      { value: 3, label: 'Substantially', color: 'bg-lime-100 text-lime-700 hover:bg-lime-200' },
                      { value: 4, label: 'Completely', color: 'bg-green-100 text-green-700 hover:bg-green-200' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleResponse(question.id, option.value)}
                        className={`
                          flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all
                          ${responses[question.id] === option.value
                            ? `${option.color} ring-2 ring-offset-2 ring-blue-500 shadow-md`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={previousSection}
            disabled={isFirstSection}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 shadow-md transition"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Progress'}
          </button>

          {!isLastSection ? (
            <button
              onClick={nextSection}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md transition"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving || progress.answered < progress.total}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition"
            >
              <Send className="w-5 h-5" />
              {saving ? 'Submitting...' : 'Submit Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
