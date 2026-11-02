import { NextResponse } from 'next/server';
import { dbGetAll, dbCreateBooking } from '@/lib/db';
import { Booking } from '@/lib/types';
import { requireAdmin } from '@/lib/auth';
import { bookingCreateSchema } from '@/lib/validations';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET(req: Request) {
  // Security Hardening: Only authorized admins can retrieve the entire booking roster
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const bookings = await dbGetAll<Booking>('lankagama_bookings');
    return NextResponse.json({ success: true, bookings }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/bookings GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json(
        { success: false, message: 'Invalid or empty request payload.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Strict Schema Validation using Zod
    const parseResult = bookingCreateSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { success: false, message: `${issue?.path.join('.')}: ${issue?.message}` },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const data = parseResult.data;

    // Date sanity check: Check-in cannot be in the past
    const today = new Date().toISOString().split('T')[0];
    if (data.checkInDate < today) {
      return NextResponse.json(
        { success: false, message: `Check-in date cannot be in the past. (Today is ${today})` },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Create booking directly in Cloud PostgreSQL
    const booking = await dbCreateBooking({
      type: data.type,
      itemId: data.itemId,
      itemName: data.itemName,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || '',
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      guestsCount: data.guestsCount,
      needGuide: Boolean(data.needGuide),
      guideFee: data.guideFee || 0,
      totalLKR: data.totalLKR,
      specialNotes: data.specialNotes || '',
      acPreference: data.acPreference,
      bookingScope: data.bookingScope,
      roomsCount: data.roomsCount,
      orderMeals: data.orderMeals,
      mealsNotes: data.mealsNotes,
      deliveryLocation: data.deliveryLocation,
      quantity: data.quantity,
      itemsSummary: data.itemsSummary
    });

    return NextResponse.json({
      success: true,
      message: 'Booking request placed successfully with status: PENDING.',
      booking
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/bookings POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
