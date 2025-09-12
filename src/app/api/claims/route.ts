import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import * as turf from '@turf/turf';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const qs = url.search || '?status=all';
    const target = `https://vanmitra.onrender.com/claims${qs}`;

    // --- 1. Get Firebase claims ---
    const snap = await getDocs(collection(db, 'claims'));
    const firebaseFeatures = snap.docs.map(doc => {
      const data = doc.data();
      // Calculate radius from claimed area (assuming circular area)
      const areaHa = data.claimed_area ?? 1;
      const areaM2 = areaHa * 10000;
      const radiusM = Math.sqrt(areaM2 / Math.PI);
      const radiusKm = radiusM / 1000;
      // Create circle geometry
      const circle = turf.circle([data.longitude ?? 0, data.latitude ?? 0], radiusKm, { steps: 64 });
      return {
        type: "Feature",
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
          created_at: data.created_at?.toDate?.() ?? null,
          updated_at: data.updated_at?.toDate?.() ?? null,
          source: "firebase",
          // radius for marker sizing
          radius: Math.sqrt(data.claimed_area ?? 1) * 200
        }
      };
    });

    // --- 2. Get Render claims ---
    let renderFeatures: any[] = [];
    try {
      const r = await fetch(target, { headers: { Accept: 'application/json' } });
      if (r.ok) {
        const data = await r.json();
        renderFeatures = data.features ?? [];
      } else {
        console.warn("Render fetch failed:", r.status);
      }
    } catch (err) {
      console.warn("Render fetch error:", err);
    }

    // --- 3. Merge into one FeatureCollection ---
    const allFeatures = [...renderFeatures, ...firebaseFeatures];
    return NextResponse.json({
      type: "FeatureCollection",
      features: allFeatures
    });
  } catch (err) {
    console.error('Proxy /api/claims error', err);
    return NextResponse.json({
      type: "FeatureCollection",
      features: [],
      error: 'Proxy failed'
    }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Save to Firestore
    const claimData = {
      state_name: body.state_name,
      district_name: body.district_name,
      village_name: body.village_name,
      claim_type: body.claim_type,
      claimant_name: body.claimant_name,
      community_name: body.community_name,
      claimed_area: body.claimed_area,
      latitude: body.latitude,
      longitude: body.longitude,
      status: 'pending',
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'claims'), claimData);

    // Return GeoJSON Feature
    const areaHa = claimData.claimed_area ?? 1;
    const areaM2 = areaHa * 10000;
    const radiusM = Math.sqrt(areaM2 / Math.PI);
    const radiusKm = radiusM / 1000;
    const circle = turf.circle([claimData.longitude ?? 0, claimData.latitude ?? 0], radiusKm, { steps: 64 });
    return NextResponse.json({
      success: true,
      message: "Claim stored successfully",
      feature: {
        type: "Feature",
        geometry: circle.geometry,
        properties: {
          claim_id: docRef.id,
          ...claimData,
          created_at: claimData.created_at.toDate(),
          updated_at: claimData.updated_at.toDate(),
          source: "firebase",
          radius: Math.sqrt(claimData.claimed_area ?? 1) * 200
        }
      }
    });
  } catch (err) {
    console.error('Firebase POST /api/claims error', err);
    return NextResponse.json({
      error: 'Failed to store claim in database',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
