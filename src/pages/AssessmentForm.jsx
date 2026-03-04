import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { saveAssessment, getAssessment } from '../lib/storage';
import { assessmentData } from '../data/assessmentQuestions';
import { ArrowLeft, ArrowRight, Save, Send, CheckCircle } from 'lucide-react';

export default function AssessmentForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentRealmIndex, setCurrentRealmIndex] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [assessmentId, setAssessmentId] = useState(id || `assessment_${Date.now()}`);
  const [saving, setSaving] = useState(false);
  const [organizationName, setOrganizationName] = useState(location.state?.organizationName || '');
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
      console.log('[SAVE] Saving assessment...', { userId: user.id, assessmentId, dataSize: Object.keys(responses).length });
      const result = await saveAssessment(user.id, assessmentId, {
        organizationName,
        assessorName,
        responses,
        status: 'in_progress',
        currentRealmIndex,
        currentSectionIndex
      });
      console.log('[SAVE] Save successful:', result);
      alert('Progress saved successfully!');
    } catch (error) {
      console.error('[SAVE] Error saving:', error);
      alert(`Error saving assessment: ${error.message}`);
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
          // Count each question as 1, regardless of subquestions
          totalQuestions++;

          // Check if question is answered (including N/A which is null)
          if (question.subQuestions && question.subQuestions.length > 0) {
            // For questions with subquestions, check if ALL subquestions are answered
            // null (N/A) counts as answered, undefined does not
            const allSubQuestionsAnswered = question.subQuestions.every(subQ =>
              responses[subQ.id] !== undefined
            );
            if (allSubQuestionsAnswered) {
              answeredQuestions++;
            }
          } else {
            // For regular questions, check if answered
            // null (N/A) counts as answered, undefined does not
            if (responses[question.id] !== undefined) {
              answeredQuestions++;
            }
          }
        });
      });
    });

    return { total: totalQuestions, answered: answeredQuestions };
  };

  const progress = getProgress();
  const progressPercentage = Math.round((progress.answered / progress.total) * 100);

  const getSectionProgress = () => {
    let totalQuestions = 0;
    let answeredQuestions = 0;

    currentSection.questions.forEach(question => {
      totalQuestions++;

      if (question.subQuestions && question.subQuestions.length > 0) {
        const allSubQuestionsAnswered = question.subQuestions.every(subQ =>
          responses[subQ.id] !== undefined
        );
        if (allSubQuestionsAnswered) {
          answeredQuestions++;
        }
      } else {
        if (responses[question.id] !== undefined) {
          answeredQuestions++;
        }
      }
    });

    return { total: totalQuestions, answered: answeredQuestions };
  };

  const sectionProgress = getSectionProgress();

  const getSectionProgressByIndex = (realmIdx, sectionIdx) => {
    const realm = assessmentData.realms[realmIdx];
    const section = realm.sections[sectionIdx];
    let totalQuestions = 0;
    let answeredQuestions = 0;

    section.questions.forEach(question => {
      totalQuestions++;

      if (question.subQuestions && question.subQuestions.length > 0) {
        const allSubQuestionsAnswered = question.subQuestions.every(subQ =>
          responses[subQ.id] !== undefined
        );
        if (allSubQuestionsAnswered) {
          answeredQuestions++;
        }
      } else {
        if (responses[question.id] !== undefined) {
          answeredQuestions++;
        }
      }
    });

    return { total: totalQuestions, answered: answeredQuestions };
  };

  if (showInfoForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-icce-gray py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-icce-teal hover:text-icce-teal-dark mb-8 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-2xl shadow-medium p-10">
            <h2 className="text-4xl font-bold text-icce-dark mb-3 tracking-tight">New FITGAP Assessment</h2>
            <p className="text-gray-600 mb-10 text-base leading-relaxed">
              Feedback-Informed Treatment GAP Assessment Tool by Scott D. Miller
            </p>

            <div className="space-y-6">
              <div>
                <label htmlFor="organizationName" className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Organization Name *
                </label>
                <input
                  id="organizationName"
                  type="text"
                  required
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-icce-teal focus:border-transparent transition-all shadow-soft text-base"
                  placeholder="Enter your organization name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="assessorName" className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Assessor Name *
                </label>
                <input
                  id="assessorName"
                  type="text"
                  required
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-icce-teal focus:border-transparent transition-all shadow-soft text-base"
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
                className="w-full bg-gradient-to-r from-icce-teal to-icce-teal-dark text-white py-4 px-6 rounded-xl font-bold hover:from-icce-teal-dark hover:to-icce-teal transition-all duration-200 shadow-medium hover:shadow-strong text-base"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-icce-gray py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-icce-teal hover:text-icce-teal-dark font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-2xl shadow-medium p-7 mb-6">
            <h1 className="text-3xl font-bold text-icce-dark mb-3 tracking-tight">FITGAP Assessment</h1>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <span className="font-semibold text-icce-teal">{organizationName}</span> <span className="text-gray-400">•</span> {assessorName}
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-emerald-700">{progress.answered} / {progress.total} questions</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-5">
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-icce-teal to-icce-teal-dark transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right font-medium">{progressPercentage}% Complete</p>
            </div>
          </div>
        </div>

        {/* Realm & Section Info */}
        <div className="bg-white rounded-2xl shadow-medium p-9 mb-6">
          <div className="border-l-4 border-icce-teal pl-5 mb-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-icce-dark tracking-tight">
                  {currentRealm.name}
                  <span className="text-sm font-medium text-gray-400 ml-4">Version {currentRealm.version}</span>
                </h2>
                <h3 className="text-xl font-semibold text-icce-teal mt-3">
                  {currentSection.name}
                </h3>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  Section {currentSectionIndex + 1} of {totalSections} in this realm
                </p>
              </div>

              {/* Section Navigation Dropdown */}
              <div className="flex-none">
                <label htmlFor="section-nav" className="block text-xs font-semibold text-gray-600 mb-2">
                  Jump to Section
                </label>
                <select
                  id="section-nav"
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-icce-teal focus:border-transparent transition-all shadow-soft text-sm font-medium bg-white cursor-pointer"
                  value={`${currentRealmIndex}-${currentSectionIndex}`}
                  onChange={(e) => {
                    const [realmIdx, sectionIdx] = e.target.value.split('-').map(Number);
                    setCurrentRealmIndex(realmIdx);
                    setCurrentSectionIndex(sectionIdx);
                  }}
                >
                  {assessmentData.realms.map((realm, realmIdx) => (
                    <optgroup key={realm.id} label={realm.name}>
                      {realm.sections.map((section, sectionIdx) => {
                        const progress = getSectionProgressByIndex(realmIdx, sectionIdx);
                        return (
                          <option key={`${realm.id}-${section.name}`} value={`${realmIdx}-${sectionIdx}`}>
                            {section.name} ({progress.answered}/{progress.total})
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-8">
            {currentSection.questions.map((question, idx) => (
              <div key={question.id} className="border-b border-gray-100 pb-8 last:border-0">
                <div className="block mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                    Question {question.id}
                  </span>
                  <p className="text-icce-dark mb-5 text-base leading-relaxed font-medium">{question.text}</p>

                  {/* Handle subquestions if they exist */}
                  {question.subQuestions ? (
                    <div className="space-y-4 pl-4">
                      {question.subQuestions.map((subQ) => (
                        <div key={subQ.id} className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                          <p className="text-gray-700 mb-4 text-sm leading-relaxed">{subQ.text}</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleResponse(subQ.id, responses[subQ.id] === null ? undefined : null)}
                              className={`
                                flex-none py-2.5 px-3 rounded-lg font-semibold text-xs transition-all duration-200
                                ${responses[subQ.id] === null
                                  ? 'bg-gray-200 text-gray-700 ring-2 ring-offset-2 ring-gray-400 shadow-soft scale-105'
                                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}
                              `}
                              title="Not Applicable"
                            >
                              N/A
                            </button>
                            {[
                              { value: 0, label: 'Not at all', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
                              { value: 1, label: 'Minimally', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
                              { value: 2, label: 'Moderately', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
                              { value: 3, label: 'Substantially', color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
                              { value: 4, label: 'Completely', color: 'bg-icce-teal/20 text-icce-teal-dark hover:bg-icce-teal/30' }
                            ].map(option => (
                              <button
                                key={option.value}
                                onClick={() => handleResponse(subQ.id, responses[subQ.id] === option.value ? undefined : option.value)}
                                className={`
                                  flex-1 py-2.5 px-2 rounded-lg font-semibold text-xs transition-all duration-200
                                  ${responses[subQ.id] === option.value
                                    ? `${option.color} ring-2 ring-offset-2 ring-icce-teal shadow-soft scale-105`
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}
                                `}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleResponse(question.id, responses[question.id] === null ? undefined : null)}
                        className={`
                          flex-none py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200
                          ${responses[question.id] === null
                            ? 'bg-gray-200 text-gray-700 ring-2 ring-offset-2 ring-gray-400 shadow-medium scale-105'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}
                        `}
                        title="Not Applicable"
                      >
                        N/A
                      </button>
                      {[
                        { value: 0, label: 'Not at all', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
                        { value: 1, label: 'Minimally', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
                        { value: 2, label: 'Moderately', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
                        { value: 3, label: 'Substantially', color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
                        { value: 4, label: 'Completely', color: 'bg-icce-teal/20 text-icce-teal-dark hover:bg-icce-teal/30' }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => handleResponse(question.id, responses[question.id] === option.value ? undefined : option.value)}
                          className={`
                            flex-1 py-3 px-3 rounded-xl font-semibold text-sm transition-all duration-200
                            ${responses[question.id] === option.value
                              ? `${option.color} ring-2 ring-offset-2 ring-icce-teal shadow-medium scale-105`
                              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}
                          `}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={previousSection}
            disabled={isFirstSection}
            className="flex items-center gap-2 px-7 py-3.5 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-medium transition-all duration-200 border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-7 py-3.5 bg-icce-dark text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 shadow-soft hover:shadow-medium transition-all duration-200"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Progress'}
          </button>

          {!isLastSection ? (
            <button
              onClick={nextSection}
              className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-icce-teal to-icce-teal-dark text-white rounded-xl font-bold hover:from-icce-teal-dark hover:to-icce-teal shadow-medium hover:shadow-strong transition-all duration-200"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving || progress.answered < progress.total}
              className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-medium hover:shadow-strong transition-all duration-200"
            >
              <Send className="w-5 h-5" />
              {saving ? 'Submitting...' : 'Submit Assessment'}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center pb-6">
          <p className="text-sm text-gray-500">
            Built for <span className="font-semibold text-icce-teal">The ICCE</span> by{' '}
            <a
              href="https://openfit.care"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-icce-teal hover:text-icce-teal-dark transition-colors"
            >
              OpenFIT.care
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
