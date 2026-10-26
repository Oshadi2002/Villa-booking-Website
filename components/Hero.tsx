'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroSlide } from '@/lib/types';

const HERO_SLIDES: HeroSlide[] = [
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

export default function Hero({ slides }: { slides?: HeroSlide[] }) {
  const activeSlides = slides && slides.length > 0 ? slides : HERO_SLIDES;
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#14231B] text-[#F5F2EB] min-h-[640px] sm:min-h-[740px] flex flex-col justify-between pt-16 pb-14 sm:pt-20 sm:pb-20 border-b border-[#2C3E33]">
      
      {/* ============================================================
         BACKGROUND PHOTO SLIDESHOW (Sinharaja & Lankagama nature)
         ============================================================ */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {activeSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentSlide === idx ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            <img
              src={slide.url}
              alt={slide.title}
              className={`w-full h-full object-cover transition-transform duration-7000 ease-out ${
                currentSlide === idx ? 'scale-104' : 'scale-100'
              }`}
            />
          </div>
        ))}

        {/* Cinematic dark scrim overlay blending seamlessly with Dark Olive Green #14231B */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#14231B]/80 via-[#14231B]/40 to-[#14231B]/95" />
      </div>

      {/* Manual Slide Navigation Arrows (Desktop) */}
      <button
        onClick={handlePrevSlide}
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#2C3E33]/85 hover:bg-[#2C3E33] text-[#F5F2EB] items-center justify-center backdrop-blur-md border border-[#3B5244] hover:border-[#D4AF37] shadow-lg transition-all cursor-pointer"
        title="Previous photo"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNextSlide}
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#2C3E33]/85 hover:bg-[#2C3E33] text-[#F5F2EB] items-center justify-center backdrop-blur-md border border-[#3B5244] hover:border-[#D4AF37] shadow-lg transition-all cursor-pointer"
        title="Next photo"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto">
        
        {/* Soft Cream / Warm Gold Pre-header Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2C3E33]/90 backdrop-blur-md border border-[#3B5244] text-[#F5F2EB] text-xs tracking-[0.16em] uppercase font-semibold shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span>Sinharaja Rainforest Southern Gateway • Sri Lanka</span>
          </div>
        </div>

        {/* Master Editorial Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif tracking-tight leading-[1.2] text-[#F5F2EB] font-medium drop-shadow-md">
            Where the Virgin Rainforest <br className="hidden sm:inline" />
            Meets the Living Waters of <br />
            <span className="italic font-normal text-[#D4AF37]">
              Lankagama (ලංකාගම)
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base lg:text-lg text-[#C2BCB0] max-w-2xl mx-auto leading-relaxed font-normal drop-shadow">
            Your official agency for vetted private river-edge villas, expedition camping equipment rentals, and native Sinharaja naturalists.
          </p>

          {/* Clean Light Process Badge */}
          <div className="mt-7 inline-flex items-center gap-2.5 bg-[#2C3E33]/90 backdrop-blur-md border border-[#3B5244] rounded-full px-5 py-2 text-xs text-[#F5F2EB] shadow-md">
            <span className="text-[#D4AF37] font-serif italic text-sm font-semibold">Direct Review Protocol:</span>
            <span className="text-[#C2BCB0] font-medium">
              Customer submits request → Agency verifies vacancy with local host → Immediate WhatsApp confirmation.
            </span>
          </div>
        </div>

        {/* 2 Muted Sage Green Action Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* Villa Card */}
          <div 
            onClick={() => scrollTo('villas')}
            className="group cursor-pointer bg-[#2C3E33]/95 backdrop-blur-md border border-[#3B5244] hover:border-[#D4AF37] rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl"
          >
            <div className="flex items-center justify-between text-[#C2BCB0] mb-2.5">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37]">
                Service 01 • Stays
              </span>
              <ArrowRight className="w-4 h-4 text-[#C2BCB0] group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors">
              Private Villas & Eco-Lodges
            </h3>
            <p className="text-xs text-[#C2BCB0] mt-2.5 leading-relaxed font-normal">
              River-edge sanctuaries with crystal-clear natural bathing pools, fresh mountain air, and woodfire village dining in Lankagama.
            </p>
            <div className="mt-3.5 pt-3 border-t border-[#3B5244] text-[11px] text-[#D4AF37] font-medium flex items-center gap-1.5">
              <span>✓ Certified native Sinharaja guide available on booking</span>
            </div>
          </div>

          {/* Camping Gear Card */}
          <div 
            onClick={() => scrollTo('camping')}
            className="group cursor-pointer bg-[#2C3E33]/95 backdrop-blur-md border border-[#3B5244] hover:border-[#D4AF37] rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl"
          >
            <div className="flex items-center justify-between text-[#C2BCB0] mb-2.5">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37]">
                Service 02 • Field Gear
              </span>
              <ArrowRight className="w-4 h-4 text-[#C2BCB0] group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors">
              Expedition Camping Sets
            </h3>
            <p className="text-xs text-[#C2BCB0] mt-2.5 leading-relaxed font-normal">
              3000mm rainproof double-layer tents, butane cookers, lanterns, and anti-leech protection delivered right in Lankagama.
            </p>
            <div className="mt-3.5 pt-3 border-t border-[#3B5244] text-[11px] text-[#D4AF37] font-medium flex items-center gap-1.5">
              <span>✓ Certified native Sinharaja guide available on booking</span>
            </div>
          </div>

        </div>

      </div>

      {/* ============================================================
         BOTTOM SLIDE CONTROLLER BAR
         ============================================================ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10">
        <div className="bg-[#2C3E33]/90 backdrop-blur-md border border-[#3B5244] rounded-2xl px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          {/* Current Active Slide Label */}
          <div className="flex items-center gap-2.5 text-xs text-[#F5F2EB]">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="font-serif italic text-[#F5F2EB] text-sm font-semibold">
              {activeSlides[currentSlide]?.title || ''}
            </span>
            <span className="hidden md:inline text-[#C2BCB0]">
              • {activeSlides[currentSlide]?.sinhala || ''}
            </span>
          </div>

          {/* Slide Indicator Pills */}
          <div className="flex items-center gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx
                    ? 'w-8 bg-[#D4AF37]'
                    : 'w-2 bg-[#3B5244] hover:bg-[#D4AF37]/60'
                }`}
                title={`Switch to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
