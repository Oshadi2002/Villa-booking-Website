import { NextResponse } from 'next/server';
import { getAllVillas, createVilla } from '@/lib/storage';
import { isPostgresConfigured, dbGetAll, dbSaveItem } from '@/lib/db';
import { Villa } from '@/lib/types';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    void searchParams;

    let villas: Villa[] = [];
    if (isPostgresConfigured()) {
      villas = await dbGetAll<Villa>('lankagama_villas');
    }

    if (!villas || villas.length === 0) {
      villas = getAllVillas();
    }

    return NextResponse.json(
      { success: true, villas },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.pricePerNightLKR) {
      return NextResponse.json(
        { success: false, message: 'Villa name and price per night are required.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const villa = createVilla({
      name: body.name,
      sinhalaName: body.sinhalaName || body.name,
      tagline: body.tagline || 'Peaceful riverside stay in Lankagama',
      description: body.description || '',
      pricePerNightLKR: Number(body.pricePerNightLKR) || 0,
      pricePerNightAcLKR: body.pricePerNightAcLKR ? Number(body.pricePerNightAcLKR) : undefined,
      maxGuests: Number(body.maxGuests) || 2,
      bedrooms: Number(body.bedrooms) || 1,
      bathrooms: Number(body.bathrooms) || 1,
      bedConfig: body.bedConfig || `${body.bedrooms || 1} Double Bed(s)`,
      checkInTime: body.checkInTime || '02:00 PM',
      checkOutTime: body.checkOutTime || '11:00 AM',
      features: Array.isArray(body.features) ? body.features : (body.features ? String(body.features).split(',').map((s: string) => s.trim()) : []),
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1000&q=80',
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : [body.imageUrl || 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1000&q=80'],
      locationDetails: body.locationDetails || 'Lankagama, Sinharaja buffer zone',
      ownerContact: body.ownerContact || '',
      highlights: Array.isArray(body.highlights) ? body.highlights : [
        { title: 'River Proximity', desc: 'Direct access to Gin Ganga river waters.', icon: 'Droplets' },
        { title: 'Village Food', desc: 'Authentic local woodfire cooked meals.', icon: 'Utensils' }
      ],
      facilities: Array.isArray(body.facilities) ? body.facilities : [
        {
          category: 'Essentials & Comfort',
          items: [
            `${body.bedrooms || 1} Bedrooms with fresh linens`,
            `${body.bathrooms || 1} Bathrooms with hot showers`,
            'River view balcony and open verandah',
            'Safe parking in Lankagama'
          ]
        }
      ],
      foodOptions: Array.isArray(body.foodOptions) ? body.foodOptions : ['Traditional Sri Lankan Village Rice & Curry', 'Local Breakfast with Fresh Tea'],
      houseRules: Array.isArray(body.houseRules) ? body.houseRules : ['Respect rainforest tranquility after 10 PM', 'No polythene disposal in river streams'],
      acType: body.acType || 'both',
      hasKitchen: body.hasKitchen !== undefined ? Boolean(body.hasKitchen) : true
    });

    if (isPostgresConfigured()) {
      await dbSaveItem('lankagama_villas', villa);
    }

    return NextResponse.json({
      success: true,
      message: 'Villa created successfully!',
      villa
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
