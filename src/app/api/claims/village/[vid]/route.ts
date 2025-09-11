import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(req: NextRequest, ctx: any) {
  try {
    const vid = ctx?.params?.vid ?? ''
    const url = new URL(req.url)
    // preserve any query string params
    const qs = url.search || ''
    const target = `https://vanmitra.onrender.com/claims/village/${encodeURIComponent(vid)}${qs}`
    const r = await fetch(target, { headers: { Accept: 'application/json' } })
    const text = await r.text()
    return new NextResponse(text, { status: r.status, headers: { 'Content-Type': r.headers.get('content-type') || 'application/json' } })
  } catch (err) {
    console.error('Proxy /api/claims/village/[vid] error', err)
    return NextResponse.json({ error: 'Proxy failed' }, { status: 502 })
  }
}
