import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const AIRTABLE_API_KEY = 'patuBi3WMEA1SssqX.0a634c1146471ac425c6e9ae49b7d4a36cca2656c1708c07dc77283e3cc6a231';
const AIRTABLE_BASE_ID = 'app0YMWSt1LtrGu7S';
const AIRTABLE_TABLE_ID = 'tblP52B81ccH8jICa';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      fullName, 
      email, 
      linkedinProfile, 
      companyWebsite, 
      pitchDeckUrl,
      ...questionAnswers 
    } = body;

    // Load questions from JSON file
    const questionsFilePath = path.join(process.cwd(), 'public', 'questions.json');
    const questionsFileContent = await fs.readFile(questionsFilePath, 'utf8');
    const questions = JSON.parse(questionsFileContent);

    // Prepare the record data for Airtable
    const recordData: Record<string, string> = {
      "Name": fullName,
      "Email": email,
      "Company Website": companyWebsite,
      "Linkedin Profile": linkedinProfile,
      "Pitch Deck URL": pitchDeckUrl || '', // Initialize field even if empty
    };

    // Format question answers
    Object.entries(questionAnswers).forEach(([key, value]) => {
      if (key.startsWith('Question ')) {
        const questionData = questions[key.replace('_other', '')];
        
        if (!key.endsWith('_other')) {
          // Main question answer
          let formattedAnswer = '';
          
          if (questionData) {
            if (Array.isArray(value)) {
              // For checkbox questions
              const answers = value as string[];
              const otherAnswer = questionAnswers[`${key}_other`];
              
              if (answers.length > 0) {
                formattedAnswer = `Question:\n${questionData.label}\nAnswer:\n${answers.join(', ')}`;
                if (otherAnswer && otherAnswer.trim()) {
                  formattedAnswer += `, ${otherAnswer}`;
                }
              }
            } else if (typeof value === 'string' && value.trim()) {
              // For radio and text questions
              formattedAnswer = `Question:\n${questionData.label}\nAnswer:\n${value}`;
            } else if (typeof value === 'boolean' && value) {
              // For standalone checkbox questions
              formattedAnswer = `Question:\n${questionData.label}\nAnswer:\nYes`;
            }

            if (formattedAnswer) {
              recordData[key] = formattedAnswer;
            }
          }
        } else {
          // Other field for checkbox questions
          if (value && typeof value === 'string' && value.trim()) {
            recordData[key] = value;
          }
        }
      }
    });

    // Send to Airtable
    const airtableResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: recordData
          }
        ]
      }),
    });

    if (!airtableResponse.ok) {
      const errorData = await airtableResponse.json();
      console.error('Airtable error:', errorData);
      throw new Error(`Airtable API error: ${airtableResponse.status}`);
    }

    const result = await airtableResponse.json();
    const recordId = result.records[0].id;
    console.log('Airtable success:', result);

    // Generate unique link for lead qualification answers
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const uniqueLink = `${baseUrl}/lead-qualification-answer/${recordId}`;

    // Update the record with the unique link
    const updateResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          "Lead qualification Answer": uniqueLink
        }
      }),
    });

    if (!updateResponse.ok) {
      console.error('Failed to update record with unique link:', await updateResponse.text());
      // Don't fail the whole request if this update fails
    }

    return NextResponse.json({ 
      success: true, 
      id: recordId,
      qualificationLink: uniqueLink 
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save contact information' },
      { status: 500 }
    );
  }
}

 