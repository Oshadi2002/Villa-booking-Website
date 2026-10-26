import { NextResponse } from 'next/server';
import { deleteCampingGear, updateCampingGear } from '@/lib/storage';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = updateCampingGear(id, {
      ...body,
      pricePerDayLKR: body.pricePerDayLKR !== undefined ? Number(body.pricePerDayLKR) : undefined,
      includes: body.includes ? (Array.isArray(body.includes) ? body.includes : String(body.includes).split(',').map((s: string) => s.trim())) : undefined
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Camping gear not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Camping gear updated successfully', gear: updated });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = deleteCampingGear(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Gear item not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Camping gear deleted' });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
