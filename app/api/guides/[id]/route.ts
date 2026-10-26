import { NextResponse } from 'next/server';
import { deleteGuide } from '@/lib/storage';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = deleteGuide(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Guide not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Guide deleted successfully'
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
