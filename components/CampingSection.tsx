'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Shield, Check, Package, ChevronLeft, ChevronRight, 
  Sparkles, Tent, Eye, Users, Utensils, Image as ImageIcon
} from 'lucide-react';
import { CampingGear } from '@/lib/types';
import { useLanguage } from '@/lib/LanguageContext';

interface CampingSectionProps {
  onSelectGear: (gear: CampingGear) => void;
  onViewDetails?: (gear: CampingGear) => void;
  gearList?: CampingGear[];
  isLoading?: boolean;
}

// Subcomponent: Individual Camping Gear Card with Photo Slider & Quick Details
function CampingCardItem({
  item,
  onSelectGear,
  onViewDetails
}: {
  item: CampingGear;
  onSelectGear: (gear: CampingGear) => void;
  onViewDetails?: (gear: CampingGear) => void;
}) {
  const images = item.images && item.images.length > 0 ? item.images : [item.imageUrl];
  const [photoIndex, setPhotoIndex] = useState(0);
  const { isSi } = useLanguage();

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(item);
    } else {
      onSelectGear(item);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="h-full group/card bg-[#2C3E33] border border-[#3B5244] hover:border-[#D4AF37] rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-2xl cursor-pointer"
    >
      <div>
        {/* Photo Stage & Pricing */}
        <div className="relative h-56 overflow-hidden bg-[#1E2A22] select-none">
          <img
            src={images[photoIndex]}
            alt={`${item.name} - photo ${photoIndex + 1}`}
            className="w-full h-full object-cover group-hover/card:scale-104 transition-transform duration-600"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14231B] via-transparent to-transparent opacity-85 pointer-events-none" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10 max-w-[85%]">
            <span className="px-2.5 py-1 rounded-full bg-[#14231B]/85 backdrop-blur-md text-[#D4AF37] border border-[#3B5244] text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm">
              {item.category === 'package' 
                ? (isSi ? 'සම්පූර්ණ කට්ටලය' : 'Complete Set') 
                : item.category === 'tent'
                ? (isSi ? 'කූඩාරම' : 'Tent')
                : item.category === 'cooking'
                ? (isSi ? 'ඉවුම් පිහුම්' : 'Cooking')
                : (isSi ? 'උපාංග' : 'Accessory')}
            </span>

            {item.capacity && (
              <span className="px-2 py-1 rounded-full bg-[#14231B]/85 backdrop-blur-md text-[#F5F2EB] text-[10px] font-semibold border border-[#3B5244] flex items-center gap-1 shadow-sm">
                <Users className="w-3 h-3 text-[#D4AF37]" />
                <span>{item.capacity}</span>
              </span>
            )}

            {item.meals && (
              <span className="px-2 py-1 rounded-full bg-[#14231B]/85 backdrop-blur-md text-[#D4AF37] text-[10px] font-semibold border border-[#D4AF37]/50 flex items-center gap-1 shadow-sm">
                <Utensils className="w-3 h-3 text-[#D4AF37]" />
                <span>{isSi ? 'ආහාර' : 'Meals'}</span>
              </span>
            )}

            {images.length > 1 && (
              <span className="px-2 py-1 rounded-full bg-[#14231B]/85 backdrop-blur-md text-[#F5F2EB] text-[10px] font-medium border border-[#3B5244] flex items-center gap-1 shadow-sm">
                <ImageIcon className="w-3 h-3 text-[#D4AF37]" />
                <span>{photoIndex + 1}/{images.length}</span>
              </span>
            )}
          </div>

          {/* Quick Photo Switcher Arrows (if multiple photos) */}
          {images.length > 1 && (
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none z-10">
              <button
                onClick={prevPhoto}
                type="button"
                aria-label="Previous photo"
                className="w-7 h-7 rounded-full bg-black/60 hover:bg-[#D4AF37] hover:text-[#14231B] text-white flex items-center justify-center transition-all pointer-events-auto border border-white/20 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextPhoto}
                type="button"
                aria-label="Next photo"
                className="w-7 h-7 rounded-full bg-black/60 hover:bg-[#D4AF37] hover:text-[#14231B] text-white flex items-center justify-center transition-all pointer-events-auto border border-white/20 active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="absolute bottom-3 right-3 bg-[#14231B]/95 text-[#D4AF37] border border-[#3B5244] px-3.5 py-1.5 rounded-xl text-right font-bold text-xs font-mono shadow z-10">
            <span>{isSi ? `රු. ${item.pricePerDayLKR.toLocaleString()} / දිනකට` : `Rs. ${item.pricePerDayLKR.toLocaleString()} / day`}</span>
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          <span className="text-[11px] font-semibold text-[#D4AF37] block mb-1">
            {isSi ? item.name : item.sinhalaName}
          </span>
          <h3 
            onClick={handleCardClick}
            className="text-base font-serif font-semibold text-[#F5F2EB] leading-snug group-hover/card:text-[#D4AF37] transition-colors cursor-pointer"
          >
            {isSi && item.sinhalaName ? item.sinhalaName : item.name}
          </h3>
          <p className="text-xs text-[#C2BCB0] mt-2 leading-relaxed font-normal line-clamp-2">
            {item.description}
          </p>

          {/* Included Items Checklist */}
          {item.includes && item.includes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#3B5244] space-y-2">
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.14em] block">
                {isSi ? 'ඇතුළත් අයිතම:' : 'Included in Package:'}
              </span>
              {item.includes.slice(0, 3).map((inc, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#F5F2EB]">
                  <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="leading-tight line-clamp-1">{inc}</span>
                </div>
              ))}
              {item.includes.length > 3 && (
                <span className="text-[10px] text-[#D4AF37] font-semibold pl-5 block">
                  +{item.includes.length - 3} {isSi ? 'තවත් අයිතම...' : 'more items included...'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons: View Details & Reserve */}
      <div className="p-6 pt-0 flex items-center gap-2">
        {onViewDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(item);
            }}
            type="button"
            className="flex-1 py-2.5 px-3 rounded-xl border border-[#3B5244] hover:border-[#D4AF37] text-xs font-semibold text-[#F5F2EB] hover:text-[#D4AF37] bg-[#1E2A22] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isSi ? 'විස්තර බලන්න' : 'View Details'}</span>
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectGear(item);
          }}
          type="button"
          className={`${onViewDetails ? 'flex-1' : 'w-full'} py-2.5 px-3 rounded-xl font-semibold text-xs text-[#14231B] bg-[#D4AF37] hover:bg-[#C5A880] active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer`}
        >
          <Package className="w-3.5 h-3.5 text-[#14231B]" />
          <span>{isSi ? 'වෙන්කරගන්න' : 'Reserve'}</span>
        </button>
      </div>
    </div>
  );
}

export default function CampingSection({ onSelectGear, onViewDetails, gearList = [], isLoading = false }: CampingSectionProps) {
  const { isSi, t } = useLanguage();
  const displayGear = gearList || [];
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
              {t('camping.pill', 'Field Equipment Rental • Expedition Ready')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#F5F2EB] tracking-tight font-medium">
              {t('camping.title', 'Expedition Camping Gear in Lankagama')}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#C2BCB0] leading-relaxed font-normal">
              {t('camping.desc', 'Travel light without hauling heavy gear across Sri Lanka. Rent heavy-duty waterproof tents, portable stoves, insulated mats, and leech protection sets.')}
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
              <span>{isAutoPlay ? (isSi ? 'ස්වයංක්‍රීයව මාරුවීම: සක්‍රියයි' : 'Auto-Slide: ON') : (isSi ? 'ස්වයංක්‍රීයව මාරුවීම: අක්‍රියයි' : 'Auto-Slide: OFF')}</span>
            </button>

            <div className="px-3.5 py-1.5 rounded-full bg-[#2C3E33] border border-[#3B5244] text-xs font-mono text-[#D4AF37] flex items-center gap-2">
              <Tent className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isSi ? `කට්ටල ${activeIndex + 1} / ${displayGear.length}` : `Gear ${activeIndex + 1} of ${displayGear.length}`}</span>
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
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-[#2C3E33]/70 border border-[#3B5244] rounded-2xl overflow-hidden flex flex-col justify-between h-[420px] shadow-xl animate-pulse"
              >
                <div>
                  <div className="relative h-56 bg-[#1E2A22] flex items-center justify-center">
                    <Tent className="w-10 h-10 text-[#D4AF37]/20" />
                    <div className="absolute top-3 left-3 w-24 h-6 rounded-full bg-[#14231B] border border-[#3B5244]" />
                    <div className="absolute bottom-3 right-3 w-24 h-7 rounded-xl bg-[#14231B] border border-[#3B5244]" />
                  </div>
                  <div className="p-6 space-y-2.5">
                    <div className="w-3/4 h-4 rounded bg-[#3B5244]" />
                    <div className="w-full h-3 rounded bg-[#26372B]" />
                    <div className="w-4/5 h-3 rounded bg-[#26372B]" />
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="w-full h-10 rounded-xl bg-[#14231B] border border-[#3B5244]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative group/camping">
          {/* Edge Fade Gradients */}
          <div className="hidden lg:block absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-[#14231B] to-transparent pointer-events-none z-10" />
          <div className="hidden lg:block absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-[#14231B] to-transparent pointer-events-none z-10" />

          {/* Scrollable Track */}
          <div
            ref={trackRef}
            className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4 pt-1 px-1"
          >
            {displayGear.length === 0 ? (
              <div className="w-full py-16 text-center bg-[#2C3E33]/50 rounded-2xl border border-dashed border-[#3B5244] text-[#C2BCB0] text-sm">
                No camping equipment currently listed.
              </div>
            ) : (
              displayGear.map((item) => (
                <div
                  key={item.id}
                  className="w-[85vw] sm:w-[380px] lg:w-[calc(33.333%-16px)] shrink-0 snap-start"
                >
                  <CampingCardItem
                    item={item}
                    onSelectGear={onSelectGear}
                    onViewDetails={onViewDetails}
                  />
                </div>
              ))
            )}
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
        )}

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
          <span>{isSi ? '👈 කූඩාරම් සහ උපකරණ බැලීමට දෙපසට අදින්න 👉' : '👈 Swipe sideways to view all gear packages 👉'}</span>
        </div>

        {/* Eco Principles Notice Box */}
        <div className="mt-14 bg-[#2C3E33] border border-[#3B5244] rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center md:text-left">
            <h4 className="text-sm font-serif font-semibold text-[#F5F2EB] flex items-center justify-center md:justify-start gap-2">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              <span>{isSi ? 'පරිසර සංරක්ෂණ මූලධර්ම සහ නීති රීති' : 'Leave No Trace Camping Protocol'}</span>
            </h4>
            <p className="text-xs text-[#C2BCB0] max-w-2xl leading-relaxed font-normal">
              {isSi 
                ? 'ලංකාගම සිංහරාජ ලෝක උරුම වැසි වනාන්තර මායිමේ පිහිටා ඇත. කඳවුරු බැඳීමේදී පොලිතින් සහ අපද්‍රව්‍ය බැහැර කිරීම තහනම් වන අතර, සියලු අපද්‍රව්‍ය ආපසු රැගෙන යා යුතුය. ස්වාභාවික දියඇලි හා ගංගාවල රසායනික සබන් භාවිතය තහනම්ය.'
                : 'Lankagama borders the Sinharaja World Heritage rainforest. All camp rubbish and polythene must be brought back. Soaps and chemical shampoos are prohibited in natural stream pools.'}
            </p>
          </div>
          <div className="shrink-0 text-xs text-[#D4AF37] font-semibold px-4 py-2 rounded-xl bg-[#1E2A22] border border-[#3B5244]">
            {isSi ? 'වර්ෂා හා කූඩැල්ලන්ගෙන් ආරක්ෂිතයි' : 'Rainfall & Leech Tested'}
          </div>
        </div>

      </div>
    </section>
  );
}
