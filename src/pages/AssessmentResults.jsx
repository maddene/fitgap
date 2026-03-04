import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAssessment } from '../lib/storage';
import { calculateScores, getRating, getScoreLabel, getLowScoreQuestions } from '../lib/scoring';
import { assessmentData } from '../data/assessmentQuestions';
import { ArrowLeft, Download, BarChart3, CheckCircle, TrendingUp, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AssessmentResults() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState(null);
  const [lowScoreQuestions, setLowScoreQuestions] = useState([]);
  const [expandedRealms, setExpandedRealms] = useState([0]); // First realm expanded by default

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
        const lowScores = getLowScoreQuestions(data.responses || {}, assessmentData);
        setLowScoreQuestions(lowScores);
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

  const toggleRealm = (index) => {
    setExpandedRealms(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getRealmLowScores = (realmName) => {
    return lowScoreQuestions.filter(q => q.realm === realmName);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // ICCE Colors
    const icce_teal = [91, 196, 159]; // #5BC49F
    const icce_dark = [49, 49, 49]; // #313131

    // Calculate overall rating
    const overallRating = getRating(scores.overall.percentage);

    // Header with ICCE branding
    doc.setFontSize(24);
    doc.setTextColor(icce_dark[0], icce_dark[1], icce_dark[2]);
    doc.setFont(undefined, 'bold');
    doc.text('FITGAP Assessment Results', pageWidth / 2, yPos, { align: 'center' });

    yPos += 12;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);

    // Organization and Assessor Info
    doc.text(`Organization: ${assessment.organizationName}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    doc.text(`Assessor: ${assessment.assessorName}`, pageWidth / 2, yPos, { align: 'center' });

    if (assessment.completedAt) {
      yPos += 6;
      const completedDate = new Date(assessment.completedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Completed: ${completedDate}`, pageWidth / 2, yPos, { align: 'center' });
    }

    yPos += 15;

    // Overall Score Section
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(icce_dark[0], icce_dark[1], icce_dark[2]);
    doc.text('Overall FITGAP Score', 14, yPos);

    yPos += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');

    const overallData = [
      ['Percentage', 'Rating', 'Score', 'Total Questions'],
      [
        `${scores.overall.percentage}%`,
        overallRating.level,
        `${scores.overall.score} / ${scores.overall.possible}`,
        `${scores.overall.questions}`
      ]
    ];

    doc.autoTable({
      startY: yPos,
      head: [overallData[0]],
      body: [overallData[1]],
      theme: 'grid',
      headStyles: {
        fillColor: icce_teal,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 10
      },
      margin: { left: 14, right: 14 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Areas Needing Attention (Low Scores)
    if (lowScoreQuestions.length > 0) {
      // Check if we need a new page
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(220, 38, 38); // Red color
      doc.text('Areas Needing Attention', 14, yPos);

      yPos += 7;
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Individual questions scoring 3 or below require development', 14, yPos);

      yPos += 8;

      const lowScoreHeaders = ['Question', 'Text', 'Realm', 'Section', 'Score'];
      const lowScoreRows = lowScoreQuestions.map((item) => [
        `Q${item.questionId}`,
        item.questionText.length > 60 ? item.questionText.substring(0, 57) + '...' : item.questionText,
        item.realm,
        item.section,
        `${item.score} - ${getScoreLabel(item.score)}`
      ]);

      doc.autoTable({
        startY: yPos,
        head: [lowScoreHeaders],
        body: lowScoreRows,
        theme: 'striped',
        headStyles: {
          fillColor: [220, 38, 38], // Red
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8
        },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 70 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30, halign: 'center' }
        }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Realm Scores
    scores.realms.forEach((realm, index) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      const realmRating = getRating(realm.percentage);

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(icce_dark[0], icce_dark[1], icce_dark[2]);
      doc.text(`Realm ${index + 1}: ${realm.name}`, 14, yPos);

      yPos += 7;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Version ${realm.version} • ${realm.questions} questions • ${realm.percentage}% (${realmRating.level})`, 14, yPos);

      yPos += 8;

      // Section breakdown table
      const sectionHeaders = ['Section', 'Score', 'Possible', 'Percentage', 'Rating'];
      const sectionRows = realm.sections.map((section) => {
        const sectionRating = getRating(section.percentage);
        return [
          section.name,
          section.score.toString(),
          section.possible.toString(),
          `${section.percentage}%`,
          sectionRating.level
        ];
      });

      doc.autoTable({
        startY: yPos,
        head: [sectionHeaders],
        body: sectionRows,
        theme: 'striped',
        headStyles: {
          fillColor: icce_teal,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 9
        },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 30, halign: 'center' }
        }
      });

      yPos = doc.lastAutoTable.finalY + 12;
    });

    // Scoring Guide on new page
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(icce_dark[0], icce_dark[1], icce_dark[2]);
    doc.text('Scoring Guide', 14, yPos);

    yPos += 10;

    const guideData = [
      ['Average Score', 'Rating', 'Description'],
      ['4.0 - 5.0 (90%+)', 'On Track', 'Strong FIT implementation'],
      ['3.0 - 3.9 (75-89%)', 'Limited', 'Developing FIT practice'],
      ['Below 3.0 (<75%)', 'Low Congruence', 'Needs FIT development']
    ];

    doc.autoTable({
      startY: yPos,
      head: [guideData[0]],
      body: guideData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: icce_teal,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 10
      },
      margin: { left: 14, right: 14 }
    });

    // Generate filename
    const dateStr = assessment.completedAt
      ? new Date(assessment.completedAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    const filename = `FITGAP-Assessment-${assessment.organizationName.replace(/\s+/g, '-')}-${dateStr}.pdf`;

    // Save the PDF
    doc.save(filename);
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

        {/* Realm Scores with Accordion */}
        <div className="space-y-6">
          {scores.realms.map((realm, index) => {
            const realmRating = getRating(realm.percentage);
            const isExpanded = expandedRealms.includes(index);
            const realmLowScores = getRealmLowScores(realm.name);

            return (
              <div key={realm.id} className="bg-white rounded-2xl shadow-medium overflow-hidden">
                {/* Accordion Header - Clickable */}
                <button
                  onClick={() => toggleRealm(index)}
                  className={`w-full border-l-4 ${realmRating.borderColor} p-6 hover:bg-gray-50 transition-colors text-left`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-icce-dark">
                          Realm {index + 1}: {realm.name}
                        </h3>
                        {realmLowScores.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            {realmLowScores.length}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Version {realm.version} • {realm.questions} questions
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${realmRating.color}`}>
                          {realm.percentage}%
                        </div>
                        <div className={`text-sm font-semibold ${realmRating.color}`}>
                          {realmRating.level}
                        </div>
                      </div>
                      <div className="flex-none pt-1">
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">
                      <span>Score: {realm.score} / {realm.possible}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${realmRating.bgColor.replace('/20', '')} transition-all duration-500`}
                        style={{ width: `${realm.percentage}%` }}
                      />
                    </div>
                  </div>
                </button>

                {/* Accordion Content - Expandable */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <div className="p-6 space-y-6">
                      {/* Section Breakdown */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                          Section Breakdown
                        </h4>
                        <div className="space-y-3">
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

                      {/* Areas Needing Attention Within This Realm */}
                      {realmLowScores.length > 0 && (
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-red-900">Areas Needing Attention</h4>
                              <p className="text-xs text-red-700">Questions scoring 3 or below in this realm</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {realmLowScores.map((item, idx) => (
                              <div key={idx} className="border-l-4 border-red-500 bg-white p-4 rounded-r-lg">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">
                                      {item.section}
                                    </div>
                                    <div className="text-sm font-medium text-gray-900 mb-1">
                                      Question {item.questionId}
                                    </div>
                                    <p className="text-sm text-gray-700">{item.questionText}</p>
                                  </div>
                                  <div className="flex-none text-center">
                                    <div className="text-2xl font-bold text-red-700">{item.score}</div>
                                    <div className="text-xs text-red-600">{getScoreLabel(item.score)}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl shadow-medium p-6 mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Scoring Guide</h3>
          <p className="text-sm text-gray-600 mb-4">
            Based on average score across answered questions (0-4 scale)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { range: '4.0 - 5.0', percent: '90%+', level: 'On Track', desc: 'Strong FIT implementation', color: 'bg-icce-teal/20 text-icce-teal border-icce-teal' },
              { range: '3.0 - 3.9', percent: '75-89%', level: 'Limited', desc: 'Developing FIT practice', color: 'bg-yellow-100 text-yellow-700 border-yellow-500' },
              { range: 'Below 3.0', percent: '<75%', level: 'Low Congruence', desc: 'Needs FIT development', color: 'bg-red-100 text-red-700 border-red-500' }
            ].map(item => (
              <div key={item.range} className={`border-l-4 ${item.color} p-4 rounded-lg`}>
                <div className="font-bold text-base">{item.level}</div>
                <div className="text-sm opacity-75 mt-1">Average: {item.range}</div>
                <div className="text-sm opacity-75">({item.percent})</div>
                <div className="text-sm mt-2">{item.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Individual questions scoring 3 or below should be highlighted for attention and development, regardless of overall average.
            </p>
          </div>
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
