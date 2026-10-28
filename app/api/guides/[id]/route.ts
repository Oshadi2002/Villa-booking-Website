import { NextResponse } from 'next/server';
import { deleteGuide } from '@/lib/storage';
import { isPostgresConfigured, dbDeleteItem } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const deleted = deleteGuide(id);

    if (isPostgresConfigured()) {
      try {
        await dbDeleteItem('lankagama_guides', id);
      } catch (e) {
        console.error('Failed to delete guide from DB:', e);
      }
    }

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
