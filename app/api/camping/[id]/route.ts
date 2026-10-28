import { NextResponse } from 'next/server';
import { deleteCampingGear, updateCampingGear } from '@/lib/storage';
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

    const updated = updateCampingGear(id, {
      ...body,
      pricePerDayLKR: body.pricePerDayLKR !== undefined ? Number(body.pricePerDayLKR) : undefined,
      includes: body.includes ? (Array.isArray(body.includes) ? body.includes : String(body.includes).split(',').map((s: string) => s.trim())) : undefined
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Camping gear not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    if (isPostgresConfigured()) {
      await dbSaveItem('lankagama_camping', updated);
    }

    return NextResponse.json({ success: true, message: 'Camping gear updated successfully', gear: updated }, { headers: NO_CACHE_HEADERS });
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
    const deleted = deleteCampingGear(id);

    if (isPostgresConfigured()) {
      await dbDeleteItem('lankagama_camping', id);
    }

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Gear item not found or already deleted' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, message: 'Camping gear deleted' }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
