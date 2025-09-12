import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const { latitude, longitude } = body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { detail: [{ loc: ['body'], msg: 'latitude and longitude must be numbers', type: 'type_error' }] },
        { status: 422 }
      );
    }

    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { detail: [{ loc: ['body', 'latitude'], msg: 'latitude must be between -90 and 90', type: 'value_error' }] },
        { status: 422 }
      );
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { detail: [{ loc: ['body', 'longitude'], msg: 'longitude must be between -180 and 180', type: 'value_error' }] },
        { status: 422 }
      );
    }

    // Forward the request to the external API
    console.log('Proxying DSS request to external API:', { latitude, longitude });
    const response = await fetch('https://vanmitra.onrender.com/dss', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        latitude,
        longitude,
      }),
    });

    console.log('External API response status:', response.status);
    console.log('External API response headers:', Object.fromEntries(response.headers.entries()));

    // Get the response text (since the API returns a string)
    const responseText = await response.text();
    console.log('External API response body:', responseText);

    if (!response.ok) {
      // Try to parse as JSON for error responses
      try {
        const errorData = JSON.parse(responseText);
        console.log('Parsed error response:', errorData);
        return NextResponse.json(errorData, { status: response.status });
      } catch (parseError) {
        console.log('Could not parse error response as JSON:', parseError);
        // If not JSON, return the text as an error
        return NextResponse.json(
          { detail: [{ msg: responseText || 'Unknown error from external API', type: 'server_error' }] },
          { status: response.status }
        );
      }
    }

    // Return the successful response
    return new NextResponse(responseText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

  } catch (error) {
    console.error('DSS API proxy error:', error);
    return NextResponse.json(
      { detail: [{ msg: 'Internal server error', type: 'server_error' }] },
      { status: 500 }
    );
  }
}