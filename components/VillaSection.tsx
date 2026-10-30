'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Users, Check, ArrowRight, MapPin, Eye, 
  Image as ImageIcon, ChevronLeft, ChevronRight, 
  Bed, Bath, Compass, Sparkles
} from 'lucide-react';
import { VILLAS } from '@/lib/data';
import { Villa } from '@/lib/types';

interface VillaSectionProps {
  onSelectVilla: (villa: Villa) => void;
  onViewDetails: (villa: Villa) => void;
  villas?: Villa[];
}

// Subcomponent: Individual Villa Card with its own Photo Slider
function VillaCardItem({
  villa,
  onSelectVilla,
  onViewDetails
}: {
  villa: Villa;
  onSelectVilla: (villa: Villa) => void;
  onViewDetails: (villa: Villa) => void;
}) {
  const images = villa.images && villa.images.length > 0 ? villa.images : [villa.imageUrl];
  const [photoIndex, setPhotoIndex] = useState(0);

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="group bg-[#2C3E33] rounded-2xl overflow-hidden border border-[#3B5244] hover:border-[#D4AF37] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Photo Slider Stage */}
        <div 
          onClick={() => onViewDetails(villa)}
          className="relative h-64 sm:h-72 overflow-hidden bg-[#14231B] cursor-pointer select-none"
        >
          <img
            src={images[photoIndex]}
            alt={`${villa.name} - Photo ${photoIndex + 1}`}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14231B] via-transparent to-transparent opacity-90" />
          
          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-1.5 z-10 max-w-[85%]">
            <span className="px-2.5 py-1 rounded-full bg-[#14231B]/85 backdrop-blur-md text-[#F5F2EB] text-xs font-medium border border-[#3B5244] flex items-center gap-1.5 shadow-sm">
              <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Up to {villa.maxGuests}</span>
            </span>

            {villa.acType && (
              <span className="px-2.5 py-1 rounded-full bg-[#14231B]/85 backdrop-blur-md text-[#F5F2EB] text-xs font-medium border border-[#3B5244] shadow-sm">
                {villa.acType === 'ac' ? '❄️ A/C' : villa.acType === 'non-ac' ? '🍃 Non-A/C' : '❄️ A/C & Non-A/C'}
              </span>
            )}

            {villa.hasKitchen && (
              <span className="px-2.5 py-1 rounded-full bg-[#14231B]/85 backdrop-blur-md text-[#F5F2EB] text-xs font-medium border border-[#3B5244] shadow-sm">
                🍳 Kitchen
              </span>
            )}

            <span className="px-2.5 py-1 rounded-full bg-[#14231B]/85 backdrop-blur-md text-[#F5F2EB] text-xs font-medium border border-[#3B5244] flex items-center gap-1.5 shadow-sm">
              <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{photoIndex + 1}/{images.length}</span>
            </span>
          </div>

          {/* Quick Photo Switcher Arrows (Card level) */}
          {images.length > 1 && (
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none z-10">
              <button
                onClick={prevPhoto}
                type="button"
                aria-label="Previous photo"
                className="w-8 h-8 rounded-full bg-[#14231B]/80 hover:bg-[#D4AF37] hover:text-[#14231B] text-[#F5F2EB] border border-[#3B5244] flex items-center justify-center pointer-events-auto transition-all shadow-md opacity-80 group-hover:opacity-100 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextPhoto}
                type="button"
                aria-label="Next photo"
                className="w-8 h-8 rounded-full bg-[#14231B]/80 hover:bg-[#D4AF37] hover:text-[#14231B] text-[#F5F2EB] border border-[#3B5244] flex items-center justify-center pointer-events-auto transition-all shadow-md opacity-80 group-hover:opacity-100 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mini Photo Dot Indicators on Card */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 flex items-center gap-1 z-10 bg-[#14231B]/80 backdrop-blur-md px-2 py-1 rounded-full border border-[#3B5244]">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    photoIndex === idx ? 'w-4 bg-[#D4AF37]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to photo ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Title & Price overlay at bottom */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-[#F5F2EB] z-10">
            <div className="pr-2">
              <span className="text-[11px] font-medium tracking-wider uppercase text-[#D4AF37] block">
                {villa.sinhalaName}
              </span>
              <h3 className="text-xl font-serif font-medium leading-tight drop-shadow-sm group-hover:text-[#D4AF37] transition-colors">
                {villa.name}
              </h3>
            </div>

            <div className="bg-[#14231B]/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-right shrink-0 border border-[#3B5244] shadow">
              {villa.pricePerRoomLKR ? (
                <div className="text-right space-y-0.5">
                  <div className="flex items-center justify-end gap-1.5 text-[11px] font-medium text-[#C2BCB0]">
                    <span>🏠 Full Villa:</span>
                    <span className="font-bold text-[#F5F2EB] font-mono">Rs. {villa.pricePerNightLKR.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 text-[11px] font-semibold text-[#D4AF37]">
                    <span>🛏️ Per Room:</span>
                    <span className="font-bold font-mono">Rs. {villa.pricePerRoomLKR.toLocaleString()}</span>
                  </div>
                </div>
              ) : villa.pricePerNightAcLKR ? (
                <div className="text-right space-y-0.5">
                  <div className="flex items-center justify-end gap-1.5 text-[11px] font-medium text-[#C2BCB0]">
                    <span>Non-A/C:</span>
                    <span className="font-bold text-[#F5F2EB] font-mono">Rs. {villa.pricePerNightLKR.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 text-[11px] font-semibold text-[#D4AF37]">
                    <span>A/C Room:</span>
                    <span className="font-bold font-mono">Rs. {villa.pricePerNightAcLKR.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-[10px] text-[#C2BCB0] block uppercase tracking-wider">Per Night</span>
                  <span className="text-base font-bold text-[#D4AF37] font-mono">
                    Rs. {villa.pricePerNightLKR.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6">
          <p className="text-xs font-serif italic text-[#D4AF37] mb-2 font-normal">
            &ldquo;{villa.tagline}&rdquo;
          </p>
          
          <p className="text-xs text-[#C2BCB0] leading-relaxed line-clamp-2">
            {villa.description}
          </p>

          <div className="mt-3.5 pt-3.5 border-t border-[#3B5244] flex items-center gap-1.5 text-xs text-[#C2BCB0] font-normal">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span className="line-clamp-1">{villa.locationDetails}</span>
          </div>

          {/* Key Amenities */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {villa.features.slice(0, 4).map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-[#F5F2EB]">
                <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span className="line-clamp-1">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 pt-0 space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => onViewDetails(villa)}
            className="py-2.5 px-3 rounded-xl font-medium text-xs text-[#F5F2EB] bg-[#1E2A22] hover:bg-[#14231B] transition-colors flex items-center justify-center gap-1.5 border border-[#3B5244] hover:border-[#D4AF37] cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Photos & Details</span>
          </button>

          <button
            onClick={() => onSelectVilla(villa)}
            className="py-2.5 px-3 rounded-xl font-semibold text-xs text-[#14231B] bg-[#D4AF37] hover:bg-[#C5A880] active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Book Villa / Room</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#14231B]" />
          </button>
        </div>

        <p className="text-[11px] text-center text-[#C2BCB0] font-normal">
          Direct verification with host • Optional guide available
        </p>
      </div>
    </div>
  );
}

export default function VillaSection({ onSelectVilla, onViewDetails, villas = VILLAS }: VillaSectionProps) {
  const displayVillas = villas && villas.length > 0 ? villas : VILLAS;
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Update scroll arrow state and current active slide index
  const updateScrollState = useCallback(() => {
    if (!trackRef.current) return;
    const { scrollLeft, clientWidth } = trackRef.current;
    const cardWidth = trackRef.current.firstElementChild?.clientWidth || clientWidth;
    const index = Math.round(scrollLeft / (cardWidth + 24));
    setActiveIndex(Math.min(Math.max(0, index), displayVillas.length - 1));
  }, [displayVillas.length]);

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
    const nextIdx = (activeIndex - 1 + displayVillas.length) % displayVillas.length;
    scrollToIndex(nextIdx);
  }, [activeIndex, displayVillas.length, scrollToIndex]);

  const handleNext = useCallback(() => {
    const nextIdx = (activeIndex + 1) % displayVillas.length;
    scrollToIndex(nextIdx);
  }, [activeIndex, displayVillas.length, scrollToIndex]);

  // Reliable Auto-Slide timer (slides every 4.5 seconds if enabled)
  useEffect(() => {
    if (!isAutoPlay || displayVillas.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlay, handleNext, displayVillas.length]);

  return (
    <section id="villas" className="py-24 bg-[#1E2A22] text-[#F5F2EB] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Section Header & Carousel Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#D4AF37] block mb-2">
              Curated Private Stays • Sinharaja Rainforest Border
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#F5F2EB] tracking-tight font-medium">
              Villas & Eco-Lodges in Lankagama
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#C2BCB0] leading-relaxed font-normal">
              Every property is personally vetted by our agency. Swipe or use controls to browse our riverside villas and rainforest lodges.
            </p>
          </div>

          {/* Carousel Controls (Top Right) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Auto-Slide Play/Pause Switch */}
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              type="button"
              className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isAutoPlay
                  ? 'bg-[#14231B] border-[#D4AF37] text-[#D4AF37]'
                  : 'bg-[#2C3E33] border-[#3B5244] text-[#C2BCB0] hover:text-[#F5F2EB]'
              }`}
              title={isAutoPlay ? 'Auto-Slide Active (Click to pause)' : 'Auto-Slide Paused (Click to play)'}
            >
              <span className={`w-2 h-2 rounded-full ${isAutoPlay ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              <span>{isAutoPlay ? 'Auto-Slide: ON' : 'Auto-Slide: OFF'}</span>
            </button>

            <div className="px-3.5 py-1.5 rounded-full bg-[#2C3E33] border border-[#3B5244] text-xs font-mono text-[#D4AF37] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Villa {activeIndex + 1} of {displayVillas.length}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#14231B] p-1 rounded-2xl border border-[#3B5244]">
              <button
                onClick={handlePrev}
                type="button"
                aria-label="Previous Villa"
                className="w-10 h-10 rounded-xl bg-[#2C3E33] hover:bg-[#D4AF37] hover:text-[#14231B] text-[#F5F2EB] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                type="button"
                aria-label="Next Villa"
                className="w-10 h-10 rounded-xl bg-[#2C3E33] hover:bg-[#D4AF37] hover:text-[#14231B] text-[#F5F2EB] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Villa Carousel Slider Track */}
        <div className="relative group/carousel">
          {/* Edge Fade Gradients on Desktop */}
          <div className="hidden lg:block absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-[#1E2A22] to-transparent pointer-events-none z-10" />
          <div className="hidden lg:block absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-[#1E2A22] to-transparent pointer-events-none z-10" />

          {/* Scrollable Track */}
          <div
            ref={trackRef}
            className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4 pt-1 px-1"
          >
            {displayVillas.map((villa) => (
              <div
                key={villa.id}
                className="w-[88vw] sm:w-[460px] lg:w-[calc(50%-16px)] shrink-0 snap-start"
              >
                <VillaCardItem
                  villa={villa}
                  onSelectVilla={onSelectVilla}
                  onViewDetails={onViewDetails}
                />
              </div>
            ))}
          </div>

          {/* Floating Next/Prev Buttons on track sides for desktop */}
          <button
            onClick={handlePrev}
            type="button"
            aria-label="Previous slide"
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#14231B]/95 text-[#F5F2EB] hover:bg-[#D4AF37] hover:text-[#14231B] border border-[#3B5244] shadow-xl items-center justify-center z-20 transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-105 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            type="button"
            aria-label="Next slide"
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#14231B]/95 text-[#F5F2EB] hover:bg-[#D4AF37] hover:text-[#14231B] border border-[#3B5244] shadow-xl items-center justify-center z-20 transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-105 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {displayVillas.map((villa, idx) => (
            <button
              key={villa.id}
              onClick={() => scrollToIndex(idx)}
              type="button"
              aria-label={`Go to Villa ${idx + 1}`}
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
          <span>👈 Swipe sideways to view other villas 👉</span>
        </div>

      </div>
    </section>
  );
}
