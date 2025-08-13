import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const AIRTABLE_API_KEY = 'patuBi3WMEA1SssqX.0a634c1146471ac425c6e9ae49b7d4a36cca2656c1708c07dc77283e3cc6a231';
const AIRTABLE_BASE_ID = 'app0YMWSt1LtrGu7S';
const AIRTABLE_TABLE_ID = 'tblP52B81ccH8jICa';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Load sections from JSON file for field mapping
    const sectionsFilePath = path.join(process.cwd(), 'public', 'sections.json');
    const sectionsFileContent = await fs.readFile(sectionsFilePath, 'utf8');
    const sectionsData = JSON.parse(sectionsFileContent);

    // Prepare the record data for Airtable
    const recordData: Record<string, string> = {};

    interface Question {
      id: string;
      label: string;
      type: string;
      required: boolean;
      airtableField?: string;
    }

    interface Section {
      id: string;
      questions: Question[];
    }

    // Handle contact section fields (direct mapping to Airtable fields)
    const contactSection = (sectionsData as { sections: Section[] }).sections.find((s: Section) => s.id === 'contact');
    if (contactSection) {
      contactSection.questions.forEach((question: Question) => {
        if (question.airtableField && body[question.airtableField]) {
          recordData[question.airtableField] = body[question.airtableField];
        }
      });
    }

    // Handle other sections (mapped to Question 1, Question 2, etc.)
    let questionIndex = 1;
    (sectionsData as { sections: Section[] }).sections.forEach((section: Section) => {
      if (section.id !== 'contact') {
        const questionField = `Question ${questionIndex}`;
        if (body[questionField]) {
          recordData[questionField] = body[questionField];
          questionIndex++;
        }
      }
    });

    // Add pitch deck URL if provided
    if (body.pitchDeckUrl) {
      recordData['Pitch Deck URL'] = body.pitchDeckUrl;
    }

    console.log('Submitting to Airtable:', recordData);

    // Create the record in Airtable
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          fields: recordData
        }]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Airtable error:', errorData);
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const result = await response.json();
    const recordId = result.records[0].id;

    // Generate unique URL for lead qualification answer page
    const leadQualificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/lead-qualification-answer/${recordId}`;

    // Update the record with the lead qualification URL
    const updateResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Lead qualification Answer': leadQualificationUrl
        }
      }),
    });

    if (!updateResponse.ok) {
      console.error('Failed to update record with lead qualification URL');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Contact information submitted successfully',
      id: recordId,
      leadQualificationUrl 
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact information' },
      { status: 500 }
    );
  }
}