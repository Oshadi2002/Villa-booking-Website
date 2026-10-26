import { NextResponse } from 'next/server';
import { getBookingById, updateBooking, deleteBooking } from '@/lib/storage';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = updateBooking(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Booking not found to update' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Booking ${id} updated successfully`,
      booking: updated
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteBooking(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Booking not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Booking ${id} deleted successfully`
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
