import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { isPostgresConfigured, dbGetSettings, dbSaveSettings } from '@/lib/db';
import { getAgencySettings, updateAgencySettings } from '@/lib/storage';
import { normalizeWhatsAppNumber, whatsappSettingsSchema } from '@/lib/validations';
import { AGENCY_CONFIG } from '@/lib/data';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function GET() {
  try {
    let settings = getAgencySettings();

    if (isPostgresConfigured()) {
      try {
        settings = await dbGetSettings();
      } catch (e) {
        console.error('Failed to load settings from DB, using fallback:', e);
      }
    }

    const rawNumber = settings.activeWhatsAppNumber || AGENCY_CONFIG.whatsappNumber;
    const normalized = normalizeWhatsAppNumber(rawNumber);

    return NextResponse.json({
      success: true,
      whatsappNumber: normalized.isValid ? normalized.cleanDigits : rawNumber,
      formattedNumber: normalized.formatted || rawNumber,
      waLink: normalized.waLink || `https://wa.me/${rawNumber}`,
      updatedAt: settings.updatedAt
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
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

    const updatedSettings = {
      activeWhatsAppNumber: normalized.cleanDigits,
      updatedAt: new Date().toISOString()
    };

    // Save to storage
    updateAgencySettings(updatedSettings);

    // Save to PostgreSQL if configured
    if (isPostgresConfigured()) {
      await dbSaveSettings(updatedSettings);
    }

    return NextResponse.json({
      success: true,
      message: `WhatsApp number updated to ${normalized.formatted}`,
      whatsappNumber: normalized.cleanDigits,
      formattedNumber: normalized.formatted,
      waLink: normalized.waLink,
      updatedAt: updatedSettings.updatedAt
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export { POST as PATCH };
