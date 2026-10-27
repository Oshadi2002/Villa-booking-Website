import { NextResponse } from 'next/server';
import { getAllInquiries, createInquiry, fetchFromCloudKV } from '@/lib/storage';
import { CustomerInquiry } from '@/lib/types';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    void searchParams;

    const cloudInquiries = await fetchFromCloudKV<CustomerInquiry[]>('lankagama_inquiries');
    const inquiries = cloudInquiries && Array.isArray(cloudInquiries) && cloudInquiries.length > 0
      ? cloudInquiries
      : getAllInquiries();

    return NextResponse.json({ success: true, inquiries }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.phone || !body.message) {
      return NextResponse.json({ success: false, message: 'Name, phone number and inquiry message are required' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const inquiry = createInquiry({
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email ? body.email.trim() : undefined,
      subject: body.subject ? body.subject.trim() : 'General Inquiry',
      message: body.message.trim(),
      preferredVillaOrProduct: body.preferredVillaOrProduct ? body.preferredVillaOrProduct.trim() : undefined
    });

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
