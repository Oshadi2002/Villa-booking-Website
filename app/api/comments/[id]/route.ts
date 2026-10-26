import { NextResponse } from 'next/server';
import { deleteComment, updateComment } from '@/lib/storage';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = updateComment(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Comment updated successfully', comment: updated });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = deleteComment(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Comment not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
