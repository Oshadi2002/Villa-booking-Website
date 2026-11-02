import { NextResponse } from 'next/server';
import { dbFindBooking, dbUpdateBooking, dbDeleteItem } from '@/lib/db';
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

    const booking = await dbFindBooking(id);

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
    console.error('API /api/bookings/[id] GET error:', error);
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

    const updated = await dbUpdateBooking(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Booking not found to update' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Booking ${id} updated successfully`,
      booking: updated
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/bookings/[id] PATCH error:', error);
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
    const deleted = await dbDeleteItem('lankagama_bookings', id);

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
    console.error('API /api/bookings/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
