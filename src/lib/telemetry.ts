// Lightweight telemetry helpers
export function collectNavTiming(): Record<string, number | string> {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (!nav) return {};

    return {
      dns: nav.domainLookupEnd - nav.domainLookupStart,
      tcp: nav.connectEnd - nav.connectStart,
      ttfb: nav.responseStart - nav.requestStart,
      fcp: (performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry | undefined)?.startTime ?? 0,
      lcp: 0, // best-effort LCP should be observed with PerformanceObserver
      domLoad: nav.domContentLoadedEventEnd - nav.fetchStart,
      load: nav.loadEventEnd - nav.fetchStart,
      timestamp: Date.now()
    };
  } catch {
    return { error: 'nav_timing_unavailable' };
  }
}

export function sendTelemetry(payload: unknown) {
  try {
    const url = '/api/telemetry';
    const body = JSON.stringify({ payload, environment: process.env.NODE_ENV || 'unknown' });
    if (navigator && 'sendBeacon' in navigator) {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    } else {
      void fetch(url, { method: 'POST', body, headers: { 'Content-Type': 'application/json' } });
    }
  } catch {
    // swallow errors
  }
}

export function collectAndSendNavTiming() {
  const data = collectNavTiming();
  sendTelemetry({ type: 'navigation-timing', data });
}
