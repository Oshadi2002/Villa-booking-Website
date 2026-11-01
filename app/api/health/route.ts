import { NextResponse } from 'next/server';
import { isPostgresConfigured, query } from '@/lib/db';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET() {
  const configured = isPostgresConfigured();
  let dbStatus = configured ? 'connected' : 'not_configured (using local storage)';
  let latencyMs = 0;

  if (configured) {
    try {
      const start = Date.now();
      await query('SELECT 1');
      latencyMs = Date.now() - start;
      dbStatus = 'connected';
    } catch (err: unknown) {
      const error = err as Error;
      dbStatus = `error: ${error.message}`;
    }
  }

  return NextResponse.json(
    {
      status: 'ok',
      cloudDatabase: {
        configured,
        status: dbStatus,
        latencyMs: latencyMs > 0 ? `${latencyMs}ms` : undefined
      },
      timestamp: new Date().toISOString()
    },
    { headers: NO_CACHE_HEADERS }
  );
}
