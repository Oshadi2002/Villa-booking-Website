'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, ShieldCheck, MapPin, CheckCircle2, 
  Wine, ShoppingBag, Droplets, ArrowRight, HeartHandshake,
  Check, Flame, Compass, ChevronLeft, ChevronRight
} from 'lucide-react';
import { KithulProduct } from '@/lib/types';
import { KITHUL_PRODUCTS } from '@/lib/data';

interface KithulSectionProps {
  onSelectProduct: (product: KithulProduct) => void;
  products?: KithulProduct[];
}

export default function KithulSection({ onSelectProduct, products = KITHUL_PRODUCTS }: KithulSectionProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'treacle' | 'jaggery' | 'toddy' | 'experience'>('all');
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  // Update active slide index upon manual scrolling
  const updateScrollState = useCallback(() => {
    if (!trackRef.current) return;
    const { scrollLeft, clientWidth } = trackRef.current;
    const cardWidth = trackRef.current.firstElementChild?.clientWidth || clientWidth;
    const index = Math.round(scrollLeft / (cardWidth + 24));
    setActiveIndex(Math.min(Math.max(0, index), filteredProducts.length - 1));
  }, [filteredProducts.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  // Smooth scroll to target card index
  const scrollToIndex = useCallback((index: number) => {
    if (!trackRef.current) return;
    const container = trackRef.current;
    const cards = container.children;
    if (cards[index]) {
      const card = cards[index] as HTMLElement;
      container.scrollTo({
        left: card.offsetLeft - container.offsetLeft,
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  }, []);

  const handlePrev = useCallback(() => {
    const nextIdx = (activeIndex - 1 + filteredProducts.length) % filteredProducts.length;
    scrollToIndex(nextIdx);
  }, [activeIndex, filteredProducts.length, scrollToIndex]);

  const handleNext = useCallback(() => {
    const nextIdx = (activeIndex + 1) % filteredProducts.length;
    scrollToIndex(nextIdx);
  }, [activeIndex, filteredProducts.length, scrollToIndex]);

  // Reset index when changing category
  const handleCategoryChange = (cat: 'all' | 'treacle' | 'jaggery' | 'toddy' | 'experience') => {
    setActiveCategory(cat);
    setActiveIndex(0);
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  return (
    <section id="kithul" className="py-24 bg-[#14231B] text-[#F5F2EB] relative border-b border-[#2C3E33] overflow-hidden">
      
      {/* Decorative ambient gradients */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2C3E33]/90 border border-[#3B5244] text-[#D4AF37] text-xs font-semibold tracking-wider uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sinharaja Rainforest Harvest • Artisanal Delicacies</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-[#F5F2EB] tracking-tight">
            100% Pure Kithul Delicacies & <br className="hidden sm:inline" />
            <span className="italic text-[#D4AF37] font-normal">Fresh Toddy Experience</span>
          </h2>

          <p className="text-sm sm:text-base text-[#C2BCB0] leading-relaxed max-w-2xl mx-auto">
            Tapped from ancient wild fishtail palms deep in the Lankagama rainforest basin. 
            Enjoy unadulterated pure treacle, jaggery, and fresh morning toddy <strong className="text-[#D4AF37]">delivered directly to your villa veranda or campsite</strong>.
          </p>
        </div>

        {/* Feature Benefit Callout Banner (Delivery to Villa) */}
        <div className="bg-gradient-to-r from-[#2C3E33]/90 via-[#1E2A22] to-[#2C3E33]/90 rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/40 shadow-xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37] text-[#14231B] flex items-center justify-center shrink-0 shadow-md">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37] block">
                Exclusive Villa Guest Privilege
              </span>
              <h3 className="text-lg sm:text-xl font-serif text-[#F5F2EB] font-bold mt-0.5">
                Delivered Direct to Your Villa Veranda in Lankagama
              </h3>
              <p className="text-xs text-[#C2BCB0] mt-1 max-w-xl leading-relaxed">
                Staying at any villa or campsite in Lankagama? Enjoy complimentary doorstep delivery of warm, organic Kithul syrup and fresh jaggery for your morning hoppers, curd, or Ceylon tea.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14231B] border border-[#3B5244] text-xs text-[#D4AF37] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero Added Sugar Guarantee</span>
            </div>
          </div>
        </div>

        {/* Category Filter Pills & Carousel Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                activeCategory === 'all'
                  ? 'bg-[#D4AF37] text-[#14231B] border-[#D4AF37] shadow-sm font-bold'
                  : 'bg-[#1E2A22] text-[#C2BCB0] border-[#3B5244] hover:bg-[#2C3E33] hover:text-[#F5F2EB]'
              }`}
            >
              All Delicacies ({products.length})
            </button>
            <button
              onClick={() => handleCategoryChange('treacle')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                activeCategory === 'treacle'
                  ? 'bg-[#D4AF37] text-[#14231B] border-[#D4AF37] shadow-sm font-bold'
                  : 'bg-[#1E2A22] text-[#C2BCB0] border-[#3B5244] hover:bg-[#2C3E33] hover:text-[#F5F2EB]'
              }`}
            >
              Pure Treacle
            </button>
            <button
              onClick={() => handleCategoryChange('jaggery')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                activeCategory === 'jaggery'
                  ? 'bg-[#D4AF37] text-[#14231B] border-[#D4AF37] shadow-sm font-bold'
                  : 'bg-[#1E2A22] text-[#C2BCB0] border-[#3B5244] hover:bg-[#2C3E33] hover:text-[#F5F2EB]'
              }`}
            >
              Palm Jaggery
            </button>
            <button
              onClick={() => handleCategoryChange('toddy')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                activeCategory === 'toddy'
                  ? 'bg-[#D4AF37] text-[#14231B] border-[#D4AF37] shadow-sm font-bold'
                  : 'bg-[#1E2A22] text-[#C2BCB0] border-[#3B5244] hover:bg-[#2C3E33] hover:text-[#F5F2EB]'
              }`}
            >
              Fresh Raa Bottle
            </button>
            <button
              onClick={() => handleCategoryChange('experience')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                activeCategory === 'experience'
                  ? 'bg-[#D4AF37] text-[#14231B] border-[#D4AF37] shadow-sm font-bold'
                  : 'bg-[#1E2A22] text-[#C2BCB0] border-[#3B5244] hover:bg-[#2C3E33] hover:text-[#F5F2EB]'
              }`}
            >
              Live Tapping Tour
            </button>
          </div>

          {/* Slider Arrow Controls */}
          {filteredProducts.length > 1 && (
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <span className="text-xs font-mono text-[#D4AF37] hidden sm:inline mr-1">
                {activeIndex + 1} of {filteredProducts.length}
              </span>
              <div className="flex items-center gap-1.5 bg-[#1E2A22] p-1 rounded-2xl border border-[#3B5244]">
                <button
                  onClick={handlePrev}
                  type="button"
                  aria-label="Previous product"
                  className="w-9 h-9 rounded-xl bg-[#2C3E33] hover:bg-[#D4AF37] hover:text-[#14231B] text-[#F5F2EB] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  type="button"
                  aria-label="Next product"
                  className="w-9 h-9 rounded-xl bg-[#2C3E33] hover:bg-[#D4AF37] hover:text-[#14231B] text-[#F5F2EB] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Product Cards Slider Track */}
        <div className="relative group/kithulSlider">
          <div
            ref={trackRef}
            className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4 pt-1 px-1"
          >
            {filteredProducts.map((item) => (
              <div
                key={item.id}
                className="w-[85vw] sm:w-[360px] lg:w-[380px] shrink-0 snap-start bg-[#1E2A22] rounded-3xl border border-[#3B5244] hover:border-[#D4AF37]/60 overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  {/* Image Container with Badges */}
                  <div className="relative h-56 w-full overflow-hidden bg-[#14231B]">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E2A22] via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#14231B]/90 text-[#D4AF37] border border-[#3B5244] backdrop-blur-md">
                        {item.purityBadge}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#D4AF37] text-[#14231B]">
                        {item.category === 'toddy' ? 'Fresh Toddy' : item.category === 'experience' ? 'Cultural Tour' : 'Pure Kithul'}
                      </span>
                    </div>

                    {/* Package Volume Pill */}
                    <div className="absolute bottom-3 left-4">
                      <span className="text-xs font-semibold text-white bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                        {item.weightOrVolume}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3.5">
                    <div>
                      <h3 className="text-lg font-serif font-medium text-[#F5F2EB] group-hover:text-white transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#D4AF37] font-medium mt-0.5">
                        {item.sinhalaName}
                      </p>
                    </div>

                    {/* Harvest Origin */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#C2BCB0]">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span>Origin: {item.harvestOrigin}</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#C2BCB0] leading-relaxed line-clamp-3">
                      {item.description}
                    </p>

                    {/* Delivery Highlight Pill */}
                    <div className="p-2.5 rounded-xl bg-[#14231B] border border-[#3B5244] flex items-center gap-2 text-[11px] text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="line-clamp-1">{item.deliveryNote}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Price & Order Action */}
                <div className="p-6 pt-0 border-t border-[#3B5244]/60 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#C2BCB0] uppercase tracking-wider block">Price</span>
                    <div className="text-xl font-bold font-mono text-[#D4AF37]">
                      Rs. {item.priceLKR.toLocaleString()}
                      <span className="text-xs font-normal text-[#C2BCB0] font-sans ml-1">/{item.unit}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectProduct(item)}
                    className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md group-hover:scale-102"
                  >
                    <span>{item.category === 'experience' ? 'Book Experience' : 'Order to Villa'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Floating Desktop Arrows on hover */}
          {filteredProducts.length > 2 && (
            <>
              <button
                onClick={handlePrev}
                type="button"
                aria-label="Previous product"
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#14231B]/95 text-[#F5F2EB] hover:bg-[#D4AF37] hover:text-[#14231B] border border-[#3B5244] shadow-xl items-center justify-center z-20 transition-all opacity-0 group-hover/kithulSlider:opacity-100 hover:scale-105 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                type="button"
                aria-label="Next product"
                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#14231B]/95 text-[#F5F2EB] hover:bg-[#D4AF37] hover:text-[#14231B] border border-[#3B5244] shadow-xl items-center justify-center z-20 transition-all opacity-0 group-hover/kithulSlider:opacity-100 hover:scale-105 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Carousel Pagination Dots */}
        {filteredProducts.length > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {filteredProducts.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => scrollToIndex(idx)}
                type="button"
                aria-label={`Go to product ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === idx
                    ? 'w-8 bg-[#D4AF37]'
                    : 'w-2 bg-[#3B5244] hover:bg-[#C2BCB0]'
                }`}
              />
            ))}
          </div>
        )}

        {/* Swipe Guidance Cue for Mobile */}
        <div className="mt-4 flex sm:hidden items-center justify-center gap-2 text-[11px] text-[#C2BCB0]">
          <span>👈 Swipe sideways to explore pure Kithul delicacies 👉</span>
        </div>

        {/* Traditional Tapping Cultural Note */}
        <div className="mt-16 bg-[#1E2A22] rounded-3xl p-6 sm:p-10 border border-[#3B5244] grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Sinharaja Heritage Tradition • The Ancient Palm Craft</span>
            </span>
            <h3 className="text-2xl font-serif text-[#F5F2EB] font-medium">
              The Legend of Sinharaja Kithul Palms
            </h3>
            <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed">
              Lankagama sits in the rainforest valley where wild Kithul trees (Caryota urens) absorb minerals from pristine mountain mist and crystal river waters. Local tappers still scale giant trees barefoot with traditional rope pulleys to tap the inflorescence before sunrise. 
              Because there is no adulteration with cane sugar, our Kithul maintains a lower glycemic index, natural caramel essence, and pure rainforest probiotics.
            </p>
          </div>

          <div className="space-y-3 bg-[#14231B] p-5 rounded-2xl border border-[#3B5244]">
            <div className="flex items-center gap-2.5 text-xs text-[#F5F2EB]">
              <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Tested & free from sugar syrup</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#F5F2EB]">
              <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Delivered chilled or warm to your room</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#F5F2EB]">
              <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Supports local Lankagama tapper families</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#F5F2EB]">
              <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Special leak-proof packing for air flights</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
