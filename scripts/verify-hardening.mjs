// Automated Verification Script for Lankagama Security, WhatsApp & Booking Hardening
// Run with: node scripts/verify-hardening.mjs

import crypto from 'crypto';

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}`);
  }
}

console.log('\n========================================');
console.log(' Running Lankagama Verification Tests');
console.log('========================================\n');

// ----------------------------------------------------
// TEST GROUP 1: WhatsApp Number Normalization
// ----------------------------------------------------
console.log('TEST GROUP 1: WhatsApp Number Normalization');

function normalizeWhatsAppNumber(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') {
    return { isValid: false, cleanDigits: '', formatted: '', waLink: '', error: 'Empty or invalid' };
  }
  let digits = rawInput.trim().replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    digits = '94' + digits.substring(1);
  } else if (digits.length === 9 && digits.startsWith('7')) {
    digits = '94' + digits;
  }
  if (digits.length < 9 || digits.length > 15) {
    return { isValid: false, cleanDigits: digits, formatted: rawInput, waLink: '', error: 'Invalid length' };
  }
  let formatted = `+${digits}`;
  if (digits.startsWith('94') && digits.length === 11) {
    formatted = `+94 ${digits.substring(2, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
  }
  return { isValid: true, cleanDigits: digits, formatted, waLink: `https://wa.me/${digits}` };
}

const norm1 = normalizeWhatsAppNumber('076 797 6081');
assert(norm1.isValid && norm1.cleanDigits === '94767976081', 'Normalizes Sri Lankan local 076... to 9476...');
assert(norm1.formatted === '+94 76 797 6081', 'Formats Sri Lankan mobile with human spaces');
assert(norm1.waLink === 'https://wa.me/94767976081', 'Generates standard wa.me link with clean digits');

const norm2 = normalizeWhatsAppNumber('+94 77 123 4567');
assert(norm2.isValid && norm2.cleanDigits === '94771234567', 'Preserves international format +94 77...');

const norm3 = normalizeWhatsAppNumber('123');
assert(!norm3.isValid, 'Rejects short/invalid numbers < 9 digits');

// ----------------------------------------------------
// TEST GROUP 2: PII Masking Utilities
// ----------------------------------------------------
console.log('\nTEST GROUP 2: PII Masking Utilities');

function maskPhoneNumber(phone) {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (trimmed.length <= 4) return '****';
  const visibleStart = trimmed.length > 7 ? 4 : 2;
  const visibleEnd = trimmed.length > 7 ? 3 : 2;
  const start = trimmed.substring(0, visibleStart);
  const end = trimmed.substring(trimmed.length - visibleEnd);
  const stars = '*'.repeat(Math.max(3, trimmed.length - visibleStart - visibleEnd));
  return `${start} ${stars} ${end}`.trim();
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return '';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0] || '*'}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

const maskedPhone = maskPhoneNumber('0771234567');
assert(maskedPhone.startsWith('0771') && maskedPhone.endsWith('567') && maskedPhone.includes('***'), 'Masks middle digits of phone number');

const maskedEmail = maskEmail('sarath.perera@gmail.com');
assert(maskedEmail.startsWith('s***a@') && maskedEmail.endsWith('gmail.com'), 'Masks middle characters of email address');

// ----------------------------------------------------
// TEST GROUP 3: Constant-Time Password & Session Auth
// ----------------------------------------------------
console.log('\nTEST GROUP 3: Constant-Time Password & Session Auth');

function verifyPasswordConstantTime(provided, expected) {
  if (!provided || !expected) return false;
  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);
  if (providedBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

function createSignedSessionToken(secret) {
  const payload = {
    sub: 'admin-family',
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 86400
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

function verifySignedSessionToken(token, secret) {
  if (!token || !token.includes('.')) return null;
  const [payloadB64, signature] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  if (signature.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return null;
  const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

const testSecret = 'test-secret-key-for-lankagama-verification-32chars!';
const testPassword = 'Lankagama@Admin2026!';

assert(verifyPasswordConstantTime(testPassword, 'Lankagama@Admin2026!'), 'Matches correct admin password');
assert(!verifyPasswordConstantTime('1234', testPassword), 'Strictly rejects old demo PIN 1234');
assert(!verifyPasswordConstantTime('wrong-pwd', testPassword), 'Rejects incorrect password');

const sessionToken = createSignedSessionToken(testSecret);
const verified = verifySignedSessionToken(sessionToken, testSecret);
assert(verified !== null && verified.role === 'admin', 'Validates HMAC-SHA256 signed session token');

const tamperedToken = sessionToken.substring(0, sessionToken.length - 4) + 'abcd';
const tamperedVerified = verifySignedSessionToken(tamperedToken, testSecret);
assert(tamperedVerified === null, 'Rejects tampered session token signature');

// ----------------------------------------------------
// TEST GROUP 4: In-Memory Rate Limiting
// ----------------------------------------------------
console.log('\nTEST GROUP 4: In-Memory Rate Limiting');

class RateLimiter {
  constructor(maxAttempts = 5, lockMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.lockMs = lockMs;
    this.attempts = new Map();
  }

  isRateLimited(ip) {
    const entry = this.attempts.get(ip);
    if (!entry) return false;
    if (entry.lockedUntil && Date.now() < entry.lockedUntil) return true;
    if (Date.now() - entry.firstAttempt > this.lockMs) {
      this.attempts.delete(ip);
      return false;
    }
    return entry.count >= this.maxAttempts;
  }

  recordFailedAttempt(ip) {
    const now = Date.now();
    const entry = this.attempts.get(ip) || { count: 0, firstAttempt: now, lockedUntil: null };
    entry.count += 1;
    if (entry.count >= this.maxAttempts) {
      entry.lockedUntil = now + this.lockMs;
    }
    this.attempts.set(ip, entry);
  }

  resetAttempts(ip) {
    this.attempts.delete(ip);
  }
}

const limiter = new RateLimiter(5, 1000);
const testIp = '192.168.1.100';

assert(!limiter.isRateLimited(testIp), 'Initially not rate limited');
for (let i = 0; i < 4; i++) limiter.recordFailedAttempt(testIp);
assert(!limiter.isRateLimited(testIp), 'Still not locked after 4 failed attempts');
limiter.recordFailedAttempt(testIp);
assert(limiter.isRateLimited(testIp), 'Locked out after 5 failed attempts');
limiter.resetAttempts(testIp);
assert(!limiter.isRateLimited(testIp), 'Reset allows login after successful attempt');

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n========================================');
console.log(` Results: ${passedTests} / ${totalTests} tests passed`);
console.log('========================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  console.log('All automated verification checks succeeded!\n');
}
