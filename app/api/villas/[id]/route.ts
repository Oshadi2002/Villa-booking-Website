import { NextResponse } from 'next/server';
import { dbGetById, dbUpdateVilla, dbDeleteItem } from '@/lib/db';
import { Villa } from '@/lib/types';
import { requireAdmin } from '@/lib/auth';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const villa = await dbGetById<Villa>('lankagama_villas', id);
    if (!villa) {
      return NextResponse.json({ success: false, message: 'Villa not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }
    return NextResponse.json({ success: true, villa }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`API /api/villas/[id] GET error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id: rawId } = await params;
    const id = decodeURIComponent(rawId);
    const body = await req.json();

    const existing = await dbGetById<Villa>('lankagama_villas', id);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Villa not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    const updated = await dbUpdateVilla(id, body);

    return NextResponse.json({
      success: true,
      message: 'Villa updated successfully',
      villa: updated
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`API /api/villas/[id] PATCH error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id: rawId } = await params;
    const id = decodeURIComponent(rawId);
    const deleted = await dbDeleteItem('lankagama_villas', id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Villa not found or already deleted' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({
      success: true,
      message: 'Villa deleted successfully'
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`API /api/villas/[id] DELETE error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
