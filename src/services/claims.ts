// src/services/claims.ts
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ClaimsResponse, Claim, ClaimsResponseSchema } from '@/types/api';
import * as turf from '@turf/turf';

export class ClaimsService {
  static async getAllClaims(status?: string): Promise<ClaimsResponse> {
    try {
      // Get Firebase claims
      const firebaseClaims = await this.getFirebaseClaims();

      // Get external claims if needed
      const externalClaims = await this.getExternalClaims(status);

      // Combine and validate
      const allFeatures = [...firebaseClaims, ...externalClaims];
      const response = {
        type: "FeatureCollection" as const,
        features: allFeatures,
      };

      // Validate response
      return ClaimsResponseSchema.parse(response);
    } catch (error) {
      console.error('Error fetching claims:', error);
      throw new Error('Failed to fetch claims');
    }
  }

  private static async getFirebaseClaims(): Promise<ClaimsResponse['features']> {
    const snap = await getDocs(collection(db, 'claims'));

    return snap.docs.map(doc => {
      const data = doc.data();

      // Map Firebase field names to our schema
      const landArea = data.claimed_area || data.land_area || 1;
      const state = data.state_name || data.state || '';
      const district = data.district_name || data.district || '';
      const village = data.village_name || data.village || '';

      // Calculate radius from claimed area
      const areaHa = landArea;
      const areaM2 = areaHa * 10000;
      const radiusM = Math.sqrt(areaM2 / Math.PI);
      const radiusKm = radiusM / 1000;

      // Create circle geometry
      const circle = turf.circle([data.longitude, data.latitude], radiusKm, { steps: 64 });

      return {
        type: "Feature" as const,
        geometry: circle.geometry,
        properties: {
          claim_id: doc.id,
          claim_type: data.claim_type || '',
          claimant_name: data.claimant_name || '',
          community_name: data.community_name || '',
          land_area: landArea,
          state: state,
          district: district,
          village: village,
          status: data.status || 'pending',
          created_at: data.created_at ?? null,
          updated_at: data.updated_at ?? null,
          source: "firebase",
          radius: Math.sqrt(landArea) * 200,
        },
      };
    });
  }

  private static async getExternalClaims(status?: string): Promise<ClaimsResponse['features']> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_EXTERNAL_API_URL || 'https://vanmitra.onrender.com';
      const qs = status ? `?status=${status}` : '?status=all';
      const target = `${baseUrl}/claims${qs}`;

      const response = await fetch(target, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 300 }, // Cache for 5 minutes
      });

      if (!response.ok) {
        console.warn('External claims API unavailable, using empty array');
        return [];
      }

      const data = await response.json();

      // Transform external data to match our schema
      return (data.features || []).map((feature: any) => ({
        ...feature,
        properties: {
          ...feature.properties,
          source: "external",
        },
      }));
    } catch (error) {
      console.warn('Failed to fetch external claims:', error);
      return [];
    }
  }

  static async createClaim(claimData: Omit<Claim, 'claim_id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'claims'), {
        ...claimData,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating claim:', error);
      throw new Error('Failed to create claim');
    }
  }

  static async getClaimsCount(): Promise<{
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  }> {
    try {
      const claims = await this.getAllClaims();

      const stats = claims.features.reduce(
        (acc, feature) => {
          const status = feature.properties.status;
          acc.total++;
          if (status === 'approved') acc.approved++;
          else if (status === 'pending') acc.pending++;
          else if (status === 'rejected') acc.rejected++;
          return acc;
        },
        { total: 0, approved: 0, pending: 0, rejected: 0 }
      );

      return stats;
    } catch (error) {
      console.error('Error getting claims count:', error);
      throw new Error('Failed to get claims count');
    }
  }
}