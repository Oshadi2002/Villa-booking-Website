import { NextResponse } from 'next/server';
import { getVillaById, updateVilla, deleteVilla } from '@/lib/storage';

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
    const { id } = await params;
    const body = await req.json();

    const updated = updateVilla(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Villa not found to update' }, { status: 404, headers: NO_CACHE_HEADERS });
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
    const { id } = await params;
    const deleted = deleteVilla(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Villa not found or already deleted' }, { status: 404, headers: NO_CACHE_HEADERS });
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
