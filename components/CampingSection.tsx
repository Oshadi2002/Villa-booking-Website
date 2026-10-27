'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Shield, Check, Package, ChevronLeft, ChevronRight, 
  Sparkles, Tent
} from 'lucide-react';
import { CAMPING_GEAR } from '@/lib/data';
import { CampingGear } from '@/lib/types';

interface CampingSectionProps {
  onSelectGear: (gear: CampingGear) => void;
  gearList?: CampingGear[];
}

export default function CampingSection({ onSelectGear, gearList = CAMPING_GEAR }: CampingSectionProps) {
  const displayGear = gearList && gearList.length > 0 ? gearList : CAMPING_GEAR;
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Update current active slide index based on scroll position
  const updateScrollState = useCallback(() => {
    if (!trackRef.current) return;
    const { scrollLeft, clientWidth } = trackRef.current;
    const cardWidth = trackRef.current.firstElementChild?.clientWidth || clientWidth;
    const index = Math.round(scrollLeft / (cardWidth + 24));
    setActiveIndex(Math.min(Math.max(0, index), displayGear.length - 1));
  }, [displayGear.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  // Scroll to index using native container scroll (never jumps viewport)
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
    const nextIdx = (activeIndex - 1 + displayGear.length) % displayGear.length;
    scrollToIndex(nextIdx);
  }, [activeIndex, displayGear.length, scrollToIndex]);

  const handleNext = useCallback(() => {
    const nextIdx = (activeIndex + 1) % displayGear.length;
    scrollToIndex(nextIdx);
  }, [activeIndex, displayGear.length, scrollToIndex]);

  // Reliable Auto-Slide timer (slides every 4.5 seconds if enabled)
  useEffect(() => {
    if (!isAutoPlay || displayGear.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlay, handleNext, displayGear.length]);

  return (
    <section id="camping" className="py-24 bg-[#14231B] text-[#F5F2EB] border-t border-[#2C3E33] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header & Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#D4AF37] block mb-2">
              Field Equipment Rental • Expedition Ready
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#F5F2EB] tracking-tight font-medium">
              Expedition Camping Gear in Lankagama
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#C2BCB0] leading-relaxed font-normal">
              Travel light without hauling heavy gear across Sri Lanka. Rent heavy-duty waterproof tents, portable stoves, insulated mats, and leech protection sets.
            </p>
          </div>

          {/* Carousel Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Auto-Slide Play/Pause Switch */}
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              type="button"
              className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isAutoPlay
                  ? 'bg-[#1E2A22] border-[#D4AF37] text-[#D4AF37]'
                  : 'bg-[#2C3E33] border-[#3B5244] text-[#C2BCB0] hover:text-[#F5F2EB]'
              }`}
              title={isAutoPlay ? 'Auto-Slide Active (Click to pause)' : 'Auto-Slide Paused (Click to play)'}
            >
              <span className={`w-2 h-2 rounded-full ${isAutoPlay ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              <span>{isAutoPlay ? 'Auto-Slide: ON' : 'Auto-Slide: OFF'}</span>
            </button>

            <div className="px-3.5 py-1.5 rounded-full bg-[#2C3E33] border border-[#3B5244] text-xs font-mono text-[#D4AF37] flex items-center gap-2">
              <Tent className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Gear {activeIndex + 1} of {displayGear.length}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#1E2A22] p-1 rounded-2xl border border-[#3B5244]">
              <button
                onClick={handlePrev}
                type="button"
                aria-label="Previous Gear"
                className="w-10 h-10 rounded-xl bg-[#2C3E33] hover:bg-[#D4AF37] hover:text-[#14231B] text-[#F5F2EB] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                type="button"
                aria-label="Next Gear"
                className="w-10 h-10 rounded-xl bg-[#2C3E33] hover:bg-[#D4AF37] hover:text-[#14231B] text-[#F5F2EB] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Camping Gear Carousel Slider Track */}
        <div className="relative group/camping">
          {/* Edge Fade Gradients */}
          <div className="hidden lg:block absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-[#14231B] to-transparent pointer-events-none z-10" />
          <div className="hidden lg:block absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-[#14231B] to-transparent pointer-events-none z-10" />

          {/* Scrollable Track */}
          <div
            ref={trackRef}
            className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4 pt-1 px-1"
          >
            {displayGear.map((item) => (
              <div
                key={item.id}
                className="w-[85vw] sm:w-[380px] lg:w-[calc(33.333%-16px)] shrink-0 snap-start"
              >
                <div className="h-full group/card bg-[#2C3E33] border border-[#3B5244] hover:border-[#D4AF37] rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-2xl">
                  <div>
                    {/* Photo & Pricing */}
                    <div className="relative h-56 overflow-hidden bg-[#1E2A22]">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover/card:scale-104 transition-transform duration-600"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#14231B] via-transparent to-transparent opacity-85" />
                      
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full bg-[#14231B]/85 backdrop-blur-md text-[#D4AF37] border border-[#3B5244] text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm">
                          {item.category === 'package' ? 'Complete Set' : 'Individual Gear'}
                        </span>
                      </div>

                      <div className="absolute bottom-3 right-3 bg-[#14231B]/95 text-[#D4AF37] border border-[#3B5244] px-3.5 py-1.5 rounded-xl text-right font-bold text-xs font-mono shadow">
                        <span>Rs. {item.pricePerDayLKR.toLocaleString()} / day</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-6">
                      <span className="text-[11px] font-semibold text-[#D4AF37] block mb-1">
                        {item.sinhalaName}
                      </span>
                      <h3 className="text-base font-serif font-semibold text-[#F5F2EB] leading-snug group-hover/card:text-[#D4AF37] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#C2BCB0] mt-2 leading-relaxed font-normal line-clamp-2">
                        {item.description}
                      </p>

                      {/* Included Items Checklist */}
                      <div className="mt-4 pt-4 border-t border-[#3B5244] space-y-2">
                        <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.14em] block">
                          Included in Package:
                        </span>
                        {item.includes.map((inc, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-[#F5F2EB]">
                            <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                            <span className="leading-tight line-clamp-1">{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => onSelectGear(item)}
                      className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-[#14231B] bg-[#D4AF37] hover:bg-[#C5A880] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-[#14231B]" />
                      <span>Reserve Equipment Set</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Next/Prev Buttons on track sides for desktop */}
          <button
            onClick={handlePrev}
            type="button"
            aria-label="Previous gear item"
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#14231B]/95 text-[#F5F2EB] hover:bg-[#D4AF37] hover:text-[#14231B] border border-[#3B5244] shadow-xl items-center justify-center z-20 transition-all opacity-0 group-hover/camping:opacity-100 hover:scale-105 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            type="button"
            aria-label="Next gear item"
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#14231B]/95 text-[#F5F2EB] hover:bg-[#D4AF37] hover:text-[#14231B] border border-[#3B5244] shadow-xl items-center justify-center z-20 transition-all opacity-0 group-hover/camping:opacity-100 hover:scale-105 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {displayGear.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => scrollToIndex(idx)}
              type="button"
              aria-label={`Go to gear ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx
                  ? 'w-8 bg-[#D4AF37]'
                  : 'w-2 bg-[#3B5244] hover:bg-[#C2BCB0]'
              }`}
            />
          ))}
        </div>

        {/* Swipe Guidance Cue for Mobile */}
        <div className="mt-4 flex sm:hidden items-center justify-center gap-2 text-[11px] text-[#C2BCB0]">
          <span>👈 Swipe sideways to view all gear packages 👉</span>
        </div>

        {/* Eco Principles Notice Box */}
        <div className="mt-14 bg-[#2C3E33] border border-[#3B5244] rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center md:text-left">
            <h4 className="text-sm font-serif font-semibold text-[#F5F2EB] flex items-center justify-center md:justify-start gap-2">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              <span>Leave No Trace Camping Protocol</span>
            </h4>
            <p className="text-xs text-[#C2BCB0] max-w-2xl leading-relaxed font-normal">
              Lankagama borders the Sinharaja World Heritage rainforest. All camp rubbish and polythene must be brought back. Soaps and chemical shampoos are prohibited in natural stream pools.
            </p>
          </div>
          <div className="shrink-0 text-xs text-[#D4AF37] font-semibold px-4 py-2 rounded-xl bg-[#1E2A22] border border-[#3B5244]">
            Rainfall & Leech Tested
          </div>
        </div>

      </div>
    </section>
  );
}
