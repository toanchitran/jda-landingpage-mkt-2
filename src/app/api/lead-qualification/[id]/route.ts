import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = 'patuBi3WMEA1SssqX.0a634c1146471ac425c6e9ae49b7d4a36cca2656c1708c07dc77283e3cc6a231';
const AIRTABLE_BASE_ID = 'app0YMWSt1LtrGu7S';
const AIRTABLE_TABLE_ID = 'tblP52B81ccH8jICa';

interface Question {
  id: string;
  label: string;
  type: string;
  required: boolean;
  airtableField?: string;
  options?: string[];
  conditionalQuestions?: Array<{
    condition: {
      field: string;
      operator?: string;
      value: string | string[];
    };
    question: Question;
  }>;
}

interface QuestionWithAnswer extends Question {
  answer: string;
}

interface Section {
  id: string;
  title: string;
  description: string;
  airtableMapping: string;
  questions: Question[];
}

interface SectionsData {
  sections: Section[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      );
    }

    const { id } = await params;

    // Fetch the record from Airtable
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        );
      }
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const record = await response.json();
    const fields = record.fields;

    // Load sections from the JSON file
    let sectionsData: SectionsData = { sections: [] };
    try {
        const protocol = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http');
        const host = request.headers.get('host') || 'localhost:3000';
      const sectionsResponse = await fetch(`${protocol}//${host}/sections.json`);
      sectionsData = await sectionsResponse.json();
    } catch (error) {
      console.error('Error loading sections:', error);
    }

    // Parse section answers from Airtable
    const sectionAnswers: Record<string, {
      title: string;
      description: string;
      questions: QuestionWithAnswer[];
    }> = {};
    
    sectionsData.sections.forEach(section => {
      if (section.id === 'contact') {
        // Handle contact section with direct field mapping
        const contactQuestions: QuestionWithAnswer[] = [];
        
        section.questions.forEach(question => {
          const answer = fields[question.airtableField || ''] || '';
          contactQuestions.push({
            ...question,
            answer: answer
          } as QuestionWithAnswer);
          
          // Handle conditional questions for contact section
          if (question.conditionalQuestions) {
            question.conditionalQuestions.forEach(cq => {
              // Check if this conditional question should be shown based on the answer
              const shouldShow = checkConditionalDisplay(cq.condition, { [question.id]: answer });
              if (shouldShow) {
                let conditionalAnswer = '';
                
                // For applicant role, extract from the formatted string
                if (question.id === 'applicantRole' && cq.question.id === 'applicantRoleOther') {
                  const match = answer.match(/\(([^)]+)\)/);
                  conditionalAnswer = match ? match[1] : '';
                } else if (question.id === 'applicantRole' && cq.question.id === 'founderCeoAttendance') {
                  const match = answer.match(/Founder\/CEO will attend call: ([^\n]+)/);
                  conditionalAnswer = match ? match[1] : '';
                }
                
                if (conditionalAnswer) {
                  contactQuestions.push({
                    ...cq.question,
                    answer: conditionalAnswer
                  } as QuestionWithAnswer);
                }
              }
            });
          }
        });
        
        sectionAnswers[section.id] = {
          title: section.title,
          description: section.description,
          questions: contactQuestions
        };
      } else if (section.airtableMapping.startsWith('Question ')) {
        // Handle other sections stored in Question fields
        const questionField = section.airtableMapping;
        const rawData = fields[questionField];
        
        if (rawData && typeof rawData === 'string') {
          // Parse the formatted question-answer pairs
          const parsedAnswers = parseFormattedAnswers(rawData, section);
          sectionAnswers[section.id] = {
            title: section.title,
            description: section.description,
            questions: parsedAnswers
          };
        }
      }
    });

    // Helper function to convert UTC time to GMT+7
    const convertToGMTPlus7 = (utcTimeString: string): string => {
      try {
        const utcDate = new Date(utcTimeString);
        // Use toLocaleString with Asia/Bangkok timezone (GMT+7)
        return utcDate.toLocaleString('en-US', {
          timeZone: 'Asia/Bangkok', // GMT+7 timezone - let JS handle the conversion
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch (error) {
        console.error('Error converting time:', error);
        return utcTimeString;
      }
    };

    const contactData = {
      id: record.id,
      fullName: fields['Name'] || '',
      email: fields['Email'] || '',
      linkedinProfile: fields['Linkedin Profile'] || '',
      companyWebsite: fields['Company Website'] || '',
      applicantRole: fields['Applicant role'] || '',
      pitchDeckUrl: fields['Pitch Deck URL'] || null,
      calendlyScheduledTime: fields['Calendly Scheduled Time'] ? convertToGMTPlus7(fields['Calendly Scheduled Time']) : null,
      calendlyScheduledTimeRaw: fields['Calendly Scheduled Time'] || null,
      meetingLink: fields['Meeting link'] || null,
      aiScreeningScore: fields['AI screening score'] || null,
      aiScreeningDetail: fields['AI screening detail'] || null,
      sections: sectionsData.sections,
      sectionAnswers,
      submittedAt: fields['Created'] || new Date().toISOString(),
    };

    return NextResponse.json(contactData);
  } catch (error) {
    console.error('Error fetching lead qualification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead qualification data' },
      { status: 500 }
    );
  }
}

// Helper function to parse formatted answers from Airtable
function parseFormattedAnswers(rawData: string, section: Section): QuestionWithAnswer[] {
  const parsedQuestions: QuestionWithAnswer[] = [];
  
  // Split by double newlines to get each question-answer block
  const blocks = rawData.split('\n\n');
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    let questionLabel = '';
    let answer = '';

    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === 'Question:') {
        // Next line should be the question label
        if (i + 1 < lines.length) {
          questionLabel = lines[i + 1].trim();
          i++; // Skip the next line since we just read it
        }
      } else if (line === 'Answer:') {
        // Next line(s) should be the answer
        if (i + 1 < lines.length) {
          answer = lines[i + 1].trim();
          i++; // Skip the next line since we just read it
          
          // Continue reading multi-line answers
          while (i + 1 < lines.length && lines[i + 1].trim() !== '') {
            i++;
            answer += '\n' + lines[i].trim();
          }
        }
      }
    }
    
    if (questionLabel && answer) {
      // Find matching question in section config
      const matchingQuestion = findQuestionByLabel(section, questionLabel);
      const questionWithAnswer: QuestionWithAnswer = matchingQuestion ? {
        ...matchingQuestion,
        answer: answer
      } as QuestionWithAnswer : {
        id: `unknown_${parsedQuestions.length}`,
        label: questionLabel,
        type: 'text',
        required: false,
        answer: answer
      } as QuestionWithAnswer;
      
      parsedQuestions.push(questionWithAnswer);
    }
  }
  
  return parsedQuestions;
}

// Helper function to check if conditional question should be displayed
function checkConditionalDisplay(condition: { field: string; operator?: string; value: string | string[] }, formData: Record<string, string>): boolean {
  const fieldValue = formData[condition.field];

  // Don't show conditional questions if the parent field has no value
  if (!fieldValue || fieldValue === '') {
    return false;
  }

  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value;
    case 'not_equals':
      return fieldValue !== condition.value;
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(fieldValue);
    case 'not_in':
      return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
    default:
      return true;
  }
}

// Helper function to find question by label in section
function findQuestionByLabel(section: Section, label: string): Question | null {
  // Check main questions
  for (const question of section.questions) {
    if (question.label === label) {
      return question;
    }
    
    // Check conditional questions
    if (question.conditionalQuestions) {
      for (const cq of question.conditionalQuestions) {
        if (cq.question.label === label) {
          return cq.question;
        }
      }
    }
  }
  
  return null;
}