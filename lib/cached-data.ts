import { cacheLife, cacheTag } from 'next/cache';
import { dbGetAll, dbGetById, dbGetSettings, dbGetActiveVillas, dbGetVerifiedComments } from './db';
import {
  Villa,
  HeroSlide,
  CampingGear,
  KithulProduct,
  Attraction,
  TourGuide,
  BlogPost,
  CustomerComment,
} from './types';
import { AGENCY_CONFIG } from './data';
import { normalizeWhatsAppNumber } from './validations';

export const CACHE_TAGS = {
  VILLAS: 'villas',
  VILLA_BY_ID: (id: string) => `villa-${id}`,
  SLIDES: 'hero-slides',
  CAMPING: 'camping',
  KITHUL: 'kithul',
  ATTRACTIONS: 'attractions',
  GUIDES: 'guides',
  BLOGS: 'blogs',
  COMMENTS: 'comments',
  WHATSAPP_SETTINGS: 'whatsapp-settings',
} as const;

export interface PublicWhatsAppSettings {
  whatsappNumber: string;
  formattedNumber: string;
  waLink: string;
  phone: string;
  email: string;
  address: string;
  locationDetails: string;
  name: string;
  sinhalaName: string;
  updatedAt?: string;
}

export async function getCachedVillas(): Promise<Villa[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.VILLAS);

  return dbGetActiveVillas();
}

export async function getCachedVillaById(id: string): Promise<Villa | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.VILLAS, CACHE_TAGS.VILLA_BY_ID(id));

  return dbGetById<Villa>('lankagama_villas', id);
}

export async function getCachedHeroSlides(): Promise<HeroSlide[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.SLIDES);

  return dbGetAll<HeroSlide>('lankagama_slides');
}

export async function getCachedCampingGear(): Promise<CampingGear[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.CAMPING);

  return dbGetAll<CampingGear>('lankagama_camping');
}

export async function getCachedKithulProducts(): Promise<KithulProduct[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.KITHUL);

  return dbGetAll<KithulProduct>('lankagama_kithul');
}

export async function getCachedAttractions(): Promise<Attraction[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.ATTRACTIONS);

  return dbGetAll<Attraction>('lankagama_attractions');
}

export async function getCachedGuides(): Promise<TourGuide[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.GUIDES);

  return dbGetAll<TourGuide>('lankagama_guides');
}

export async function getCachedBlogs(): Promise<BlogPost[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.BLOGS);

  return dbGetAll<BlogPost>('lankagama_blogs');
}

export async function getCachedPublicComments(): Promise<CustomerComment[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.COMMENTS);

  return dbGetVerifiedComments();
}

export async function getCachedAllComments(): Promise<CustomerComment[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.COMMENTS);

  return dbGetAll<CustomerComment>('lankagama_comments');
}

export async function getCachedPublicWhatsAppSettings(): Promise<PublicWhatsAppSettings> {
  'use cache';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.WHATSAPP_SETTINGS);

  const settings = await dbGetSettings();
  const rawNumber = settings.activeWhatsAppNumber || AGENCY_CONFIG.whatsappNumber;
  const normalized = normalizeWhatsAppNumber(rawNumber);

  return {
    whatsappNumber: normalized.isValid ? normalized.cleanDigits : rawNumber,
    formattedNumber: normalized.formatted || rawNumber,
    waLink: normalized.waLink || `https://wa.me/${rawNumber}`,
    phone: settings.phone || normalized.formatted || AGENCY_CONFIG.phone,
    email: settings.email || AGENCY_CONFIG.email,
    address: settings.address || AGENCY_CONFIG.address,
    locationDetails: settings.locationDetails || AGENCY_CONFIG.locationDetails,
    name: settings.name || AGENCY_CONFIG.name,
    sinhalaName: settings.sinhalaName || AGENCY_CONFIG.sinhalaName,
    updatedAt: settings.updatedAt,
  };
}
