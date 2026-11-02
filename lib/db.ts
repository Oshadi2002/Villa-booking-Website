import { Pool } from 'pg';
import crypto from 'crypto';
import { 
  Booking, Villa, TourGuide, HeroSlide, Attraction, 
  CampingGear, KithulProduct, CustomerComment, CustomerInquiry, AgencySettings 
} from './types';
import { AGENCY_CONFIG } from './data';

export class DatabaseError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function getConnectionString(): string | null {
  // 1. Direct standard environment keys
  const direct = process.env.POSTGRES_URL || 
                 process.env.DATABASE_URL || 
                 process.env.STORAGE_POSTGRES_URL || 
                 process.env.STORAGE_DATABASE_URL || 
                 process.env.STORAGE_URL || 
                 process.env.POSTGRES_PRISMA_URL || 
                 process.env.SUPABASE_DATABASE_URL;
  if (direct && (direct.startsWith('postgres://') || direct.startsWith('postgresql://'))) {
    return direct;
  }

  // 2. Scan all environment variables for any postgresql connection string
  for (const [, value] of Object.entries(process.env)) {
    if (typeof value === 'string' && (value.startsWith('postgres://') || value.startsWith('postgresql://'))) {
      return value;
    }
  }

  return direct || null;
}

export function isPostgresConfigured(): boolean {
  return Boolean(getConnectionString());
}

let pool: Pool | null = null;

export function getPool(): Pool {
  const connString = getConnectionString();
  if (!connString) {
    throw new DatabaseError(
      'Cloud PostgreSQL is mandatory but not configured. Please set DATABASE_URL or POSTGRES_URL environment variable.'
    );
  }
  if (!pool) {
    pool = new Pool({
      connectionString: connString,
      ssl: connString.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err);
    });
  }
  return pool;
}

// Universal query runner - strictly throws error on connection or query failure
export async function query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  const p = getPool();
  try {
    const result = await p.query(sql, params);
    return result.rows as T[];
  } catch (error) {
    console.error('PostgreSQL execution error:', error, 'SQL:', sql);
    throw new DatabaseError(`Database operation failed: ${error instanceof Error ? error.message : String(error)}`, error);
  }
}

let tablesInitialized = false;

// Ensure all database tables exist
export async function ensurePostgresTables(): Promise<boolean> {
  if (tablesInitialized) return true;

  await query(`
    CREATE TABLE IF NOT EXISTS lankagama_villas (
      id VARCHAR(255) PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lankagama_camping (
      id VARCHAR(255) PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lankagama_kithul (
      id VARCHAR(255) PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lankagama_slides (
      id VARCHAR(255) PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lankagama_attractions (
      id VARCHAR(255) PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lankagama_guides (
      id VARCHAR(255) PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lankagama_bookings (
      id VARCHAR(255) PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lankagama_comments (
      id VARCHAR(255) PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lankagama_inquiries (
      id VARCHAR(255) PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lankagama_settings (
      id VARCHAR(255) PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lankagama_users (
      id VARCHAR(255) PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  tablesInitialized = true;
  return true;
}

/* ============================================================
   GENERIC POSTGRESQL CRUD OPERATIONS
   ============================================================ */

export async function dbGetAll<T>(table: string): Promise<T[]> {
  await ensurePostgresTables();
  const rows = await query<{ data: T }>(`SELECT data FROM ${table} ORDER BY created_at DESC`);
  return rows.map(r => r.data);
}

export async function dbGetById<T>(table: string, id: string): Promise<T | null> {
  await ensurePostgresTables();
  const rows = await query<{ data: T }>(`SELECT data FROM ${table} WHERE id = $1 LIMIT 1`, [id]);
  return rows.length > 0 ? rows[0].data : null;
}

export async function dbSaveItem<T extends { id: string }>(table: string, item: T): Promise<T> {
  await ensurePostgresTables();
  await query(
    `INSERT INTO ${table} (id, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP`,
    [item.id, JSON.stringify(item)]
  );
  return item;
}

export async function dbDeleteItem(table: string, id: string): Promise<boolean> {
  await ensurePostgresTables();
  const rows = await query<{ id: string }>(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}

/* ============================================================
   AGENCY SETTINGS MANAGEMENT
   ============================================================ */

export async function dbGetSettings(): Promise<AgencySettings> {
  await ensurePostgresTables();
  const rows = await query<{ data: AgencySettings }>(
    'SELECT data FROM lankagama_settings WHERE id = $1 LIMIT 1',
    ['general']
  );
  if (rows.length > 0 && rows[0].data) {
    return rows[0].data;
  }
  return {
    activeWhatsAppNumber: '94767976081',
    phone: AGENCY_CONFIG.phone,
    email: AGENCY_CONFIG.email,
    address: AGENCY_CONFIG.address,
    locationDetails: AGENCY_CONFIG.locationDetails,
    name: AGENCY_CONFIG.name,
    sinhalaName: AGENCY_CONFIG.sinhalaName,
    updatedAt: new Date().toISOString()
  };
}

export async function dbSaveSettings(settings: AgencySettings): Promise<AgencySettings> {
  await ensurePostgresTables();
  const updated: AgencySettings = {
    ...settings,
    updatedAt: new Date().toISOString()
  };
  await query(
    `INSERT INTO lankagama_settings (id, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP`,
    ['general', JSON.stringify(updated)]
  );
  return updated;
}

/* ============================================================
   MODULE-SPECIFIC BUSINESS LOGIC (DATABASE ONLY)
   ============================================================ */

// 1. BOOKINGS
export async function dbCreateBooking(newBooking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> {
  await ensurePostgresTables();
  const existingRows = await query<{ id: string }>('SELECT id FROM lankagama_bookings');
  const existingIds = new Set(existingRows.map(r => r.id.toUpperCase()));

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

  const trackingToken = crypto.randomBytes(8).toString('hex');
  const booking: Booking = {
    ...newBooking,
    id,
    trackingToken,
    status: 'pending',
    createdAt: new Date().toISOString(),
    adminNotes: ''
  };

  await query(
    `INSERT INTO lankagama_bookings (id, data, created_at, updated_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [booking.id, JSON.stringify(booking)]
  );
  return booking;
}

export async function dbFindBooking(idOrQuery: string): Promise<Booking | null> {
  await ensurePostgresTables();
  const clean = idOrQuery.trim().toUpperCase();
  const cleanPhone = idOrQuery.replace(/[\s+-]/g, '');

  const rows = await query<{ data: Booking }>(`
    SELECT data FROM lankagama_bookings 
    WHERE UPPER(id) = $1 
       OR UPPER(data->>'trackingToken') = $1
       OR REPLACE(REPLACE(REPLACE(data->>'customerPhone', ' ', ''), '+', ''), '-', '') = $2
    LIMIT 1
  `, [clean, cleanPhone]);

  return rows.length > 0 ? rows[0].data : null;
}

export async function dbUpdateBooking(id: string, updatedData: Partial<Booking>): Promise<Booking | null> {
  await ensurePostgresTables();
  const existing = await dbGetById<Booking>('lankagama_bookings', id);
  if (!existing) return null;

  const merged: Booking = {
    ...existing,
    ...updatedData,
    id: existing.id
  };

  await query(
    `UPDATE lankagama_bookings SET data = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [id, JSON.stringify(merged)]
  );
  return merged;
}

// 2. VILLAS
export async function dbCreateVilla(newVilla: Omit<Villa, 'id'> & { id?: string }): Promise<Villa> {
  await ensurePostgresTables();
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

  await query(
    `INSERT INTO lankagama_villas (id, data, created_at, updated_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [villa.id, JSON.stringify(villa)]
  );
  return villa;
}

export async function dbUpdateVilla(id: string, updatedData: Partial<Villa>): Promise<Villa> {
  await ensurePostgresTables();
  const existing = await dbGetById<Villa>('lankagama_villas', id);
  const merged: Villa = {
    ...(existing || {
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
      houseRules: updatedData.houseRules || []
    }),
    ...updatedData,
    id
  };

  await query(
    `INSERT INTO lankagama_villas (id, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP`,
    [id, JSON.stringify(merged)]
  );
  return merged;
}

// 3. GUIDES
export async function dbCreateGuide(newGuide: Omit<TourGuide, 'id'> & { id?: string }): Promise<TourGuide> {
  await ensurePostgresTables();
  const id = newGuide.id || `guide-${Date.now()}`;
  const guide: TourGuide = {
    ...newGuide,
    id,
    languages: newGuide.languages || ['Sinhala', 'English'],
    specialties: newGuide.specialties || [],
    verifiedLocal: newGuide.verifiedLocal ?? true
  };

  await query(
    `INSERT INTO lankagama_guides (id, data, created_at, updated_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [guide.id, JSON.stringify(guide)]
  );
  return guide;
}

// 4. CAMPING GEAR
export async function dbCreateCampingGear(newGear: Omit<CampingGear, 'id'> & { id?: string }): Promise<CampingGear> {
  await ensurePostgresTables();
  const id = newGear.id || `gear-${Date.now()}`;
  const gear: CampingGear = {
    ...newGear,
    id,
    includes: newGear.includes || []
  };

  await query(
    `INSERT INTO lankagama_camping (id, data, created_at, updated_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [gear.id, JSON.stringify(gear)]
  );
  return gear;
}

export async function dbUpdateCampingGear(id: string, updatedData: Partial<CampingGear>): Promise<CampingGear | null> {
  await ensurePostgresTables();
  const existing = await dbGetById<CampingGear>('lankagama_camping', id);
  if (!existing) return null;

  const merged: CampingGear = {
    ...existing,
    ...updatedData,
    id
  };

  await query(
    `UPDATE lankagama_camping SET data = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [id, JSON.stringify(merged)]
  );
  return merged;
}

// 5. ATTRACTIONS
export async function dbCreateAttraction(newAttr: Omit<Attraction, 'id'> & { id?: string }): Promise<Attraction> {
  await ensurePostgresTables();
  const id = newAttr.id || `attraction-${Date.now()}`;
  const attr: Attraction = {
    ...newAttr,
    id
  };

  await query(
    `INSERT INTO lankagama_attractions (id, data, created_at, updated_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [attr.id, JSON.stringify(attr)]
  );
  return attr;
}

export async function dbUpdateAttraction(id: string, updatedData: Partial<Attraction>): Promise<Attraction | null> {
  await ensurePostgresTables();
  const existing = await dbGetById<Attraction>('lankagama_attractions', id);
  if (!existing) return null;

  const merged: Attraction = {
    ...existing,
    ...updatedData,
    id
  };

  await query(
    `UPDATE lankagama_attractions SET data = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [id, JSON.stringify(merged)]
  );
  return merged;
}

// 6. HERO SLIDES
export async function dbCreateHeroSlide(newSlide: Omit<HeroSlide, 'id'> & { id?: string }): Promise<HeroSlide> {
  await ensurePostgresTables();
  const id = newSlide.id || `slide-${Date.now()}`;
  const slide: HeroSlide = {
    ...newSlide,
    id
  };

  await query(
    `INSERT INTO lankagama_slides (id, data, created_at, updated_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [slide.id, JSON.stringify(slide)]
  );
  return slide;
}

export async function dbUpdateHeroSlide(id: string, updatedData: Partial<HeroSlide>): Promise<HeroSlide | null> {
  await ensurePostgresTables();
  const existing = await dbGetById<HeroSlide>('lankagama_slides', id);
  if (!existing) return null;

  const merged: HeroSlide = {
    ...existing,
    ...updatedData,
    id
  };

  await query(
    `UPDATE lankagama_slides SET data = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [id, JSON.stringify(merged)]
  );
  return merged;
}

// 7. KITHUL
export async function dbCreateKithulProduct(newProd: Omit<KithulProduct, 'id'> & { id?: string }): Promise<KithulProduct> {
  await ensurePostgresTables();
  const id = newProd.id || `kithul-${Date.now()}`;
  const prod: KithulProduct = {
    ...newProd,
    id,
    inStock: newProd.inStock ?? true
  };

  await query(
    `INSERT INTO lankagama_kithul (id, data, created_at, updated_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [prod.id, JSON.stringify(prod)]
  );
  return prod;
}

export async function dbUpdateKithulProduct(id: string, updatedData: Partial<KithulProduct>): Promise<KithulProduct | null> {
  await ensurePostgresTables();
  const existing = await dbGetById<KithulProduct>('lankagama_kithul', id);
  if (!existing) return null;

  const merged: KithulProduct = {
    ...existing,
    ...updatedData,
    id
  };

  await query(
    `UPDATE lankagama_kithul SET data = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [id, JSON.stringify(merged)]
  );
  return merged;
}

// 8. CUSTOMER COMMENTS / REVIEWS
export async function dbCreateComment(newComment: Omit<CustomerComment, 'id' | 'createdAt' | 'isVerified'> & { isVerified?: boolean }): Promise<CustomerComment> {
  await ensurePostgresTables();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const id = `rev-${Date.now()}-${randomSuffix}`;
  const comment: CustomerComment = {
    ...newComment,
    id,
    createdAt: new Date().toISOString().split('T')[0],
    isVerified: newComment.isVerified ?? false
  };

  await query(
    `INSERT INTO lankagama_comments (id, data, created_at, updated_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [comment.id, JSON.stringify(comment)]
  );
  return comment;
}

export async function dbUpdateComment(id: string, updatedData: Partial<CustomerComment>): Promise<CustomerComment | null> {
  await ensurePostgresTables();
  const existing = await dbGetById<CustomerComment>('lankagama_comments', id);
  if (!existing) return null;

  const merged: CustomerComment = {
    ...existing,
    ...updatedData,
    id
  };

  await query(
    `UPDATE lankagama_comments SET data = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [id, JSON.stringify(merged)]
  );
  return merged;
}

// 9. CUSTOMER INQUIRIES
export async function dbCreateInquiry(newInq: Omit<CustomerInquiry, 'id' | 'createdAt' | 'status'>): Promise<CustomerInquiry> {
  await ensurePostgresTables();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const id = `inq-${Date.now()}-${randomSuffix}`;
  const inq: CustomerInquiry = {
    ...newInq,
    id,
    status: 'new',
    createdAt: new Date().toISOString()
  };

  await query(
    `INSERT INTO lankagama_inquiries (id, data, created_at, updated_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [inq.id, JSON.stringify(inq)]
  );
  return inq;
}

export async function dbUpdateInquiryStatus(id: string, status: 'new' | 'contacted' | 'resolved'): Promise<CustomerInquiry | null> {
  await ensurePostgresTables();
  const existing = await dbGetById<CustomerInquiry>('lankagama_inquiries', id);
  if (!existing) return null;

  const merged: CustomerInquiry = {
    ...existing,
    status
  };

  await query(
    `UPDATE lankagama_inquiries SET data = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [id, JSON.stringify(merged)]
  );
  return merged;
}
