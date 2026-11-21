'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WhyChooseUs from '@/components/WhyChooseUs';
import VillaSection from '@/components/VillaSection';
import VillaDetailModal from '@/components/VillaDetailModal';
import KithulSection from '@/components/KithulSection';
import KithulOrderModal from '@/components/KithulOrderModal';
import CampingSection from '@/components/CampingSection';
import CampingDetailModal from '@/components/CampingDetailModal';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import TrackModal from '@/components/TrackModal';
import { 
  Villa, CampingGear, BookingType, HeroSlide, 
  KithulProduct 
} from '@/lib/types';
import { 
  AGENCY_CONFIG 
} from '@/lib/data';
import { MessageCircle, ShoppingBag, BookOpen, MessageSquare, ArrowRight } from 'lucide-react';
import { useWhatsApp } from '@/lib/useWhatsApp';
import { useLanguage } from '@/lib/LanguageContext';

interface SsrStatus {
  villas: boolean;
  slides: boolean;
  camping: boolean;
  kithul: boolean;
}

interface HomePageClientProps {
  initialVillas?: Villa[];
  initialSlides?: HeroSlide[];
  initialGear?: CampingGear[];
  initialKithul?: KithulProduct[];
  ssrStatus?: SsrStatus;
}

const DEFAULT_SSR_STATUS: SsrStatus = {
  villas: false,
  slides: false,
  camping: false,
  kithul: false,
};

// Track whether user navigated away from `/` and returned via browser Back/Forward
let returnedViaPopstate = false;
let popstateTrackerAttached = false;

function ensurePopstateTracker() {
  if (typeof window === 'undefined' || popstateTrackerAttached) return;
  popstateTrackerAttached = true;

  // Modern browsers (Chromium): Navigation API fires `navigate` synchronously on traversal
  // BEFORE Next.js mounts the restored route and BEFORE `popstate` fires.
  const nav = (window as unknown as {
    navigation?: {
      currentEntry?: { url?: string | null };
      addEventListener?: (
        type: string,
        listener: (event: {
          navigationType?: string;
          hashChange?: boolean;
          destination?: { url?: string | null };
        }) => void
      ) => void;
    };
  }).navigation;

  if (nav?.addEventListener) {
    nav.addEventListener('navigate', (event) => {
      if (event.navigationType === 'traverse' && !event.hashChange) {
        try {
          const destUrl = event.destination?.url ? new URL(event.destination.url) : null;
          const currUrl = nav.currentEntry?.url ? new URL(nav.currentEntry.url) : null;
          if (destUrl?.pathname === '/' && currUrl?.pathname !== '/') {
            returnedViaPopstate = true;
          }
        } catch {}
      } else if (event.navigationType === 'push') {
        returnedViaPopstate = false;
      }
    });
  }

  // Fallback for browsers without Navigation API (e.g. Firefox, Safari)
  window.addEventListener(
    'popstate',
    () => {
      if (window.location.pathname === '/' && !nav?.addEventListener) {
        returnedViaPopstate = true;
      }
    },
    { capture: true }
  );
}

if (typeof window !== 'undefined') {
  ensurePopstateTracker();
}

function syncStorageItem(key: string, items: unknown[]) {
  try {
    if (items.length > 0) {
      localStorage.setItem(key, JSON.stringify(items));
    } else {
      localStorage.removeItem(key);
    }
  } catch {}
}

export default function HomePageClient({
  initialVillas = [],
  initialSlides = [],
  initialGear = [],
  initialKithul = [],
  ssrStatus = DEFAULT_SSR_STATUS
}: HomePageClientProps) {
  const router = useRouter();
  const { isSi, t } = useLanguage();
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailVilla, setDetailVilla] = useState<Villa | null>(null);

  // Camping Detail Modal state
  const [isCampingDetailModalOpen, setIsCampingDetailModalOpen] = useState(false);
  const [detailCampingGear, setDetailCampingGear] = useState<CampingGear | null>(null);

  // Kithul Order Modal state
  const [isKithulModalOpen, setIsKithulModalOpen] = useState(false);
  const [selectedKithulProduct, setSelectedKithulProduct] = useState<KithulProduct | null>(null);

  // Booking Modal State
  const [bookingType, setBookingType] = useState<BookingType>('villa');
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string; price: number; [key: string]: unknown } | null>(null);

  const allSsrLoaded = ssrStatus.villas && ssrStatus.slides && ssrStatus.camping && ssrStatus.kithul;

  // Data lists initialized with server-prefetched data for instant loading
  const [villasList, setVillasList] = useState<Villa[]>(initialVillas);
  const [slidesList, setSlidesList] = useState<HeroSlide[]>(initialSlides);
  const [gearList, setGearList] = useState<CampingGear[]>(initialGear);
  const [kithulList, setKithulList] = useState<KithulProduct[]>(initialKithul);
  const [isLoading, setIsLoading] = useState<boolean>(!ssrStatus.villas && initialVillas.length === 0);
  const hasTriggeredBackRefreshRef = useRef(false);

  const { getWhatsAppLink } = useWhatsApp();
  const whatsappFloatingUrl = getWhatsAppLink(
    'Hello The Sinharaja Collection Lankagama! I am browsing your website and would like assistance with planning a visit.'
  );

  // Helper to load locally synced data from Admin panel if available
  const loadLocalSyncedData = (onlyKeys?: Partial<SsrStatus>) => {
    try {
      if (!onlyKeys || onlyKeys.villas) {
        const v = localStorage.getItem('lankagama_synced_villas');
        if (v) {
          const parsed = JSON.parse(v);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((villa: Villa) => !['villa-1', 'villa-2', 'villa-3', 'villa-4'].includes(villa.id));
            setVillasList(cleaned);
            setIsLoading(false);
          }
        }
      }
      if (!onlyKeys || onlyKeys.slides) {
        const s = localStorage.getItem('lankagama_synced_slides');
        if (s) {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) setSlidesList(parsed);
        }
      }
      if (!onlyKeys || onlyKeys.camping) {
        const g = localStorage.getItem('lankagama_synced_camping');
        if (g) {
          const parsed = JSON.parse(g);
          if (Array.isArray(parsed)) setGearList(parsed);
        }
      }
      if (!onlyKeys || onlyKeys.kithul) {
        const k = localStorage.getItem('lankagama_synced_kithul');
        if (k) {
          const parsed = JSON.parse(k);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((p: KithulProduct) => !['kithul-treacle-clay-1000', 'kithul-jaggery-1000'].includes(p.id));
            setKithulList(cleaned);
          }
        }
      }
    } catch {}
  };

  // Keep state and localStorage synchronized whenever fresh SSR props arrive (e.g. initial load or router.refresh)
  useEffect(() => {
    if (ssrStatus.villas) {
      setVillasList(initialVillas);
      syncStorageItem('lankagama_synced_villas', initialVillas);
    }
    if (ssrStatus.slides) {
      setSlidesList(initialSlides);
      syncStorageItem('lankagama_synced_slides', initialSlides);
    }
    if (ssrStatus.camping) {
      setGearList(initialGear);
      syncStorageItem('lankagama_synced_camping', initialGear);
    }
    if (ssrStatus.kithul) {
      setKithulList(initialKithul);
      syncStorageItem('lankagama_synced_kithul', initialKithul);
    }
    if (ssrStatus.villas) {
      setIsLoading(false);
    }
  }, [ssrStatus, initialVillas, initialSlides, initialGear, initialKithul]);

  const routerRef = useRef(router);
  routerRef.current = router;

  // Mount-only effect: cross-tab sync listeners + browser Back/Forward freshness
  useEffect(() => {
    ensurePopstateTracker();

    const handleStorage = () => {
      loadLocalSyncedData();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('lankagama_data_updated', handleStorage);

    // BroadcastChannel for instant real-time sync across open browser tabs
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('lankagama_sync_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SYNC_VILLAS' && Array.isArray(event.data.data)) {
          const validVillas = event.data.data.filter((villa: Villa) => !['villa-1', 'villa-2', 'villa-3', 'villa-4'].includes(villa.id));
          setVillasList(validVillas);
          setIsLoading(false);
        }
        if (event.data?.type === 'SYNC_SLIDES' && Array.isArray(event.data.data)) setSlidesList(event.data.data);
        if (event.data?.type === 'SYNC_CAMPING' && Array.isArray(event.data.data)) setGearList(event.data.data);
        if (event.data?.type === 'SYNC_KITHUL' && Array.isArray(event.data.data)) {
          const cleaned = event.data.data.filter((p: KithulProduct) => !['kithul-treacle-clay-1000', 'kithul-jaggery-1000'].includes(p.id));
          setKithulList(cleaned);
        }
      };
    } catch {}

    // Handle browser Back/Forward navigation (Next.js history restore or browser bfcache)
    // so users returning from another page always get up-to-date homepage content.
    const navEntry = performance.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined;
    const isBackForwardNav = returnedViaPopstate || navEntry?.type === 'back_forward';
    returnedViaPopstate = false;

    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    if (isBackForwardNav && !hasTriggeredBackRefreshRef.current) {
      hasTriggeredBackRefreshRef.current = true;
      refreshTimer = setTimeout(() => {
        routerRef.current.refresh();
      }, 0);
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        loadLocalSyncedData();
        routerRef.current.refresh();
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      returnedViaPopstate = false;
      hasTriggeredBackRefreshRef.current = false;
      if (refreshTimer) clearTimeout(refreshTimer);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('lankagama_data_updated', handleStorage);
      window.removeEventListener('pageshow', handlePageShow);
      if (bc) bc.close();
    };
  }, []);

  // Recovery fallback effect: only runs for datasets where SSR failed
  useEffect(() => {
    if (allSsrLoaded) return;

    const controller = new AbortController();
    const { signal } = controller;

    loadLocalSyncedData({
      villas: !ssrStatus.villas,
      slides: !ssrStatus.slides,
      camping: !ssrStatus.camping,
      kithul: !ssrStatus.kithul,
    });

    const timestamp = Date.now();
    const recoveryTasks: Promise<void>[] = [];

    if (!ssrStatus.villas) {
      recoveryTasks.push(
        fetch(`/api/villas?t=${timestamp}`, { cache: 'no-store', signal })
          .then(r => r.json())
          .then(villasData => {
            if (villasData?.success && Array.isArray(villasData.villas)) {
              const validVillas = villasData.villas.filter((villa: Villa) => !['villa-1', 'villa-2', 'villa-3', 'villa-4'].includes(villa.id));
              setVillasList(validVillas);
              syncStorageItem('lankagama_synced_villas', validVillas);
            }
          })
          .catch(() => {})
      );
    }

    if (!ssrStatus.slides) {
      recoveryTasks.push(
        fetch(`/api/hero-slides?t=${timestamp}`, { cache: 'no-store', signal })
          .then(r => r.json())
          .then(slidesData => {
            if (slidesData?.success && Array.isArray(slidesData.slides)) {
              setSlidesList(slidesData.slides);
              syncStorageItem('lankagama_synced_slides', slidesData.slides);
            }
          })
          .catch(() => {})
      );
    }

    if (!ssrStatus.camping) {
      recoveryTasks.push(
        fetch(`/api/camping?t=${timestamp}`, { cache: 'no-store', signal })
          .then(r => r.json())
          .then(campingData => {
            if (campingData?.success && Array.isArray(campingData.gear)) {
              setGearList(campingData.gear);
              syncStorageItem('lankagama_synced_camping', campingData.gear);
            }
          })
          .catch(() => {})
      );
    }

    if (!ssrStatus.kithul) {
      recoveryTasks.push(
        fetch(`/api/kithul?t=${timestamp}`, { cache: 'no-store', signal })
          .then(r => r.json())
          .then(kithulData => {
            if (kithulData?.success && Array.isArray(kithulData.products)) {
              const cleaned = kithulData.products.filter((p: KithulProduct) => !['kithul-treacle-clay-1000', 'kithul-jaggery-1000'].includes(p.id));
              setKithulList(cleaned);
              syncStorageItem('lankagama_synced_kithul', cleaned);
            }
          })
          .catch(() => {})
      );
    }

    Promise.all(recoveryTasks).finally(() => {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    });

    return () => {
      controller.abort();
    };
  }, [allSsrLoaded, ssrStatus.camping, ssrStatus.kithul, ssrStatus.slides, ssrStatus.villas]);

  const handleSelectVilla = (villa: Villa) => {
    setBookingType('villa');
    setSelectedItem({
      id: villa.id,
      name: `${villa.name} (${villa.sinhalaName})`,
      price: villa.pricePerNightLKR,
      villa
    });
    setIsBookingModalOpen(true);
  };

  const handleSelectGear = (gear: CampingGear) => {
    setBookingType('camping');
    setSelectedItem({
      id: gear.id,
      name: `${gear.name} (${gear.sinhalaName})`,
      price: gear.pricePerDayLKR,
      gear
    });
    setIsBookingModalOpen(true);
  };

  const handleSelectKithul = (product: KithulProduct) => {
    setSelectedKithulProduct(product);
    setIsKithulModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#14231B] text-[#F5F2EB] selection:bg-[#D4AF37] selection:text-[#14231B] relative">
      
      {/* Navigation */}
      <Navbar onOpenTrackModal={() => setIsTrackModalOpen(true)} />

      {/* Hero with Agency value proposition */}
      <Hero slides={slidesList} />

      {/* 1. Curated Villas Showcase */}
      <VillaSection
        onSelectVilla={handleSelectVilla}
        onViewDetails={(villa) => {
          setDetailVilla(villa);
          setIsDetailModalOpen(true);
        }}
        villas={villasList}
        isLoading={isLoading}
      />

      {/* 2. Pure Sinharaja Kithul Products & Fresh Toddy Experience */}
      <KithulSection
        onSelectProduct={handleSelectKithul}
        products={kithulList}
      />

      {/* 3. Expedition Camping Gear Rentals */}
      <CampingSection
        onSelectGear={handleSelectGear}
        onViewDetails={(gear) => {
          setDetailCampingGear(gear);
          setIsCampingDetailModalOpen(true);
        }}
        gearList={gearList}
        isLoading={isLoading}
      />

      {/* 4. Why Choose Us: All-in-one platform benefits */}
      <WhyChooseUs />

      {/* Exploration & Community Section */}
      <section className="py-20 bg-[#16271E] border-t border-[#2C3E33]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Guides & Waterfalls Hub Card */}
            <div className="bg-[#1E2A22] rounded-3xl p-8 border border-[#3B5244] hover:border-[#D4AF37] transition-all shadow-xl flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#14231B] border border-[#3B5244] flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37] block">
                    {t('hub.waterfallsPill', 'Field Notes & Safety')}
                  </span>
                  <h3 className="text-2xl font-serif font-semibold text-[#F5F2EB] mt-1">
                    {t('hub.waterfallsTitle', 'Waterfalls & Sinharaja Guides')}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed">
                  {t('hub.waterfallsDesc', 'Explore Brahmana Ella, Doowili Ella, Gin Ganga secret pools, trekking gear checklists, and village heritage with native naturalist guidance.')}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#2C3E33]">
                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#D4AF37] hover:text-white transition-colors"
                >
                  <span>{t('hub.waterfallsBtn', 'Explore Waterfalls & Guides')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Guest Reviews & FAQ Card */}
            <div className="bg-[#1E2A22] rounded-3xl p-8 border border-[#3B5244] hover:border-[#D4AF37] transition-all shadow-xl flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#14231B] border border-[#3B5244] flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37] block">
                    {t('hub.reviewsPill', 'Rated 4.9 / 5.0 by Travelers')}
                  </span>
                  <h3 className="text-2xl font-serif font-semibold text-[#F5F2EB] mt-1">
                    {t('hub.reviewsTitle', 'Guest Reviews & FAQ')}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed">
                  {t('hub.reviewsDesc', 'Read authentic feedback from travelers who stayed at our villas, ordered fresh Kithul treacle, or rented camping gear. Ask us questions directly.')}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#2C3E33]">
                <Link
                  href="/reviews"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#D4AF37] hover:text-white transition-colors"
                >
                  <span>{t('hub.reviewsBtn', 'Read Guest Reviews & FAQ')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Detailed Villa Photos & Facilities Modal */}
      <VillaDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        villa={detailVilla}
        onBookNow={(villa) => {
          setIsDetailModalOpen(false);
          handleSelectVilla(villa);
        }}
      />

      {/* Detailed Camping Gear Photos & Equipment Specs Modal */}
      <CampingDetailModal
        isOpen={isCampingDetailModalOpen}
        onClose={() => setIsCampingDetailModalOpen(false)}
        gear={detailCampingGear}
        onBookNow={(gear) => {
          setIsCampingDetailModalOpen(false);
          handleSelectGear(gear);
        }}
      />

      {/* Booking Form Modal for Villas & Camping */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        bookingType={bookingType}
        item={selectedItem}
      />

      {/* Dedicated Kithul & Toddy Villa Delivery Modal */}
      <KithulOrderModal
        isOpen={isKithulModalOpen}
        onClose={() => setIsKithulModalOpen(false)}
        product={selectedKithulProduct}
        villas={villasList}
      />

      {/* Track Booking Modal */}
      <TrackModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
      />

      {/* Floating Action Buttons (Sticky at bottom right) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 sm:gap-2.5 max-w-[calc(100vw-2rem)]">
        {/* Quick Order Kithul to Villa Button */}
        <a
          href="#kithul"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1E2A22]/95 text-[#D4AF37] hover:text-white border border-[#D4AF37]/50 hover:border-[#D4AF37] shadow-lg backdrop-blur-md text-xs font-semibold hover:scale-102 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{isSi ? 'විලා එකට කිතුල් ඇණවුම් කරන්න' : 'Order Kithul to Villa'}</span>
        </a>

        {/* WhatsApp Chat Floating Bubble */}
        <a
          href={whatsappFloatingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] font-semibold text-xs shadow-xl shadow-black/30 hover:scale-103 transition-all group"
          title="Direct WhatsApp Concierge"
        >
          <MessageCircle className="w-4 h-4 fill-[#14231B] text-[#D4AF37]" />
          <span className="hidden sm:inline">{isSi ? 'WhatsApp සහය' : 'WhatsApp Agency'}</span>
        </a>
      </div>

    </div>
  );
}
