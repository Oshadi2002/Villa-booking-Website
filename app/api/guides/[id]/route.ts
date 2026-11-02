import { NextResponse } from 'next/server';
import { dbDeleteItem } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const deleted = await dbDeleteItem('lankagama_guides', id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Guide not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Guide deleted successfully'
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/guides/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
