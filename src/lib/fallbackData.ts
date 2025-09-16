import { Feature, Point } from "geojson";

export interface FallbackProperties {
  id: string;
  type: 'pond' | 'farm' | 'well' | 'wetland';
  state: string;
  district: string;
  village: string;
  source: string;
  created_date: string;
  area_hectares?: number;
  water_quality?: 'Good' | 'Fair' | 'Poor';
  usage?: 'Irrigation' | 'Drinking' | 'Both';
  crop_type?: 'Rice' | 'Wheat' | 'Cotton' | 'Sugarcane' | 'Maize';
  irrigation_type?: 'Canal' | 'Well' | 'Rain-fed';
  depth_meters?: number;
  water_level_meters?: number;
  well_type?: 'Borewell' | 'Hand Pump' | 'Open Well';
  wetland_type?: 'Marsh' | 'Swamp' | 'Lake' | 'Riverine';
  biodiversity_index?: number;
}

export function generateFallbackData(state: string, district: string): Feature<Point, FallbackProperties>[] {
  // Generate sample fallback data for the given state and district
  const fallbackData: Feature<Point, FallbackProperties>[] = [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [77.2090, 28.6139], // Sample coordinates (Delhi area)
      },
      properties: {
        id: "fallback-1",
        type: "pond",
        state,
        district,
        village: "Sample Village",
        source: "Fallback Data",
        created_date: new Date().toISOString(),
        area_hectares: 2.5,
        water_quality: "Good",
        usage: "Irrigation",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [77.2190, 28.6239], // Slightly different coordinates
      },
      properties: {
        id: "fallback-2",
        type: "well",
        state,
        district,
        village: "Sample Village 2",
        source: "Fallback Data",
        created_date: new Date().toISOString(),
        depth_meters: 25,
        water_level_meters: 8,
        well_type: "Borewell",
        usage: "Drinking",
      },
    },
  ];

  return fallbackData;
}
