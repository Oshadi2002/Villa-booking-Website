'use client';

import React from 'react';
import { Star, Award, Languages, Compass, Check } from 'lucide-react';
import { TOUR_GUIDES } from '@/lib/data';
import { TourGuide } from '@/lib/types';

interface GuideSectionProps {
  onSelectGuide: (guide: TourGuide) => void;
  guides?: TourGuide[];
}

export default function GuideSection({ onSelectGuide, guides = TOUR_GUIDES }: GuideSectionProps) {
  const displayGuides = guides && guides.length > 0 ? guides : TOUR_GUIDES;

  return (
    <section id="guides" className="py-24 bg-[#1E2A22] text-[#F5F2EB] border-t border-[#2C3E33]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#D4AF37] block mb-2">
            Field Naturalists
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#F5F2EB] tracking-tight font-medium">
            Native Sinharaja Rainforest Guides
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#C2BCB0] leading-relaxed font-normal">
            Trek safely with guides born and raised in Lankagama village who know every trail, endemic bird species, and safe waterfall step.
          </p>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayGuides.map((guide) => (
            <div
              key={guide.id}
              className="group bg-[#2C3E33] rounded-2xl overflow-hidden border border-[#3B5244] hover:border-[#D4AF37] shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Guide Photo & Header */}
                <div className="relative h-64 bg-[#14231B] overflow-hidden">
                  <img
                    src={guide.imageUrl}
                    alt={guide.name}
                    className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14231B] via-transparent to-black/20" />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-[#14231B]/80 backdrop-blur-md text-[#F5F2EB] border border-[#3B5244] px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                    <span>{guide.rating}</span>
                  </div>

                  {/* Local Verified Badge */}
                  <div className="absolute top-3 left-3 bg-[#14231B]/80 backdrop-blur-md text-[#D4AF37] px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-[#3B5244]">
                    Lankagama Native
                  </div>

                  {/* Guide Name & Rates */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-[#F5F2EB]">
                    <div>
                      <h3 className="text-xl font-serif font-medium leading-tight group-hover:text-[#D4AF37] transition-colors">
                        {guide.name}
                      </h3>
                      <p className="text-xs text-[#C2BCB0] font-normal">
                        {guide.nickname}
                      </p>
                    </div>

                    <div className="bg-[#14231B]/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-right shrink-0 border border-[#3B5244]">
                      <span className="text-[9px] text-[#C2BCB0] uppercase tracking-wider block">Full Day Trek</span>
                      <span className="text-sm font-bold text-[#D4AF37] font-mono">
                        Rs. {guide.dailyRateLKR.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-4">
                  {/* Experience & Languages */}
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-[#3B5244] font-normal">
                    <div className="flex items-center gap-1.5 font-medium text-[#F5F2EB]">
                      <Award className="w-4 h-4 text-[#D4AF37]" />
                      <span>{guide.experienceYears} Years Trekking</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#C2BCB0]">
                      <Languages className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="line-clamp-1">{guide.languages.join(', ')}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-[#C2BCB0] leading-relaxed font-normal">
                    {guide.bio}
                  </p>

                  {/* Specialties */}
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D4AF37] block mb-2">
                      Trail Expertise:
                    </span>
                    <div className="space-y-1.5">
                      {guide.specialties.map((spec, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#F5F2EB]">
                          <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span className="leading-tight">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => onSelectGuide(guide)}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-[#14231B] bg-[#D4AF37] hover:bg-[#C5A880] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#14231B]" />
                  <span>Reserve {guide.name.split(' ')[0]} for Your Trek</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
