import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { dbUpdateCampingGear, dbDeleteItem } from '@/lib/db';
import { CACHE_TAGS } from '@/lib/cached-data';
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

    const updated = await dbUpdateCampingGear(id, {
      ...body,
      pricePerDayLKR: body.pricePerDayLKR !== undefined ? Number(body.pricePerDayLKR) : undefined,
      maxGuests: body.maxGuests !== undefined ? (body.maxGuests ? Number(body.maxGuests) : undefined) : undefined,
      includes: body.includes ? (Array.isArray(body.includes) ? body.includes : String(body.includes).split(',').map((s: string) => s.trim())) : undefined,
      images: Array.isArray(body.images) ? body.images : undefined
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Camping gear not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    revalidateTag(CACHE_TAGS.CAMPING, { expire: 0 });

    return NextResponse.json({ success: true, message: 'Camping gear updated successfully', gear: updated }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/camping/[id] PATCH error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const deleted = await dbDeleteItem('lankagama_camping', id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Gear item not found or already deleted' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    revalidateTag(CACHE_TAGS.CAMPING, { expire: 0 });

    return NextResponse.json({ success: true, message: 'Camping gear deleted' }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/camping/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
