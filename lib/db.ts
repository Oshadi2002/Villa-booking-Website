import { Pool } from 'pg';
import { 
  VILLAS, TOUR_GUIDES, CAMPING_GEAR, ATTRACTIONS, 
  KITHUL_PRODUCTS, CUSTOMER_COMMENTS, CUSTOMER_INQUIRIES 
} from './data';
import { 
  Villa, TourGuide, CampingGear, Attraction, 
  KithulProduct, HeroSlide, CustomerComment, CustomerInquiry, Booking 
} from './types';

function getConnectionString(): string | null {
  return process.env.POSTGRES_URL || 
         process.env.DATABASE_URL || 
         process.env.POSTGRES_PRISMA_URL || 
         process.env.SUPABASE_DATABASE_URL || 
         null;
}

let pool: Pool | null = null;

function getPool(): Pool | null {
  const connString = getConnectionString();
  if (!connString) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: connString,
      ssl: connString.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

// Universal query runner supporting all PostgreSQL providers (Vercel Postgres, Neon, Supabase, AWS, etc.)
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const p = getPool();
  if (!p) return [];

  try {
    const result = await p.query(sql, params);
    return result.rows as T[];
  } catch (error) {
    console.error('PostgreSQL query error:', error, 'SQL:', sql);
    return [];
  }
}

export function isPostgresConfigured(): boolean {
  return Boolean(getConnectionString());
}

let tablesInitialized = false;

// Automatically initialize tables and seed initial data if empty
export async function ensurePostgresTables(): Promise<boolean> {
  if (tablesInitialized || !isPostgresConfigured()) return tablesInitialized;

  try {
    await query(`
      CREATE TABLE IF NOT EXISTS lankagama_villas (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lankagama_camping (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lankagama_kithul (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lankagama_slides (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lankagama_attractions (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lankagama_guides (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lankagama_bookings (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lankagama_comments (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lankagama_inquiries (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Auto-seed villas if empty
    const existingVillas = await query<{ id: string }>('SELECT id FROM lankagama_villas LIMIT 1');
    if (existingVillas.length === 0) {
      for (const villa of VILLAS) {
        await query(
          'INSERT INTO lankagama_villas (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
          [villa.id, JSON.stringify(villa)]
        );
      }
    }

    // Auto-seed camping if empty
    const existingCamping = await query<{ id: string }>('SELECT id FROM lankagama_camping LIMIT 1');
    if (existingCamping.length === 0) {
      for (const gear of CAMPING_GEAR) {
        await query(
          'INSERT INTO lankagama_camping (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
          [gear.id, JSON.stringify(gear)]
        );
      }
    }

    // Auto-seed kithul if empty
    const existingKithul = await query<{ id: string }>('SELECT id FROM lankagama_kithul LIMIT 1');
    if (existingKithul.length === 0) {
      for (const prod of KITHUL_PRODUCTS) {
        await query(
          'INSERT INTO lankagama_kithul (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
          [prod.id, JSON.stringify(prod)]
        );
      }
    }

    // Auto-seed slides if empty
    const existingSlides = await query<{ id: string }>('SELECT id FROM lankagama_slides LIMIT 1');
    if (existingSlides.length === 0) {
      const defaultSlides: HeroSlide[] = [
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
      for (const s of defaultSlides) {
        await query(
          'INSERT INTO lankagama_slides (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
          [s.id, JSON.stringify(s)]
        );
      }
    }

    // Auto-seed attractions if empty
    const existingAttractions = await query<{ id: string }>('SELECT id FROM lankagama_attractions LIMIT 1');
    if (existingAttractions.length === 0) {
      for (let i = 0; i < ATTRACTIONS.length; i++) {
        const a = ATTRACTIONS[i];
        const item: Attraction = {
          id: `attraction-${i + 1}`,
          name: a.name,
          badge: a.badge,
          description: a.description,
          caution: a.caution,
          imageUrl: i === 0 
            ? 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80'
            : i === 1
            ? 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80'
            : i === 2
            ? 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=800&q=80'
        };
        await query(
          'INSERT INTO lankagama_attractions (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
          [item.id, JSON.stringify(item)]
        );
      }
    }

    // Auto-seed tour guides if empty
    const existingGuides = await query<{ id: string }>('SELECT id FROM lankagama_guides LIMIT 1');
    if (existingGuides.length === 0) {
      for (const g of TOUR_GUIDES) {
        await query(
          'INSERT INTO lankagama_guides (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
          [g.id, JSON.stringify(g)]
        );
      }
    }

    tablesInitialized = true;
    return true;
  } catch (err) {
    console.error('PostgreSQL table initialization error:', err);
    return false;
  }
}

/* ============================================================
   POSTGRES DATA ACCESS FUNCTIONS
   ============================================================ */

export async function dbGetAll<T>(table: string): Promise<T[]> {
  await ensurePostgresTables();
  const rows = await query<{ data: T }>(`SELECT data FROM ${table} ORDER BY updated_at DESC, created_at DESC`);
  return rows.map(r => r.data);
}

export async function dbSaveItem<T extends { id: string }>(table: string, item: T): Promise<void> {
  await ensurePostgresTables();
  await query(
    `INSERT INTO ${table} (id, data) VALUES ($1, $2)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP`,
    [item.id, JSON.stringify(item)]
  );
}

export async function dbDeleteItem(table: string, id: string): Promise<boolean> {
  await ensurePostgresTables();
  const rows = await query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}
