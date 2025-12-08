import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = 'app0YMWSt1LtrGu7S';
const AIRTABLE_TABLE_ID = 'tblP52B81ccH8jICa';

// Background function to update Airtable (continues even if client disconnects)
async function updateAirtableInBackground(recordId: string, analysisResult: {
  success: boolean;
  reportLink: string | null;
  investorReadinessReport: string | null;
  analysisError: string | null;
  investorReadinessError: string | null;
}) {
  try {
    console.log('=== BACKGROUND AIRTABLE UPDATE ===');
    console.log('Record ID:', recordId);
    
    const updateFields: Record<string, string> = {};
    let hasUpdates = false;

    // Handle analysis report link
    if (analysisResult.success && analysisResult.reportLink) {
      console.log('Adding pitch deck analysis report link:', analysisResult.reportLink);
      updateFields["Pitch Deck Analysis Report Link"] = analysisResult.reportLink;
      hasUpdates = true;
    }

    // Handle investor readiness report
    if (analysisResult.investorReadinessReport) {
      console.log('Adding investor readiness report, length:', analysisResult.investorReadinessReport.length);
      updateFields["Investor readiness report"] = analysisResult.investorReadinessReport;
      hasUpdates = true;
    }

    if (!hasUpdates) {
      console.log('No updates to make to Airtable');
      return;
    }

    const updateData = { fields: updateFields };
    console.log('Updating Airtable with:', Object.keys(updateFields));

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${recordId}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Successfully updated Airtable in background:', result.id);
    } else {
      const errorText = await response.text();
      console.error('❌ Background Airtable update failed:', response.status, errorText);
    }

  } catch (error) {
    console.error('❌ Background Airtable update error:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== PITCH DECK ANALYSIS PROXY API ===');
    
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('pitchDeckFile') as File;
    const recordId = formData.get('recordId') as string;
    
    if (!file) {
      console.error('No file received in proxy API');
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    if (!recordId) {
      console.error('No recordId received in proxy API');
      return NextResponse.json({ error: 'No recordId received' }, { status: 400 });
    }

    console.log('File received:', file.name);
    console.log('File size:', file.size, 'bytes');
    console.log('File type:', file.type);

    // Create new FormData for the external API
    const externalFormData = new FormData();
    externalFormData.append('pitchDeckFile', file);

    console.log('Forwarding request to both analysis APIs...');

    // Forward to both APIs in parallel
    const [analysisResponse, investorReadinessResponse] = await Promise.allSettled([
      // Original analysis API
      fetch('https://deckanalysis.fundraisingflywheel.io/api/pitch-deck-analysis', {
        method: 'POST',
        body: externalFormData,
        signal: AbortSignal.timeout(300000), // 5 minutes
      }),
      // New investor readiness scoring API
      fetch('https://n8n.brandbeam.io/webhook/investor-readiness-scoring', {
        method: 'POST',
        body: externalFormData,
        signal: AbortSignal.timeout(300000), // 5 minutes
      })
    ]);

    // Handle original analysis API response
    let analysisResult = null;
    if (analysisResponse.status === 'fulfilled') {
      console.log('Analysis API HTTP status:', analysisResponse.value.status);
      if (analysisResponse.value.ok) {
        analysisResult = await analysisResponse.value.json();
        console.log('Analysis API success response:', JSON.stringify(analysisResult, null, 2));
      } else {
        const errorText = await analysisResponse.value.text();
        console.error('Analysis API error:', errorText);
      }
    } else {
      console.error('Analysis API failed:', analysisResponse.reason);
    }

    // Handle investor readiness scoring API response
    let investorReadinessResult = null;
    if (investorReadinessResponse.status === 'fulfilled') {
      console.log('Investor readiness API HTTP status:', investorReadinessResponse.value.status);
      if (investorReadinessResponse.value.ok) {
        const rawResult = await investorReadinessResponse.value.json();
        console.log('Investor readiness API raw response:', JSON.stringify(rawResult, null, 2));
        
        // Extract text from output array index 1
        if (rawResult.output && rawResult.output.length > 1 && rawResult.output[1].type === 'text') {
          investorReadinessResult = rawResult.output[1].text;
          console.log('Extracted investor readiness text:', investorReadinessResult.substring(0, 200) + '...');
        } else {
          console.error('Unexpected investor readiness response format');
        }
      } else {
        const errorText = await investorReadinessResponse.value.text();
        console.error('Investor readiness API error:', errorText);
      }
    } else {
      console.error('Investor readiness API failed:', investorReadinessResponse.reason);
    }

    // Prepare combined response
    const combinedResult = {
      success: analysisResult?.success || false,
      reportLink: analysisResult?.reportLink || null,
      investorReadinessReport: investorReadinessResult || null,
      analysisError: analysisResponse.status === 'rejected' ? analysisResponse.reason?.message : null,
      investorReadinessError: investorReadinessResponse.status === 'rejected' ? investorReadinessResponse.reason?.message : null
    };

    console.log('Combined result:', JSON.stringify(combinedResult, null, 2));

    // Update Airtable with results (server-side, continues even if client disconnects)
    updateAirtableInBackground(recordId, combinedResult);

    // Return success immediately to client
    return NextResponse.json({ 
      success: true, 
      message: 'Analysis started successfully. Results will be updated in Airtable automatically.' 
    });

  } catch (error) {
    console.error('Pitch deck analysis proxy error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return NextResponse.json(
          { error: 'Analysis request timed out after 4 minutes' },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { error: `Analysis failed: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Unknown analysis error' },
      { status: 500 }
    );
  }
}
