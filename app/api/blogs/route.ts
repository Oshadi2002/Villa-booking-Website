import { NextResponse } from 'next/server';
import { dbGetAllBlogs, dbCreateBlog } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    void searchParams;

    const blogs = await dbGetAllBlogs();
    return NextResponse.json({ success: true, blogs }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/blogs GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: Request) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();

    if (!body.title || !body.summary) {
      return NextResponse.json(
        { success: false, message: 'Blog title and summary are required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const blog = await dbCreateBlog({
      title: body.title,
      sinhalaTitle: body.sinhalaTitle || '',
      category: body.category || 'Waterfalls',
      readTime: body.readTime || '5 min read',
      badge: body.badge || 'Field Guide',
      summary: body.summary,
      summarySi: body.summarySi || '',
      content: body.content || '',
      contentSi: body.contentSi || '',
      caution: body.caution || '',
      cautionSi: body.cautionSi || '',
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : [body.imageUrl],
      publishedDate: body.publishedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      author: body.author || 'Sinharaja Field Naturalist',
      authorSi: body.authorSi || 'සිංහරාජ ගවේෂණ කණ්ඩායම',
      highlights: Array.isArray(body.highlights) ? body.highlights : [],
      highlightsSi: Array.isArray(body.highlightsSi) ? body.highlightsSi : []
    });

    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully!',
      blog
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/blogs POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
