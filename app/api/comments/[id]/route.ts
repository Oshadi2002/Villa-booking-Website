import { NextResponse } from 'next/server';
import { deleteComment, updateComment } from '@/lib/storage';
import { isPostgresConfigured, dbSaveItem, dbDeleteItem, dbGetAll } from '@/lib/db';
import { CustomerComment } from '@/lib/types';
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

    let updated: CustomerComment | null = null;

    if (isPostgresConfigured()) {
      try {
        const all = await dbGetAll<CustomerComment>('lankagama_comments');
        const existing = all.find(c => c.id === id);
        if (existing) {
          const merged: CustomerComment = { ...existing, ...body, id: existing.id };
          await dbSaveItem('lankagama_comments', merged);
          updated = merged;
        }
      } catch (e) {
        console.error('Failed to update comment in DB:', e);
      }
    }

    const localUpdated = updateComment(id, body);
    if (!updated) updated = localUpdated;

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, message: 'Comment updated successfully', comment: updated }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    let deleted = false;

    if (isPostgresConfigured()) {
      try {
        await dbDeleteItem('lankagama_comments', id);
        deleted = true;
      } catch (e) {
        console.error('Failed to delete comment from DB:', e);
      }
    }

    const localDeleted = deleteComment(id);
    if (localDeleted) deleted = true;

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Comment not found or already deleted' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, message: 'Comment deleted successfully' }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
