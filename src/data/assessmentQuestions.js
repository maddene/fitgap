export const assessmentData = {
  realms: [
    {
      id: 'clinical',
      name: 'CLINICAL',
      version: '2.0',
      sections: [
        {
          id: 'helpers',
          name: 'Helpers',
          questions: [
            {
              id: 1,
              text: 'Administer and score the Outcome Rating Scale (ORS) and Session Rating Scale (SRS) together with the client (and/or collateral rater) at each visit or "unit of service."'
            },
            {
              id: 2,
              text: 'Compare client score on the ORS to the clinical cutoff and discuss with the client at the first visit.'
            },
            {
              id: 3,
              text: 'Compare client scores on the ORS at each visit to the "treatment response trajectory" (TRT) to determine which clients are making progress and which are at risk for a negative or null outcome.'
            },
            {
              id: 4,
              text: 'Discuss client progress (ORS) and experience of the relationship (SRS) at each visit.'
            },
            {
              id: 5,
              text: 'Use the ORS and SRS to develop and refine individualized treatment planning.'
            },
            {
              id: 6,
              text: 'Use ORS and SRS data to determine which cases need to be discussed in FIT consultation.'
            }
          ]
        },
        {
          id: 'consultation',
          name: 'Consultation & Supervision',
          questions: [
            {
              id: 7,
              text: 'FIT consultants have access to individual helper and program outcome data to facilitate the identification of "at risk" clients.'
            },
            {
              id: 8,
              text: 'Access to FIT consultation is sufficient to address the number of cases identified as "at risk" for a negative or null outcome.'
            },
            {
              id: 9,
              text: 'Any supervision beyond FIT consultation is consistent with and friendly toward FIT principles and practice.'
            },
            {
              id: 10,
              text: 'FIT consultation and other supervision provided encourage flexibility and diversity in methods, approach, and providers in order to accommodate individual client culture, preferences, and worldview.'
            }
          ]
        },
        {
          id: 'training',
          name: 'Training on FIT',
          questions: [
            {
              id: 11,
              text: 'Is based on a structured curriculum and training plan consistent with the "Core Competencies of Feedback-informed Treatment."'
            },
            {
              id: 12,
              text: 'Is available on an ongoing basis to both new and existing staff (i.e., helpers, managers, supervisors).'
            },
            {
              id: 13,
              text: 'Is offered onsite by "in house" FIT experts/champions'
            }
          ]
        },
        {
          id: 'clients',
          name: 'Client/Service Users',
          questions: [
            {
              id: 14,
              text: 'A description of and rationale for FIT (including the process and timeframe for dealing with unhelpful or undesired services) is provided at first contact.'
            },
            {
              id: 15,
              text: 'Clinical records (e.g., assessments/evaluations, correspondence, FIT SDA, progress notes) are completed in an open and collaborative manner.'
            },
            {
              id: 16,
              text: 'FIT "Service Delivery Agreement" (SDA) is organized around their priorities, goals, preferences, and progress.'
            },
            {
              id: 17,
              text: 'Level, intensity, and type of service(s) offered are informed by their initial score on the ORS.'
            },
            {
              id: 18,
              text: 'Feedback via the ORS and SRS is taken seriously and used on an ongoing basis to inform and adjust service(s).'
            }
          ]
        }
      ]
    },
    {
      id: 'administrative',
      name: 'ADMINISTRATIVE',
      version: '2.0',
      sections: [
        {
          id: 'agency',
          name: 'The Agency',
          questions: [
            {
              id: 19,
              text: 'Client/service user outcomes are a central feature of the agency\'s "Mission Statement" and strategic plan.'
            },
            {
              id: 20,
              text: 'Agency has policies and practice guidelines consistent with the principles and practice of FIT including, but not limited to:',
              subQuestions: [
                {
                  id: '20a',
                  text: 'How outcome and relationship data are collected, utilized, and shared with clients, staff, managers, and external stakeholders.'
                },
                {
                  id: '20b',
                  text: 'Using individual client outcome data (i.e., SPI [Success Probability Index] and TRT) to guide care (e.g., intensity, type, provider) and discharge planning.'
                },
                {
                  id: '20c',
                  text: 'Timing and process of ending services or transferring clients to different providers or service settings when outcome data indicate care is unhelpful.'
                },
                {
                  id: '20d',
                  text: 'Using outcome data to guide the type and funding of professional development activities.'
                }
              ]
            },
            {
              id: 21,
              text: 'Knowledge about, attitude toward, and experience using FIT are essential qualifications in the hiring of new staff and leadership'
            }
          ]
        },
        {
          id: 'management',
          name: 'Management and Leadership',
          questions: [
            {
              id: 22,
              text: 'Leadership and managers are knowledgeable about FIT and follow the evidence-based steps of implementation'
            },
            {
              id: 23,
              text: 'Leadership and managers actively lead the implementation of FIT (e.g., attending the Transition Oversight Group [TOG], establishing an implementation plan and budget, addressing barriers, and establishing an accountability framework)'
            },
            {
              id: 24,
              text: 'Leadership and managers foster a "culture of feedback" at the agency (e.g., being open and transparent, interested in and receptive to feedback from staff, supervisors, and service users)'
            },
            {
              id: 25,
              text: 'Leadership and managers ensure client feedback regarding progress and quality of the relationship is included in all clinical discussions'
            },
            {
              id: 26,
              text: 'Leadership and managers have secured support for FIT from the governing authorities (e.g., Board of Directors, funders, consumer organization, regulatory and other oversight bodies)'
            },
            {
              id: 27,
              text: 'Leadership and managers ensure agency personnel have the time available in their schedules to meaningfully and effectively utilize FIT.'
            }
          ]
        },
        {
          id: 'support',
          name: 'Support Personnel',
          questions: [
            {
              id: 28,
              text: 'Administrative staff (receptionists, administrative assistants, custodial and other non-clinical employees) have been trained in the principles of FIT'
            },
            {
              id: 29,
              text: 'Administrative staff (receptionists, administrative assistants, custodial and other non-clinical employees) embody the "culture of feedback" in their interactions with service users (e.g., are open and transparent, interested in and receptive to feedback).'
            }
          ]
        }
      ]
    },
    {
      id: 'documentation',
      name: 'DOCUMENTATION & INFORMATION TECHNOLOGY (IT)',
      version: '2.0',
      sections: [
        {
          id: 'doc-it',
          name: 'Documentation and IT',
          questions: [
            {
              id: 30,
              text: 'One of the three, authorized FIT outcome management systems has been adopted and is being used in all programs and service settings (e.g., inpatient, outpatient, in home, outreach, individual/couple/family, psychiatric and group).'
            },
            {
              id: 31,
              text: 'A specific staff member has been assigned to oversee and manage access to and organization of the outcome management system (e.g., subscriptions, licenses, and hardware purchases).'
            },
            {
              id: 32,
              text: 'Staff (e.g., helpers, supervisors, managers) are skilled in using the outcome management system.'
            },
            {
              id: 33,
              text: 'Support and training on the use of the outcome management system is easily accessible and available on an ongoing basis.'
            },
            {
              id: 34,
              text: 'Clinical documentation is consistent with and supportive of FIT principles and practice (i.e., FIT service delivery agreement and progress note).'
            },
            {
              id: 35,
              text: 'Clinical documentation (e.g., administration of the measures, development of the FIT SDA and progress note) is completed in a collaborative manner, together with clients.'
            }
          ]
        }
      ]
    },
    {
      id: 'stakeholders',
      name: 'STAKEHOLDERS',
      version: '2.0',
      sections: [
        {
          id: 'legal',
          name: 'Legal, regulatory, accreditation, and funding',
          questions: [
            {
              id: 36,
              text: 'Managers and the TOG have identified and addressed potential conflicts between the principles and practice of FIT and legal mandates, accreditation standards, and funding/funder requirements.'
            },
            {
              id: 37,
              text: 'Managers and the TOG have sought variances from legal, accreditation and funding bodies for mandates or standards representing significant barriers to FIT implementation'
            }
          ]
        },
        {
          id: 'referral',
          name: 'Referral sources',
          questions: [
            {
              id: 38,
              text: 'Managers and the TOG have informed referral sources about:',
              subQuestions: [
                {
                  id: '38a',
                  text: 'The use of FIT to determine the level and intensity of care.'
                },
                {
                  id: '38b',
                  text: 'Their potential role as "collateral raters."'
                },
                {
                  id: '38c',
                  text: 'The formal process and time frame for determining dealing with care that is unhelpful or undesired.'
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  scaleOptions: [
    { value: 'NA', label: 'Not Applicable', description: 'N/A' },
    { value: 1, label: 'No, None, Never', description: 'No, None, Never' },
    { value: 2, label: 'Very Limited, Not Often', description: 'Very Limited, Not Often' },
    { value: 3, label: 'Partially, Frequently', description: 'Partially. Frequently' },
    { value: 4, label: 'Mostly, Regularly', description: 'Mostly, Regularly' },
    { value: 5, label: 'Yes, Fully, Always', description: 'Yes, Fully Always' }
  ]
};

// Helper function to get all questions with their full context
export const getAllQuestions = () => {
  const allQuestions = [];

  assessmentData.realms.forEach(realm => {
    realm.sections.forEach(section => {
      section.questions.forEach(question => {
        allQuestions.push({
          ...question,
          realmId: realm.id,
          realmName: realm.name,
          sectionId: section.id,
          sectionName: section.name
        });

        // Add sub-questions if they exist
        if (question.subQuestions) {
          question.subQuestions.forEach(subQ => {
            allQuestions.push({
              ...subQ,
              parentId: question.id,
              realmId: realm.id,
              realmName: realm.name,
              sectionId: section.id,
              sectionName: section.name,
              isSubQuestion: true
            });
          });
        }
      });
    });
  });

  return allQuestions;
};

// Get total number of questions (including sub-questions)
export const getTotalQuestions = () => getAllQuestions().length;

// Get questions by realm
export const getQuestionsByRealm = (realmId) => {
  return getAllQuestions().filter(q => q.realmId === realmId);
};
