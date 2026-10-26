import { NextResponse } from 'next/server';
import { deleteInquiry, updateInquiryStatus } from '@/lib/storage';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = deleteInquiry(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Inquiry not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.status || !['new', 'contacted', 'resolved'].includes(body.status)) {
      return NextResponse.json({ success: false, message: 'Valid status is required' }, { status: 400 });
    }

    const updated = updateInquiryStatus(id, body.status);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
