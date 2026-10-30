import { z } from 'zod';
import { Booking } from './types';

// ==========================================
// 1. PHONE & WHATSAPP NUMBER NORMALIZATION
// ==========================================

export interface NormalizedWhatsApp {
  isValid: boolean;
  cleanDigits: string;
  formatted: string;
  waLink: string;
  error?: string;
}

export function normalizeWhatsAppNumber(rawInput: string): NormalizedWhatsApp {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      isValid: false,
      cleanDigits: '',
      formatted: '',
      waLink: '',
      error: 'Phone number is empty or invalid.'
    };
  }

  // Remove all non-digits except a possible leading +
  const cleaned = rawInput.trim();
  let digits = cleaned.replace(/\D/g, '');

  // Sri Lanka local mobile normalization:
  // e.g. 0767976081 (10 digits starting with 07) -> 94767976081
  if (digits.startsWith('0') && digits.length === 10) {
    digits = '94' + digits.substring(1);
  } else if (digits.length === 9 && digits.startsWith('7')) {
    // e.g. 767976081 -> 94767976081
    digits = '94' + digits;
  }

  // Validation: standard international numbers are 9 to 15 digits
  if (digits.length < 9 || digits.length > 15) {
    return {
      isValid: false,
      cleanDigits: digits,
      formatted: rawInput,
      waLink: '',
      error: 'WhatsApp number must be between 9 and 15 digits.'
    };
  }

  // Format nicely for humans: if Sri Lankan (starts with 94 and 11 digits)
  let formatted = `+${digits}`;
  if (digits.startsWith('94') && digits.length === 11) {
    // +94 76 797 6081
    formatted = `+94 ${digits.substring(2, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
  }

  return {
    isValid: true,
    cleanDigits: digits,
    formatted,
    waLink: `https://wa.me/${digits}`
  };
}

// Generate prefilled WhatsApp link
export function buildWhatsAppLink(number: string, message: string): string {
  const norm = normalizeWhatsAppNumber(number);
  const targetDigits = norm.isValid ? norm.cleanDigits : '94767976081';
  return `https://wa.me/${targetDigits}?text=${encodeURIComponent(message)}`;
}

// ==========================================
// 2. PII MASKING UTILITIES
// ==========================================

export function maskPhoneNumber(phone: string): string {
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

export function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return '';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0] || '*'}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export function maskBookingForPublic(booking: Booking, isAuthorizedAdmin = false): Partial<Booking> {
  if (isAuthorizedAdmin) {
    return booking;
  }

  // Sanitize for public tracking
  return {
    id: booking.id,
    type: booking.type,
    itemId: booking.itemId,
    itemName: booking.itemName,
    customerName: booking.customerName,
    customerPhone: maskPhoneNumber(booking.customerPhone),
    customerEmail: booking.customerEmail ? maskEmail(booking.customerEmail) : undefined,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    guestsCount: booking.guestsCount,
    needGuide: booking.needGuide,
    guideFee: booking.guideFee,
    totalLKR: booking.totalLKR,
    status: booking.status,
    createdAt: booking.createdAt,
    acPreference: booking.acPreference,
    bookingScope: booking.bookingScope,
    roomsCount: booking.roomsCount,
    orderMeals: booking.orderMeals,
    itemsSummary: booking.itemsSummary,
    deliveryLocation: booking.deliveryLocation
    // Note: adminNotes, raw customerPhone, raw customerEmail are excluded!
  };
}

// ==========================================
// 3. ZOD REQUEST VALIDATION SCHEMAS
// ==========================================

export const bookingCreateSchema = z.object({
  type: z.enum(['villa', 'camping', 'guide', 'kithul', 'toddy']).default('villa'),
  itemId: z.string().min(1, 'Item ID is required').max(100),
  itemName: z.string().min(1, 'Item name is required').max(200),
  customerName: z.string().min(2, 'Customer name must be at least 2 characters').max(100),
  customerPhone: z.string().min(9, 'Phone number must be at least 9 digits').max(25),
  customerEmail: z.union([z.string().email(), z.literal('')]).optional(),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-in date must be in YYYY-MM-DD format'),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-out date must be in YYYY-MM-DD format').optional(),
  guestsCount: z.coerce.number().int().min(1, 'Guests count must be at least 1').max(50, 'Max 50 guests'),
  needGuide: z.boolean().optional(),
  guideFee: z.coerce.number().min(0).optional(),
  totalLKR: z.coerce.number().min(0, 'Total LKR cannot be negative'),
  specialNotes: z.string().max(1000).optional(),
  acPreference: z.enum(['ac', 'non-ac']).optional(),
  bookingScope: z.enum(['full_villa', 'room_only']).optional(),
  roomsCount: z.coerce.number().int().min(1).max(20).optional(),
  orderMeals: z.boolean().optional(),
  mealsNotes: z.string().max(500).optional(),
  deliveryLocation: z.string().max(300).optional(),
  quantity: z.coerce.number().min(1).optional(),
  itemsSummary: z.string().max(500).optional()
}).refine(data => {
  // Validate date logic: check-out must be >= check-in
  if (data.checkInDate && data.checkOutDate) {
    return new Date(data.checkOutDate) >= new Date(data.checkInDate);
  }
  return true;
}, {
  message: 'Check-out date must be on or after check-in date',
  path: ['checkOutDate']
});

export const inquiryCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().min(9, 'Phone number must be at least 9 digits').max(25),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(150),
  message: z.string().min(5, 'Message must be at least 5 characters').max(2000),
  preferredVillaOrProduct: z.string().max(200).optional()
});

export const commentCreateSchema = z.object({
  author: z.string().min(2, 'Author name must be at least 2 characters').max(100),
  cityOrCountry: z.string().min(2, 'Location must be at least 2 characters').max(100),
  rating: z.coerce.number().int().min(1).max(5),
  category: z.enum(['Villa Stay', 'Pure Kithul & Hakuru', 'Fresh Raa Experience', 'Camping Gear', 'General']),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(1500),
  stayedAtOrOrdered: z.string().max(200).optional()
});

export const whatsappSettingsSchema = z.object({
  whatsappNumber: z.string().min(9, 'WhatsApp number is required'),
  phone: z.string().optional(),
  email: z.union([z.string().email('Please enter a valid email address'), z.literal('')]).optional(),
  address: z.string().optional(),
  locationDetails: z.string().optional(),
  name: z.string().optional(),
  sinhalaName: z.string().optional()
});
