import { NextResponse } from 'next/server';
import { isPostgresConfigured, query } from '@/lib/db';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET() {
  const configured = isPostgresConfigured();
  let dbAvailable = false;
  let dbStatus: 'connected' | 'not_configured' | 'connection_error' = configured ? 'connected' : 'not_configured';
  let latencyMs = 0;
  let errorMessage: string | undefined = undefined;

  if (configured) {
    try {
      const start = Date.now();
      await query('SELECT 1');
      latencyMs = Date.now() - start;
      dbAvailable = true;
      dbStatus = 'connected';
    } catch (err: unknown) {
      const error = err as Error;
      dbAvailable = false;
      dbStatus = 'connection_error';
      errorMessage = error.message;
    }
  }

  const isHealthy = configured && dbAvailable;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      storageMode: 'postgresql_only',
      jsonFallback: 'disabled',
      inMemoryFallback: 'disabled',
      singleSourceOfTruth: 'Cloud PostgreSQL',
      cloudDatabase: {
        configured,
        available: dbAvailable,
        status: dbStatus,
        latency: latencyMs > 0 ? `${latencyMs}ms` : undefined,
        error: errorMessage
      },
      timestamp: new Date().toISOString()
    },
    { 
      status: isHealthy ? 200 : 503,
      headers: NO_CACHE_HEADERS 
    }
  );
}
