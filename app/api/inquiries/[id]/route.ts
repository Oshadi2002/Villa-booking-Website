import { NextResponse } from 'next/server';
import { deleteInquiry, updateInquiryStatus } from '@/lib/storage';
import { isPostgresConfigured, dbSaveItem, dbDeleteItem } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
};

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const deleted = deleteInquiry(id);

    if (isPostgresConfigured()) {
      try {
        await dbDeleteItem('lankagama_inquiries', id);
      } catch (e) {
        console.error('Failed to delete inquiry from DB:', e);
      }
    }

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Inquiry not found or already deleted' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, message: 'Inquiry deleted successfully' }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.status || !['new', 'contacted', 'resolved'].includes(body.status)) {
      return NextResponse.json({ success: false, message: 'Valid status is required' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const updated = updateInquiryStatus(id, body.status);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Inquiry not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    if (isPostgresConfigured()) {
      try {
        await dbSaveItem('lankagama_inquiries', updated);
      } catch (e) {
        console.error('Failed to update inquiry in DB:', e);
      }
    }

    return NextResponse.json({ success: true, inquiry: updated }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
