import { NextResponse } from 'next/server';
import { getVillaById, updateVilla, deleteVilla } from '@/lib/storage';
import { isPostgresConfigured, dbSaveItem, dbDeleteItem } from '@/lib/db';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const villa = getVillaById(id);
    if (!villa) {
      return NextResponse.json({ success: false, message: 'Villa not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }
    return NextResponse.json({ success: true, villa }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = decodeURIComponent(rawId);
    const body = await req.json();

    const updated = updateVilla(id, body);

    if (isPostgresConfigured()) {
      await dbSaveItem('lankagama_villas', updated);
    }

    return NextResponse.json({
      success: true,
      message: 'Villa updated successfully',
      villa: updated
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = decodeURIComponent(rawId);
    deleteVilla(id);

    if (isPostgresConfigured()) {
      await dbDeleteItem('lankagama_villas', id);
    }

    return NextResponse.json({
      success: true,
      message: 'Villa deleted successfully'
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
