import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// Asset types supported by the system
const ASSET_TYPES = ['pond', 'farm', 'well', 'wetland'] as const;
type AssetType = typeof ASSET_TYPES[number];

// Interface for asset creation request
interface CreateAssetRequest {
  latitude: number;
  longitude: number;
  type: AssetType;
  state: string;
  district: string;
  village?: string;
  // Type-specific properties
  area_hectares?: number;
  water_quality?: 'Good' | 'Fair' | 'Poor';
  usage?: 'Irrigation' | 'Drinking' | 'Both';
  crop_type?: string;
  irrigation_type?: 'Canal' | 'Well' | 'Rain-fed';
  depth_meters?: number;
  water_level_meters?: number;
  well_type?: 'Borewell' | 'Hand Pump' | 'Open Well';
  wetland_type?: 'Marsh' | 'Swamp' | 'Lake' | 'Riverine';
  biodiversity_index?: number;
  // Additional metadata
  description?: string;
  reported_by?: string;
  contact_info?: string;
}

// Validation function for asset data
function validateAssetData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (typeof data.latitude !== 'number' || data.latitude < -90 || data.latitude > 90) {
    errors.push('latitude must be a number between -90 and 90');
  }

  if (typeof data.longitude !== 'number' || data.longitude < -180 || data.longitude > 180) {
    errors.push('longitude must be a number between -180 and 180');
  }

  if (!data.type || !ASSET_TYPES.includes(data.type)) {
    errors.push(`type must be one of: ${ASSET_TYPES.join(', ')}`);
  }

  if (!data.state || typeof data.state !== 'string') {
    errors.push('state is required and must be a string');
  }

  if (!data.district || typeof data.district !== 'string') {
    errors.push('district is required and must be a string');
  }

  // Type-specific validations
  switch (data.type) {
    case 'pond':
      if (data.area_hectares !== undefined && (typeof data.area_hectares !== 'number' || data.area_hectares <= 0)) {
        errors.push('area_hectares must be a positive number for ponds');
      }
      if (data.water_quality && !['Good', 'Fair', 'Poor'].includes(data.water_quality)) {
        errors.push('water_quality must be one of: Good, Fair, Poor');
      }
      if (data.usage && !['Irrigation', 'Drinking', 'Both'].includes(data.usage)) {
        errors.push('usage must be one of: Irrigation, Drinking, Both');
      }
      break;

    case 'farm':
      if (data.area_hectares !== undefined && (typeof data.area_hectares !== 'number' || data.area_hectares <= 0)) {
        errors.push('area_hectares must be a positive number for farms');
      }
      if (data.irrigation_type && !['Canal', 'Well', 'Rain-fed'].includes(data.irrigation_type)) {
        errors.push('irrigation_type must be one of: Canal, Well, Rain-fed');
      }
      break;

    case 'well':
      if (data.depth_meters !== undefined && (typeof data.depth_meters !== 'number' || data.depth_meters <= 0)) {
        errors.push('depth_meters must be a positive number for wells');
      }
      if (data.water_level_meters !== undefined && (typeof data.water_level_meters !== 'number' || data.water_level_meters < 0)) {
        errors.push('water_level_meters must be a non-negative number for wells');
      }
      if (data.well_type && !['Borewell', 'Hand Pump', 'Open Well'].includes(data.well_type)) {
        errors.push('well_type must be one of: Borewell, Hand Pump, Open Well');
      }
      break;

    case 'wetland':
      if (data.area_hectares !== undefined && (typeof data.area_hectares !== 'number' || data.area_hectares <= 0)) {
        errors.push('area_hectares must be a positive number for wetlands');
      }
      if (data.wetland_type && !['Marsh', 'Swamp', 'Lake', 'Riverine'].includes(data.wetland_type)) {
        errors.push('wetland_type must be one of: Marsh, Swamp, Lake, Riverine');
      }
      if (data.biodiversity_index !== undefined && (typeof data.biodiversity_index !== 'number' || data.biodiversity_index < 0 || data.biodiversity_index > 1)) {
        errors.push('biodiversity_index must be a number between 0 and 1');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAssetRequest = await request.json();

    // Validate the request data
    const validation = validateAssetData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Prepare asset data for Firestore
    const assetData = {
      type: body.type,
      state: body.state,
      district: body.district,
      village: body.village,
      area_hectares: body.area_hectares,
      water_quality: body.water_quality,
      usage: body.usage,
      crop_type: body.crop_type,
      irrigation_type: body.irrigation_type,
      depth_meters: body.depth_meters,
      water_level_meters: body.water_level_meters,
      well_type: body.well_type,
      wetland_type: body.wetland_type,
      biodiversity_index: body.biodiversity_index,
      description: body.description,
      reported_by: body.reported_by,
      contact_info: body.contact_info,
      geometry: {
        type: 'Point' as const,
        coordinates: [body.longitude, body.latitude]
      },
      source: 'User Reported',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      status: 'pending_verification' // New assets need verification
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'assets'), assetData);

    console.log(`Asset created with ID: ${docRef.id}`);

    // Return success response with the created asset data
    return NextResponse.json({
      success: true,
      message: 'Asset created successfully',
      data: {
        id: docRef.id,
        ...assetData,
        // Include lat/lng for convenience
        latitude: body.latitude,
        longitude: body.longitude,
        created_at: new Date().toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating asset:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve user-reported assets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'verified'; // Default to verified assets

    // For now, return a placeholder response
    // In a full implementation, you would query Firestore here
    return NextResponse.json({
      success: true,
      message: 'User-reported assets endpoint - implementation pending',
      filters: {
        state,
        district,
        type,
        status
      },
      data: []
    });

  } catch (error) {
    console.error('Error fetching assets:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}