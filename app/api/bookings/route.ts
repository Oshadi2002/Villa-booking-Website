import { NextResponse } from 'next/server';
import { getAllBookings, createBooking } from '@/lib/storage';
import { isPostgresConfigured, dbGetAll, dbSaveItem } from '@/lib/db';
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
    let bookings: Booking[] = [];
    if (isPostgresConfigured()) {
      try {
        bookings = await dbGetAll<Booking>('lankagama_bookings');
      } catch (dbErr) {
        console.error('Failed to load bookings from Postgres:', dbErr);
      }
    }

    if (!bookings || bookings.length === 0) {
      bookings = getAllBookings();
    }

    return NextResponse.json({ success: true, bookings }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
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

    // Date sanity check: Check-in cannot be in the past (using Sri Lanka time / UTC)
    const today = new Date().toISOString().split('T')[0];
    if (data.checkInDate < today) {
      return NextResponse.json(
        { success: false, message: `Check-in date cannot be in the past. (Today is ${today})` },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Create booking in local runtime storage with safe collision check and tracking token
    const booking = createBooking({
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
      orderMeals: data.orderMeals,
      mealsNotes: data.mealsNotes,
      deliveryLocation: data.deliveryLocation,
      quantity: data.quantity,
      itemsSummary: data.itemsSummary
    });

    // Explicit Database Persistence handling
    if (isPostgresConfigured()) {
      try {
        await dbSaveItem('lankagama_bookings', booking);
      } catch (dbError) {
        console.error('CRITICAL: Failed to persist booking to PostgreSQL database:', dbError);
        // If in production with configured Postgres, fail explicitly rather than silently losing booking
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json(
            { success: false, message: 'Database connection failed. Please contact us via WhatsApp.' },
            { status: 500, headers: NO_CACHE_HEADERS }
          );
        }
      }
    }

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
