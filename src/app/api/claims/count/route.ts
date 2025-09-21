import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import * as turf from '@turf/turf';

// Simple in-memory cache to avoid repeated heavy work for identical geometries
const cache = new Map<string, { ts: number; count: number }>();
const CACHE_TTL = 30 * 1000; // 30s

const fetchWithTimeout = async (url: string, opts: RequestInit = {}, timeout = 3000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const geometry = body?.geometry ?? body?.feature?.geometry;
    if (!geometry) return NextResponse.json({ error: 'Missing geometry' }, { status: 400 });

    const cacheKey = JSON.stringify(geometry);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json({ count: cached.count, cached: true });
    }

    // --- 1. Get Firebase claims ---
    const snap = await getDocs(collection(db, 'claims'));
    const firebaseFeatures = snap.docs.map((doc) => {
      const data = doc.data();
      const areaHa = data.claimed_area ?? 1;
      const areaM2 = areaHa * 10000;
      const radiusM = Math.sqrt(areaM2 / Math.PI);
      const radiusKm = radiusM / 1000;
      const circle = turf.circle([data.longitude ?? 0, data.latitude ?? 0], radiusKm, { steps: 32 });
      return {
        type: 'Feature',
        geometry: circle.geometry,
        properties: {
          claim_id: doc.id,
          claim_type: data.claim_type,
          claimant_name: data.claimant_name,
          community_name: data.community_name,
          land_area: data.claimed_area,
          state: data.state_name,
          district: data.district_name,
          village: data.village_name,
          status: data.status,
          source: 'firebase',
        },
      };
    });

    // --- 2. Get Render claims (with timeout) ---
    let renderFeatures: any[] = [];
    try {
      const url = new URL(req.url);
      const qs = url.search || '';
      const target = `https://vanmitra.onrender.com/claims${qs}`;
      const r = await fetchWithTimeout(target, { headers: { Accept: 'application/json' } }, 3000);
      if (r.ok) {
        const data = await r.json();
        renderFeatures = data.features ?? [];
      }
    } catch (err) {
      // ignore remote errors, rely on firebase features at least
      console.warn('Render fetch for count failed or timed out', err);
    }

    const all = [...renderFeatures, ...firebaseFeatures];

    const polyFeature = { type: 'Feature', properties: {}, geometry };
    let count = 0;

    for (const f of all) {
      try {
        if (!f || !f.geometry) continue;
        const geomType = (f.geometry.type || '').toLowerCase();
        const feat = f.type === 'Feature' ? f : { type: 'Feature', properties: f.properties || {}, geometry: f.geometry || f };

        // Fast path: if claim is a point, use booleanPointInPolygon which is quicker
        if (geomType === 'point') {
          try {
            const coords = feat.geometry.coordinates;
            if (Array.isArray(coords) && coords.length >= 2) {
              const pt = turf.point(coords);
              if (turf.booleanPointInPolygon(pt, polyFeature as any)) {
                count++;
                continue;
              }
            }
          } catch (e) {
            // fall through to intersects check
          }
        }

        // Fallback: generic intersects check
  if (turf.booleanIntersects(feat as any, polyFeature as any)) count++;
      } catch (e) {
        // ignore per-feature errors
      }
    }

    cache.set(cacheKey, { ts: Date.now(), count });

    return NextResponse.json({ count });
  } catch (err) {
    console.error('Error in /api/claims/count', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown' }, { status: 500 });
  }
}
