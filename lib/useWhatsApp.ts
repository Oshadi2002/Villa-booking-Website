'use client';

import { useState, useEffect } from 'react';
import { AGENCY_CONFIG } from '@/lib/data';

export interface WhatsAppData {
  whatsappNumber: string;
  formattedNumber: string;
  waLink: string;
}

export function useWhatsApp() {
  const [data, setData] = useState<WhatsAppData>({
    whatsappNumber: AGENCY_CONFIG.whatsappNumber,
    formattedNumber: AGENCY_CONFIG.phone,
    waLink: `https://wa.me/${AGENCY_CONFIG.whatsappNumber}`
  });

  useEffect(() => {
    // 1. Load from localStorage cache first for fast render
    try {
      const cached = localStorage.getItem('lankagama_whatsapp_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.whatsappNumber) {
          queueMicrotask(() => {
            setData(parsed);
          });
        }
      }
    } catch {}

    // 2. Fetch fresh from API
    fetch('/api/settings/whatsapp')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.whatsappNumber) {
          const fresh: WhatsAppData = {
            whatsappNumber: json.whatsappNumber,
            formattedNumber: json.formattedNumber || `+${json.whatsappNumber}`,
            waLink: json.waLink || `https://wa.me/${json.whatsappNumber}`
          };
          setData(fresh);
          try {
            localStorage.setItem('lankagama_whatsapp_settings', JSON.stringify(fresh));
          } catch {}
        }
      })
      .catch(() => {});

    // 3. Listen for cross-tab or local custom events
    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.type === 'SYNC_WHATSAPP' && customEvent.detail?.data) {
        setData(customEvent.detail.data);
      }
    };

    window.addEventListener('lankagama_data_updated', handleCustom);
    return () => {
      window.removeEventListener('lankagama_data_updated', handleCustom);
    };
  }, []);

  const getWhatsAppLink = (message: string) => {
    return `https://wa.me/${data.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return {
    whatsappNumber: data.whatsappNumber,
    formattedNumber: data.formattedNumber,
    waLink: data.waLink,
    getWhatsAppLink
  };
}
