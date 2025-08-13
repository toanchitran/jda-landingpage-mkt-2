import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = 'patuBi3WMEA1SssqX.0a634c1146471ac425c6e9ae49b7d4a36cca2656c1708c07dc77283e3cc6a231';
const AIRTABLE_BASE_ID = 'app0YMWSt1LtrGu7S';
const AIRTABLE_TABLE_ID = 'tblP52B81ccH8jICa';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      );
    }

    const { id } = params;

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

    // Load questions from the JSON file
    let questions = {};
    try {
      const questionsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/questions.json`);
      questions = await questionsResponse.json();
    } catch (error) {
      console.error('Error loading questions:', error);
    }

    // Extract answers from Airtable fields (formatted answers)
    const answers: Record<string, string | string[]> = {};
    Object.keys(fields).forEach(key => {
      if (key.startsWith('Question ')) {
        const value = fields[key];
        if (value && typeof value === 'string') {
          // Parse formatted answer to extract just the answer part
          const lines = value.split('\n');
          const answerIndex = lines.findIndex(line => line.startsWith('Answer:'));
          if (answerIndex !== -1 && answerIndex + 1 < lines.length) {
            const answerText = lines.slice(answerIndex + 1).join('\n').trim();
            // Check if it's a multi-select answer (contains commas)
            if (answerText.includes(', ')) {
              answers[key] = answerText.split(', ').map(item => item.trim());
            } else {
              answers[key] = answerText;
            }
          } else {
            // Fallback to full value if parsing fails
            answers[key] = value;
          }
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
      pitchDeckUrl: fields['Pitch Deck URL'] || null,
      calendlyScheduledTime: fields['Calendly Scheduled Time'] ? convertToGMTPlus7(fields['Calendly Scheduled Time']) : null,
      calendlyScheduledTimeRaw: fields['Calendly Scheduled Time'] || null,
      meetingLink: fields['Meeting link'] || null,
      answers,
      questions,
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
