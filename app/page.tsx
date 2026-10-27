'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WhyChooseUs from '@/components/WhyChooseUs';
import VillaSection from '@/components/VillaSection';
import VillaDetailModal from '@/components/VillaDetailModal';
import KithulSection from '@/components/KithulSection';
import KithulOrderModal from '@/components/KithulOrderModal';
import CampingSection from '@/components/CampingSection';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import TrackModal from '@/components/TrackModal';
import { 
  Villa, CampingGear, BookingType, HeroSlide, 
  KithulProduct 
} from '@/lib/types';
import { 
  AGENCY_CONFIG, VILLAS, CAMPING_GEAR, 
  KITHUL_PRODUCTS 
} from '@/lib/data';
import { MessageCircle, Search, ShoppingBag, BookOpen, MessageSquare, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailVilla, setDetailVilla] = useState<Villa | null>(null);

  // Kithul Order Modal state
  const [isKithulModalOpen, setIsKithulModalOpen] = useState(false);
  const [selectedKithulProduct, setSelectedKithulProduct] = useState<KithulProduct | null>(null);

  // Data lists
  const [villasList, setVillasList] = useState<Villa[]>(VILLAS);
  const [slidesList, setSlidesList] = useState<HeroSlide[]>([]);
  const [gearList, setGearList] = useState<CampingGear[]>(CAMPING_GEAR);
  const [kithulList, setKithulList] = useState<KithulProduct[]>(KITHUL_PRODUCTS);

  // Helper to load locally synced data from Admin panel
  const loadLocalSyncedData = () => {
    try {
      const v = localStorage.getItem('lankagama_synced_villas');
      if (v) {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed) && parsed.length > 0) setVillasList(parsed);
      }
      const s = localStorage.getItem('lankagama_synced_slides');
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length > 0) setSlidesList(parsed);
      }
      const g = localStorage.getItem('lankagama_synced_camping');
      if (g) {
        const parsed = JSON.parse(g);
        if (Array.isArray(parsed) && parsed.length > 0) setGearList(parsed);
      }
      const k = localStorage.getItem('lankagama_synced_kithul');
      if (k) {
        const parsed = JSON.parse(k);
        if (Array.isArray(parsed) && parsed.length > 0) setKithulList(parsed);
      }
    } catch {}
  };

  useEffect(() => {
    loadLocalSyncedData();

    // Listen for storage events across tabs
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
        if (event.data?.type === 'SYNC_VILLAS' && Array.isArray(event.data.data)) setVillasList(event.data.data);
        if (event.data?.type === 'SYNC_SLIDES' && Array.isArray(event.data.data)) setSlidesList(event.data.data);
        if (event.data?.type === 'SYNC_CAMPING' && Array.isArray(event.data.data)) setGearList(event.data.data);
        if (event.data?.type === 'SYNC_KITHUL' && Array.isArray(event.data.data)) setKithulList(event.data.data);
        loadLocalSyncedData();
      };
    } catch {}

    const timestamp = Date.now();

    fetch(`/api/villas?t=${timestamp}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.villas) && data.villas.length > 0) {
          setVillasList(prev => {
            const hasLocalChanges = typeof window !== 'undefined' && localStorage.getItem('lankagama_synced_villas');
            if (hasLocalChanges) {
              const localParsed = JSON.parse(localStorage.getItem('lankagama_synced_villas') || '[]');
              if (localParsed.length >= data.villas.length) return localParsed;
            }
            return data.villas;
          });
        }
      })
      .catch(() => {});

    fetch(`/api/hero-slides?t=${timestamp}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.slides) && data.slides.length > 0) {
          setSlidesList(prev => {
            const hasLocal = typeof window !== 'undefined' && localStorage.getItem('lankagama_synced_slides');
            if (hasLocal) {
              const localParsed = JSON.parse(localStorage.getItem('lankagama_synced_slides') || '[]');
              if (localParsed.length >= data.slides.length) return localParsed;
            }
            return data.slides;
          });
        }
      })
      .catch(() => {});

    fetch(`/api/camping?t=${timestamp}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.gear) && data.gear.length > 0) {
          setGearList(prev => {
            const hasLocal = typeof window !== 'undefined' && localStorage.getItem('lankagama_synced_camping');
            if (hasLocal) {
              const localParsed = JSON.parse(localStorage.getItem('lankagama_synced_camping') || '[]');
              if (localParsed.length >= data.gear.length) return localParsed;
            }
            return data.gear;
          });
        }
      })
      .catch(() => {});

    fetch(`/api/kithul?t=${timestamp}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setKithulList(prev => {
            const hasLocal = typeof window !== 'undefined' && localStorage.getItem('lankagama_synced_kithul');
            if (hasLocal) {
              const localParsed = JSON.parse(localStorage.getItem('lankagama_synced_kithul') || '[]');
              if (localParsed.length >= data.products.length) return localParsed;
            }
            return data.products;
          });
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('lankagama_data_updated', handleStorage);
      if (bc) bc.close();
    };
  }, []);

  const [bookingType, setBookingType] = useState<BookingType>('villa');
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
    sinhalaName?: string;
    price: number;
    unitLabel?: string;
    imageUrl?: string;
    acType?: 'ac' | 'non-ac' | 'both';
    hasKitchen?: boolean;
  } | null>(null);

  // View Details trigger (Opens interactive photo gallery & facilities modal)
  const handleViewDetails = (villa: Villa) => {
    setDetailVilla(villa);
    setIsDetailModalOpen(true);
  };

  // Handlers for booking triggers
  const handleSelectVilla = (villa: Villa) => {
    setBookingType('villa');
    setSelectedItem({
      id: villa.id,
      name: villa.name,
      sinhalaName: villa.sinhalaName,
      price: villa.pricePerNightLKR,
      unitLabel: 'night',
      imageUrl: villa.imageUrl,
      acType: villa.acType,
      hasKitchen: villa.hasKitchen
    });
    setIsBookingModalOpen(true);
  };

  const handleSelectGear = (gear: CampingGear) => {
    setBookingType('camping');
    setSelectedItem({
      id: gear.id,
      name: gear.name,
      sinhalaName: gear.sinhalaName,
      price: gear.pricePerDayLKR,
      unitLabel: 'day',
      imageUrl: gear.imageUrl
    });
    setIsBookingModalOpen(true);
  };

  // Handler for Kithul & Toddy product orders
  const handleSelectKithul = (product: KithulProduct) => {
    setSelectedKithulProduct(product);
    setIsKithulModalOpen(true);
  };

  const whatsappFloatingUrl = `https://wa.me/${AGENCY_CONFIG.whatsappNumber}?text=${encodeURIComponent('Hello The Sinharaja Collection Lankagama! I want to inquire about stays, pure kithul orders, and activities.')}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#14231B] text-[#F5F2EB]">
      {/* Navigation */}
      <Navbar onOpenTrackModal={() => setIsTrackModalOpen(true)} />

      {/* Hero with Agency value proposition */}
      <Hero slides={slidesList} />

      {/* 1. Why Choose Us: All-in-one platform benefits */}
      <WhyChooseUs />

      {/* 2. Villas & Rooms */}
      <VillaSection
        onSelectVilla={handleSelectVilla}
        onViewDetails={handleViewDetails}
        villas={villasList}
      />

      {/* 3. Pure Sinharaja Kithul Products & Fresh Toddy Experience */}
      <KithulSection
        onSelectProduct={handleSelectKithul}
        products={kithulList}
      />

      {/* 4. Camping Gear Rental */}
      <CampingSection
        onSelectGear={handleSelectGear}
        gearList={gearList}
      />

      {/* 5. Clean Gateway to Rainforest Blogs & Guest Reviews */}
      <section className="py-20 bg-[#16271E] border-t border-[#2C3E33]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#D4AF37] block mb-2">
              Explore More of Lankagama
            </span>
            <h2 className="text-3xl font-serif text-[#F5F2EB] font-medium">
              Rainforest Field Guides & Guest Stories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Blogs & Waterfalls Card */}
            <div className="bg-[#1E2A22] rounded-3xl p-8 border border-[#3B5244] hover:border-[#D4AF37] transition-all shadow-xl flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#14231B] border border-[#3B5244] flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37] block">Field Guides & Waterfalls</span>
                  <h3 className="text-2xl font-serif font-semibold text-[#F5F2EB] mt-1">Waterfalls & Trekking Blogs</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed">
                  Deep dive into Brahmana Ella, hidden Gin Ganga rock pools, safety guides, and native tips for Sinharaja rainforest exploration.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#2C3E33]">
                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#D4AF37] hover:text-white transition-colors"
                >
                  <span>Explore Waterfalls & Guides</span>
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
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37] block">Rated 4.9 / 5.0 by Travelers</span>
                  <h3 className="text-2xl font-serif font-semibold text-[#F5F2EB] mt-1">Guest Reviews & FAQ</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed">
                  Read authentic feedback from travelers who stayed at our villas, ordered fresh Kithul treacle, or rented camping gear. Ask us questions directly.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#2C3E33]">
                <Link
                  href="/reviews"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#D4AF37] hover:text-white transition-colors"
                >
                  <span>Read Guest Reviews & FAQ</span>
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
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
        {/* Quick Order Kithul to Villa Button */}
        <a
          href="#kithul"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1E2A22]/95 text-[#D4AF37] hover:text-white border border-[#D4AF37]/50 hover:border-[#D4AF37] shadow-lg backdrop-blur-md text-xs font-semibold hover:scale-102 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Order Kithul to Villa</span>
        </a>

        {/* Track Booking quick bubble */}
        <button
          onClick={() => setIsTrackModalOpen(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#2C3E33]/95 text-[#F5F2EB] hover:text-[#D4AF37] border border-[#3B5244] hover:border-[#D4AF37] shadow-lg backdrop-blur-md text-xs font-medium hover:scale-102 transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Track Reservation</span>
        </button>

        {/* WhatsApp Chat Floating Bubble */}
        <a
          href={whatsappFloatingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] font-semibold text-xs shadow-xl shadow-black/30 hover:scale-103 transition-all group"
          title="Direct WhatsApp Concierge"
        >
          <MessageCircle className="w-4 h-4 fill-[#14231B] text-[#D4AF37]" />
          <span className="hidden sm:inline">WhatsApp Agency</span>
        </a>
      </div>

    </div>
  );
}
