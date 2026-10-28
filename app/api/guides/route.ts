import { NextResponse } from 'next/server';
import { getAllGuides, createGuide, fetchFromCloudKV } from '@/lib/storage';
import { isPostgresConfigured, dbGetAll, dbSaveItem } from '@/lib/db';
import { TourGuide } from '@/lib/types';
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

    let guides: TourGuide[] = [];
    if (isPostgresConfigured()) {
      try {
        guides = await dbGetAll<TourGuide>('lankagama_guides');
      } catch (e) {
        console.error('Failed to get guides from DB:', e);
      }
    }

    if (!guides || guides.length === 0) {
      const cloudGuides = await fetchFromCloudKV<TourGuide[]>('lankagama_guides');
      guides = cloudGuides && Array.isArray(cloudGuides) && cloudGuides.length > 0
        ? cloudGuides
        : getAllGuides();
    }

    return NextResponse.json({ success: true, guides }, { headers: NO_CACHE_HEADERS });
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

    if (!body.name || !body.dailyRateLKR) {
      return NextResponse.json(
        { success: false, message: 'Guide name and daily rate are required.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const guide = createGuide({
      name: body.name,
      nickname: body.nickname || body.name.split(' ')[0],
      experienceYears: Number(body.experienceYears) || 3,
      languages: Array.isArray(body.languages) ? body.languages : (body.languages ? String(body.languages).split(',').map((s: string) => s.trim()) : ['Sinhala', 'English']),
      specialties: Array.isArray(body.specialties) ? body.specialties : (body.specialties ? String(body.specialties).split(',').map((s: string) => s.trim()) : ['Brahmana Waterfall Trail', 'Sinharaja Buffer Zone']),
      dailyRateLKR: Number(body.dailyRateLKR) || 4000,
      halfDayRateLKR: Number(body.halfDayRateLKR) || Math.round((Number(body.dailyRateLKR) || 4000) * 0.6),
      bio: body.bio || 'Native Lankagama rainforest guide with comprehensive knowledge of local trails, waterfalls, and wildlife.',
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      rating: Number(body.rating) || 5.0,
      verifiedLocal: true
    });

    if (isPostgresConfigured()) {
      try {
        await dbSaveItem('lankagama_guides', guide);
      } catch (e) {
        console.error('Failed to save guide to DB:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Guide created successfully!',
      guide
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
