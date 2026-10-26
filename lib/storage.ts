import fs from 'fs';
import path from 'path';
import { Booking, Villa, TourGuide, HeroSlide, Attraction, CampingGear, KithulProduct, CustomerComment, CustomerInquiry } from './types';
import { VILLAS, TOUR_GUIDES, CAMPING_GEAR, ATTRACTIONS, KITHUL_PRODUCTS, CUSTOMER_COMMENTS, CUSTOMER_INQUIRIES } from './data';

const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const VILLAS_FILE = path.join(DATA_DIR, 'villas.json');
const GUIDES_FILE = path.join(DATA_DIR, 'guides.json');
const HERO_SLIDES_FILE = path.join(DATA_DIR, 'hero_slides.json');
const CAMPING_FILE = path.join(DATA_DIR, 'camping.json');
const ATTRACTIONS_FILE = path.join(DATA_DIR, 'attractions.json');
const KITHUL_FILE = path.join(DATA_DIR, 'kithul.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');

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

// In-memory fallbacks
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

function ensureDataFiles() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BOOKINGS_FILE)) {
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(inMemoryBookings, null, 2), 'utf-8');
    }
    if (!fs.existsSync(VILLAS_FILE)) {
      fs.writeFileSync(VILLAS_FILE, JSON.stringify(inMemoryVillas, null, 2), 'utf-8');
    }
    if (!fs.existsSync(GUIDES_FILE)) {
      fs.writeFileSync(GUIDES_FILE, JSON.stringify(inMemoryGuides, null, 2), 'utf-8');
    }
    if (!fs.existsSync(HERO_SLIDES_FILE)) {
      fs.writeFileSync(HERO_SLIDES_FILE, JSON.stringify(inMemoryHeroSlides, null, 2), 'utf-8');
    }
    if (!fs.existsSync(CAMPING_FILE)) {
      fs.writeFileSync(CAMPING_FILE, JSON.stringify(inMemoryCamping, null, 2), 'utf-8');
    }
    if (!fs.existsSync(ATTRACTIONS_FILE)) {
      fs.writeFileSync(ATTRACTIONS_FILE, JSON.stringify(inMemoryAttractions, null, 2), 'utf-8');
    }
    if (!fs.existsSync(KITHUL_FILE)) {
      fs.writeFileSync(KITHUL_FILE, JSON.stringify(inMemoryKithul, null, 2), 'utf-8');
    }
    if (!fs.existsSync(COMMENTS_FILE)) {
      fs.writeFileSync(COMMENTS_FILE, JSON.stringify(inMemoryComments, null, 2), 'utf-8');
    }
    if (!fs.existsSync(INQUIRIES_FILE)) {
      fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inMemoryInquiries, null, 2), 'utf-8');
    }
  } catch {
    // fallback
  }
}

/* ============================================================
   1. BOOKINGS MANAGEMENT
   ============================================================ */
export function getAllBookings(): Booking[] {
  try {
    ensureDataFiles();
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        inMemoryBookings = parsed;
        return parsed;
      }
    }
  } catch {}
  return inMemoryBookings;
}

export function getBookingById(id: string): Booking | undefined {
  const all = getAllBookings();
  const cleanId = id.trim().toUpperCase();
  return all.find(b => b.id.toUpperCase() === cleanId || b.customerPhone.replace(/[\s+-]/g, '') === cleanId.replace(/[\s+-]/g, ''));
}

export function createBooking(newBooking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking {
  const all = getAllBookings();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const id = `LET-${randomSuffix}`;

  const booking: Booking = {
    ...newBooking,
    id,
    status: 'pending',
    createdAt: new Date().toISOString(),
    adminNotes: ''
  };

  all.unshift(booking);
  inMemoryBookings = all;

  try {
    ensureDataFiles();
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

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

  try {
    ensureDataFiles();
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

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

  try {
    ensureDataFiles();
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

  return all[index];
}

export function deleteBooking(id: string): boolean {
  const all = getAllBookings();
  const filtered = all.filter(b => b.id.toUpperCase() !== id.toUpperCase());
  if (filtered.length === all.length) return false;

  inMemoryBookings = filtered;

  try {
    ensureDataFiles();
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch {}

  return true;
}

/* ============================================================
   2. VILLAS MANAGEMENT
   ============================================================ */
export function getAllVillas(): Villa[] {
  try {
    ensureDataFiles();
    if (fs.existsSync(VILLAS_FILE)) {
      const data = fs.readFileSync(VILLAS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryVillas = parsed;
        return parsed;
      }
    }
  } catch {}
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

  try {
    ensureDataFiles();
    fs.writeFileSync(VILLAS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

  return villa;
}

export function updateVilla(id: string, updatedData: Partial<Villa>): Villa | null {
  const all = getAllVillas();
  const index = all.findIndex(v => v.id === id);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updatedData,
    id
  };

  inMemoryVillas = all;

  try {
    ensureDataFiles();
    fs.writeFileSync(VILLAS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

  return all[index];
}

export function deleteVilla(id: string): boolean {
  const all = getAllVillas();
  const filtered = all.filter(v => v.id !== id);
  if (filtered.length === all.length) return false;

  inMemoryVillas = filtered;

  try {
    ensureDataFiles();
    fs.writeFileSync(VILLAS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch {}

  return true;
}

/* ============================================================
   3. GUIDES MANAGEMENT
   ============================================================ */
export function getAllGuides(): TourGuide[] {
  try {
    ensureDataFiles();
    if (fs.existsSync(GUIDES_FILE)) {
      const data = fs.readFileSync(GUIDES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryGuides = parsed;
        return parsed;
      }
    }
  } catch {}
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

  try {
    ensureDataFiles();
    fs.writeFileSync(GUIDES_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

  return guide;
}

export function deleteGuide(id: string): boolean {
  const all = getAllGuides();
  const filtered = all.filter(g => g.id !== id);
  if (filtered.length === all.length) return false;

  inMemoryGuides = filtered;

  try {
    ensureDataFiles();
    fs.writeFileSync(GUIDES_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch {}

  return true;
}

/* ============================================================
   4. HERO SLIDESHOW MANAGEMENT (මුල් පිටුවේ Slideshow Photos)
   ============================================================ */
export function getAllHeroSlides(): HeroSlide[] {
  try {
    ensureDataFiles();
    if (fs.existsSync(HERO_SLIDES_FILE)) {
      const data = fs.readFileSync(HERO_SLIDES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryHeroSlides = parsed;
        return parsed;
      }
    }
  } catch {}
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

  try {
    ensureDataFiles();
    fs.writeFileSync(HERO_SLIDES_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

  return slide;
}

export function deleteHeroSlide(id: string): boolean {
  const all = getAllHeroSlides();
  if (all.length <= 1) {
    // Keep at least 1 slide
    return false;
  }
  const filtered = all.filter(s => s.id !== id);
  if (filtered.length === all.length) return false;

  inMemoryHeroSlides = filtered;

  try {
    ensureDataFiles();
    fs.writeFileSync(HERO_SLIDES_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch {}

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

  try {
    ensureDataFiles();
    fs.writeFileSync(HERO_SLIDES_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

  return all[index];
}

/* ============================================================
   5. CAMPING GEAR MANAGEMENT (කඳවුරු උපකරණ)
   ============================================================ */
export function getAllCampingGear(): CampingGear[] {
  try {
    ensureDataFiles();
    if (fs.existsSync(CAMPING_FILE)) {
      const data = fs.readFileSync(CAMPING_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryCamping = parsed;
        return parsed;
      }
    }
  } catch {}
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

  try {
    ensureDataFiles();
    fs.writeFileSync(CAMPING_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

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

  try {
    ensureDataFiles();
    fs.writeFileSync(CAMPING_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

  return all[index];
}

export function deleteCampingGear(id: string): boolean {
  const all = getAllCampingGear();
  const filtered = all.filter(g => g.id !== id);
  if (filtered.length === all.length) return false;

  inMemoryCamping = filtered;

  try {
    ensureDataFiles();
    fs.writeFileSync(CAMPING_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch {}

  return true;
}

/* ============================================================
   6. ATTRACTIONS & WATERFALLS (දියඇලි සහ නැරඹුම් ස්ථාන)
   ============================================================ */
export function getAllAttractions(): Attraction[] {
  try {
    ensureDataFiles();
    if (fs.existsSync(ATTRACTIONS_FILE)) {
      const data = fs.readFileSync(ATTRACTIONS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryAttractions = parsed;
        return parsed;
      }
    }
  } catch {}
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

  try {
    ensureDataFiles();
    fs.writeFileSync(ATTRACTIONS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

  return attr;
}

export function deleteAttraction(id: string): boolean {
  const all = getAllAttractions();
  const filtered = all.filter(a => a.id !== id);
  if (filtered.length === all.length) return false;

  inMemoryAttractions = filtered;

  try {
    ensureDataFiles();
    fs.writeFileSync(ATTRACTIONS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch {}

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

  try {
    ensureDataFiles();
    fs.writeFileSync(ATTRACTIONS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

  return all[index];
}

/* ============================================================
   7. KITHUL & TODDY PRODUCTS (කිතුල් පැණි, හකුරු සහ රා)
   ============================================================ */
export function getAllKithulProducts(): KithulProduct[] {
  try {
    ensureDataFiles();
    if (fs.existsSync(KITHUL_FILE)) {
      const data = fs.readFileSync(KITHUL_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryKithul = parsed;
        return parsed;
      }
    }
  } catch {}
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

  try {
    ensureDataFiles();
    fs.writeFileSync(KITHUL_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

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

  try {
    ensureDataFiles();
    fs.writeFileSync(KITHUL_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

  return all[index];
}

export function deleteKithulProduct(id: string): boolean {
  const all = getAllKithulProducts();
  const filtered = all.filter(p => p.id !== id);
  if (filtered.length === all.length) return false;

  inMemoryKithul = filtered;

  try {
    ensureDataFiles();
    fs.writeFileSync(KITHUL_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch {}

  return true;
}

/* ============================================================
   8. CUSTOMER REVIEWS & COMMENTS (පාරිභෝගික අදහස්)
   ============================================================ */
export function getAllComments(): CustomerComment[] {
  try {
    ensureDataFiles();
    if (fs.existsSync(COMMENTS_FILE)) {
      const data = fs.readFileSync(COMMENTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryComments = parsed;
        return parsed;
      }
    }
  } catch {}
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
    isVerified: newComment.isVerified ?? true
  };

  all.unshift(comment);
  inMemoryComments = all;

  try {
    ensureDataFiles();
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

  return comment;
}

export function deleteComment(id: string): boolean {
  const all = getAllComments();
  const filtered = all.filter(c => c.id !== id);
  if (filtered.length === all.length) return false;

  inMemoryComments = filtered;

  try {
    ensureDataFiles();
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch {}

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

  try {
    ensureDataFiles();
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

  return all[index];
}

/* ============================================================
   9. CUSTOMER INQUIRIES & QUESTIONS (විමසීම්)
   ============================================================ */
export function getAllInquiries(): CustomerInquiry[] {
  try {
    ensureDataFiles();
    if (fs.existsSync(INQUIRIES_FILE)) {
      const data = fs.readFileSync(INQUIRIES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryInquiries = parsed;
        return parsed;
      }
    }
  } catch {}
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

  try {
    ensureDataFiles();
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

  return inq;
}

export function updateInquiryStatus(id: string, status: 'new' | 'contacted' | 'resolved'): CustomerInquiry | null {
  const all = getAllInquiries();
  const index = all.findIndex(i => i.id === id);
  if (index === -1) return null;

  all[index].status = status;
  inMemoryInquiries = all;

  try {
    ensureDataFiles();
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch {}

  return all[index];
}

export function deleteInquiry(id: string): boolean {
  const all = getAllInquiries();
  const filtered = all.filter(i => i.id !== id);
  if (filtered.length === all.length) return false;

  inMemoryInquiries = filtered;

  try {
    ensureDataFiles();
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch {}

  return true;
}
