import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Simple server-side logging for telemetry. In production, forward to analytics/monitoring.
    // Keep logs minimal to avoid PII.
    // Example: { payload: { type, data }, environment }
    console.info('[telemetry]', JSON.stringify({ t: new Date().toISOString(), body }, null, 0));
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.warn('Telemetry endpoint error', err);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
