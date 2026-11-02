import { NextResponse } from 'next/server';
import { dbGetAll, dbCreateInquiry } from '@/lib/db';
import { CustomerInquiry } from '@/lib/types';
import { requireAdmin } from '@/lib/auth';
import { inquiryCreateSchema } from '@/lib/validations';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET(req: Request) {
  // Authorization: Only authenticated admin can view customer inquiries
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const inquiries = await dbGetAll<CustomerInquiry>('lankagama_inquiries');
    return NextResponse.json({ success: true, inquiries }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/inquiries GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json(
        { success: false, message: 'Invalid inquiry request payload.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const parseResult = inquiryCreateSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { success: false, message: `${issue?.path.join('.')}: ${issue?.message}` },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const data = parseResult.data;

    const inquiry = await dbCreateInquiry({
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email ? data.email.trim() : undefined,
      subject: data.subject.trim(),
      message: data.message.trim(),
      preferredVillaOrProduct: data.preferredVillaOrProduct ? data.preferredVillaOrProduct.trim() : undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully!',
      inquiry
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/inquiries POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
