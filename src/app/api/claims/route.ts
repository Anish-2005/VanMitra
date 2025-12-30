import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { ClaimsService } from '@/services/claims';
import { ClaimSchema } from '@/types/api';

export const GET = async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || undefined;

    const claims = await ClaimsService.getAllClaims(status);
    return NextResponse.json(claims);
  } catch (error) {
    console.error('GET /api/claims error:', error);
    return NextResponse.json(
      {
        type: "FeatureCollection",
        features: [],
        error: 'Failed to fetch claims'
      },
      { status: 500 }
    );
  }
};

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = ClaimSchema.omit({
      claim_id: true,
      created_at: true,
      updated_at: true
    }).parse(body);

    const claimId = await ClaimsService.createClaim(validatedData);

    return NextResponse.json({
      success: true,
      message: "Claim created successfully",
      claimId
    });
  } catch (error) {
    console.error('POST /api/claims error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create claim' },
      { status: 500 }
    );
  }
});
