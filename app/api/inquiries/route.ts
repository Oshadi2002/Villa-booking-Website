import { NextResponse } from 'next/server';
import { getAllInquiries, createInquiry, fetchFromCloudKV } from '@/lib/storage';
import { isPostgresConfigured, dbGetAll, dbSaveItem } from '@/lib/db';
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
    let inquiries: CustomerInquiry[] = [];

    if (isPostgresConfigured()) {
      try {
        inquiries = await dbGetAll<CustomerInquiry>('lankagama_inquiries');
      } catch (e) {
        console.error('Failed to get inquiries from DB:', e);
      }
    }

    if (!inquiries || inquiries.length === 0) {
      const cloudInquiries = await fetchFromCloudKV<CustomerInquiry[]>('lankagama_inquiries');
      inquiries = cloudInquiries && Array.isArray(cloudInquiries) && cloudInquiries.length > 0
        ? cloudInquiries
        : getAllInquiries();
    }

    return NextResponse.json({ success: true, inquiries }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
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

    const inquiry = createInquiry({
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email ? data.email.trim() : undefined,
      subject: data.subject.trim(),
      message: data.message.trim(),
      preferredVillaOrProduct: data.preferredVillaOrProduct ? data.preferredVillaOrProduct.trim() : undefined
    });

    if (isPostgresConfigured()) {
      try {
        await dbSaveItem('lankagama_inquiries', inquiry);
      } catch (e) {
        console.error('Failed to persist inquiry to Postgres:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully!',
      inquiry
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
