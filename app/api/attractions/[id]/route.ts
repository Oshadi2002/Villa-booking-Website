import { NextResponse } from 'next/server';
import { deleteAttraction, updateAttraction } from '@/lib/storage';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = updateAttraction(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Attraction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Attraction updated successfully', attraction: updated });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = deleteAttraction(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Attraction not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Attraction deleted' });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
