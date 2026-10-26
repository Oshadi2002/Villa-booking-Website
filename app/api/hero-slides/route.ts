import { NextResponse } from 'next/server';
import { getAllHeroSlides, createHeroSlide } from '@/lib/storage';

export async function GET() {
  try {
    const slides = getAllHeroSlides();
    return NextResponse.json({ success: true, slides });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.url || !body.title) {
      return NextResponse.json({ success: false, message: 'Image URL and Title are required' }, { status: 400 });
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
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
