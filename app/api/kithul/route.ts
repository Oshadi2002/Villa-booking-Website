import { NextResponse } from 'next/server';
import { getAllKithulProducts, createKithulProduct } from '@/lib/storage';

export async function GET() {
  try {
    const products = getAllKithulProducts();
    return NextResponse.json({ success: true, products });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.priceLKR) {
      return NextResponse.json({ success: false, message: 'Product name and price are required' }, { status: 400 });
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

    return NextResponse.json({
      success: true,
      message: 'Kithul product added successfully!',
      product
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
