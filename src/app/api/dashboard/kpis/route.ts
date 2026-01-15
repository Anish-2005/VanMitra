import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const base = new URL(req.url);

    // Fetch live claims and assets from local APIs
    const claimsUrl = new URL('/api/claims?status=all', base).toString();
    const assetsUrl = new URL('/api/atlas/assets?state=Madhya%20Pradesh&district=Bhopal', base).toString();

    const [claimsRes, assetsRes] = await Promise.allSettled([
      fetch(claimsUrl, { headers: { Accept: 'application/json' } }),
      fetch(assetsResultOrUrl(assetsUrl), { headers: { Accept: 'application/json' } }),
    ]);

    // Helper to safely read JSON
    async function safeJson(res: any) {
      if (!res || res.status !== 200) return null;
      try {
        return await res.json();
      } catch (e) {
        return null;
      }
    }

    const claimsData = claimsRes.status === 'fulfilled' ? await safeJson(claimsRes.value) : null;
    const assetsData = assetsRes.status === 'fulfilled' ? await safeJson(assetsRes.value) : null;

    // Compute counts
    const claims = Array.isArray(claimsData?.features) ? claimsData.features.length : null;
    const grants = Array.isArray(claimsData?.features)
      ? claimsData.features.filter((f: any) => {
          const s = (f?.properties?.status || '').toString().toLowerCase();
          return s === 'granted' || s === 'verified' || s === 'approved';
        }).length
      : null;
    const assets = Array.isArray(assetsData?.features) ? assetsData.features.length : null;
    const priorityVillages = Array.isArray(claimsData?.features)
      ? new Set(claimsData.features.map((f: any) => f?.properties?.village || '').filter(Boolean)).size
      : null;

    // Build a simple time series from claims created_at (group by month)
    let timeSeries: number[] | undefined = undefined;
    if (Array.isArray(claimsData?.features) && claimsData.features.length > 0) {
      try {
        const buckets: Record<string, number> = {};
        for (const f of claimsData.features) {
          const raw = f?.properties?.created_at ?? f?.properties?.createdAt ?? f?.properties?.created;
          const d = raw ? new Date(raw) : null;
          if (!d || isNaN(d.getTime())) continue;
          const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
          buckets[key] = (buckets[key] || 0) + 1;
        }
        const keys = Object.keys(buckets).sort();
        timeSeries = keys.map(k => buckets[k]);
      } catch (e) {
        timeSeries = undefined;
      }
    }

    // If any of the live values are null, fall back to the previous static sample so callers still work
    if (claims == null || grants == null || assets == null || priorityVillages == null) {
      const payload = {
        claims: 1240,
        grants: 380,
        assets: 4120,
        priorityVillages: 4,
        timeSeries: [120, 180, 240, 300, 220, 260, 310, 380, 420, 480],
        source: 'fallback'
      };
      return NextResponse.json(payload);
    }

    return NextResponse.json({
      claims,
      grants,
      assets,
      priorityVillages,
      timeSeries,
      source: 'live'
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });

  } catch (err) {
    console.error('KPIs API error', err);
    const payload = {
      claims: 1240,
      grants: 380,
      assets: 4120,
      priorityVillages: 4,
      timeSeries: [120, 180, 240, 300, 220, 260, 310, 380, 420, 480],
      source: 'error'
    };
    return NextResponse.json(payload, { status: 500 });
  }
}

// Helper to handle potential accidental reuse of variables in earlier edits
function assetsResultOrUrl(url: string) {
  return url;
}
