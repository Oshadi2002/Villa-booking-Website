import { NextResponse } from 'next/server';
import { getAllComments, createComment, fetchFromCloudKV } from '@/lib/storage';
import { CustomerComment } from '@/lib/types';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    void searchParams;

    const cloudComments = await fetchFromCloudKV<CustomerComment[]>('lankagama_comments');
    const comments = cloudComments && Array.isArray(cloudComments) && cloudComments.length > 0
      ? cloudComments
      : getAllComments();

    return NextResponse.json({ success: true, comments }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.author || !body.comment) {
      return NextResponse.json({ success: false, message: 'Author name and comment text are required' }, { status: 400, headers: NO_CACHE_HEADERS });
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
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
