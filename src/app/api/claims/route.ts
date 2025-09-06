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
