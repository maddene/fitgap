import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { assessmentData, getAllQuestions } from '../data/assessmentQuestions';
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';

export default function AssessmentForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentRealmIndex, setCurrentRealmIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [assessmentId, setAssessmentId] = useState(id || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assessmentInfo, setAssessmentInfo] = useState({
    organizationName: '',
    assessorName: '',
    assessorEmail: '',
  });

  const currentRealm = assessmentData.realms[currentRealmIndex];
  const allQuestions = getAllQuestions();

  useEffect(() => {
    if (assessmentId) {
      loadAssessment();
    }
  }, [assessmentId]);

  const loadAssessment = async () => {
    setLoading(true);
    try {
      // Load assessment details
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (assessmentError) throw assessmentError;

      setAssessmentInfo({
        organizationName: assessment.organization_name || '',
        assessorName: assessment.assessor_name || '',
        assessorEmail: assessment.assessor_email || '',
      });

      // Load responses
      const { data: responseData, error: responseError } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('assessment_id', assessmentId);

      if (responseError) throw responseError;

      const responseMap = {};
      responseData.forEach((r) => {
        responseMap[r.question_id] = {
          score: r.score,
          notes: r.notes || '',
        };
      });
      setResponses(responseMap);
    } catch (error) {
      console.error('Error loading assessment:', error);
      alert('Error loading assessment');
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateAssessment = async () => {
    if (!assessmentId) {
      // Create new assessment
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          organization_name: assessmentInfo.organizationName,
          assessor_name: assessmentInfo.assessorName,
          assessor_email: assessmentInfo.assessorEmail,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      setAssessmentId(data.id);
      return data.id;
    } else {
      // Update existing assessment info
      const { error } = await supabase
        .from('assessments')
        .update({
          organization_name: assessmentInfo.organizationName,
          assessor_name: assessmentInfo.assessorName,
          assessor_email: assessmentInfo.assessorEmail,
        })
        .eq('id', assessmentId);

      if (error) throw error;
      return assessmentId;
    }
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      const currentAssessmentId = await createOrUpdateAssessment();

      // Save all responses
      for (const [questionId, response] of Object.entries(responses)) {
        if (response.score || response.notes) {
          await supabase.from('assessment_responses').upsert({
            assessment_id: currentAssessmentId,
            question_id: questionId,
            score: response.score,
            notes: response.notes,
          });
        }
      }

      alert('Progress saved successfully!');
    } catch (error) {
      console.error('Error saving progress:', error);
      alert('Error saving progress');
    } finally {
      setSaving(false);
    }
  };

  const submitAssessment = async () => {
    setSaving(true);
    try {
      const currentAssessmentId = await createOrUpdateAssessment();

      // Save all responses
      for (const [questionId, response] of Object.entries(responses)) {
        if (response.score || response.notes) {
          await supabase.from('assessment_responses').upsert({
            assessment_id: currentAssessmentId,
            question_id: questionId,
            score: response.score,
            notes: response.notes,
          });
        }
      }

      // Mark as completed
      await supabase
        .from('assessments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', currentAssessmentId);

      alert('Assessment submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Error submitting assessment');
    } finally {
      setSaving(false);
    }
  };

  const handleResponseChange = (questionId, field, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [field]: value,
      },
    }));
  };

  const getQuestionResponse = (questionId) => {
    return responses[questionId] || { score: '', notes: '' };
  };

  const renderQuestion = (question, index) => {
    const response = getQuestionResponse(question.id.toString());

    return (
      <div key={question.id} className="border-b border-gray-200 pb-6 mb-6 last:border-b-0">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {index + 1}. {question.text}
          </label>
          <div className="flex flex-wrap gap-2">
            {assessmentData.scaleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleResponseChange(question.id.toString(), 'score', option.value.toString())}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  response.score === option.value.toString()
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {response.score && assessmentData.scaleOptions.find(o => o.value.toString() === response.score)?.description}
          </div>
        </div>

        {question.subQuestions && (
          <div className="ml-6 space-y-4">
            {question.subQuestions.map((subQ, subIndex) => {
              const subResponse = getQuestionResponse(subQ.id);
              return (
                <div key={subQ.id} className="border-l-2 border-gray-200 pl-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {String.fromCharCode(97 + subIndex)}. {subQ.text}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {assessmentData.scaleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleResponseChange(subQ.id, 'score', option.value.toString())}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          subResponse.score === option.value.toString()
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            rows={2}
            value={response.notes}
            onChange={(e) => handleResponseChange(question.id.toString(), 'notes', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Add any additional notes..."
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            FITGAP Assessment Tool
          </h1>
          <p className="text-sm text-gray-600">
            Feedback-Informed Treatment GAP Assessment (Version 2.0)
          </p>

          {!assessmentId && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={assessmentInfo.organizationName}
                  onChange={(e) => setAssessmentInfo({ ...assessmentInfo, organizationName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assessor Name
                </label>
                <input
                  type="text"
                  value={assessmentInfo.assessorName}
                  onChange={(e) => setAssessmentInfo({ ...assessmentInfo, assessorName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assessor Email
                </label>
                <input
                  type="email"
                  value={assessmentInfo.assessorEmail}
                  onChange={(e) => setAssessmentInfo({ ...assessmentInfo, assessorEmail: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Realm {currentRealmIndex + 1} of {assessmentData.realms.length}
            </span>
            <span className="text-sm text-gray-500">
              {Object.keys(responses).length} / {allQuestions.length} questions answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentRealmIndex + 1) / assessmentData.realms.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Realm */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Realm {currentRealmIndex + 1}: {currentRealm.name}
          </h2>
          <p className="text-sm text-gray-500 mb-6">Version {currentRealm.version}</p>

          {currentRealm.sections.map((section, sectionIndex) => (
            <div key={section.id} className="mb-8 last:mb-0">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
                {section.name}
              </h3>
              {section.questions.map((question, qIndex) =>
                renderQuestion(question, sectionIndex === 0 && qIndex === 0 ? 0 : section.questions.slice(0, qIndex).reduce((acc, q) => acc + 1 + (q.subQuestions?.length || 0), 0))
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
          <button
            onClick={() => setCurrentRealmIndex(Math.max(0, currentRealmIndex - 1))}
            disabled={currentRealmIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Realm
          </button>

          <div className="flex gap-2">
            <button
              onClick={saveProgress}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Progress'}
            </button>

            {currentRealmIndex === assessmentData.realms.length - 1 ? (
              <button
                onClick={submitAssessment}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {saving ? 'Submitting...' : 'Submit Assessment'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentRealmIndex(Math.min(assessmentData.realms.length - 1, currentRealmIndex + 1))}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Next Realm
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
