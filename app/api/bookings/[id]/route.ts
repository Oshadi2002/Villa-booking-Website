import { NextResponse } from 'next/server';
import { getBookingById, updateBooking, deleteBooking } from '@/lib/storage';
import { isPostgresConfigured, dbSaveItem, dbDeleteItem, dbGetAll } from '@/lib/db';
import { Booking } from '@/lib/types';
import { requireAdmin, isAuthenticatedAdmin } from '@/lib/auth';
import { maskBookingForPublic } from '@/lib/validations';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isAdmin = isAuthenticatedAdmin(req);

    let booking: Booking | undefined;

    // Check Postgres first if configured
    if (isPostgresConfigured()) {
      try {
        const all = await dbGetAll<Booking>('lankagama_bookings');
        const cleanId = id.trim().toUpperCase();
        const cleanPhone = id.replace(/[\s+-]/g, '');
        booking = all.find(b => 
          b.id.toUpperCase() === cleanId || 
          (b.trackingToken && b.trackingToken.toUpperCase() === cleanId) ||
          b.customerPhone.replace(/[\s+-]/g, '') === cleanPhone
        );
      } catch (e) {
        console.error('Error fetching booking from DB:', e);
      }
    }

    if (!booking) {
      booking = getBookingById(id);
    }

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    // PII Protection: If not admin, mask phone/email and strip internal adminNotes
    const safeBooking = maskBookingForPublic(booking, isAdmin);

    return NextResponse.json({ success: true, booking: safeBooking }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Authorization: Only admin can mutate booking statuses or notes
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();

    const updated = updateBooking(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Booking not found to update' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    if (isPostgresConfigured()) {
      await dbSaveItem('lankagama_bookings', updated);
    }

    return NextResponse.json({
      success: true,
      message: `Booking ${id} updated successfully`,
      booking: updated
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Authorization: Only admin can delete bookings
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const deleted = deleteBooking(id);

    if (isPostgresConfigured()) {
      await dbDeleteItem('lankagama_bookings', id);
    }

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Booking not found or already deleted' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Booking ${id} deleted successfully`
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
