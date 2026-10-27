import { NextResponse } from 'next/server';
import { getAllBookings, createBooking, fetchFromCloudKV } from '@/lib/storage';
import { Booking } from '@/lib/types';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    void searchParams;

    const cloudBookings = await fetchFromCloudKV<Booking[]>('lankagama_bookings');
    const bookings = cloudBookings && Array.isArray(cloudBookings) && cloudBookings.length > 0
      ? cloudBookings
      : getAllBookings();

    return NextResponse.json({ success: true, bookings }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation
    if (!body.customerName || !body.customerPhone || !body.itemName || !body.checkInDate) {
      return NextResponse.json(
        { success: false, message: 'Missing required booking fields (Name, Phone, Item, Date)' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const booking = createBooking({
      type: body.type || 'villa',
      itemId: body.itemId || 'custom',
      itemName: body.itemName,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail || '',
      checkInDate: body.checkInDate,
      checkOutDate: body.checkOutDate,
      guestsCount: Number(body.guestsCount) || 1,
      needGuide: Boolean(body.needGuide),
      guideFee: Number(body.guideFee) || 0,
      totalLKR: Number(body.totalLKR) || 0,
      specialNotes: body.specialNotes || '',
      acPreference: body.acPreference || undefined,
      orderMeals: body.orderMeals !== undefined ? Boolean(body.orderMeals) : undefined,
      mealsNotes: body.mealsNotes || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Booking request placed successfully with status: PENDING.',
      booking
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
