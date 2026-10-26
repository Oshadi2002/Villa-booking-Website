import { NextResponse } from 'next/server';
import { deleteHeroSlide, updateHeroSlide } from '@/lib/storage';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = updateHeroSlide(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Slide not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Slide updated successfully', slide: updated });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = deleteHeroSlide(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Cannot delete: at least 1 slide must remain or slide not found' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Slide deleted' });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
