import { NextResponse } from 'next/server';
import { getAllHeroSlides, createHeroSlide } from '@/lib/storage';
import { isPostgresConfigured, dbGetAll, dbSaveItem } from '@/lib/db';
import { HeroSlide } from '@/lib/types';
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

    let slides: HeroSlide[] = [];
    if (isPostgresConfigured()) {
      slides = await dbGetAll<HeroSlide>('lankagama_slides');
    }

    if (!slides || slides.length === 0) {
      slides = getAllHeroSlides();
    }

    return NextResponse.json({ success: true, slides }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
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

    const slide = createHeroSlide({
      url: body.url,
      title: body.title,
      sinhala: body.sinhala || body.title
    });

    if (isPostgresConfigured()) {
      await dbSaveItem('lankagama_slides', slide);
    }

    return NextResponse.json({
      success: true,
      message: 'Slide added successfully!',
      slide
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
