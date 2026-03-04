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
            const score = responses[subQ.id] || 0;
            sectionTotal += score;
            sectionPossible += 4; // Max score is 4 (0-4 scale)
            sectionQuestions++;
          });
        } else {
          const score = responses[question.id] || 0;
          sectionTotal += score;
          sectionPossible += 4; // Max score is 4 (0-4 scale)
          sectionQuestions++;
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
 * Get a descriptive rating based on percentage score
 * @param {number} percentage - Score as percentage (0-100)
 * @returns {Object} Rating level and description
 */
export const getRating = (percentage) => {
  if (percentage >= 90) {
    return {
      level: 'Excellent',
      description: 'Yes, Fully Always',
      color: 'text-icce-teal',
      bgColor: 'bg-icce-teal/20',
      borderColor: 'border-icce-teal'
    };
  } else if (percentage >= 70) {
    return {
      level: 'Good',
      description: 'Mostly, Regularly',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-100',
      borderColor: 'border-emerald-500'
    };
  } else if (percentage >= 50) {
    return {
      level: 'Moderate',
      description: 'Partially, Frequently',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-500'
    };
  } else if (percentage >= 30) {
    return {
      level: 'Limited',
      description: 'Very Limited, Not Often',
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-500'
    };
  } else {
    return {
      level: 'Minimal',
      description: 'No, None, Never',
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
