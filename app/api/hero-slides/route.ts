import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { dbCreateHeroSlide } from '@/lib/db';
import { CACHE_TAGS, getCachedHeroSlides } from '@/lib/cached-data';
import { requireAdmin } from '@/lib/auth';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    void searchParams;

    const slides = await getCachedHeroSlides();
    return NextResponse.json({ success: true, slides }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/hero-slides GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: Request) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();

    if (!body.url || !body.title) {
      return NextResponse.json({ success: false, message: 'Image URL and Title are required' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const slide = await dbCreateHeroSlide({
      url: body.url,
      title: body.title,
      sinhala: body.sinhala || body.title
    });

    revalidateTag(CACHE_TAGS.SLIDES, { expire: 0 });

    return NextResponse.json({
      success: true,
      message: 'Slide added successfully!',
      slide
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/hero-slides POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
