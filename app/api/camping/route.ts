import { NextResponse } from 'next/server';
import { getAllCampingGear, createCampingGear } from '@/lib/storage';

export async function GET() {
  try {
    const gear = getAllCampingGear();
    return NextResponse.json({ success: true, gear });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.pricePerDayLKR) {
      return NextResponse.json({ success: false, message: 'Gear name and daily price are required' }, { status: 400 });
    }

    const gear = createCampingGear({
      name: body.name,
      sinhalaName: body.sinhalaName || body.name,
      category: body.category || 'package',
      description: body.description || '',
      includes: Array.isArray(body.includes) ? body.includes : (body.includes ? String(body.includes).split(',').map((s: string) => s.trim()) : []),
      pricePerDayLKR: Number(body.pricePerDayLKR) || 0,
      capacity: body.capacity || 'Camp Equipment',
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80'
    });

    return NextResponse.json({
      success: true,
      message: 'Camping gear added successfully!',
      gear
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
