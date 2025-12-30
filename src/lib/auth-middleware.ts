// src/lib/auth-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from './firebase';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: DecodedIdToken;
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse> | NextResponse,
  options: { requireAuth?: boolean; requireAdmin?: boolean } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const { requireAuth = true, requireAdmin = false } = options;

    try {
      const authHeader = req.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        if (requireAuth) {
          return NextResponse.json(
            { error: 'Authorization header missing or invalid', code: 401 },
            { status: 401 }
          );
        }
        // If auth not required, continue without user
        return handler(req);
      }

      const token = authHeader.substring(7); // Remove 'Bearer '

      // Verify Firebase token
      // const decodedToken = await auth.verifyIdToken(token);

      // Check admin role if required
      // if (requireAdmin && decodedToken.role !== 'admin') {
      //   return NextResponse.json(
      //     { error: 'Admin access required', code: 403 },
      //     { status: 403 }
      //   );
      // }

      // Add user to request
      const authenticatedReq = req as AuthenticatedRequest;
      // authenticatedReq.user = decodedToken;

      return handler(authenticatedReq);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 401 },
        { status: 401 }
      );
    }
  };
}