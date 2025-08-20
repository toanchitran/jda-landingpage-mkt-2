import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = 'patuBi3WMEA1SssqX.0a634c1146471ac425c6e9ae49b7d4a36cca2656c1708c07dc77283e3cc6a231';
const AIRTABLE_BASE_ID = 'app0YMWSt1LtrGu7S';
const AIRTABLE_TABLE_ID = 'tblP52B81ccH8jICa';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { recordId, pitchDeckUrl, joinLink, calendlyEventScheduledTime, pitchDeckAnalysisReportLink } = body;

    console.log('=== UPDATE CONTACT API ===');
    console.log('Record ID:', recordId);
    console.log('Pitch Deck URL:', pitchDeckUrl);
    console.log('Join Link:', joinLink);
    console.log('Pitch Deck Analysis Report Link:', pitchDeckAnalysisReportLink);
    console.log('Base ID:', AIRTABLE_BASE_ID);
    console.log('Table ID:', AIRTABLE_TABLE_ID);
    console.log('Full request body:', JSON.stringify(body, null, 2));

    if (!recordId) {
      console.error('Missing record ID');
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    // At least one field must be provided
    if (!pitchDeckUrl && !joinLink && !calendlyEventScheduledTime && !pitchDeckAnalysisReportLink) {
      console.error('No updatable fields provided');
      return NextResponse.json({ error: 'No fields provided to update' }, { status: 400 });
    }

    // Validate URL format for Airtable URL field if provided
    if (pitchDeckUrl) {
      try {
        new URL(pitchDeckUrl);
        console.log('URL validation passed:', pitchDeckUrl);
      } catch {
        console.error('Invalid URL format:', pitchDeckUrl);
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
      }
    }

    // Validate pitch deck analysis report link URL format if provided
    if (pitchDeckAnalysisReportLink) {
      try {
        new URL(pitchDeckAnalysisReportLink);
        console.log('Pitch deck analysis report link validation passed:', pitchDeckAnalysisReportLink);
      } catch {
        console.error('Invalid pitch deck analysis report link URL format:', pitchDeckAnalysisReportLink);
        return NextResponse.json({ error: 'Invalid pitch deck analysis report link URL format' }, { status: 400 });
      }
    }

    // Construct the URL
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${recordId}`;
    console.log('Airtable URL:', url);

    const updateFields: Record<string, string> = {};
    if (pitchDeckUrl) updateFields["Pitch Deck URL"] = pitchDeckUrl;
    if (joinLink) updateFields["Meeting link"] = String(joinLink);
    if (calendlyEventScheduledTime) updateFields["Calendly Scheduled Time"] = String(calendlyEventScheduledTime);
    if (pitchDeckAnalysisReportLink) {
      console.log('Adding pitch deck analysis report link to update fields:', pitchDeckAnalysisReportLink);
      // Try the exact field name we expect
      updateFields["Pitch Deck Analysis Report Link"] = pitchDeckAnalysisReportLink;
      console.log('Field name used:', "Pitch Deck Analysis Report Link");
    }

    const updateData = { fields: updateFields };

    console.log('Update data:', JSON.stringify(updateData, null, 2));

    // Update the record in Airtable
    const airtableResponse = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    console.log('Airtable response status:', airtableResponse.status);
    console.log('Airtable response headers:', Object.fromEntries(airtableResponse.headers.entries()));

    const responseText = await airtableResponse.text();
    console.log('Airtable raw response:', responseText);

    if (!airtableResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      console.error('Airtable error details:', errorData);
      return NextResponse.json({ 
        error: 'Failed to update Airtable record', 
        status: airtableResponse.status,
        details: errorData 
      }, { status: airtableResponse.status });
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText };
    }
    
    console.log('Airtable update success:', result);
    return NextResponse.json({ success: true, data: result });
    
  } catch (error) {
    console.error('Contact update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update contact information', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
