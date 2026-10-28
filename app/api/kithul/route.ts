import { NextResponse } from 'next/server';
import { getAllKithulProducts, createKithulProduct } from '@/lib/storage';
import { isPostgresConfigured, dbGetAll, dbSaveItem } from '@/lib/db';
import { KithulProduct } from '@/lib/types';
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

    let products: KithulProduct[] = [];
    if (isPostgresConfigured()) {
      products = await dbGetAll<KithulProduct>('lankagama_kithul');
    }

    if (!products || products.length === 0) {
      products = getAllKithulProducts();
    }

    return NextResponse.json({ success: true, products }, { headers: NO_CACHE_HEADERS });
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

    if (!body.name || !body.priceLKR) {
      return NextResponse.json({ success: false, message: 'Product name and price are required' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const product = createKithulProduct({
      name: body.name,
      sinhalaName: body.sinhalaName || body.name,
      category: body.category || 'treacle',
      description: body.description || '',
      priceLKR: Number(body.priceLKR) || 0,
      unit: body.unit || 'unit',
      weightOrVolume: body.weightOrVolume || 'Standard Pack',
      purityBadge: body.purityBadge || '100% Pure Forest Grade',
      harvestOrigin: body.harvestOrigin || 'Lankagama, Sinharaja',
      deliveryNote: body.deliveryNote || 'Delivered directly to your Villa or Campsite in Lankagama',
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      inStock: body.inStock ?? true,
      featured: body.featured ?? false
    });

    if (isPostgresConfigured()) {
      await dbSaveItem('lankagama_kithul', product);
    }

    return NextResponse.json({
      success: true,
      message: 'Kithul product added successfully!',
      product
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
