import { NextResponse } from 'next/server';
import { getAllBookings, createBooking } from '@/lib/storage';

export async function GET() {
  try {
    const bookings = getAllBookings();
    return NextResponse.json({ success: true, bookings });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation
    if (!body.customerName || !body.customerPhone || !body.itemName || !body.checkInDate) {
      return NextResponse.json(
        { success: false, message: 'Missing required booking fields (Name, Phone, Item, Date)' },
        { status: 400 }
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
      specialNotes: body.specialNotes || ''
    });

    return NextResponse.json({
      success: true,
      message: 'Booking request placed successfully with status: PENDING.',
      booking
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
