import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const qs = url.search;
    const target = `https://vanmitra.onrender.com/claims${qs}`;
    const r = await fetch(target, { headers: { Accept: 'application/json' } });
    const text = await r.text();
    // forward status
    return new Response(text, { status: r.status, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Proxy /api/claims error', err);
    return new Response(JSON.stringify({ error: 'Proxy failed' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }
}
