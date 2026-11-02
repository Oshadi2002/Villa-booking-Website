import { NextResponse } from 'next/server';
import { requireAdmin, verifyAdminPassword, hashPassword } from '@/lib/auth';
import { dbGetSettings, dbSaveSettings } from '@/lib/db';

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

    // Save directly to Cloud PostgreSQL settings
    const currentSettings = await dbGetSettings();
    await dbSaveSettings({
      ...currentSettings,
      adminPasswordHash: newHash,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Admin password changed successfully! Use your new password on your next login.'
    }, { headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/auth/change-password error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
