import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { dbCreateComment } from '@/lib/db';
import { CACHE_TAGS, getCachedPublicComments, getCachedAllComments } from '@/lib/cached-data';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { commentCreateSchema } from '@/lib/validations';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET(req: Request) {
  try {
    const isAdmin = isAuthenticatedAdmin(req);
    // Public visitors query & cache only verified comments; admins query & cache all comments separately
    const visibleComments = isAdmin
      ? await getCachedAllComments()
      : await getCachedPublicComments();

    return NextResponse.json({ success: true, comments: visibleComments }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/comments GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json(
        { success: false, message: 'Invalid comment payload.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const parseResult = commentCreateSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { success: false, message: `${issue?.path.join('.')}: ${issue?.message}` },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const data = parseResult.data;

    // Security Hardening: New public submissions are unverified by default and require admin review
    const comment = await dbCreateComment({
      author: data.author.trim(),
      cityOrCountry: data.cityOrCountry.trim(),
      rating: data.rating,
      category: data.category,
      comment: data.comment.trim(),
      stayedAtOrOrdered: data.stayedAtOrOrdered ? data.stayedAtOrOrdered.trim() : undefined,
      isVerified: false
    });

    revalidateTag(CACHE_TAGS.COMMENTS, { expire: 0 });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your review has been submitted and is pending verification.',
      comment
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/comments POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
