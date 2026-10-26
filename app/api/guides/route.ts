import { NextResponse } from 'next/server';
import { getAllGuides, createGuide } from '@/lib/storage';

export async function GET() {
  try {
    const guides = getAllGuides();
    return NextResponse.json({ success: true, guides });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.dailyRateLKR) {
      return NextResponse.json(
        { success: false, message: 'Guide name and daily rate are required.' },
        { status: 400 }
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

    return NextResponse.json({
      success: true,
      message: 'Guide created successfully!',
      guide
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
