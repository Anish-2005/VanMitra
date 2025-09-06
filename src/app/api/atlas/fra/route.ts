import { NextResponse } from "next/server";

// Simple in-memory cache for FRA data
const fraCache = new Map<string, { data: unknown; timestamp: number }>();
const FRA_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for FRA data

// Pre-cache common FRA claims data
function initializeFRACache() {
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
      const cacheKey = `fra_${state}_${district}`;

      // Generate mock FRA features
      const mockFeatures = generateFallbackFRAClaims(state, district);

      const geojson = {
        type: "FeatureCollection",
        features: mockFeatures,
        metadata: {
          source: 'Pre-cached FRA Database',
          state,
          district,
          total_claims: mockFeatures.length,
          status_summary: {
            granted: mockFeatures.filter(f => f.properties.status === 'granted').length,
            submitted: mockFeatures.filter(f => f.properties.status === 'submitted').length,
            pending: mockFeatures.filter(f => f.properties.status === 'pending').length
          },
          timestamp: new Date().toISOString()
        }
      };

      fraCache.set(cacheKey, { data: geojson, timestamp: Date.now() });
    });
  });

  console.log('Pre-cached FRA claims data for common state/district combinations');
}

// Initialize FRA cache on startup
initializeFRACache();

// Generate realistic fallback FRA claims for different states
function generateFallbackFRAClaims(state: string, district: string) {
  const stateClaims: { [key: string]: any[] } = {
    'Madhya Pradesh': [
      {
        id: 'MP_BH_FRA_001',
        claimant: 'Ram Prasad Sharma',
        status: 'granted',
        area: 2.5,
        claim_type: 'IFR',
        village: 'Bairagarh',
        coordinates: [[[77.35, 23.25], [77.45, 23.25], [77.45, 23.15], [77.35, 23.15], [77.35, 23.25]]]
      },
      {
        id: 'MP_BH_FRA_002',
        claimant: 'Sita Bai Patel',
        status: 'submitted',
        area: 1.8,
        claim_type: 'CR',
        village: 'Misrod',
        coordinates: [[[77.38, 23.22], [77.42, 23.22], [77.42, 23.18], [77.38, 23.18], [77.38, 23.22]]]
      },
      {
        id: 'MP_BH_FRA_003',
        claimant: 'Mohan Singh Rajput',
        status: 'pending',
        area: 3.2,
        claim_type: 'IFR',
        village: 'Piplani',
        coordinates: [[[77.42, 23.28], [77.48, 23.28], [77.48, 23.22], [77.42, 23.22], [77.42, 23.28]]]
      },
      {
        id: 'MP_BH_FRA_004',
        claimant: 'Kavita Devi',
        status: 'granted',
        area: 4.1,
        claim_type: 'CR',
        village: 'Kolar Road',
        coordinates: [[[77.48, 23.32], [77.52, 23.32], [77.52, 23.28], [77.48, 23.28], [77.48, 23.32]]]
      },
      {
        id: 'MP_BH_FRA_005',
        claimant: 'Rajesh Kumar',
        status: 'submitted',
        area: 2.3,
        claim_type: 'IFR',
        village: 'Bagh Sewania',
        coordinates: [[[77.32, 23.18], [77.38, 23.18], [77.38, 23.12], [77.32, 23.12], [77.32, 23.18]]]
      }
    ],
    'Tripura': [
      {
        id: 'TR_WT_FRA_001',
        claimant: 'Prabhat Debbarma',
        status: 'granted',
        area: 1.5,
        claim_type: 'IFR',
        village: 'Agartala Municipal Area',
        coordinates: [[[91.25, 23.85], [91.35, 23.85], [91.35, 23.75], [91.25, 23.75], [91.25, 23.85]]]
      },
      {
        id: 'TR_WT_FRA_002',
        claimant: 'Rina Tripura',
        status: 'pending',
        area: 2.1,
        claim_type: 'CR',
        village: 'Udaipur',
        coordinates: [[[91.45, 23.52], [91.55, 23.52], [91.55, 23.42], [91.45, 23.42], [91.45, 23.52]]]
      },
      {
        id: 'TR_WT_FRA_003',
        claimant: 'Bina Debbarma',
        status: 'submitted',
        area: 3.7,
        claim_type: 'IFR',
        village: 'Dharmanagar',
        coordinates: [[[92.15, 24.35], [92.25, 24.35], [92.25, 24.25], [92.15, 24.25], [92.15, 24.35]]]
      }
    ],
    'Odisha': [
      {
        id: 'OD_PU_FRA_001',
        claimant: 'Sanjay Mohapatra',
        status: 'granted',
        area: 3.7,
        claim_type: 'IFR',
        village: 'Konark',
        coordinates: [[[86.05, 19.85], [86.15, 19.85], [86.15, 19.75], [86.05, 19.75], [86.05, 19.85]]]
      },
      {
        id: 'OD_PU_FRA_002',
        claimant: 'Priya Pradhan',
        status: 'submitted',
        area: 2.8,
        claim_type: 'CR',
        village: 'Puri Municipality',
        coordinates: [[[85.75, 19.82], [85.85, 19.82], [85.85, 19.72], [85.75, 19.72], [85.75, 19.82]]]
      },
      {
        id: 'OD_PU_FRA_003',
        claimant: 'Ramesh Chandra',
        status: 'pending',
        area: 4.2,
        claim_type: 'IFR',
        village: 'Brahmagiri',
        coordinates: [[[85.95, 19.78], [86.05, 19.78], [86.05, 19.68], [85.95, 19.68], [85.95, 19.78]]]
      }
    ],
    'Telangana': [
      {
        id: 'TS_HY_FRA_001',
        claimant: 'Venkat Reddy',
        status: 'granted',
        area: 2.2,
        claim_type: 'IFR',
        village: 'Secunderabad',
        coordinates: [[[78.45, 17.45], [78.55, 17.45], [78.55, 17.35], [78.45, 17.35], [78.45, 17.45]]]
      },
      {
        id: 'TS_HY_FRA_002',
        claimant: 'Lakshmi Rao',
        status: 'pending',
        area: 1.9,
        claim_type: 'CR',
        village: 'Kukatpally',
        coordinates: [[[78.35, 17.52], [78.45, 17.52], [78.45, 17.42], [78.35, 17.42], [78.35, 17.52]]]
      },
      {
        id: 'TS_HY_FRA_003',
        claimant: 'Srinivas Naidu',
        status: 'submitted',
        area: 3.1,
        claim_type: 'IFR',
        village: 'Hi-Tech City',
        coordinates: [[[78.37, 17.45], [78.42, 17.45], [78.42, 17.40], [78.37, 17.40], [78.37, 17.45]]]
      }
    ],
    'West Bengal': [
      {
        id: 'WB_SB_FRA_001',
        claimant: 'Amit Singh',
        status: 'granted',
        area: 4.5,
        claim_type: 'IFR',
        village: 'Sundarban Reserve Forest',
        coordinates: [[[88.75, 21.95], [88.85, 21.95], [88.85, 21.85], [88.75, 21.85], [88.75, 21.95]]]
      },
      {
        id: 'WB_SB_FRA_002',
        claimant: 'Bina Devi',
        status: 'submitted',
        area: 3.1,
        claim_type: 'CR',
        village: 'Basanti',
        coordinates: [[[88.65, 22.15], [88.75, 22.15], [88.75, 22.05], [88.65, 22.05], [88.65, 22.15]]]
      },
      {
        id: 'WB_SB_FRA_003',
        claimant: 'Raj Kumar',
        status: 'pending',
        area: 2.8,
        claim_type: 'IFR',
        village: 'Canning',
        coordinates: [[[88.65, 22.32], [88.75, 22.32], [88.75, 22.22], [88.65, 22.22], [88.65, 22.32]]]
      }
    ]
  };

  const defaultClaims = [
    {
      id: 'DEFAULT_FRA_001',
      claimant: 'Sample Claimant 1',
      status: 'granted',
      area: 2.5,
      claim_type: 'IFR',
      village: 'Sample Village 1',
      coordinates: [[[77.35, 23.25], [77.45, 23.25], [77.45, 23.15], [77.35, 23.15], [77.35, 23.25]]]
    },
    {
      id: 'DEFAULT_FRA_002',
      claimant: 'Sample Claimant 2',
      status: 'pending',
      area: 1.8,
      claim_type: 'CR',
      village: 'Sample Village 2',
      coordinates: [[[77.38, 23.22], [77.42, 23.22], [77.42, 23.18], [77.38, 23.18], [77.38, 23.22]]]
    },
    {
      id: 'DEFAULT_FRA_003',
      claimant: 'Sample Claimant 3',
      status: 'submitted',
      area: 3.2,
      claim_type: 'IFR',
      village: 'Sample Village 3',
      coordinates: [[[77.42, 23.28], [77.48, 23.28], [77.48, 23.22], [77.42, 23.22], [77.42, 23.28]]]
    }
  ];

  const claims = stateClaims[state] || defaultClaims;

  return claims.map(claim => ({
    type: "Feature",
    properties: {
      id: claim.id,
      claimant: claim.claimant,
      status: claim.status,
      area: claim.area,
      claim_type: claim.claim_type,
      village: claim.village,
      state,
      district,
      application_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      source: 'Realistic Fallback Data',
      resolution_status: claim.status === 'granted' ? 'approved' : claim.status === 'submitted' ? 'under_review' : 'pending'
    },
    geometry: {
      type: "Polygon",
      coordinates: claim.coordinates
    }
  }));
}

// Function to fetch FRA claims data from government sources
async function fetchFRAClaims(state: string, district: string) {
  // In production, this would connect to actual FRA database or government APIs
  // For now, we'll simulate realistic FRA data based on state/district

  const mockFRAData = {
    'Madhya Pradesh': {
      'Bhopal': [
        { id: 'MP_BH_FRA_001', claimant: 'Ram Prasad Sharma', status: 'granted', area: 2.5, claim_type: 'IFR', village: 'Bairagarh' },
        { id: 'MP_BH_FRA_002', claimant: 'Sita Bai Patel', status: 'submitted', area: 1.8, claim_type: 'CR', village: 'Misrod' },
        { id: 'MP_BH_FRA_003', claimant: 'Mohan Singh Rajput', status: 'pending', area: 3.2, claim_type: 'IFR', village: 'Piplani' }
      ],
      'Indore': [
        { id: 'MP_IN_FRA_001', claimant: 'Kavita Devi', status: 'granted', area: 4.1, claim_type: 'CR', village: 'Palda' },
        { id: 'MP_IN_FRA_002', claimant: 'Rajesh Kumar', status: 'submitted', area: 2.3, claim_type: 'IFR', village: 'Vijay Nagar' }
      ]
    },
    'Tripura': {
      'West Tripura': [
        { id: 'TR_WT_FRA_001', claimant: 'Prabhat Debbarma', status: 'granted', area: 1.5, claim_type: 'IFR', village: 'Agartala' },
        { id: 'TR_WT_FRA_002', claimant: 'Rina Tripura', status: 'pending', area: 2.1, claim_type: 'CR', village: 'Udaipur' }
      ]
    },
    'Odisha': {
      'Puri': [
        { id: 'OD_PU_FRA_001', claimant: 'Sanjay Mohapatra', status: 'granted', area: 3.7, claim_type: 'IFR', village: 'Konark' },
        { id: 'OD_PU_FRA_002', claimant: 'Priya Pradhan', status: 'submitted', area: 2.8, claim_type: 'CR', village: 'Puri Sadar' }
      ]
    },
    'Telangana': {
      'Hyderabad': [
        { id: 'TS_HY_FRA_001', claimant: 'Venkat Reddy', status: 'granted', area: 2.2, claim_type: 'IFR', village: 'Secunderabad' },
        { id: 'TS_HY_FRA_002', claimant: 'Lakshmi Rao', status: 'pending', area: 1.9, claim_type: 'CR', village: 'Kukatpally' }
      ]
    },
    'West Bengal': {
      'Sundarban': [
        { id: 'WB_SB_FRA_001', claimant: 'Amit Singh', status: 'granted', area: 4.5, claim_type: 'IFR', village: 'Sundarban' },
        { id: 'WB_SB_FRA_002', claimant: 'Bina Devi', status: 'submitted', area: 3.1, claim_type: 'CR', village: 'Reserve Forest' }
      ]
    }
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const stateData = mockFRAData[state as keyof typeof mockFRAData];
  if (!stateData) return [];

  const districtData = stateData[district as keyof typeof stateData];
  return districtData || [];
}

// Function to generate realistic polygon coordinates for FRA claims
function generateFRAPolygon(baseLng: number, baseLat: number, area: number, index: number) {
  // Approximate polygon size based on area (hectares)
  const size = Math.sqrt(area) * 0.001; // Rough conversion to coordinate units

  const offsetLng = (index % 3) * 0.02; // Spread claims horizontally
  const offsetLat = Math.floor(index / 3) * 0.02; // Spread claims vertically

  return [
    [baseLng + offsetLng, baseLat + offsetLat],
    [baseLng + offsetLng + size, baseLat + offsetLat],
    [baseLng + offsetLng + size, baseLat + offsetLat + size],
    [baseLng + offsetLng, baseLat + offsetLat + size],
    [baseLng + offsetLng, baseLat + offsetLat]
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state') || 'Madhya Pradesh';
  const district = searchParams.get('district') || 'Bhopal';

  const cacheKey = `fra_${state}_${district}`;

  try {
    // Check pre-cached data first for instant response
    const cached = fraCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < FRA_CACHE_DURATION) {
      console.log('Using pre-cached FRA data for instant response');
      return NextResponse.json(cached.data);
    }

    // Fetch FRA claims data
    const fraData = await fetchFRAClaims(state, district);

    // State center coordinates for polygon generation
  // Resolve state center from shared regions metadata when available
  // Importing here avoids circular import during edge runtime evaluation
  const { STATES, DEFAULT_STATE } = await import('@/lib/regions');
  const resolved = STATES.find(s => s.name === state) ?? STATES.find(s => s.name === DEFAULT_STATE);
  const [centerLng, centerLat] = resolved?.center ?? [78.9629, 22.9734];

    // Convert to GeoJSON features
    const features = fraData.map((claim: any, index: number) => ({
      type: "Feature",
      properties: {
        id: claim.id,
        claimant: claim.claimant,
        status: claim.status,
        area: claim.area,
        claim_type: claim.claim_type,
        village: claim.village,
        state: state,
        district: district,
        application_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        source: 'FRA Database (Mock)',
        resolution_status: claim.status === 'granted' ? 'approved' : claim.status === 'submitted' ? 'under_review' : 'pending'
      },
      geometry: {
        type: "Polygon",
        coordinates: [generateFRAPolygon(centerLng, centerLat, claim.area, index)]
      }
    }));

    const geojson = {
      type: "FeatureCollection",
      features: features,
      metadata: {
        source: 'Forest Rights Act Database',
        state,
        district,
        total_claims: features.length,
        status_summary: {
          granted: features.filter(f => f.properties.status === 'granted').length,
          submitted: features.filter(f => f.properties.status === 'submitted').length,
          pending: features.filter(f => f.properties.status === 'pending').length
        },
        timestamp: new Date().toISOString()
      }
    };

    // Cache the result
    fraCache.set(cacheKey, { data: geojson, timestamp: Date.now() });

    return NextResponse.json(geojson);
  } catch (err) {
    console.error('Error in FRA API:', err);

    // Fallback to realistic sample data if API fails
    const features = generateFallbackFRAClaims(state, district);
    const geojson = {
      type: "FeatureCollection",
      features: features.slice(0, 15),
      metadata: {
        source: 'Realistic Fallback Data',
        state,
        district,
        total_claims: features.length,
        status_summary: {
          granted: features.filter(f => f.properties.status === 'granted').length,
          submitted: features.filter(f => f.properties.status === 'submitted').length,
          pending: features.filter(f => f.properties.status === 'pending').length
        },
  error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(geojson);
  }
}
