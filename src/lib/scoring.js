// FITGAP Scoring Utilities

/**
 * Calculate scores for a completed assessment
 * @param {Object} responses - Object with question IDs as keys and scores as values
 * @param {Object} assessmentData - The assessment questions data structure
 * @returns {Object} Scoring results broken down by realm and overall
 */
export const calculateScores = (responses, assessmentData) => {
  const realmScores = [];
  let totalScore = 0;
  let totalPossible = 0;
  let totalQuestions = 0;

  assessmentData.realms.forEach(realm => {
    let realmTotal = 0;
    let realmPossible = 0;
    let realmQuestions = 0;

    const sectionScores = [];

    realm.sections.forEach(section => {
      let sectionTotal = 0;
      let sectionPossible = 0;
      let sectionQuestions = 0;

      section.questions.forEach(question => {
        // Handle questions with subquestions
        if (question.subQuestions && question.subQuestions.length > 0) {
          question.subQuestions.forEach(subQ => {
            const response = responses[subQ.id];
            // Skip N/A (null) responses - they don't count towards score or total
            if (response !== null && response !== undefined) {
              const score = response || 0;
              sectionTotal += score;
              sectionPossible += 4; // Max score is 4 (0-4 scale)
              sectionQuestions++;
            }
          });
        } else {
          const response = responses[question.id];
          // Skip N/A (null) responses - they don't count towards score or total
          if (response !== null && response !== undefined) {
            const score = response || 0;
            sectionTotal += score;
            sectionPossible += 4; // Max score is 4 (0-4 scale)
            sectionQuestions++;
          }
        }
      });

      sectionScores.push({
        name: section.name,
        score: sectionTotal,
        possible: sectionPossible,
        questions: sectionQuestions,
        percentage: sectionPossible > 0 ? Math.round((sectionTotal / sectionPossible) * 100) : 0
      });

      realmTotal += sectionTotal;
      realmPossible += sectionPossible;
      realmQuestions += sectionQuestions;
    });

    realmScores.push({
      id: realm.id,
      name: realm.name,
      version: realm.version,
      score: realmTotal,
      possible: realmPossible,
      questions: realmQuestions,
      percentage: realmPossible > 0 ? Math.round((realmTotal / realmPossible) * 100) : 0,
      sections: sectionScores
    });

    totalScore += realmTotal;
    totalPossible += realmPossible;
    totalQuestions += realmQuestions;
  });

  return {
    overall: {
      score: totalScore,
      possible: totalPossible,
      questions: totalQuestions,
      percentage: totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0
    },
    realms: realmScores
  };
};

/**
 * Get a descriptive rating based on average score (0-4 scale)
 * Based on Scott's benchmarks:
 * - Average 4-5: On track with FIT implementation
 * - Average ~3: Limited
 * - Below 3: Low congruence with FIT culture
 * @param {number} percentage - Score as percentage (0-100)
 * @returns {Object} Rating level and description
 */
export const getRating = (percentage) => {
  // Convert percentage back to 0-4 scale average for interpretation
  const avgScore = (percentage / 100) * 4;

  if (avgScore >= 3.6) { // ~90%+ (4-5 average range)
    return {
      level: 'On Track',
      description: 'Strong FIT implementation',
      color: 'text-icce-teal',
      bgColor: 'bg-icce-teal/20',
      borderColor: 'border-icce-teal'
    };
  } else if (avgScore >= 3.0) { // 75-89% (~3-3.5 average)
    return {
      level: 'Limited',
      description: 'Developing FIT practice',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-500'
    };
  } else { // Below 75% (< 3 average)
    return {
      level: 'Low Congruence',
      description: 'Needs FIT development',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-500'
    };
  }
};

/**
 * Get score label for individual question score
 * @param {number} score - Score value (0-4)
 * @returns {string} Label text
 */
export const getScoreLabel = (score) => {
  const labels = {
    0: 'Not at all',
    1: 'Minimally',
    2: 'Moderately',
    3: 'Substantially',
    4: 'Completely'
  };
  return labels[score] || 'Not answered';
};

/**
 * Check if an individual score needs attention (3 or below)
 * @param {number} score - Score value (0-4)
 * @returns {boolean} True if score is 3 or below
 */
export const isLowScore = (score) => {
  return score !== null && score !== undefined && score <= 3;
};

/**
 * Get all low-scoring questions from responses
 * @param {Object} responses - Object with question IDs as keys and scores as values
 * @param {Object} assessmentData - The assessment questions data structure
 * @returns {Array} Array of low-scoring questions with details
 */
export const getLowScoreQuestions = (responses, assessmentData) => {
  const lowScores = [];

  assessmentData.realms.forEach((realm) => {
    realm.sections.forEach((section) => {
      section.questions.forEach((question) => {
        if (question.subQuestions && question.subQuestions.length > 0) {
          question.subQuestions.forEach((subQ) => {
            const score = responses[subQ.id];
            if (isLowScore(score)) {
              lowScores.push({
                questionId: subQ.id,
                questionText: subQ.text,
                score: score,
                realm: realm.name,
                section: section.name
              });
            }
          });
        } else {
          const score = responses[question.id];
          if (isLowScore(score)) {
            lowScores.push({
              questionId: question.id,
              questionText: question.text,
              score: score,
              realm: realm.name,
              section: section.name
            });
          }
        }
      });
    });
  });

  return lowScores;
};
