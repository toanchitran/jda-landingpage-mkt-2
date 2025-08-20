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
    
    console.log('=== DEBUG INFO ===');
    console.log('Requested ID:', id);
    console.log('ID type:', typeof id);
    console.log('ID length:', id.length);
    console.log('Base ID:', AIRTABLE_BASE_ID);
    console.log('Table ID:', AIRTABLE_TABLE_ID);
    console.log('API Key prefix:', AIRTABLE_API_KEY.substring(0, 10) + '...');
    
    // Construct URL exactly like Postman
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${id}`;
    console.log('Full URL:', airtableUrl);

    // Fetch the specific record from Airtable with exact same headers as Postman
    const response = await fetch(airtableUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'User-Agent': 'Next.js/15.4.4',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: airtableUrl,
        headers: Object.fromEntries(response.headers.entries()),
        requestHeaders: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY.substring(0, 10)}...`,
          'Accept': '*/*',
          'User-Agent': 'Next.js/15.4.4',
        }
      });
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        );
      } else if (response.status === 403) {
        return NextResponse.json(
          { error: 'Access denied - API key may lack read permissions or has expired' },
          { status: 403 }
        );
      } else if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed - Invalid API key' },
          { status: 401 }
        );
      }
      
      throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
    }

    const record = await response.json();
    const fields = record.fields;
    
    console.log('Record ID:', id);
    console.log('Record fields:', Object.keys(fields));
    console.log('Name field:', fields['Name']);
    console.log('Email field:', fields['Email']);

    // Load sections from the JSON file
    let sectionsData: SectionsData = { sections: [] };
    try {
        const protocol = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http');
        const host = request.headers.get('host') || 'localhost:3000';
      const sectionsUrl = `${protocol}://${host}/sections.json`;
      console.log('Loading sections from:', sectionsUrl);
      const sectionsResponse = await fetch(sectionsUrl);
      console.log('Sections response status:', sectionsResponse.status);
      sectionsData = await sectionsResponse.json();
      console.log('Loaded sections count:', sectionsData.sections.length);
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

    // Check if we have basic required data
    if (!fields['Name'] && !fields['Email']) {
      console.warn('Record missing basic contact information');
      return NextResponse.json(
        { error: 'Record found but missing essential data' },
        { status: 404 }
      );
    }

    const contactData = {
      id: record.id,
      fullName: fields['Name'] || '',
      email: fields['Email'] || '',
      linkedinProfile: fields['Linkedin Profile'] || '',
      companyWebsite: fields['Company Website'] || '',
      applicantRole: fields['Applicant role'] || '',
      pitchDeckUrl: fields['Pitch Deck URL'] || null,
      pitchDeckAnalysisReportLink: fields['Pitch Deck Analysis Report Link'] || null,
      calendlyScheduledTime: fields['Calendly Scheduled Time'] ? convertToGMTPlus7(fields['Calendly Scheduled Time']) : null,
      calendlyScheduledTimeRaw: fields['Calendly Scheduled Time'] || null,
      meetingLink: fields['Meeting link'] || null,
      aiScreeningScore: fields['AI screening score'] || null,
      aiScreeningDetail: fields['AI screening detail'] || null,
      sections: sectionsData.sections,
      sectionAnswers,
      submittedAt: fields['Created'] || new Date().toISOString(),
    };

    console.log('Final contactData:', {
      id: contactData.id,
      hasName: !!contactData.fullName,
      hasEmail: !!contactData.email,
      sectionsCount: contactData.sections.length,
      sectionAnswersKeys: Object.keys(contactData.sectionAnswers)
    });

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