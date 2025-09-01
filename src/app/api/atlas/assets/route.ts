import { NextResponse } from "next/server";

// Generate realistic fallback data for different states
function generateFallbackData(state: string, district: string) {
  const stateCenters: { [key: string]: [number, number] } = {
    'Madhya Pradesh': [77.4, 23.2],
    'Tripura': [91.2, 23.8],
    'Odisha': [85.8, 19.8],
    'Telangana': [78.4, 17.3],
    'West Bengal': [88.8, 21.9]
  };

  const [centerLng, centerLat] = stateCenters[state] || stateCenters['Madhya Pradesh'];

  // Generate diverse features around the state center
  const features = [];
  const featureTypes = ['pond', 'farm', 'well', 'wetland'];
  const villages = [
    'Village A', 'Village B', 'Village C', 'Village D', 'Village E',
    'Village F', 'Village G', 'Village H', 'Village I', 'Village J'
  ];

  for (let i = 0; i < 25; i++) {
    const type = featureTypes[i % featureTypes.length];
    const village = villages[i % villages.length];

    // Generate coordinates within a reasonable radius of the state center
    const radius = 0.5; // degrees
    const angle = (i / 25) * 2 * Math.PI;
    const lng = centerLng + Math.cos(angle) * radius * (0.5 + Math.random() * 0.5);
    const lat = centerLat + Math.sin(angle) * radius * (0.5 + Math.random() * 0.5);

    let properties: any = {
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
          water_quality: ['Good', 'Fair', 'Poor'][Math.floor(Math.random() * 3)],
          usage: ['Irrigation', 'Drinking', 'Both'][Math.floor(Math.random() * 3)]
        };
        break;
      case 'farm':
        properties = {
          ...properties,
          crop_type: ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize'][Math.floor(Math.random() * 5)],
          area_hectares: Math.round((1 + Math.random() * 9) * 100) / 100,
          irrigation_type: ['Canal', 'Well', 'Rain-fed'][Math.floor(Math.random() * 3)]
        };
        break;
      case 'well':
        properties = {
          ...properties,
          depth_meters: Math.round((10 + Math.random() * 50) * 100) / 100,
          water_level_meters: Math.round((2 + Math.random() * 20) * 100) / 100,
          well_type: ['Borewell', 'Hand Pump', 'Open Well'][Math.floor(Math.random() * 3)]
        };
        break;
      case 'wetland':
        properties = {
          ...properties,
          area_hectares: Math.round((2 + Math.random() * 18) * 100) / 100,
          wetland_type: ['Marsh', 'Swamp', 'Lake', 'Riverine'][Math.floor(Math.random() * 4)],
          biodiversity_index: Math.round((0.3 + Math.random() * 0.7) * 100) / 100
        };
        break;
    }

    features.push({
      type: "Feature",
      properties,
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    });
  }

  return features;
}

// OpenStreetMap Overpass API query for natural water bodies and agricultural features
async function fetchOSMData(bbox: string, featureType: string) {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  const query = `
    [out:json][timeout:25];
    (
      ${featureType}(${bbox});
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching OSM data:', error);
    return null;
  }
}

// Convert OSM data to GeoJSON format
function convertOSMToGeoJSON(osmData: any, stateName: string, districtName: string) {
  if (!osmData || !osmData.elements) return [];

  return osmData.elements
    .filter((element: any) => element.type === 'node' || element.type === 'way')
    .map((element: any, index: number) => {
      let coordinates: [number, number];
      let geometryType = 'Point';

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
    .filter(Boolean);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state') || 'Madhya Pradesh';
  const district = searchParams.get('district') || 'Bhopal';

  // Define bounding boxes for different states (approximate)
  const stateBounds: { [key: string]: string } = {
    'Madhya Pradesh': '74.0,21.0,82.0,26.0',
    'Tripura': '90.0,22.0,93.0,25.0',
    'Odisha': '81.0,17.0,87.0,23.0',
    'Telangana': '77.0,15.0,82.0,20.0',
    'West Bengal': '85.0,21.0,90.0,28.0'
  };

  const bbox = stateBounds[state] || stateBounds['Madhya Pradesh'];

  try {
    // Fetch different types of features from OSM
    const fetchPromises = [
      fetchOSMData(bbox, 'node["natural"="water"];way["natural"="water"];node["waterway"];way["waterway"]'),
      fetchOSMData(bbox, 'way["landuse"="farmland"];way["landuse"="farm"]'),
      fetchOSMData(bbox, 'node["man_made"="water_well"];node["amenity"="drinking_water"]')
    ];

    const results = await Promise.allSettled(fetchPromises);
    const [waterResult, farmlandResult, wellResult] = results;

    const features = [];

    // Process water data
    if (waterResult.status === 'fulfilled' && waterResult.value) {
      features.push(...convertOSMToGeoJSON(waterResult.value, state, district));
    }

    // Process farmland data
    if (farmlandResult.status === 'fulfilled' && farmlandResult.value) {
      features.push(...convertOSMToGeoJSON(farmlandResult.value, state, district));
    }

    // Process well data
    if (wellResult.status === 'fulfilled' && wellResult.value) {
      features.push(...convertOSMToGeoJSON(wellResult.value, state, district));
    }

    // If no real data, provide fallback sample data
    if (features.length === 0) {
      features.push(...generateFallbackData(state, district));
    }

    const geojson = {
      type: "FeatureCollection",
      features: features.slice(0, 50), // Limit to 50 features for performance
      metadata: {
        source: features.length > 0 && features[0].properties.source !== 'Realistic Fallback Data' ? 'OpenStreetMap Overpass API' : 'Realistic Fallback Data',
        state,
        district,
        bbox,
        total_features: features.length,
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Error in assets API:', error);

    // Fallback to realistic sample data if API fails
    const features = generateFallbackData(state, district);
    const geojson = {
      type: "FeatureCollection",
      features: features.slice(0, 50),
      metadata: {
        source: 'Realistic Fallback Data',
        state,
        district,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(geojson);
  }
}
