import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { isPostgresConfigured, dbGetSettings } from './db';
import { getAgencySettings } from './storage';

const COOKIE_NAME = 'lankagama_admin_session';
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Get session secret with safe fallback for dev
function getSessionSecret(): string {
  return process.env.SESSION_SECRET || 'lankagama-rainforest-session-secret-key-32chars!';
}

// Get authorized admin passwords (supports single password or comma-separated list for two family members)
function getAdminPasswords(): string[] {
  const envPasswords = process.env.ADMIN_PASSWORDS || process.env.ADMIN_PASSWORD;
  if (envPasswords) {
    return envPasswords.split(',').map(p => p.trim()).filter(Boolean);
  }
  // Safe default for unconfigured environments (never 1234 or demo PIN)
  return ['Lankagama@Admin2026!'];
}

// Optional hashed password check support
function getAdminPasswordHash(): string | null {
  return process.env.ADMIN_PASSWORD_HASH || null;
}

// In-memory rate limiting for login attempts by client IP
interface RateLimitEntry {
  attempts: number;
  lockUntil: number;
}
const loginRateLimitMap = new Map<string, RateLimitEntry>();

export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = loginRateLimitMap.get(ip);

  if (!entry) {
    return { allowed: true };
  }

  if (entry.lockUntil > now) {
    const retryAfterSeconds = Math.ceil((entry.lockUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  // If lockout expired, reset
  if (entry.lockUntil <= now && entry.attempts >= 5) {
    loginRateLimitMap.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(ip: string): { locked: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = loginRateLimitMap.get(ip) || { attempts: 0, lockUntil: 0 };
  entry.attempts += 1;

  if (entry.attempts >= 5) {
    // Lock out for 15 minutes
    entry.lockUntil = now + 15 * 60 * 1000;
    loginRateLimitMap.set(ip, entry);
    return { locked: true, retryAfterSeconds: 15 * 60 };
  }

  loginRateLimitMap.set(ip, entry);
  return { locked: false };
}

export function clearLoginRateLimit(ip: string): void {
  loginRateLimitMap.delete(ip);
}

// Constant-time string comparison
function constantTimeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) {
      // Dummy check to prevent timing leaks on length
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// Password hashing using pbkdf2
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}$${hash}`;
}

export function verifyPasswordHash(password: string, storedHash: string): boolean {
  try {
    if (!storedHash || !storedHash.includes('$')) return false;
    const [salt, expectedHash] = storedHash.split('$');
    const derived = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return constantTimeCompare(derived, expectedHash);
  } catch {
    return false;
  }
}

// Verify given password against configured passwords or hash
export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!password || typeof password !== 'string') return false;

  // 1. Check if custom password hash is saved in database or storage
  let savedHash: string | undefined;
  if (isPostgresConfigured()) {
    try {
      const dbSettings = await dbGetSettings();
      if (dbSettings.adminPasswordHash) {
        savedHash = dbSettings.adminPasswordHash;
      }
    } catch {}
  }

  if (!savedHash) {
    try {
      const storageSettings = getAgencySettings();
      if (storageSettings.adminPasswordHash) {
        savedHash = storageSettings.adminPasswordHash;
      }
    } catch {}
  }

  if (savedHash) {
    return verifyPasswordHash(password, savedHash);
  }

  // 2. Check against ADMIN_PASSWORD_HASH if configured in env
  const envHash = getAdminPasswordHash();
  if (envHash) {
    if (verifyPasswordHash(password, envHash)) {
      return true;
    }
  }

  // 3. Check against plain text passwords in env (supports comma-separated list for two family members)
  const allowedPasswords = getAdminPasswords();
  for (const allowed of allowedPasswords) {
    if (constantTimeCompare(password, allowed)) {
      return true;
    }
  }

  return false;
}

// Create a signed session token
export function createSessionToken(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    role: 'admin',
    iat: now,
    exp: now + SESSION_DURATION_SECONDS,
    jti: crypto.randomBytes(8).toString('hex')
  });

  const payloadB64 = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

// Verify a signed session token
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return false;
  }

  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) {
    return false;
  }

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url');

  if (!constantTimeCompare(signature, expectedSignature)) {
    return false;
  }

  // Verify expiry and payload
  try {
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp > now && payload.role === 'admin') {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

// Check admin session from NextRequest or standard Request
export function getSessionTokenFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie') || '';
  const cookiesList = cookieHeader.split(';').map(c => c.trim());
  for (const c of cookiesList) {
    if (c.startsWith(`${COOKIE_NAME}=`)) {
      return decodeURIComponent(c.substring(COOKIE_NAME.length + 1));
    }
  }
  return null;
}

export function isAuthenticatedAdmin(req: Request): boolean {
  const token = getSessionTokenFromRequest(req);
  return verifySessionToken(token);
}

// Helper to return 401 Unauthorized if not admin
export function requireAdmin(req: Request): NextResponse | null {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Unauthorized: Admin authentication required.'
      },
      {
        status: 401,
        headers: {
          'Cache-Control': 'no-store',
          'WWW-Authenticate': 'Cookie realm="admin"'
        }
      }
    );
  }
  return null;
}

// Set admin cookie on a response
export function attachAdminSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS
  });
}

// Clear admin cookie on a response
export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}
