import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { Booking, Villa, TourGuide, HeroSlide, Attraction, CampingGear, KithulProduct, CustomerComment, CustomerInquiry, AgencySettings } from './types';
import { VILLAS, TOUR_GUIDES, CAMPING_GEAR, ATTRACTIONS, KITHUL_PRODUCTS, CUSTOMER_COMMENTS, CUSTOMER_INQUIRIES } from './data';

const DATA_DIR = path.join(process.cwd(), 'data');
const TMP_DATA_DIR = path.join(os.tmpdir(), 'lankagama_data');

// Initial defaults
const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1920&q=85',
    title: 'Brahmana Ella & Waterfalls',
    sinhala: 'බ්‍රාහ්මණ ඇල්ල සහ දූවිලි ඇල්ල දියඇලි මිටියාවත'
  },
  {
    id: 'slide-2',
    url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1920&q=85',
    title: 'Sinharaja Virgin Rainforest Canopy',
    sinhala: 'සිංහරාජ ලෝක උරුම වැසි වනාන්තර මායිම'
  },
  {
    id: 'slide-3',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=85',
    title: 'Gin Ganga Natural River Pools',
    sinhala: 'ලංකාගම ගිං ගඟ අද්දර ස්වාභාවික නාන තටාක'
  },
  {
    id: 'slide-4',
    url: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=1920&q=85',
    title: 'Deep Jungle Trails & Suspension Bridges',
    sinhala: 'ගැඹුරු වැසි වනාන්තර අඩිපාරවල් සහ ලී පාලම්'
  },
  {
    id: 'slide-5',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=85',
    title: 'Mist-Shrouded Mountain Ridges',
    sinhala: 'නෙළුව - ලංකාගම මීදුම් සළු බැඳි කඳු පන්ති'
  }
];

const INITIAL_ATTRACTIONS: Attraction[] = ATTRACTIONS.map((a, idx) => ({
  id: `attraction-${idx + 1}`,
  name: a.name,
  badge: a.badge,
  description: a.description,
  caution: a.caution,
  imageUrl: idx === 0 
    ? 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80'
    : idx === 1
    ? 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80'
    : idx === 2
    ? 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'
    : 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=800&q=80'
}));

// In-memory runtime cache
let inMemoryBookings: Booking[] = [
  {
    id: 'LET-8401',
    type: 'villa',
    itemId: 'villa-1',
    itemName: 'Sinharaja Gin Ganga River Edge Villa',
    customerName: 'Roshan Samarasinghe',
    customerPhone: '0771234567',
    customerEmail: 'roshan.s@example.com',
    checkInDate: '2026-10-24',
    checkOutDate: '2026-10-26',
    guestsCount: 4,
    totalLKR: 25000,
    specialNotes: 'Require river-facing room on upper floor. Arriving around 1:00 PM.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    adminNotes: 'Need to call Mr. Karunathilaka to confirm river-facing room availability.'
  },
  {
    id: 'LET-8392',
    type: 'camping',
    itemId: 'gear-pack-1',
    itemName: 'Full 4-Person Rainforest Wilderness Camp Set',
    customerName: 'Chathura Deshan',
    customerPhone: '0719876543',
    customerEmail: 'chathura.d@gmail.com',
    checkInDate: '2026-10-25',
    checkOutDate: '2026-10-27',
    guestsCount: 4,
    totalLKR: 11000,
    specialNotes: 'Need 2 extra rechargeable headlamps and leech socks.',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    adminNotes: 'Gear checked and reserved in storage. Customer notified via WhatsApp.'
  },
  {
    id: 'LET-8380',
    type: 'guide',
    itemId: 'guide-1',
    itemName: 'Sunil Shantha (Brahmana Ella & Duwili Ella Trek)',
    customerName: 'David & Sarah Miller',
    customerPhone: '+447812345678',
    customerEmail: 'david.miller@ukmail.com',
    checkInDate: '2026-10-26',
    guestsCount: 2,
    totalLKR: 4500,
    specialNotes: 'Interested in photography and bird watching around Brahmana falls.',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    adminNotes: 'Confirmed with Sunil Aiya. Meet point at Lankagama bridge 8:30 AM.'
  }
];

let inMemoryVillas: Villa[] = [...VILLAS];
let inMemoryGuides: TourGuide[] = [...TOUR_GUIDES];
let inMemoryHeroSlides: HeroSlide[] = [...INITIAL_HERO_SLIDES];
let inMemoryCamping: CampingGear[] = [...CAMPING_GEAR];
let inMemoryAttractions: Attraction[] = [...INITIAL_ATTRACTIONS];
let inMemoryKithul: KithulProduct[] = [...KITHUL_PRODUCTS];
let inMemoryComments: CustomerComment[] = [...CUSTOMER_COMMENTS];
let inMemoryInquiries: CustomerInquiry[] = [...CUSTOMER_INQUIRIES];
let inMemorySettings: AgencySettings = {
  activeWhatsAppNumber: '94767976081',
  updatedAt: new Date().toISOString()
};

// Ensure writable directories exist
function ensureDirectories() {
  try {
    if (!fs.existsSync(TMP_DATA_DIR)) {
      fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
    }
  } catch {}
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {}
}

// Cloud KV Sync (Upstash Redis or Vercel KV)
export async function syncToCloudKV(key: string, data: unknown): Promise<void> {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  try {
    await fetch(`${url}/set/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.error(`Cloud KV sync error for key: ${key}`, err);
  }
}

export async function fetchFromCloudKV<T>(key: string): Promise<T | null> {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.result) {
      if (typeof json.result === 'string') {
        try {
          return JSON.parse(json.result);
        } catch {
          return json.result;
        }
      }
      return json.result;
    }
  } catch (err) {
    console.error(`Cloud KV fetch error for key: ${key}`, err);
  }
  return null;
}

// Generic file reading with multi-level fallback
function readDataFile<T>(fileName: string, fallback: T): T {
  ensureDirectories();

  // 1. Try /tmp directory (writable in serverless)
  const tmpFile = path.join(TMP_DATA_DIR, fileName);
  try {
    if (fs.existsSync(tmpFile)) {
      const data = fs.readFileSync(tmpFile, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) ? parsed.length > 0 : parsed) {
        return parsed;
      }
    }
  } catch {}

  // 2. Try project data/ directory
  const localFile = path.join(DATA_DIR, fileName);
  try {
    if (fs.existsSync(localFile)) {
      const data = fs.readFileSync(localFile, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) ? parsed.length > 0 : parsed) {
        return parsed;
      }
    }
  } catch {}

  return fallback;
}

// Generic file writing (writes to /tmp, data/ and triggers cloud KV sync)
function writeDataFile<T>(fileName: string, data: T, cloudKey?: string): void {
  ensureDirectories();
  const content = JSON.stringify(data, null, 2);

  // 1. Write to /tmp (always succeeds on Vercel)
  try {
    fs.writeFileSync(path.join(TMP_DATA_DIR, fileName), content, 'utf-8');
  } catch {}

  // 2. Write to data/ (succeeds locally)
  try {
    fs.writeFileSync(path.join(DATA_DIR, fileName), content, 'utf-8');
  } catch {}

  // 3. Trigger cloud KV sync if key provided
  if (cloudKey) {
    syncToCloudKV(cloudKey, data).catch(() => {});
  }
}

/* ============================================================
   1. BOOKINGS MANAGEMENT
   ============================================================ */
export function getAllBookings(): Booking[] {
  inMemoryBookings = readDataFile<Booking[]>('bookings.json', inMemoryBookings);
  return inMemoryBookings;
}

export function getBookingById(idOrQuery: string): Booking | undefined {
  const all = getAllBookings();
  const clean = idOrQuery.trim().toUpperCase();
  const cleanPhone = idOrQuery.replace(/[\s+-]/g, '');
  return all.find(b => 
    b.id.toUpperCase() === clean || 
    (b.trackingToken && b.trackingToken.toUpperCase() === clean) ||
    b.customerPhone.replace(/[\s+-]/g, '') === cleanPhone
  );
}

export function createBooking(newBooking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking {
  const all = getAllBookings();
  const existingIds = new Set(all.map(b => b.id.toUpperCase()));
  
  // Collision-safe reference generation
  let id = '';
  for (let attempt = 0; attempt < 25; attempt++) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const candidate = `LET-${randomSuffix}`;
    if (!existingIds.has(candidate)) {
      id = candidate;
      break;
    }
  }
  if (!id) {
    id = `LET-${Date.now().toString().slice(-4)}`;
  }

  // Cryptographically random tracking token for secure public lookup
  const trackingToken = crypto.randomBytes(8).toString('hex');

  const booking: Booking = {
    ...newBooking,
    id,
    trackingToken,
    status: 'pending',
    createdAt: new Date().toISOString(),
    adminNotes: ''
  };

  all.unshift(booking);
  inMemoryBookings = all;
  writeDataFile('bookings.json', all, 'lankagama_bookings');
  return booking;
}

export function updateBookingStatus(id: string, status: 'pending' | 'approved' | 'rejected', adminNotes?: string): Booking | null {
  const all = getAllBookings();
  const index = all.findIndex(b => b.id.toUpperCase() === id.toUpperCase());
  if (index === -1) return null;

  all[index].status = status;
  if (adminNotes !== undefined) {
    all[index].adminNotes = adminNotes;
  }

  inMemoryBookings = all;
  writeDataFile('bookings.json', all, 'lankagama_bookings');
  return all[index];
}

export function updateBooking(id: string, updatedData: Partial<Booking>): Booking | null {
  const all = getAllBookings();
  const index = all.findIndex(b => b.id.toUpperCase() === id.toUpperCase());
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updatedData,
    id: all[index].id
  };

  inMemoryBookings = all;
  writeDataFile('bookings.json', all, 'lankagama_bookings');
  return all[index];
}

export function deleteBooking(id: string): boolean {
  const all = getAllBookings();
  const filtered = all.filter(b => b.id.toUpperCase() !== id.toUpperCase());
  if (filtered.length === all.length) return false;

  inMemoryBookings = filtered;
  writeDataFile('bookings.json', filtered, 'lankagama_bookings');
  return true;
}

/* ============================================================
   2. VILLAS MANAGEMENT
   ============================================================ */
export function getAllVillas(): Villa[] {
  inMemoryVillas = readDataFile<Villa[]>('villas.json', inMemoryVillas);
  return inMemoryVillas;
}

export function getVillaById(id: string): Villa | undefined {
  const all = getAllVillas();
  return all.find(v => v.id === id);
}

export function createVilla(newVilla: Omit<Villa, 'id'> & { id?: string }): Villa {
  const all = getAllVillas();
  const id = newVilla.id || `villa-${Date.now()}`;

  const villa: Villa = {
    ...newVilla,
    id,
    images: newVilla.images && newVilla.images.length > 0 ? newVilla.images : [newVilla.imageUrl],
    features: newVilla.features || [],
    highlights: newVilla.highlights || [],
    facilities: newVilla.facilities || [],
    foodOptions: newVilla.foodOptions || [],
    houseRules: newVilla.houseRules || []
  };

  all.unshift(villa);
  inMemoryVillas = all;
  writeDataFile('villas.json', all, 'lankagama_villas');
  return villa;
}

export function updateVilla(id: string, updatedData: Partial<Villa>): Villa {
  const all = getAllVillas();
  const index = all.findIndex(v => v.id === id);
  if (index === -1) {
    const newV: Villa = {
      id,
      name: updatedData.name || 'Lankagama Villa',
      sinhalaName: updatedData.sinhalaName || updatedData.name || 'ලංකාගම විලා',
      tagline: updatedData.tagline || '',
      pricePerNightLKR: updatedData.pricePerNightLKR || 0,
      maxGuests: updatedData.maxGuests || 4,
      bedrooms: updatedData.bedrooms || 1,
      bathrooms: updatedData.bathrooms || 1,
      bedConfig: updatedData.bedConfig || '1 Double Bed',
      checkInTime: updatedData.checkInTime || '02:00 PM',
      checkOutTime: updatedData.checkOutTime || '11:00 AM',
      locationDetails: updatedData.locationDetails || 'Lankagama, Sinharaja',
      description: updatedData.description || '',
      imageUrl: updatedData.imageUrl || '',
      images: updatedData.images && updatedData.images.length > 0 ? updatedData.images : (updatedData.imageUrl ? [updatedData.imageUrl] : []),
      features: updatedData.features || [],
      highlights: updatedData.highlights || [],
      facilities: updatedData.facilities || [],
      foodOptions: updatedData.foodOptions || [],
      houseRules: updatedData.houseRules || [],
      ...updatedData
    };
    all.unshift(newV);
    inMemoryVillas = all;
    writeDataFile('villas.json', all, 'lankagama_villas');
    return newV;
  }

  all[index] = {
    ...all[index],
    ...updatedData,
    id
  };

  inMemoryVillas = all;
  writeDataFile('villas.json', all, 'lankagama_villas');
  return all[index];
}

export function deleteVilla(id: string): boolean {
  const all = getAllVillas();
  const filtered = all.filter(v => v.id !== id);
  if (filtered.length === all.length) return false;

  inMemoryVillas = filtered;
  writeDataFile('villas.json', filtered, 'lankagama_villas');
  return true;
}

/* ============================================================
   3. GUIDES MANAGEMENT
   ============================================================ */
export function getAllGuides(): TourGuide[] {
  inMemoryGuides = readDataFile<TourGuide[]>('guides.json', inMemoryGuides);
  return inMemoryGuides;
}

export function createGuide(newGuide: Omit<TourGuide, 'id'> & { id?: string }): TourGuide {
  const all = getAllGuides();
  const id = newGuide.id || `guide-${Date.now()}`;

  const guide: TourGuide = {
    ...newGuide,
    id,
    languages: newGuide.languages || ['Sinhala', 'English'],
    specialties: newGuide.specialties || [],
    verifiedLocal: newGuide.verifiedLocal ?? true
  };

  all.unshift(guide);
  inMemoryGuides = all;
  writeDataFile('guides.json', all, 'lankagama_guides');
  return guide;
}

export function deleteGuide(id: string): boolean {
  const all = getAllGuides();
  const filtered = all.filter(g => g.id !== id);
  if (filtered.length === all.length) return false;

  inMemoryGuides = filtered;
  writeDataFile('guides.json', filtered, 'lankagama_guides');
  return true;
}

/* ============================================================
   4. HERO SLIDESHOW MANAGEMENT
   ============================================================ */
export function getAllHeroSlides(): HeroSlide[] {
  inMemoryHeroSlides = readDataFile<HeroSlide[]>('hero_slides.json', inMemoryHeroSlides);
  return inMemoryHeroSlides;
}

export function createHeroSlide(newSlide: Omit<HeroSlide, 'id'> & { id?: string }): HeroSlide {
  const all = getAllHeroSlides();
  const id = newSlide.id || `slide-${Date.now()}`;

  const slide: HeroSlide = {
    ...newSlide,
    id
  };

  all.push(slide);
  inMemoryHeroSlides = all;
  writeDataFile('hero_slides.json', all, 'lankagama_hero_slides');
  return slide;
}

export function deleteHeroSlide(id: string): boolean {
  const all = getAllHeroSlides();
  if (all.length <= 1) return false;

  const filtered = all.filter(s => s.id !== id);
  if (filtered.length === all.length) return false;

  inMemoryHeroSlides = filtered;
  writeDataFile('hero_slides.json', filtered, 'lankagama_hero_slides');
  return true;
}

export function updateHeroSlide(id: string, updatedData: Partial<HeroSlide>): HeroSlide | null {
  const all = getAllHeroSlides();
  const index = all.findIndex(s => s.id === id);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updatedData,
    id: all[index].id
  };

  inMemoryHeroSlides = all;
  writeDataFile('hero_slides.json', all, 'lankagama_hero_slides');
  return all[index];
}

/* ============================================================
   5. CAMPING GEAR MANAGEMENT
   ============================================================ */
export function getAllCampingGear(): CampingGear[] {
  inMemoryCamping = readDataFile<CampingGear[]>('camping.json', inMemoryCamping);
  return inMemoryCamping;
}

export function createCampingGear(newGear: Omit<CampingGear, 'id'> & { id?: string }): CampingGear {
  const all = getAllCampingGear();
  const id = newGear.id || `gear-${Date.now()}`;

  const gear: CampingGear = {
    ...newGear,
    id,
    includes: newGear.includes || []
  };

  all.unshift(gear);
  inMemoryCamping = all;
  writeDataFile('camping.json', all, 'lankagama_camping');
  return gear;
}

export function updateCampingGear(id: string, updatedData: Partial<CampingGear>): CampingGear | null {
  const all = getAllCampingGear();
  const index = all.findIndex(g => g.id === id);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updatedData,
    id: all[index].id
  };

  inMemoryCamping = all;
  writeDataFile('camping.json', all, 'lankagama_camping');
  return all[index];
}

export function deleteCampingGear(id: string): boolean {
  const all = getAllCampingGear();
  const filtered = all.filter(g => g.id !== id);
  if (filtered.length === all.length) return false;

  inMemoryCamping = filtered;
  writeDataFile('camping.json', filtered, 'lankagama_camping');
  return true;
}

/* ============================================================
   6. ATTRACTIONS & WATERFALLS
   ============================================================ */
export function getAllAttractions(): Attraction[] {
  inMemoryAttractions = readDataFile<Attraction[]>('attractions.json', inMemoryAttractions);
  return inMemoryAttractions;
}

export function createAttraction(newAttr: Omit<Attraction, 'id'> & { id?: string }): Attraction {
  const all = getAllAttractions();
  const id = newAttr.id || `attraction-${Date.now()}`;

  const attr: Attraction = {
    ...newAttr,
    id
  };

  all.push(attr);
  inMemoryAttractions = all;
  writeDataFile('attractions.json', all, 'lankagama_attractions');
  return attr;
}

export function deleteAttraction(id: string): boolean {
  const all = getAllAttractions();
  const filtered = all.filter(a => a.id !== id);
  if (filtered.length === all.length) return false;

  inMemoryAttractions = filtered;
  writeDataFile('attractions.json', filtered, 'lankagama_attractions');
  return true;
}

export function updateAttraction(id: string, updatedData: Partial<Attraction>): Attraction | null {
  const all = getAllAttractions();
  const index = all.findIndex(a => a.id === id);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updatedData,
    id: all[index].id
  };

  inMemoryAttractions = all;
  writeDataFile('attractions.json', all, 'lankagama_attractions');
  return all[index];
}

/* ============================================================
   7. KITHUL & TODDY PRODUCTS
   ============================================================ */
export function getAllKithulProducts(): KithulProduct[] {
  inMemoryKithul = readDataFile<KithulProduct[]>('kithul.json', inMemoryKithul);
  return inMemoryKithul;
}

export function getKithulProductById(id: string): KithulProduct | undefined {
  const all = getAllKithulProducts();
  return all.find(p => p.id === id);
}

export function createKithulProduct(newProd: Omit<KithulProduct, 'id'> & { id?: string }): KithulProduct {
  const all = getAllKithulProducts();
  const id = newProd.id || `kithul-${Date.now()}`;

  const prod: KithulProduct = {
    ...newProd,
    id,
    inStock: newProd.inStock ?? true
  };

  all.unshift(prod);
  inMemoryKithul = all;
  writeDataFile('kithul.json', all, 'lankagama_kithul');
  return prod;
}

export function updateKithulProduct(id: string, updatedData: Partial<KithulProduct>): KithulProduct | null {
  const all = getAllKithulProducts();
  const index = all.findIndex(p => p.id === id);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updatedData,
    id
  };

  inMemoryKithul = all;
  writeDataFile('kithul.json', all, 'lankagama_kithul');
  return all[index];
}

export function deleteKithulProduct(id: string): boolean {
  const all = getAllKithulProducts();
  const filtered = all.filter(p => p.id !== id);
  if (filtered.length === all.length) return false;

  inMemoryKithul = filtered;
  writeDataFile('kithul.json', filtered, 'lankagama_kithul');
  return true;
}

/* ============================================================
   8. CUSTOMER REVIEWS & COMMENTS
   ============================================================ */
export function getAllComments(): CustomerComment[] {
  inMemoryComments = readDataFile<CustomerComment[]>('comments.json', inMemoryComments);
  return inMemoryComments;
}

export function createComment(newComment: Omit<CustomerComment, 'id' | 'createdAt' | 'isVerified'> & { isVerified?: boolean }): CustomerComment {
  const all = getAllComments();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const id = `rev-${Date.now()}-${randomSuffix}`;

  const comment: CustomerComment = {
    ...newComment,
    id,
    createdAt: new Date().toISOString().split('T')[0],
    isVerified: newComment.isVerified ?? false // Safe default: false so admin must approve
  };

  all.unshift(comment);
  inMemoryComments = all;
  writeDataFile('comments.json', all, 'lankagama_comments');
  return comment;
}

export function deleteComment(id: string): boolean {
  const all = getAllComments();
  const filtered = all.filter(c => c.id !== id);
  if (filtered.length === all.length) return false;

  inMemoryComments = filtered;
  writeDataFile('comments.json', filtered, 'lankagama_comments');
  return true;
}

export function updateComment(id: string, updatedData: Partial<CustomerComment>): CustomerComment | null {
  const all = getAllComments();
  const index = all.findIndex(c => c.id === id);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updatedData,
    id: all[index].id
  };

  inMemoryComments = all;
  writeDataFile('comments.json', all, 'lankagama_comments');
  return all[index];
}

/* ============================================================
   9. CUSTOMER INQUIRIES & QUESTIONS
   ============================================================ */
export function getAllInquiries(): CustomerInquiry[] {
  inMemoryInquiries = readDataFile<CustomerInquiry[]>('inquiries.json', inMemoryInquiries);
  return inMemoryInquiries;
}

export function createInquiry(newInq: Omit<CustomerInquiry, 'id' | 'createdAt' | 'status'>): CustomerInquiry {
  const all = getAllInquiries();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const id = `inq-${Date.now()}-${randomSuffix}`;

  const inq: CustomerInquiry = {
    ...newInq,
    id,
    status: 'new',
    createdAt: new Date().toISOString()
  };

  all.unshift(inq);
  inMemoryInquiries = all;
  writeDataFile('inquiries.json', all, 'lankagama_inquiries');
  return inq;
}

export function updateInquiryStatus(id: string, status: 'new' | 'contacted' | 'resolved'): CustomerInquiry | null {
  const all = getAllInquiries();
  const index = all.findIndex(i => i.id === id);
  if (index === -1) return null;

  all[index].status = status;
  inMemoryInquiries = all;
  writeDataFile('inquiries.json', all, 'lankagama_inquiries');
  return all[index];
}

export function deleteInquiry(id: string): boolean {
  const all = getAllInquiries();
  const filtered = all.filter(i => i.id !== id);
  if (filtered.length === all.length) return false;

  inMemoryInquiries = filtered;
  writeDataFile('inquiries.json', filtered, 'lankagama_inquiries');
  return true;
}

/* ============================================================
   10. AGENCY SETTINGS MANAGEMENT (CENTRAL WHATSAPP ETC)
   ============================================================ */
export function getAgencySettings(): AgencySettings {
  inMemorySettings = readDataFile<AgencySettings>('settings.json', inMemorySettings);
  return inMemorySettings;
}

export function updateAgencySettings(newSettings: Partial<AgencySettings>): AgencySettings {
  const current = getAgencySettings();
  const updated: AgencySettings = {
    ...current,
    ...newSettings,
    updatedAt: new Date().toISOString()
  };

  inMemorySettings = updated;
  writeDataFile('settings.json', updated, 'lankagama_settings');
  return updated;
}
