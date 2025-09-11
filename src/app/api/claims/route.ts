import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const qs = url.search || '?status=all';
    const target = `https://vanmitra.onrender.com/claims${qs}`;
    const r = await fetch(target, { headers: { Accept: 'application/json' } });
    const text = await r.text();
    return new NextResponse(text, { status: r.status, headers: { 'Content-Type': r.headers.get('content-type') || 'application/json' } });
  } catch (err) {
    console.error('Proxy /api/claims error', err);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const target = `https://vanmitra.onrender.com/claims`;
    const r = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const text = await r.text();
    return new NextResponse(text, { status: r.status, headers: { 'Content-Type': r.headers.get('content-type') || 'application/json' } });
  } catch (err) {
    console.error('Proxy POST /api/claims error', err);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 502 });
  }
}
