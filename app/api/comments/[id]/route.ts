import { NextResponse } from 'next/server';
import { dbUpdateComment, dbDeleteItem } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await dbUpdateComment(id, body);

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, message: 'Comment updated successfully', comment: updated }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/comments/[id] PATCH error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const deleted = await dbDeleteItem('lankagama_comments', id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Comment not found or already deleted' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, message: 'Comment deleted successfully' }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/comments/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
