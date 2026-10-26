import { NextResponse } from 'next/server';
import { getAllAttractions, createAttraction } from '@/lib/storage';

export async function GET() {
  try {
    const attractions = getAllAttractions();
    return NextResponse.json({ success: true, attractions });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.description) {
      return NextResponse.json({ success: false, message: 'Attraction name and description are required' }, { status: 400 });
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
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
