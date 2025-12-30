// src/types/api.ts
import { z } from "zod";

// GeoJSON Feature types
export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: string;
    coordinates: number[][][] | number[][];
  };
  properties: Record<string, unknown>;
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

// Claim types
export interface Claim {
  claim_id?: string;
  claim_type: string;
  claimant_name: string;
  community_name: string;
  land_area: number;
  state: string;
  district: string;
  village: string;
  status: "pending" | "approved" | "rejected";
  latitude: number;
  longitude: number;
  created_at?: Date;
  updated_at?: Date;
}

// API Response schemas
export const ClaimSchema = z.object({
  claim_id: z.string().optional(),
  claim_type: z.string(),
  claimant_name: z.string(),
  community_name: z.string(),
  land_area: z.number(),
  state: z.string(),
  district: z.string(),
  village: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  latitude: z.number(),
  longitude: z.number(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const ClaimsResponseSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(z.object({
    type: z.literal("Feature"),
    geometry: z.object({
      type: z.string(),
      coordinates: z.union([z.array(z.array(z.array(z.number()))), z.array(z.array(z.number()))]),
    }),
    properties: z.object({
      claim_id: z.string(),
      claim_type: z.string(),
      claimant_name: z.string(),
      community_name: z.string(),
      land_area: z.number(),
      state: z.string(),
      district: z.string(),
      village: z.string(),
      status: z.string(),
      created_at: z.date().nullable(),
      updated_at: z.date().nullable(),
      source: z.string(),
      radius: z.number(),
    }),
  })),
});

export type ClaimsResponse = z.infer<typeof ClaimsResponseSchema>;

// Dashboard KPI types
export interface DashboardKPI {
  total_claims: number;
  approved_claims: number;
  pending_claims: number;
  rejected_claims: number;
  total_area: number;
  approved_area: number;
}

export const DashboardKPISchema = z.object({
  total_claims: z.number(),
  approved_claims: z.number(),
  pending_claims: z.number(),
  rejected_claims: z.number(),
  total_area: z.number(),
  approved_area: z.number(),
});

// Atlas types
export interface AtlasLayer {
  id: string;
  name: string;
  type: "geojson" | "raster" | "vector";
  url?: string;
  data?: GeoJSONFeatureCollection;
  visible: boolean;
  style: {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    opacity?: number;
  };
}

export interface AtlasMarker {
  id: string;
  lng: number;
  lat: number;
  label?: string;
  color?: string;
  popup?: string;
  size?: number;
}

// Error types
export interface APIError {
  error: string;
  code: number;
  details?: Record<string, unknown>;
}

// Auth types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: "admin" | "user";
}