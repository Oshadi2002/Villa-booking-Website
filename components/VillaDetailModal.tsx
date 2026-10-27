'use client';

import React, { useState } from 'react';
import { 
  X, ChevronLeft, ChevronRight, MapPin, Users, Bed, Bath, 
  Clock, ShieldCheck, Utensils, Share2, Sparkles, Check,
  MessageCircle, ArrowRight
} from 'lucide-react';
import { Villa } from '@/lib/types';
import { AGENCY_CONFIG } from '@/lib/data';

interface VillaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  villa: Villa | null;
  onBookNow: (villa: Villa) => void;
}

export default function VillaDetailModal({ isOpen, onClose, villa, onBookNow }: VillaDetailModalProps) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !villa) return null;

  const images = villa.images && villa.images.length > 0 ? villa.images : [villa.imageUrl];

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const whatsappInquireUrl = `https://wa.me/${AGENCY_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hello The Sinharaja Collection Lankagama! I am inquiring about ${villa.name} (Rs. ${villa.pricePerNightLKR.toLocaleString()}/night). Is it available?`)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      {/* Modal Container */}
      <div className="relative bg-[#1E2A22] text-[#F5F2EB] w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 border border-[#3B5244]">
        
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 bg-[#1E2A22]/95 backdrop-blur-md border-b border-[#3B5244] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#D4AF37] bg-[#2C3E33] px-2.5 py-1 rounded-full border border-[#3B5244]">
              Private Villa Sanctuary
            </span>
            <span className="text-xs text-[#C2BCB0] hidden sm:inline">• Lankagama</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-[#2C3E33] text-[#F5F2EB] transition-colors text-xs flex items-center gap-1 cursor-pointer border border-transparent hover:border-[#3B5244]"
              title="Share"
            >
              <Share2 className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[11px] font-medium hidden sm:inline">
                {copiedLink ? 'Copied!' : 'Share'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#2C3E33] hover:bg-[#3B5244] text-[#F5F2EB] transition-colors cursor-pointer border border-[#3B5244]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 pb-24 sm:pb-8">
          
          {/* ============================================================
             1. INTERACTIVE PHOTO GALLERY (Mobile-Optimized)
             ============================================================ */}
          <div className="relative bg-[#14231B] group select-none">
            
            {/* Main Stage Image */}
            <div className="relative h-64 sm:h-96 w-full overflow-hidden">
              <img
                src={images[activePhotoIdx]}
                alt={`${villa.name} photo ${activePhotoIdx + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14231B] via-transparent to-transparent pointer-events-none" />

              {/* Photo Counter Pill */}
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-[#14231B]/80 backdrop-blur-md text-[#F5F2EB] text-xs font-medium flex items-center gap-1 border border-[#3B5244]">
                <span className="text-[#D4AF37]">{activePhotoIdx + 1}</span>
                <span className="text-[#C2BCB0]">/</span>
                <span>{images.length} Photos</span>
              </div>

              {/* Left / Right Nav Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#14231B]/70 hover:bg-[#2C3E33] text-[#F5F2EB] border border-[#3B5244] flex items-center justify-center backdrop-blur-sm transition-all sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#14231B]/70 hover:bg-[#2C3E33] text-[#F5F2EB] border border-[#3B5244] flex items-center justify-center backdrop-blur-sm transition-all sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="p-2 bg-[#14231B] border-t border-[#3B5244] flex items-center gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activePhotoIdx === idx
                        ? 'border-[#D4AF37] opacity-100 scale-102'
                        : 'border-[#3B5244] opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ============================================================
             2. VILLA TITLE & SPECS BAR
             ============================================================ */}
          <div className="p-5 sm:p-8 space-y-7">
            
            <div>
              <span className="text-xs font-medium text-[#D4AF37] block tracking-wide">
                {villa.sinhalaName}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#F5F2EB] font-medium mt-1 leading-tight">
                {villa.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-[#C2BCB0] mt-2 font-normal">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{villa.locationDetails}</span>
              </div>
            </div>

            {/* Quick Specs Pill Badges (Bedrooms, Bathrooms, Guests, Beds) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-[#2C3E33] rounded-2xl border border-[#3B5244] shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E2A22] text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#3B5244]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#C2BCB0] uppercase tracking-wider block font-medium">Capacity</span>
                  <span className="text-xs font-semibold text-[#F5F2EB]">{villa.maxGuests} Guests</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E2A22] text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#3B5244]">
                  <Bed className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#C2BCB0] uppercase tracking-wider block font-medium">Bedrooms</span>
                  <span className="text-xs font-semibold text-[#F5F2EB]">{villa.bedrooms} Bedrooms</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E2A22] text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#3B5244]">
                  <Bath className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#C2BCB0] uppercase tracking-wider block font-medium">Bathrooms</span>
                  <span className="text-xs font-semibold text-[#F5F2EB]">{villa.bathrooms} Hot Showers</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E2A22] text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#3B5244]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#C2BCB0] uppercase tracking-wider block font-medium">Check-in</span>
                  <span className="text-xs font-semibold text-[#F5F2EB]">{villa.checkInTime}</span>
                </div>
              </div>
            </div>

            {/* Bed Layout, A/C & Kitchen Callout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {villa.bedConfig && (
                <div className="p-3 bg-[#2C3E33] border border-[#3B5244] rounded-xl flex items-center gap-2 text-xs text-[#C2BCB0] font-normal">
                  <Bed className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span><strong className="font-semibold text-[#F5F2EB]">Beds:</strong> {villa.bedConfig}</span>
                </div>
              )}

              <div className="p-3 bg-[#2C3E33] border border-[#3B5244] rounded-xl flex items-center gap-2 text-xs text-[#C2BCB0] font-normal">
                <span className="text-base shrink-0">❄️</span>
                <span>
                  <strong className="font-semibold text-[#F5F2EB]">A/C Status:</strong>{' '}
                  {villa.acType === 'ac' ? 'A/C Only' : villa.acType === 'non-ac' ? 'Non-A/C Rainforest Breeze' : 'Both A/C & Non-A/C Available'}
                </span>
              </div>

              <div className="p-3 bg-[#2C3E33] border border-[#3B5244] rounded-xl flex items-center gap-2 text-xs text-[#C2BCB0] font-normal">
                <span className="text-base shrink-0">🍳</span>
                <span>
                  <strong className="font-semibold text-[#F5F2EB]">Kitchen:</strong>{' '}
                  {villa.hasKitchen ? 'Private Kitchen Available' : 'No Kitchen (Village Meals Available)'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.18em] mb-2">
                About The Sanctuary
              </h3>
              <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed font-normal">
                {villa.description}
              </p>
            </div>

            {/* Property Highlights */}
            {villa.highlights && villa.highlights.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.18em] mb-3">
                  Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {villa.highlights.map((h, i) => (
                    <div key={i} className="p-4 bg-[#2C3E33] rounded-2xl border border-[#3B5244] flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#1E2A22] text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5 border border-[#3B5244]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#F5F2EB]">{h.title}</h4>
                        <p className="text-[11px] text-[#C2BCB0] mt-0.5 leading-relaxed font-normal">{h.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities & Included Amenities */}
            <div>
              <h3 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.18em] mb-3">
                Facilities & Included Amenities
              </h3>
              <div className="space-y-3.5">
                {villa.facilities && villa.facilities.length > 0 ? (
                  villa.facilities.map((grp, i) => (
                    <div key={i} className="bg-[#2C3E33] p-4 sm:p-5 rounded-2xl border border-[#3B5244]">
                      <h4 className="text-xs font-semibold text-[#F5F2EB] mb-2.5">
                        {grp.category}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {grp.items.map((item, j) => (
                          <div key={j} className="flex items-start gap-2 text-xs text-[#C2BCB0] font-normal">
                            <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                            <span className="leading-tight">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {villa.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#C2BCB0]">
                        <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Food & Dining */}
            {villa.foodOptions && villa.foodOptions.length > 0 && (
              <div className="p-5 bg-[#2C3E33] rounded-2xl border border-[#3B5244]">
                <h3 className="text-xs font-semibold text-[#F5F2EB] uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Utensils className="w-4 h-4 text-[#D4AF37]" />
                  <span>Woodfire Village Cuisine & Dining</span>
                </h3>
                <p className="text-[11px] text-[#C2BCB0] mb-3 font-normal">
                  Freshly prepared with homegrown rainforest ingredients by local village cooks:
                </p>
                <div className="space-y-1.5">
                  {villa.foodOptions.map((food, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#F5F2EB] font-normal">
                      <span className="text-[#D4AF37] font-bold">•</span>
                      <span>{food}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* House Rules & Guidelines */}
            {villa.houseRules && villa.houseRules.length > 0 && (
              <div className="p-4 bg-[#2C3E33]/70 rounded-2xl border border-[#3B5244]">
                <h3 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
                  Sanctuary Rules & Guidelines
                </h3>
                <div className="space-y-1.5">
                  {villa.houseRules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#C2BCB0] font-normal">
                      <span className="text-[#D4AF37] font-bold">•</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agency Verification Guarantee */}
            <div className="p-4 bg-[#14231B] text-[#F5F2EB] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#3B5244]">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Agency Host-Vetted Guarantee</span>
                </div>
                <p className="text-xs text-[#C2BCB0] font-normal">
                  You submit a request → Our agency calls host Mr. {villa.ownerContact?.split('(')[1]?.replace(')', '') || 'Karunathilaka'} to confirm live room vacancy → Official WhatsApp approval is sent.
                </p>
              </div>

              <a
                href={whatsappInquireUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] font-semibold text-xs flex items-center gap-1.5 transition-all shadow"
              >
                <MessageCircle className="w-4 h-4 fill-[#14231B]" />
                <span>WhatsApp Agency</span>
              </a>
            </div>

          </div>
        </div>

        {/* ============================================================
           STICKY BOTTOM BOOKING BAR (AIRBNB MOBILE STYLE)
           ============================================================ */}
        <div className="sticky bottom-0 z-30 bg-[#1E2A22]/95 backdrop-blur-md border-t border-[#3B5244] p-3 sm:p-4 px-4 sm:px-8 flex items-center justify-between gap-3 shadow-lg">
          <div>
            <span className="text-[10px] text-[#C2BCB0] block uppercase tracking-wider">Per Night</span>
            <div className="text-lg sm:text-2xl font-bold text-[#D4AF37] font-mono">
              Rs. {villa.pricePerNightLKR.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#C2BCB0] font-sans">/ night</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={whatsappInquireUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-[#2C3E33] hover:bg-[#3B5244] text-[#D4AF37] border border-[#3B5244] transition-colors"
              title="Inquire via WhatsApp"
            >
              <MessageCircle className="w-5 h-5 fill-[#D4AF37] text-[#1E2A22]" />
            </a>

            <button
              onClick={() => {
                onClose();
                onBookNow(villa);
              }}
              className="py-3 px-5 sm:px-7 rounded-xl font-semibold text-xs sm:text-sm text-[#14231B] bg-[#D4AF37] hover:bg-[#C5A880] active:scale-98 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Reserve Room</span>
              <ArrowRight className="w-4 h-4 text-[#14231B]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
