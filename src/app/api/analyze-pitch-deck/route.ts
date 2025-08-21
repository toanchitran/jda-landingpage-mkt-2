import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== PITCH DECK ANALYSIS PROXY API ===');
    
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('pitchDeckFile') as File;
    
    if (!file) {
      console.error('No file received in proxy API');
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    console.log('File received:', file.name);
    console.log('File size:', file.size, 'bytes');
    console.log('File type:', file.type);

    // Create new FormData for the external API
    const externalFormData = new FormData();
    externalFormData.append('pitchDeckFile', file);

    console.log('Forwarding request to external analysis API...');

    // Forward the request to the external analysis API
    const response = await fetch('https://deckanalysis.fundraisingflywheel.io/api/pitch-deck-analysis', {
      method: 'POST',
      body: externalFormData,
      // Add timeout
      signal: AbortSignal.timeout(240000), // 4 minutes (240 seconds)
    });

    console.log('External API response status:', response.status);
    console.log('External API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return NextResponse.json(
        { error: `Analysis API returned ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    // Get the JSON response
    const result = await response.json();
    console.log('External API success response:', JSON.stringify(result, null, 2));

    // Return the result to the client
    return NextResponse.json(result);

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
