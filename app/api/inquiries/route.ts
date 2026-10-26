import { NextResponse } from 'next/server';
import { getAllInquiries, createInquiry } from '@/lib/storage';

export async function GET() {
  try {
    const inquiries = getAllInquiries();
    return NextResponse.json({ success: true, inquiries });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.phone || !body.message) {
      return NextResponse.json({ success: false, message: 'Name, phone number and inquiry message are required' }, { status: 400 });
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
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
