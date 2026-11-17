'use client';

import { useState, useEffect, useCallback } from 'react';
import { AGENCY_CONFIG } from '@/lib/data';

export interface WhatsAppData {
  whatsappNumber: string;
  formattedNumber: string;
  waLink: string;
  email?: string;
  address?: string;
  phone?: string;
  locationDetails?: string;
}

export interface UseWhatsAppOptions {
  /** When false (e.g., inside a closed modal), skips triggering an API fetch while still reading cached values. */
  enabled?: boolean;
}

const STORAGE_KEY = 'lankagama_whatsapp_settings';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes short-lived memory cache

const DEFAULT_WHATSAPP_DATA: WhatsAppData = {
  whatsappNumber: AGENCY_CONFIG.whatsappNumber,
  formattedNumber: AGENCY_CONFIG.phone,
  waLink: `https://wa.me/${AGENCY_CONFIG.whatsappNumber}`,
  email: AGENCY_CONFIG.email,
  address: AGENCY_CONFIG.address,
  phone: AGENCY_CONFIG.phone,
  locationDetails: AGENCY_CONFIG.locationDetails
};

// Module-level singleton cache & in-flight promise shared across all hook instances
let memoryCache: WhatsAppData | null = null;
let memoryCacheTimestamp = 0;
let inFlightPromise: Promise<WhatsAppData | null> | null = null;

function readLocalStorageCache(): WhatsAppData | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as Partial<WhatsAppData>;
    if (parsed && typeof parsed.whatsappNumber === 'string' && parsed.whatsappNumber.length > 0) {
      return { ...DEFAULT_WHATSAPP_DATA, ...parsed };
    }
  } catch {}
  return null;
}

function writeLocalStorageCache(fresh: WhatsAppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {}
}

function fetchWhatsAppSettings(): Promise<WhatsAppData | null> {
  const now = Date.now();
  if (memoryCache && now - memoryCacheTimestamp < CACHE_TTL_MS) {
    return Promise.resolve(memoryCache);
  }

  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = fetch('/api/settings/whatsapp')
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    })
    .then(json => {
      if (json?.success && json?.whatsappNumber) {
        const fresh: WhatsAppData = {
          whatsappNumber: json.whatsappNumber,
          formattedNumber: json.formattedNumber || `+${json.whatsappNumber}`,
          waLink: json.waLink || `https://wa.me/${json.whatsappNumber}`,
          email: json.email || AGENCY_CONFIG.email,
          address: json.address || AGENCY_CONFIG.address,
          phone: json.phone || json.formattedNumber || AGENCY_CONFIG.phone,
          locationDetails: json.locationDetails || AGENCY_CONFIG.locationDetails
        };
        memoryCache = fresh;
        memoryCacheTimestamp = Date.now();
        writeLocalStorageCache(fresh);
        return fresh;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      inFlightPromise = null;
    });

  return inFlightPromise;
}

/**
 * Provides agency WhatsApp and contact settings using a shared singleton request
 * and short-lived memory cache with localStorage fallback.
 */
export function useWhatsApp(options: UseWhatsAppOptions = {}) {
  const { enabled = true } = options;
  const [data, setData] = useState<WhatsAppData>(DEFAULT_WHATSAPP_DATA);

  useEffect(() => {
    let isMounted = true;

    // 1. Hydrate from memory cache or localStorage first for fast render without extra network calls
    const cached =
      memoryCache && Date.now() - memoryCacheTimestamp < CACHE_TTL_MS
        ? memoryCache
        : readLocalStorageCache();

    if (cached) {
      queueMicrotask(() => {
        if (isMounted) {
          setData(prev => ({ ...prev, ...cached }));
        }
      });
    }

    // 2. Fetch fresh settings via deduplicated singleton promise only when enabled and cache is stale/empty
    if (enabled) {
      fetchWhatsAppSettings().then(fresh => {
        if (isMounted && fresh) {
          setData(fresh);
        }
      });
    }

    // 3. Listen for cross-tab or local custom events when admin updates settings
    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.type === 'SYNC_WHATSAPP' && customEvent.detail?.data) {
        const synced = { ...DEFAULT_WHATSAPP_DATA, ...memoryCache, ...customEvent.detail.data };
        memoryCache = synced;
        memoryCacheTimestamp = Date.now();
        writeLocalStorageCache(synced);
        if (isMounted) {
          setData(prev => ({ ...prev, ...customEvent.detail.data }));
        }
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const updated = readLocalStorageCache();
        if (updated) {
          memoryCache = updated;
          memoryCacheTimestamp = Date.now();
          if (isMounted) {
            setData(updated);
          }
        }
      }
    };

    window.addEventListener('lankagama_data_updated', handleCustom);
    window.addEventListener('storage', handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener('lankagama_data_updated', handleCustom);
      window.removeEventListener('storage', handleStorage);
    };
  }, [enabled]);

  const getWhatsAppLink = useCallback(
    (message: string) => {
      return `https://wa.me/${data.whatsappNumber}?text=${encodeURIComponent(message)}`;
    },
    [data.whatsappNumber]
  );

  return {
    whatsappNumber: data.whatsappNumber,
    formattedNumber: data.formattedNumber,
    waLink: data.waLink,
    email: data.email || AGENCY_CONFIG.email,
    address: data.address || AGENCY_CONFIG.address,
    phone: data.phone || data.formattedNumber || AGENCY_CONFIG.phone,
    locationDetails: data.locationDetails || AGENCY_CONFIG.locationDetails,
    getWhatsAppLink
  };
}
