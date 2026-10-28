import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  const authenticated = isAuthenticatedAdmin(req);
  return NextResponse.json(
    {
      authenticated,
      role: authenticated ? 'admin' : 'guest'
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    }
  );
}
