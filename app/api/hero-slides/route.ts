import { NextResponse } from 'next/server';
import { getAllHeroSlides, createHeroSlide, fetchFromCloudKV } from '@/lib/storage';
import { HeroSlide } from '@/lib/types';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    void searchParams;

    const cloudSlides = await fetchFromCloudKV<HeroSlide[]>('lankagama_hero_slides');
    const slides = cloudSlides && Array.isArray(cloudSlides) && cloudSlides.length > 0
      ? cloudSlides
      : getAllHeroSlides();

    return NextResponse.json({ success: true, slides }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: Request) {
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
