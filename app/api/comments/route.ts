import { NextResponse } from 'next/server';
import { getAllComments, createComment } from '@/lib/storage';

export async function GET() {
  try {
    const comments = getAllComments();
    return NextResponse.json({ success: true, comments });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.author || !body.comment) {
      return NextResponse.json({ success: false, message: 'Author name and comment text are required' }, { status: 400 });
    }

    const comment = createComment({
      author: body.author.trim(),
      cityOrCountry: body.cityOrCountry ? body.cityOrCountry.trim() : 'Guest Traveler',
      rating: Number(body.rating) || 5,
      category: body.category || 'General',
      comment: body.comment.trim(),
      stayedAtOrOrdered: body.stayedAtOrOrdered ? body.stayedAtOrOrdered.trim() : undefined,
      isVerified: true
    });

    return NextResponse.json({
      success: true,
      message: 'Comment submitted successfully!',
      comment
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
