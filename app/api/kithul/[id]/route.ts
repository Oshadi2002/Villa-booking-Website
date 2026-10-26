import { NextResponse } from 'next/server';
import { deleteKithulProduct, updateKithulProduct } from '@/lib/storage';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = deleteKithulProduct(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Kithul product not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Kithul product deleted' });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = updateKithulProduct(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Kithul product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
