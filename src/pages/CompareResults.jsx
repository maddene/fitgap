import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { listUserAssessments } from '../lib/storage';
import { compareAssessments } from '../lib/comparison';
import { getRating } from '../lib/scoring';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function CompareResults() {
  const { orgName } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState(null);
  const [orgAssessments, setOrgAssessments] = useState([]);

  useEffect(() => {
    if (user && orgName) {
      loadAndCompare();
    }
  }, [user, orgName]);

  const loadAndCompare = async () => {
    try {
      const allAssessments = await listUserAssessments(user.id);
      const decodedOrgName = decodeURIComponent(orgName);

      // Filter completed assessments for this organization
      const filtered = allAssessments
        .filter(a => a.organizationName === decodedOrgName && a.status === 'completed')
        .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

      if (filtered.length < 2) {
        alert('Need at least 2 completed assessments to compare');
        navigate('/dashboard');
        return;
      }

      setOrgAssessments(filtered);
      const comparison = compareAssessments(filtered);
      setComparisonData(comparison);
    } catch (error) {
      console.error('Error loading assessments:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    const icce_teal = [91, 196, 159];
    const icce_dark = [49, 49, 49];
    const decodedOrgName = decodeURIComponent(orgName);

    // Header
    doc.setFontSize(24);
    doc.setTextColor(icce_dark[0], icce_dark[1], icce_dark[2]);
    doc.setFont(undefined, 'bold');
    doc.text('Assessment Comparison Report', pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(decodedOrgName, pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${orgAssessments.length} Assessments Compared`, pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;

    // Overall Trend
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(icce_dark[0], icce_dark[1], icce_dark[2]);
    doc.text('Overall Score Trend', 14, yPos);
    yPos += 10;

    const trendData = overallTrend.map((item, index) => [
      `Assessment ${index + 1}`,
      new Date(orgAssessments[index].completedAt).toLocaleDateString(),
      `${item.percentage}%`
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Assessment', 'Date', 'Score']],
      body: trendData,
      theme: 'grid',
      headStyles: { fillColor: icce_teal, textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Realm Trends
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Realm Score Trends', 14, yPos);
    yPos += 10;

    realmTrends.forEach((realm) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(realm.realmName, 14, yPos);
      yPos += 8;

      const realmData = realm.trend.map((item, index) => [
        `Assessment ${index + 1}`,
        `${item.percentage}%`
      ]);

      doc.autoTable({
        startY: yPos,
        head: [['Assessment', 'Score']],
        body: realmData,
        theme: 'grid',
        headStyles: { fillColor: icce_teal, textColor: [255, 255, 255], fontSize: 9 },
        margin: { left: 20 }
      });

      yPos = doc.lastAutoTable.finalY + 10;
    });

    // Save PDF
    const fileName = `${decodedOrgName.replace(/[^a-z0-9]/gi, '_')}_Comparison_${new Date().toLocaleDateString()}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-icce-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-icce-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (!comparisonData) {
    return null;
  }

  const { overallTrend, realmTrends, deltas, questionChanges } = comparisonData;
  const decodedOrgName = decodeURIComponent(orgName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-icce-gray py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-icce-teal hover:text-icce-teal-dark font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-icce-teal to-icce-teal-dark text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
            >
              <Download className="w-5 h-5" />
              Export PDF
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-medium p-8">
            <h1 className="text-4xl font-bold text-icce-dark mb-2 tracking-tight">Assessment Comparison</h1>
            <p className="text-xl text-gray-600">
              <span className="font-semibold text-icce-teal">{decodedOrgName}</span>
              {' • '}
              {orgAssessments.length} assessments
            </p>
          </div>
        </div>

        {/* Overall Trend Chart */}
        <div className="bg-white rounded-2xl shadow-medium p-8 mb-8">
          <h2 className="text-2xl font-bold text-icce-dark mb-6">Overall Score Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overallTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border-2 border-icce-teal rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900">{payload[0].payload.date}</p>
                        <p className="text-sm text-gray-600">by {payload[0].payload.assessor}</p>
                        <p className="text-lg font-bold text-icce-teal mt-1">{payload[0].value}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#5BC49F"
                strokeWidth={3}
                dot={{ fill: '#5BC49F', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Latest vs Previous Delta */}
          {deltas.overall && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Previous</p>
                  <p className="text-3xl font-bold text-gray-700">{deltas.overall.previous}%</p>
                </div>
                <div className="flex items-center">
                  {deltas.overall.improved ? (
                    <ArrowUp className="w-8 h-8 text-green-600" />
                  ) : deltas.overall.delta < 0 ? (
                    <ArrowDown className="w-8 h-8 text-red-600" />
                  ) : (
                    <Minus className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Latest</p>
                  <p className="text-3xl font-bold text-icce-teal">{deltas.overall.current}%</p>
                </div>
                <div className="text-center ml-4">
                  <p className="text-sm text-gray-600 mb-1">Change</p>
                  <p className={`text-2xl font-bold ${deltas.overall.delta > 0 ? 'text-green-600' : deltas.overall.delta < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {deltas.overall.delta > 0 && '+'}{deltas.overall.delta}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Realm Comparisons */}
        <div className="bg-white rounded-2xl shadow-medium p-8 mb-8">
          <h2 className="text-2xl font-bold text-icce-dark mb-6">Realm Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {realmTrends.map((realmTrend) => {
              const realmDelta = deltas.realms.find(d => d.realmId === realmTrend.realmId);
              return (
                <div key={realmTrend.realmId} className="border border-gray-200 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-icce-dark mb-4">{realmTrend.realmName}</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={realmTrend.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="percentage"
                        stroke="#5BC49F"
                        strokeWidth={2}
                        dot={{ fill: '#5BC49F', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  {realmDelta && (
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-gray-600">Latest Change:</span>
                      <div className="flex items-center gap-2">
                        {realmDelta.delta > 0 ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-green-600">+{realmDelta.delta}%</span>
                          </>
                        ) : realmDelta.delta < 0 ? (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-600" />
                            <span className="font-bold text-red-600">{realmDelta.delta}%</span>
                          </>
                        ) : (
                          <span className="font-bold text-gray-400">No change</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Biggest Changes */}
        {questionChanges.length > 0 && (
          <div className="bg-white rounded-2xl shadow-medium p-8">
            <h2 className="text-2xl font-bold text-icce-dark mb-6">Top Question Changes</h2>
            <p className="text-sm text-gray-600 mb-4">
              Comparing most recent assessment to previous one
            </p>
            <div className="space-y-3">
              {questionChanges.map((change, idx) => (
                <div
                  key={idx}
                  className={`border-l-4 ${change.improved ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'} p-4 rounded-r-lg`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: change.improved ? '#059669' : '#dc2626' }}>
                        {change.realm} • {change.section}
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        Q{change.questionId}
                      </div>
                      <p className="text-sm text-gray-700">{change.questionText}</p>
                    </div>
                    <div className="flex-none text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-600">{change.previousScore}</span>
                        {change.improved ? (
                          <ArrowUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm font-bold text-gray-900">{change.latestScore}</span>
                      </div>
                      <div className={`text-lg font-bold ${change.improved ? 'text-green-600' : 'text-red-600'}`}>
                        {change.delta > 0 && '+'}{change.delta}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
