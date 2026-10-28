import { NextResponse } from 'next/server';
import { deleteAttraction, updateAttraction } from '@/lib/storage';
import { isPostgresConfigured, dbSaveItem, dbDeleteItem } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();

    const updated = updateAttraction(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Attraction not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    if (isPostgresConfigured()) {
      await dbSaveItem('lankagama_attractions', updated);
    }

    return NextResponse.json({ success: true, message: 'Attraction updated successfully', attraction: updated }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const deleted = deleteAttraction(id);

    if (isPostgresConfigured()) {
      await dbDeleteItem('lankagama_attractions', id);
    }

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Attraction not found or already deleted' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, message: 'Attraction deleted' }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
