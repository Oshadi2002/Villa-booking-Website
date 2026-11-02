import { NextResponse } from 'next/server';
import { dbGetAll, dbUpdateHeroSlide, dbDeleteItem } from '@/lib/db';
import { HeroSlide } from '@/lib/types';
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

    const updated = await dbUpdateHeroSlide(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Slide not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, message: 'Slide updated successfully', slide: updated }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/hero-slides/[id] PATCH error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;

    // Safety rule: at least 1 hero slide must remain
    const allSlides = await dbGetAll<HeroSlide>('lankagama_slides');
    if (allSlides.length <= 1) {
      return NextResponse.json({ success: false, message: 'Cannot delete: at least 1 hero slide must remain' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const deleted = await dbDeleteItem('lankagama_slides', id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Slide not found or already deleted' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, message: 'Slide deleted' }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/hero-slides/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
