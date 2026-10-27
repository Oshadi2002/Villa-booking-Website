import { NextResponse } from 'next/server';
import { getAllAttractions, createAttraction, fetchFromCloudKV } from '@/lib/storage';
import { Attraction } from '@/lib/types';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    void searchParams;

    const cloudAttractions = await fetchFromCloudKV<Attraction[]>('lankagama_attractions');
    const attractions = cloudAttractions && Array.isArray(cloudAttractions) && cloudAttractions.length > 0
      ? cloudAttractions
      : getAllAttractions();

    return NextResponse.json({ success: true, attractions }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.description) {
      return NextResponse.json({ success: false, message: 'Attraction name and description are required' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const attraction = createAttraction({
      name: body.name,
      badge: body.badge || 'Waterfall / Sanctuary',
      description: body.description,
      caution: body.caution || 'Travel with care; respect nature and river currents.',
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80'
    });

    return NextResponse.json({
      success: true,
      message: 'Attraction added successfully!',
      attraction
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
