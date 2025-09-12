import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Create form data for the external API
    const externalFormData = new FormData();
    externalFormData.append('file', file);

    // Forward the request to the external OCR API
    const target = 'https://vanmitra.onrender.com/ocr';
    const response = await fetch(target, {
      method: 'POST',
      body: externalFormData,
    });

    // Get the response text
    const text = await response.text();

    // Return the response with the same status
    return new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json'
      }
    });

  } catch (err) {
    console.error('OCR API proxy error:', err);
    return NextResponse.json({ error: 'OCR processing failed' }, { status: 500 });
  }
}