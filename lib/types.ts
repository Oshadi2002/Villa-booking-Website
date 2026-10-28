export type BookingType = 'villa' | 'camping' | 'guide' | 'kithul' | 'toddy';

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'delivered';

export interface Booking {
  id: string;
  type: BookingType;
  itemId: string;
  itemName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  checkInDate: string;
  checkOutDate?: string;
  guestsCount: number;
  needGuide?: boolean;
  guideFee?: number;
  totalLKR: number;
  specialNotes?: string;
  status: BookingStatus;
  createdAt: string;
  adminNotes?: string;
  deliveryLocation?: string;
  quantity?: number;
  itemsSummary?: string;
  acPreference?: 'ac' | 'non-ac';
  orderMeals?: boolean;
  mealsNotes?: string;
  trackingToken?: string;
}

export interface AgencySettings {
  activeWhatsAppNumber: string;
  updatedAt?: string;
}

export interface AmenityHighlight {
  title: string;
  desc: string;
  icon: string;
}

export interface FacilityGroup {
  category: string;
  items: string[];
}

export interface Villa {
  id: string;
  name: string;
  sinhalaName: string;
  tagline: string;
  description: string;
  pricePerNightLKR: number; // Non-A/C or standard rate
  pricePerNightAcLKR?: number; // A/C rate
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  bedConfig: string;
  checkInTime: string;
  checkOutTime: string;
  features: string[];
  imageUrl: string;
  images: string[];
  locationDetails: string;
  ownerContact?: string;
  highlights: AmenityHighlight[];
  facilities: FacilityGroup[];
  foodOptions: string[];
  houseRules: string[];
  acType?: 'ac' | 'non-ac' | 'both';
  hasKitchen?: boolean;
}

export interface CampingGear {
  id: string;
  name: string;
  sinhalaName: string;
  category: 'package' | 'tent' | 'cooking' | 'accessory';
  description: string;
  includes: string[];
  pricePerDayLKR: number;
  capacity?: string;
  imageUrl: string;
}

export interface TourGuide {
  id: string;
  name: string;
  nickname?: string;
  experienceYears: number;
  languages: string[];
  specialties: string[];
  dailyRateLKR: number;
  halfDayRateLKR: number;
  bio: string;
  imageUrl: string;
  rating: number;
  verifiedLocal: boolean;
}

export interface HeroSlide {
  id: string;
  url: string;
  title: string;
  subtitle?: string;
  sinhala?: string;
}

export interface Attraction {
  id: string;
  name: string;
  badge: string;
  description: string;
  caution: string;
  imageUrl?: string;
}

export interface KithulProduct {
  id: string;
  name: string;
  sinhalaName: string;
  category: 'treacle' | 'jaggery' | 'toddy' | 'experience';
  description: string;
  priceLKR: number;
  unit: string;
  weightOrVolume: string;
  purityBadge: string;
  harvestOrigin: string;
  deliveryNote: string;
  imageUrl: string;
  inStock: boolean;
  featured?: boolean;
}

export interface CustomerComment {
  id: string;
  author: string;
  cityOrCountry: string;
  rating: number; // 1 to 5
  category: 'Villa Stay' | 'Pure Kithul & Hakuru' | 'Fresh Raa Experience' | 'Camping Gear' | 'General';
  comment: string;
  stayedAtOrOrdered?: string;
  createdAt: string;
  isVerified: boolean;
}

export interface CustomerInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  preferredVillaOrProduct?: string;
  status: 'new' | 'contacted' | 'resolved';
  createdAt: string;
}

