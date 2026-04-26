// src/services/claims.ts
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ClaimsResponse, Claim, ClaimsResponseSchema } from '@/types/api';
import * as turf from '@turf/turf';

export class ClaimsService {
  static async getAllClaims(status?: string): Promise<ClaimsResponse> {
    try {
      const firebaseClaims = await this.getFirebaseClaims()
      const externalClaims = await this.getExternalClaims(status)
      const allFeatures = [...firebaseClaims, ...externalClaims]
      const response = {
        type: "FeatureCollection" as const,
        features: allFeatures,
      }

      try {
        return ClaimsResponseSchema.parse(response)
      } catch (validationError) {
        if (validationError instanceof Error && validationError.name === "ZodError") {
          console.error("❌ Claims Validation Error:", JSON.stringify((validationError as any).issues, null, 2))
        }
        throw validationError
      }
    } catch (error) {
      console.error("Error fetching claims:", error)
      throw new Error("Failed to fetch claims")
    }
  }

  private static async getFirebaseClaims(): Promise<ClaimsResponse["features"]> {
    try {
      const snap = await getDocs(collection(db, "claims"))

      return snap.docs.map((doc) => {
        const data = doc.data()
        const landArea = Number(data.claimed_area || data.land_area || 1)
        const radiusKm = Math.sqrt(landArea * 10000 / Math.PI) / 1000
        const circle = turf.circle([data.longitude || 78.0, data.latitude || 23.0], radiusKm, { steps: 64 })

        return {
          type: "Feature" as const,
          geometry: circle.geometry as any,
          properties: {
            claim_id: String(doc.id),
            claim_type: String(data.claim_type || "Individual"),
            claimant_name: String(data.claimant_name || "Unknown"),
            community_name: String(data.community_name || ""),
            land_area: landArea,
            state: String(data.state_name || data.state || "Madhya Pradesh"),
            district: String(data.district_name || data.district || ""),
            village: String(data.village_name || data.village || ""),
            status: String(data.status === "granted" ? "approved" : (data.status || "pending")),
            created_at: data.created_at ? (isNaN(new Date(data.created_at instanceof Timestamp ? data.created_at.toDate() : data.created_at).getTime()) ? null : new Date(data.created_at instanceof Timestamp ? data.created_at.toDate() : data.created_at)) : null,
            updated_at: data.updated_at ? (isNaN(new Date(data.updated_at instanceof Timestamp ? data.updated_at.toDate() : data.updated_at).getTime()) ? null : new Date(data.updated_at instanceof Timestamp ? data.updated_at.toDate() : data.updated_at)) : null,
            source: "firebase",
            radius: Math.sqrt(landArea) * 200,
          },
        }
      })
    } catch (error) {
      console.error("Firebase fetch error:", error)
      return []
    }
  }

  private static async getExternalClaims(status?: string): Promise<ClaimsResponse["features"]> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_EXTERNAL_API_URL || "https://vanmitra.onrender.com"
      const qs = status ? `?status=${status}` : "?status=all"
      const target = `${baseUrl}/claims${qs}`

      const response = await fetch(target, {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
      })

      if (!response.ok) return []
      const data = await response.json()

      return (data.features || []).map((feature: any) => {
        const props = feature.properties || {}
        const landArea = Number(props.land_area || props.claimed_area || 1)

        return {
          type: "Feature" as const,
          geometry: feature.geometry,
          properties: {
            claim_id: String(props.claim_id || feature.id || Math.random().toString(36).substr(2, 9)),
            claim_type: String(props.claim_type || "Individual"),
            claimant_name: String(props.claimant_name || "Unknown"),
            community_name: String(props.community_name || ""),
            land_area: landArea,
            state: String(props.state || props.state_name || "Madhya Pradesh"),
            district: String(props.district || props.district_name || ""),
            village: String(props.village || props.village_name || ""),
            status: String(props.status === "granted" ? "approved" : (props.status || "pending")),
            created_at: props.created_at ? (isNaN(new Date(props.created_at).getTime()) ? null : new Date(props.created_at)) : null,
            updated_at: props.updated_at ? (isNaN(new Date(props.updated_at).getTime()) ? null : new Date(props.updated_at)) : null,
            source: "external",
            radius: Number(props.radius || (Math.sqrt(landArea) * 200)),
          },
        }
      })
    } catch (error) {
      console.warn("External API fetch error:", error)
      return []
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