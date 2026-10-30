import { NextResponse } from 'next/server';
import { 
  verifyAdminPassword, 
  createSessionToken, 
  attachAdminSessionCookie,
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginRateLimit
} from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // Get client IP for rate limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    // Check rate limit
    const rateCheck = checkLoginRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many failed login attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.`
        },
        { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfterSeconds) } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const password = body.password || body.pin;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }

    const isValid = await verifyAdminPassword(password);

    if (!isValid) {
      const lockStatus = recordFailedLogin(ip);
      if (lockStatus.locked) {
        return NextResponse.json(
          {
            success: false,
            message: `Account temporarily locked due to 5 failed attempts. Please try again in 15 minutes.`
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { success: false, message: 'Invalid admin password or PIN.' },
        { status: 401 }
      );
    }

    // Success: clear rate limit, create signed token, attach HttpOnly cookie
    clearLoginRateLimit(ip);
    const token = createSessionToken();
    const response = NextResponse.json({
      success: true,
      message: 'Admin authentication successful.'
    });

    attachAdminSessionCookie(response, token);
    return response;
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
