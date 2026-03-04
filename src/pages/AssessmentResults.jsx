import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAssessment } from '../lib/storage';
import { calculateScores, getRating, getScoreLabel } from '../lib/scoring';
import { assessmentData } from '../data/assessmentQuestions';
import { ArrowLeft, Download, BarChart3, CheckCircle, TrendingUp } from 'lucide-react';

export default function AssessmentResults() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState(null);

  useEffect(() => {
    if (id && user) {
      loadAssessment();
    }
  }, [id, user]);

  const loadAssessment = async () => {
    try {
      const data = await getAssessment(user.id, id);
      if (data) {
        setAssessment(data);
        const calculatedScores = calculateScores(data.responses || {}, assessmentData);
        setScores(calculatedScores);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert('PDF export coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-icce-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-icce-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!assessment || !scores) {
    return null;
  }

  const overallRating = getRating(scores.overall.percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-icce-gray py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-icce-teal hover:text-icce-teal-dark font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-2xl shadow-medium p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold text-icce-dark mb-2 tracking-tight">Assessment Results</h1>
                <p className="text-gray-600 text-lg">
                  <span className="font-semibold text-icce-teal">{assessment.organizationName}</span>
                  {' • '}
                  {assessment.assessorName}
                </p>
                {assessment.completedAt && (
                  <p className="text-sm text-gray-500 mt-1">
                    Completed: {new Date(assessment.completedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-6 py-3 bg-icce-dark text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-soft"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-2xl shadow-medium p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-icce-teal to-icce-teal-dark rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-icce-dark">Overall FITGAP Score</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${overallRating.color} mb-2`}>
                {scores.overall.percentage}%
              </div>
              <div className={`inline-block px-4 py-2 rounded-lg ${overallRating.bgColor} ${overallRating.color} font-semibold`}>
                {overallRating.level}
              </div>
            </div>
            <div className="md:col-span-3 flex items-center">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-600">Total Score</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {scores.overall.score} / {scores.overall.possible}
                  </span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-icce-teal to-icce-teal-dark transition-all duration-500"
                    style={{ width: `${scores.overall.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Based on {scores.overall.questions} questions across 4 realms
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Realm Scores */}
        <div className="space-y-6">
          {scores.realms.map((realm, index) => {
            const realmRating = getRating(realm.percentage);
            return (
              <div key={realm.id} className="bg-white rounded-2xl shadow-medium overflow-hidden">
                <div className={`border-l-4 ${realmRating.borderColor} p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-icce-dark">
                        Realm {index + 1}: {realm.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Version {realm.version} • {realm.questions} questions
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${realmRating.color}`}>
                        {realm.percentage}%
                      </div>
                      <div className={`text-sm font-semibold ${realmRating.color}`}>
                        {realmRating.level}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Score: {realm.score} / {realm.possible}</span>
                      <span>{realm.percentage}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${realmRating.bgColor.replace('/20', '')} transition-all duration-500`}
                        style={{ width: `${realm.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Section Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Section Breakdown
                    </h4>
                    {realm.sections.map((section) => {
                      const sectionRating = getRating(section.percentage);
                      return (
                        <div key={section.name} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">{section.name}</span>
                            <span className={`font-semibold ${sectionRating.color}`}>
                              {section.percentage}%
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${sectionRating.bgColor.replace('/20', '')} transition-all duration-300`}
                                style={{ width: `${section.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-20 text-right">
                              {section.score} / {section.possible}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl shadow-medium p-6 mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Scoring Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { range: '90-100%', level: 'Excellent', desc: 'Yes, Fully Always', color: 'bg-icce-teal/20 text-icce-teal border-icce-teal' },
              { range: '70-89%', level: 'Good', desc: 'Mostly, Regularly', color: 'bg-emerald-100 text-emerald-700 border-emerald-500' },
              { range: '50-69%', level: 'Moderate', desc: 'Partially, Frequently', color: 'bg-yellow-100 text-yellow-700 border-yellow-500' },
              { range: '30-49%', level: 'Limited', desc: 'Very Limited, Not Often', color: 'bg-orange-100 text-orange-700 border-orange-500' },
              { range: '0-29%', level: 'Minimal', desc: 'No, None, Never', color: 'bg-red-100 text-red-700 border-red-500' }
            ].map(item => (
              <div key={item.range} className={`border-l-4 ${item.color} p-3 rounded-lg`}>
                <div className="font-bold text-sm">{item.level}</div>
                <div className="text-xs opacity-75">{item.range}</div>
                <div className="text-xs mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
