import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { assessmentData, getAllQuestions } from '../data/assessmentQuestions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ArrowLeft, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AssessmentResults() {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    loadAssessmentResults();
  }, [id]);

  const loadAssessmentResults = async () => {
    try {
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', id)
        .single();

      if (assessmentError) throw assessmentError;
      setAssessment(assessmentData);

      const { data: responseData, error: responseError } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('assessment_id', id);

      if (responseError) throw responseError;
      setResponses(responseData || []);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRealmScores = () => {
    const realmScores = {};

    assessmentData.realms.forEach((realm) => {
      const realmQuestions = [];

      realm.sections.forEach((section) => {
        section.questions.forEach((question) => {
          realmQuestions.push(question.id.toString());

          if (question.subQuestions) {
            question.subQuestions.forEach((subQ) => {
              realmQuestions.push(subQ.id);
            });
          }
        });
      });

      const realmResponses = responses.filter(
        (r) => realmQuestions.includes(r.question_id) && r.score !== 'NA' && r.score
      );

      const numericScores = realmResponses
        .map((r) => parseInt(r.score))
        .filter((s) => !isNaN(s));

      const total = numericScores.reduce((sum, score) => sum + score, 0);
      const average = numericScores.length > 0 ? total / numericScores.length : 0;
      const maxPossible = numericScores.length * 5;
      const percentage = maxPossible > 0 ? (total / maxPossible) * 100 : 0;

      realmScores[realm.id] = {
        name: realm.name,
        average: average.toFixed(2),
        total,
        answered: numericScores.length,
        totalQuestions: realmQuestions.length,
        percentage: percentage.toFixed(1),
      };
    });

    return realmScores;
  };

  const getChartData = () => {
    const realmScores = calculateRealmScores();
    return Object.values(realmScores).map((realm) => ({
      name: realm.name.substring(0, 20),
      score: parseFloat(realm.average),
      percentage: parseFloat(realm.percentage),
    }));
  };

  const getRadarData = () => {
    const realmScores = calculateRealmScores();
    return Object.values(realmScores).map((realm) => ({
      realm: realm.name.split(' ')[0],
      score: parseFloat(realm.average),
      fullMark: 5,
    }));
  };

  const getOverallScore = () => {
    const numericResponses = responses.filter(
      (r) => r.score !== 'NA' && r.score && !isNaN(parseInt(r.score))
    );

    if (numericResponses.length === 0) return { average: 0, total: 0, percentage: 0 };

    const total = numericResponses.reduce((sum, r) => sum + parseInt(r.score), 0);
    const average = total / numericResponses.length;
    const maxPossible = numericResponses.length * 5;
    const percentage = (total / maxPossible) * 100;

    return {
      average: average.toFixed(2),
      total,
      answered: numericResponses.length,
      percentage: percentage.toFixed(1),
    };
  };

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`FITGAP-Assessment-${assessment.organization_name || 'Results'}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Assessment not found</p>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const realmScores = calculateRealmScores();
  const overallScore = getOverallScore();
  const chartData = getChartData();
  const radarData = getRadarData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <button
            onClick={exportToPDF}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>

        <div ref={contentRef} className="space-y-6">
          {/* Assessment Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              FITGAP Assessment Results
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Organization</p>
                <p className="font-medium">{assessment.organization_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Assessor</p>
                <p className="font-medium">{assessment.assessor_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="font-medium">
                  {assessment.completed_at
                    ? new Date(assessment.completed_at).toLocaleDateString()
                    : 'In Progress'}
                </p>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Score</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-blue-600">{overallScore.average}</p>
                <p className="text-xs text-gray-500">out of 5.00</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-3xl font-bold text-green-600">{overallScore.total}</p>
                <p className="text-xs text-gray-500">points earned</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Percentage</p>
                <p className="text-3xl font-bold text-purple-600">{overallScore.percentage}%</p>
                <p className="text-xs text-gray-500">of maximum</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Questions Answered</p>
                <p className="text-3xl font-bold text-gray-700">{overallScore.answered}</p>
                <p className="text-xs text-gray-500">numeric responses</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Realm Scores</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#3B82F6" name="Average Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Radar</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="realm" />
                  <PolarRadiusAxis domain={[0, 5]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Realm Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Realm Breakdown</h2>
            <div className="space-y-4">
              {Object.values(realmScores).map((realm, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{realm.name}</h3>
                    <span className="text-lg font-bold text-blue-600">{realm.average}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${realm.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {realm.answered} questions answered • {realm.percentage}% of maximum
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Responses */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Responses</h2>
            {assessmentData.realms.map((realm) => (
              <div key={realm.id} className="mb-6 last:mb-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b-2 border-gray-200">
                  {realm.name}
                </h3>
                {realm.sections.map((section) => (
                  <div key={section.id} className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">{section.name}</h4>
                    <div className="space-y-3">
                      {section.questions.map((question) => {
                        const response = responses.find(
                          (r) => r.question_id === question.id.toString()
                        );
                        return (
                          <div key={question.id} className="ml-4 text-sm">
                            <p className="text-gray-700 mb-1">
                              {question.id}. {question.text}
                            </p>
                            <p className="text-gray-900 font-medium">
                              Score: {response?.score || 'Not answered'}
                            </p>
                            {response?.notes && (
                              <p className="text-gray-600 italic mt-1">
                                Note: {response.notes}
                              </p>
                            )}
                            {question.subQuestions && (
                              <div className="ml-4 mt-2 space-y-2">
                                {question.subQuestions.map((subQ) => {
                                  const subResponse = responses.find(
                                    (r) => r.question_id === subQ.id
                                  );
                                  return (
                                    <div key={subQ.id}>
                                      <p className="text-gray-700">{subQ.id}. {subQ.text}</p>
                                      <p className="text-gray-900 font-medium">
                                        Score: {subResponse?.score || 'Not answered'}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
