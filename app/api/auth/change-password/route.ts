import { NextResponse } from 'next/server';
import { requireAdmin, verifyAdminPassword, hashPassword } from '@/lib/auth';
import { getAgencySettings, updateAgencySettings } from '@/lib/storage';
import { isPostgresConfigured, dbGetSettings, dbSaveSettings } from '@/lib/db';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
};

export async function POST(req: Request) {
  // Enforce Admin Auth
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json().catch(() => ({}));
    const { currentPassword, newPassword } = body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Current password is required.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters long.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Verify current password
    const isCurrentValid = await verifyAdminPassword(currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect. Please check and try again.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Generate PBKDF2 hash of new password
    const newHash = hashPassword(newPassword);

    // Save to settings
    updateAgencySettings({
      adminPasswordHash: newHash
    });

    // Save to PostgreSQL if configured
    if (isPostgresConfigured()) {
      try {
        const dbSettings = await dbGetSettings();
        await dbSaveSettings({
          ...dbSettings,
          adminPasswordHash: newHash,
          updatedAt: new Date().toISOString()
        });
      } catch (dbErr) {
        console.error('Failed to save updated password hash to DB:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Admin password changed successfully! Use your new password on your next login.'
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
