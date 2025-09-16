import { NextResponse } from "next/server";

// Simple in-memory cache for OSM data
const osmCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes - increased cache duration

// Request queue to prevent concurrent requests to the same endpoint
const requestQueue = new Map<string, Promise<any>>();
const REQUEST_TIMEOUT = 30000; // 30 seconds timeout for queued requests

type OSMResponse = { elements?: any[] };

// Pre-cache common mock data for instant loading
function initializeMockCache() {
  const commonStates = ['Madhya Pradesh', 'Tripura', 'Odisha', 'Telangana', 'West Bengal'];
  const commonDistricts = {
    'Madhya Pradesh': ['Bhopal', 'Indore'],
    'Tripura': ['West Tripura'],
    'Odisha': ['Puri'],
    'Telangana': ['Hyderabad'],
    'West Bengal': ['Sundarban']
  };

  commonStates.forEach(state => {
    const districts = commonDistricts[state as keyof typeof commonDistricts] || [state.split(' ')[0]];
    districts.forEach(district => {
      const mockFeatures = generateFallbackData(state, district);
      const bbox = '74.0,21.0,82.0,26.0'; // Default bbox
      const cacheKey = `${bbox}_combined`;
      const geojson = {
        type: "FeatureCollection",
        features: mockFeatures.slice(0, 50),
        metadata: {
          source: 'Realistic Fallback Data',
          state,
          district,
          bbox,
          total_features: mockFeatures.length,
          timestamp: new Date().toISOString()
        }
      };

      osmCache.set(cacheKey, { data: geojson, timestamp: Date.now() });
    });
  });

  console.log('Pre-cached mock data for common state/district combinations');
}

// Initialize mock cache on startup
initializeMockCache();

// Quick OSM fetch with minimal retries and fast timeout
async function fetchOSMDataQuick(bbox: string, featureType: string): Promise<OSMResponse | null> {
  const cacheKey = `${bbox}_${featureType}`;
  const now = Date.now();

  // Check cache first
  const cached = osmCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  const query = `
    [out:json][timeout:10];
    (
      ${featureType}(${bbox});
    );
    out body 20;
    >;
    out skel qt;
  `;

  try {
    // Fast fetch with short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'VanMitra-FRA-Application/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      // Single quick retry for rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchOSMDataQuick(bbox, featureType);
    }

    if (!response.ok) {
      return null;
    }

  const data = (await response.json()) as OSMResponse;

  // Cache the successful response
  osmCache.set(cacheKey, { data, timestamp: now });

  return data;
  } catch (error) {
    // Return null on any error for fast fallback
    return null;
  }
}

import { Feature, Point } from "geojson";

interface FallbackProperties {
  id: string;
  type: 'pond' | 'farm' | 'well' | 'wetland';
  state: string;
  district: string;
  village: string;
  source: string;
  created_date: string;
  // optional type-specific properties
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
  const stateCenters: Record<string, [number, number]> = {
    'Madhya Pradesh': [77.4, 23.2],
    'Tripura': [91.2, 23.8],
    'Odisha': [85.8, 19.8],
    'Telangana': [78.4, 17.3],
    'West Bengal': [88.8, 21.9]
  };

  const [centerLng, centerLat] = stateCenters[state] || stateCenters['Madhya Pradesh'];

  const features: Feature<Point, FallbackProperties>[] = [];
  const featureTypes: FallbackProperties['type'][] = ['pond', 'farm', 'well', 'wetland'];
  const villages = [
    'Village A', 'Village B', 'Village C', 'Village D', 'Village E',
    'Village F', 'Village G', 'Village H', 'Village I', 'Village J'
  ];

  for (let i = 0; i < 25; i++) {
    const type = featureTypes[i % featureTypes.length];
    const village = villages[i % villages.length];

    const radius = 0.5;
    const angle = (i / 25) * 2 * Math.PI;
    const lng = centerLng + Math.cos(angle) * radius * (0.5 + Math.random() * 0.5);
    const lat = centerLat + Math.sin(angle) * radius * (0.5 + Math.random() * 0.5);

    let properties: FallbackProperties = {
      id: `${state.toLowerCase().replace(' ', '_')}_${district.toLowerCase().replace(' ', '_')}_${type}_${i + 1}`,
      type,
      state,
      district,
      village,
      source: 'Realistic Fallback Data',
      created_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    // Add type-specific properties
    switch (type) {
      case 'pond':
        properties = {
          ...properties,
          area_hectares: Math.round((0.5 + Math.random() * 4.5) * 100) / 100,
          water_quality: ['Good', 'Fair', 'Poor'][Math.floor(Math.random() * 3)] as 'Good' | 'Fair' | 'Poor',
          usage: ['Irrigation', 'Drinking', 'Both'][Math.floor(Math.random() * 3)] as 'Irrigation' | 'Drinking' | 'Both'
        };
        break;
      case 'farm':
        properties = {
          ...properties,
          crop_type: ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize'][Math.floor(Math.random() * 5)] as 'Rice' | 'Wheat' | 'Cotton' | 'Sugarcane' | 'Maize',
          area_hectares: Math.round((1 + Math.random() * 9) * 100) / 100,
          irrigation_type: ['Canal', 'Well', 'Rain-fed'][Math.floor(Math.random() * 3)] as 'Canal' | 'Well' | 'Rain-fed'
        };
        break;
      case 'well':
        properties = {
          ...properties,
          depth_meters: Math.round((10 + Math.random() * 50) * 100) / 100,
          water_level_meters: Math.round((2 + Math.random() * 20) * 100) / 100,
          well_type: ['Borewell', 'Hand Pump', 'Open Well'][Math.floor(Math.random() * 3)] as 'Borewell' | 'Hand Pump' | 'Open Well'
        };
        break;
      case 'wetland':
        properties = {
          ...properties,
          area_hectares: Math.round((2 + Math.random() * 18) * 100) / 100,
          wetland_type: ['Marsh', 'Swamp', 'Lake', 'Riverine'][Math.floor(Math.random() * 4)] as 'Marsh' | 'Swamp' | 'Lake' | 'Riverine',
          biodiversity_index: Math.round((0.3 + Math.random() * 0.7) * 100) / 100
        };
        break;
    }

    features.push({
      type: "Feature",
      properties,
      geometry: {
        type: "Point",
        coordinates: [lng, lat]
      }
    });
  }

  return features;
}

// OpenStreetMap Overpass API query for natural water bodies and agricultural features with retry logic
/* eslint-disable @typescript-eslint/no-unused-vars */
async function fetchOSMData(bbox: string, featureType: string, retryCount = 0): Promise<any> {
  const cacheKey = `${bbox}_${featureType}`;
  const now = Date.now();

  // Check cache first
  const cached = osmCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`Using cached data for ${featureType}`);
    return cached.data;
  }

  // Check if there's already a request in progress for this endpoint
  const queueKey = cacheKey;
  if (requestQueue.has(queueKey)) {
    console.log(`Request already in progress for ${featureType}, waiting...`);
    try {
      const result = await Promise.race([
        requestQueue.get(queueKey),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)
        )
      ]);
      return result;
    } catch (error) {
      console.log(`Queued request failed for ${featureType}, proceeding with new request`);
    }
  }

  // Create a new request promise
  const requestPromise = (async () => {
    const maxRetries = 3;
    const baseDelay = 5000; // 5 second base delay - increased

    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const query = `
      [out:json][timeout:25];
      (
        ${featureType}(${bbox});
      );
      out body 50;
      >;
      out skel qt;
    `;

    try {
      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: query,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'VanMitra-FRA-Application/1.0'
        }
      });

      // Handle rate limiting (429)
      if (response.status === 429) {
        if (retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
          console.log(`Rate limited (429). Retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchOSMData(bbox, featureType, retryCount + 1);
        } else {
          console.log('Max retries reached for rate limited request, using fallback data');
          return null;
        }
      }

      if (!response.ok) {
        // For other errors, don't retry
        console.error(`Overpass API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();

      // Cache the successful response
      osmCache.set(cacheKey, { data, timestamp: now });

      return data;
    } catch (error) {
      console.error(`Error fetching OSM data (attempt ${retryCount + 1}):`, error);
      return null;
    }
  })();

  // Store the promise in the queue
  requestQueue.set(queueKey, requestPromise);

  try {
    const result = await requestPromise;
    return result;
  } finally {
    // Clean up the queue after the request completes
    requestQueue.delete(queueKey);
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

// Convert OSM data to GeoJSON format
function convertOSMToGeoJSON(osmData: OSMResponse | null, stateName: string, districtName: string): any[] {
  if (!osmData || !osmData.elements) return [];

  return (osmData.elements || [])
    .filter((element: any) => element.type === 'node' || element.type === 'way')
    .map((element: any, index: number) => {
      let coordinates: [number, number];
      const geometryType = 'Point';

      if (element.type === 'node') {
        coordinates = [element.lon, element.lat];
      } else if (element.type === 'way' && element.geometry) {
        // For ways, use the first coordinate as representative point
        const firstNode = element.geometry[0];
        coordinates = [firstNode.lon, firstNode.lat];
      } else {
        return null;
      }

      // Determine asset type based on OSM tags
      let assetType = 'unknown';
      if (element.tags) {
        if (element.tags.natural === 'water' || element.tags.waterway) {
          assetType = 'pond';
        } else if (element.tags.landuse === 'farmland' || element.tags.landuse === 'farm') {
          assetType = 'farm';
        } else if (element.tags.man_made === 'water_well' || element.tags.amenity === 'drinking_water') {
          assetType = 'well';
        } else if (element.tags.natural === 'wetland') {
          assetType = 'wetland';
        }
      }

      return {
        type: "Feature",
        properties: {
          id: element.id || `osm_${index}`,
          type: assetType,
          state: stateName,
          district: districtName,
          osm_id: element.id,
          tags: element.tags || {}
        },
        geometry: {
          type: geometryType,
          coordinates: coordinates
        }
      };
    })
    .filter((feature): feature is any => feature !== null);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state') || 'Madhya Pradesh';
  const district = searchParams.get('district') || 'Bhopal';

  console.log(`Assets API called for ${state}, ${district}`);

  // Define bounding boxes for different states (approximate)
  // BBox fallbacks per-state; keep approximate bounds but prefer shared region centers when available
  const stateBounds: { [key: string]: string } = {
    'Madhya Pradesh': '74.0,21.0,82.0,26.0',
    'Tripura': '90.0,22.0,93.0,25.0',
    'Odisha': '81.0,17.0,87.0,23.0',
    'Telangana': '77.0,15.0,82.0,20.0',
    'West Bengal': '85.0,21.0,90.0,28.0'
  };

  const bbox = stateBounds[state] || stateBounds['Madhya Pradesh'];

  // Check cache first for immediate response
  const cacheKey = `${bbox}_combined`;
  const cached = osmCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('Using cached combined data');
    return NextResponse.json(cached.data);
  }

  try {
    // Try to get OSM data quickly, but don't wait too long
    const features: any[] = [];
    let hasOSMData = false;

    // Quick OSM fetch with minimal delay and single retry
    console.log('Quick OSM fetch attempt...');

    const osmPromises = [
      fetchOSMDataQuick(bbox, 'node["natural"="water"];way["natural"="water"];node["waterway"];way["waterway"]'),
      fetchOSMDataQuick(bbox, 'way["landuse"="farmland"];way["landuse"="farm"]'),
      fetchOSMDataQuick(bbox, 'node["man_made"="water_well"];node["amenity"="drinking_water"]')
    ];

    // Wait for all OSM requests with a short timeout
    const osmResults = await Promise.allSettled(osmPromises);

    osmResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const geoJsonFeatures = convertOSMToGeoJSON(result.value, state, district);
        if (geoJsonFeatures.length > 0) {
          features.push(...geoJsonFeatures);
          hasOSMData = true;
          console.log(`Added ${geoJsonFeatures.length} features from OSM query ${index + 1}`);
        }
      }
    });

    // If we got some OSM data, use it
    if (hasOSMData && features.length > 0) {
      console.log(`Using ${features.length} OSM features`);
      const geojson = {
        type: "FeatureCollection",
        features: features.slice(0, 50),
        metadata: {
          source: 'OpenStreetMap Overpass API',
          state,
          district,
          bbox,
          total_features: features.length,
          timestamp: new Date().toISOString()
        }
      };

      // Cache the result
      osmCache.set(cacheKey, { data: geojson, timestamp: Date.now() });
      return NextResponse.json(geojson);
    }

    // If no OSM data or OSM failed, use fast mock data
    console.log('Using fast mock data');
    const mockFeatures = generateFallbackData(state, district);
    const geojson = {
      type: "FeatureCollection",
      features: mockFeatures.slice(0, 50),
      metadata: {
        source: 'Realistic Fallback Data',
        state,
        district,
        bbox,
        total_features: mockFeatures.length,
        timestamp: new Date().toISOString()
      }
    };

    // Cache the mock result too
    osmCache.set(cacheKey, { data: geojson, timestamp: Date.now() });
    return NextResponse.json(geojson);

  } catch (err) {
    console.error('Error in assets API:', err);

    // Fast fallback to mock data
    console.log('Fast fallback to mock data due to error');
    const mockFeatures = generateFallbackData(state, district);
    const geojson = {
      type: "FeatureCollection",
      features: mockFeatures.slice(0, 50),
      metadata: {
        source: 'Realistic Fallback Data',
        state,
        district,
  error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(geojson);
  }
}
