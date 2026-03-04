// Assessment Comparison Utilities

import { calculateScores } from './scoring';
import { assessmentData } from '../data/assessmentQuestions';

/**
 * Compare multiple assessments for the same organization
 * @param {Array} assessments - Array of assessment objects (sorted by date)
 * @returns {Object} Comparison data with trends and deltas
 */
export const compareAssessments = (assessments) => {
  // Calculate scores for each assessment
  const assessmentScores = assessments.map(assessment => ({
    id: assessment.id,
    assessorName: assessment.assessorName,
    completedAt: assessment.completedAt,
    scores: calculateScores(assessment.responses || {}, assessmentData)
  }));

  // Calculate overall trend
  const overallTrend = assessmentScores.map((item, index) => ({
    date: new Date(item.completedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    assessor: item.assessorName,
    percentage: item.scores.overall.percentage,
    index
  }));

  // Calculate realm trends
  const realmTrends = assessmentData.realms.map(realm => {
    const trend = assessmentScores.map((item, index) => {
      const realmScore = item.scores.realms.find(r => r.id === realm.id);
      return {
        date: new Date(item.completedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        assessor: item.assessorName,
        percentage: realmScore ? realmScore.percentage : 0,
        index
      };
    });

    return {
      realmId: realm.id,
      realmName: realm.name,
      trend
    };
  });

  // Calculate deltas (most recent vs previous)
  const deltas = {
    overall: null,
    realms: []
  };

  if (assessmentScores.length >= 2) {
    const latest = assessmentScores[assessmentScores.length - 1];
    const previous = assessmentScores[assessmentScores.length - 2];

    deltas.overall = {
      current: latest.scores.overall.percentage,
      previous: previous.scores.overall.percentage,
      delta: latest.scores.overall.percentage - previous.scores.overall.percentage,
      improved: latest.scores.overall.percentage > previous.scores.overall.percentage
    };

    deltas.realms = assessmentData.realms.map(realm => {
      const latestRealm = latest.scores.realms.find(r => r.id === realm.id);
      const previousRealm = previous.scores.realms.find(r => r.id === realm.id);

      return {
        realmId: realm.id,
        realmName: realm.name,
        current: latestRealm ? latestRealm.percentage : 0,
        previous: previousRealm ? previousRealm.percentage : 0,
        delta: (latestRealm ? latestRealm.percentage : 0) - (previousRealm ? previousRealm.percentage : 0),
        improved: (latestRealm ? latestRealm.percentage : 0) > (previousRealm ? previousRealm.percentage : 0)
      };
    });
  }

  // Find questions with biggest changes
  const questionChanges = [];
  if (assessmentScores.length >= 2) {
    const latest = assessments[assessments.length - 1];
    const previous = assessments[assessments.length - 2];

    assessmentData.realms.forEach(realm => {
      realm.sections.forEach(section => {
        section.questions.forEach(question => {
          if (question.subQuestions && question.subQuestions.length > 0) {
            question.subQuestions.forEach(subQ => {
              const latestScore = latest.responses[subQ.id];
              const previousScore = previous.responses[subQ.id];

              if (latestScore !== null && latestScore !== undefined &&
                  previousScore !== null && previousScore !== undefined) {
                const delta = latestScore - previousScore;
                if (delta !== 0) {
                  questionChanges.push({
                    questionId: subQ.id,
                    questionText: subQ.text,
                    realm: realm.name,
                    section: section.name,
                    previousScore,
                    latestScore,
                    delta,
                    improved: delta > 0
                  });
                }
              }
            });
          } else {
            const latestScore = latest.responses[question.id];
            const previousScore = previous.responses[question.id];

            if (latestScore !== null && latestScore !== undefined &&
                previousScore !== null && previousScore !== undefined) {
              const delta = latestScore - previousScore;
              if (delta !== 0) {
                questionChanges.push({
                  questionId: question.id,
                  questionText: question.text,
                  realm: realm.name,
                  section: section.name,
                  previousScore,
                  latestScore,
                  delta,
                  improved: delta > 0
                });
              }
            }
          }
        });
      });
    });

    // Sort by absolute delta (biggest changes first)
    questionChanges.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  }

  return {
    assessmentScores,
    overallTrend,
    realmTrends,
    deltas,
    questionChanges: questionChanges.slice(0, 10) // Top 10 changes
  };
};
