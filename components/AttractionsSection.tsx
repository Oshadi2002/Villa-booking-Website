'use client';

import React from 'react';
import { MapPin, AlertCircle, Compass } from 'lucide-react';
import { Attraction } from '@/lib/types';
import { ATTRACTIONS } from '@/lib/data';

interface AttractionsSectionProps {
  attractionsList?: Attraction[];
}

export default function AttractionsSection({ attractionsList }: AttractionsSectionProps) {
  const displayAttractions = attractionsList && attractionsList.length > 0 ? attractionsList : ATTRACTIONS;

  return (
    <section id="attractions" className="py-24 bg-[#14231B] text-[#F5F2EB] border-t border-[#2C3E33]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#D4AF37] block mb-2">
            Regional Highlights
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#F5F2EB] tracking-tight font-medium">
            Natural Waterfalls & Sanctuaries
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#C2BCB0] leading-relaxed font-normal">
            Essential sights in Lankagama village and key safety advice for visiting the Sinharaja buffer zone.
          </p>
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayAttractions.map((attraction, idx) => (
            <div
              key={attraction.id || idx}
              className="bg-[#2C3E33] border border-[#3B5244] hover:border-[#D4AF37] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between"
            >
              {/* Optional Photo */}
              {attraction.imageUrl && (
                <div className="relative h-44 overflow-hidden bg-[#1E2A22]">
                  <img src={attraction.imageUrl} alt={attraction.name} className="w-full h-full object-cover hover:scale-103 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E33] via-transparent to-transparent" />
                </div>
              )}

              <div className="p-6 sm:p-7 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#1E2A22] text-[#D4AF37] border border-[#3B5244] text-[11px] font-semibold tracking-wide shadow-xs">
                    {attraction.badge}
                  </span>
                  <span className="text-xs font-mono text-[#D4AF37] font-semibold">0{idx + 1}</span>
                </div>

                <h3 className="text-xl font-serif font-semibold text-[#F5F2EB] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>{attraction.name}</span>
                </h3>

                <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed font-normal">
                  {attraction.description}
                </p>

                {/* Safety Guidance Callout */}
                <div className="p-3.5 bg-[#1E2A22] border border-[#3B5244] rounded-xl flex items-start gap-2.5 text-xs text-[#C2BCB0] shadow-xs">
                  <AlertCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="leading-relaxed"><strong className="text-[#F5F2EB] font-semibold">Safety Note:</strong> {attraction.caution}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Route Guidance Box */}
        <div className="mt-12 bg-[#2C3E33] border border-[#3B5244] rounded-2xl p-6 sm:p-8 shadow-md">
          <h4 className="text-base font-serif font-semibold text-[#F5F2EB] mb-2 flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#D4AF37]" />
            <span>How to Reach Lankagama Valley</span>
          </h4>
          <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed font-normal">
            <strong className="text-[#D4AF37] font-semibold">From Galle / Neluwa:</strong> Reach Neluwa town, then proceed along the scenic Gin Ganga road directly into Lankagama village (~14 km). The road features concrete bridges and breathtaking river scenery.<br />
            <strong className="text-[#D4AF37] font-semibold">From Deniyaya:</strong> Reach via Neluwa or through designated forest approach routes. High clearance vehicles or 4WD are recommended during heavy monsoon seasons.
          </p>
        </div>

      </div>
    </section>
  );
}
