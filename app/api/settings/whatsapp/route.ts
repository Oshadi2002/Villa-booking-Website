import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { dbGetSettings, dbSaveSettings } from '@/lib/db';
import { normalizeWhatsAppNumber, whatsappSettingsSchema } from '@/lib/validations';
import { AGENCY_CONFIG } from '@/lib/data';
import { AgencySettings } from '@/lib/types';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET() {
  try {
    const settings = await dbGetSettings();

    const rawNumber = settings.activeWhatsAppNumber || AGENCY_CONFIG.whatsappNumber;
    const normalized = normalizeWhatsAppNumber(rawNumber);

    return NextResponse.json({
      success: true,
      whatsappNumber: normalized.isValid ? normalized.cleanDigits : rawNumber,
      formattedNumber: normalized.formatted || rawNumber,
      waLink: normalized.waLink || `https://wa.me/${rawNumber}`,
      phone: settings.phone || normalized.formatted || AGENCY_CONFIG.phone,
      email: settings.email || AGENCY_CONFIG.email,
      address: settings.address || AGENCY_CONFIG.address,
      locationDetails: settings.locationDetails || AGENCY_CONFIG.locationDetails,
      name: settings.name || AGENCY_CONFIG.name,
      sinhalaName: settings.sinhalaName || AGENCY_CONFIG.sinhalaName,
      updatedAt: settings.updatedAt
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/settings/whatsapp GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: Request) {
  // Enforce Admin Auth
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const parseResult = whatsappSettingsSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        message: parseResult.error.issues[0]?.message || 'Invalid WhatsApp number format.'
      }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const normalized = normalizeWhatsAppNumber(parseResult.data.whatsappNumber);
    if (!normalized.isValid) {
      return NextResponse.json({
        success: false,
        message: normalized.error || 'Invalid WhatsApp number. Please provide a valid international or Sri Lankan mobile number.'
      }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const current = await dbGetSettings();
    const cleanPayload: Partial<AgencySettings> = {
      activeWhatsAppNumber: normalized.cleanDigits,
      updatedAt: new Date().toISOString()
    };
    if (parseResult.data.phone !== undefined && parseResult.data.phone !== '') {
      cleanPayload.phone = parseResult.data.phone;
    } else {
      cleanPayload.phone = normalized.formatted;
    }
    if (parseResult.data.email !== undefined) cleanPayload.email = parseResult.data.email;
    if (parseResult.data.address !== undefined) cleanPayload.address = parseResult.data.address;
    if (parseResult.data.locationDetails !== undefined) cleanPayload.locationDetails = parseResult.data.locationDetails;
    if (parseResult.data.name !== undefined) cleanPayload.name = parseResult.data.name;
    if (parseResult.data.sinhalaName !== undefined) cleanPayload.sinhalaName = parseResult.data.sinhalaName;

    const merged = { ...current, ...cleanPayload };

    // Save directly to PostgreSQL
    const saved = await dbSaveSettings(merged);

    return NextResponse.json({
      success: true,
      message: 'Agency contact and WhatsApp settings updated successfully.',
      whatsappNumber: normalized.cleanDigits,
      formattedNumber: normalized.formatted,
      waLink: normalized.waLink,
      phone: saved.phone || normalized.formatted,
      email: saved.email || AGENCY_CONFIG.email,
      address: saved.address || AGENCY_CONFIG.address,
      locationDetails: saved.locationDetails || AGENCY_CONFIG.locationDetails,
      name: saved.name || AGENCY_CONFIG.name,
      sinhalaName: saved.sinhalaName || AGENCY_CONFIG.sinhalaName,
      updatedAt: saved.updatedAt
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/settings/whatsapp POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export { POST as PATCH };
