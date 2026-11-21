'use client';

import React, { useState } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Users, ShieldCheck, 
  Utensils, Share2, Sparkles, Check, Package,
  MessageCircle, ArrowRight, Tent
} from 'lucide-react';
import { CampingGear } from '@/lib/types';
import { useWhatsApp } from '@/lib/useWhatsApp';
import { useLanguage } from '@/lib/LanguageContext';
import { useModalHistory } from '@/lib/useModalHistory';

interface CampingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  gear: CampingGear | null;
  onBookNow: (gear: CampingGear) => void;
}

export default function CampingDetailModal({ isOpen, onClose, gear, onBookNow }: CampingDetailModalProps) {
  useModalHistory({
    isOpen: Boolean(isOpen && gear),
    onClose,
    modalId: gear ? `gear-${gear.id}` : 'gear-detail'
  });

  const { isSi, t } = useLanguage();
  const { getWhatsAppLink } = useWhatsApp();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !gear) return null;

  const images = gear.images && gear.images.length > 0 ? gear.images : [gear.imageUrl];

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

  const whatsappInquireUrl = getWhatsAppLink(
    `Hello The Sinharaja Collection Lankagama! I am inquiring about the camping equipment "${gear.name}" (Rs. ${gear.pricePerDayLKR.toLocaleString()} / day). Is it available for rental?`
  );

  const getCategoryLabel = () => {
    switch (gear.category) {
      case 'package':
        return isSi ? 'සම්පූර්ණ කඳවුරු කට්ටලය' : 'Complete Camping Package';
      case 'tent':
        return isSi ? 'ජලරෝධී කූඩාරම' : 'Rainforest Tent';
      case 'cooking':
        return isSi ? 'කඳවුරු ඉවුම් පිහුම් කට්ටලය' : 'Outdoor Cooking Kit';
      case 'accessory':
        return isSi ? 'ආරක්ෂිත උපාංග' : 'Trekking & Safety Gear';
      default:
        return isSi ? 'කඳවුරු උපකරණ' : 'Camping Equipment';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      {/* Modal Container */}
      <div className="relative bg-[#1E2A22] text-[#F5F2EB] w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 border border-[#3B5244]">
        
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 bg-[#1E2A22]/95 backdrop-blur-md border-b border-[#3B5244] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#D4AF37] bg-[#2C3E33] px-2.5 py-1 rounded-full border border-[#3B5244] flex items-center gap-1.5">
              <Tent className="w-3 h-3 text-[#D4AF37]" />
              <span>{getCategoryLabel()}</span>
            </span>
            <span className="text-xs text-[#C2BCB0] hidden sm:inline">• Lankagama Expedition</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-[#2C3E33] text-[#F5F2EB] transition-colors text-xs flex items-center gap-1 cursor-pointer border border-transparent hover:border-[#3B5244]"
              title="Share"
            >
              <Share2 className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[11px] font-medium hidden sm:inline">
                {copiedLink ? (isSi ? 'පිටපත් කළා!' : 'Copied!') : (isSi ? 'බෙදාහරින්න' : 'Share')}
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
             1. INTERACTIVE PHOTO GALLERY
             ============================================================ */}
          <div className="relative bg-[#14231B] group select-none">
            
            {/* Main Stage Image */}
            <div className="relative h-64 sm:h-96 w-full overflow-hidden">
              <img
                src={images[activePhotoIdx]}
                alt={`${gear.name} photo ${activePhotoIdx + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E2A22] via-transparent to-black/30 pointer-events-none" />

              {/* Badges on Image */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 pointer-events-none">
                {gear.capacity && (
                  <span className="px-3 py-1.5 rounded-full bg-[#14231B]/90 backdrop-blur-md text-[#F5F2EB] text-xs font-semibold border border-[#3B5244] flex items-center gap-1.5 shadow-md">
                    <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{gear.capacity}</span>
                  </span>
                )}

                {gear.meals && (
                  <span className="px-3 py-1.5 rounded-full bg-[#14231B]/90 backdrop-blur-md text-[#D4AF37] text-xs font-semibold border border-[#D4AF37]/50 flex items-center gap-1.5 shadow-md">
                    <Utensils className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{isSi ? 'ආහාර පහසුකම් ඇත' : 'Meals Available'}</span>
                  </span>
                )}
              </div>

              {/* Arrow navigation if multiple images */}
              {images.length > 1 && (
                <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-between">
                  <button
                    onClick={handlePrevPhoto}
                    type="button"
                    className="w-10 h-10 rounded-full bg-black/60 hover:bg-[#D4AF37] hover:text-[#14231B] text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/20 active:scale-95"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    type="button"
                    className="w-10 h-10 rounded-full bg-black/60 hover:bg-[#D4AF37] hover:text-[#14231B] text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/20 active:scale-95"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Photo Index Counter */}
              <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-md text-white text-xs font-mono px-3 py-1.5 rounded-full border border-white/20">
                {activePhotoIdx + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnail Strip (if multiple photos) */}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 bg-[#14231B] overflow-x-auto no-scrollbar border-t border-[#2C3E33]">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    type="button"
                    className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activePhotoIdx === idx
                        ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 scale-102'
                        : 'border-[#3B5244] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ============================================================
             2. TITLE, PRICING & ESSENTIAL BADGES
             ============================================================ */}
          <div className="p-5 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#3B5244] pb-6">
              <div>
                <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider block mb-1">
                  {isSi ? gear.name : gear.sinhalaName}
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F2EB]">
                  {isSi && gear.sinhalaName ? gear.sinhalaName : gear.name}
                </h1>
                <p className="text-xs sm:text-sm text-[#C2BCB0] mt-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{isSi ? 'ලංකාගම සිංහරාජ වන සීමාවට කෙලින්ම ගෙනැවිත් භාරදෙනු ලැබේ' : 'Hand-delivered directly to your stay or campsite in Lankagama'}</span>
                </p>
              </div>

              {/* Price Tag */}
              <div className="shrink-0 bg-[#2C3E33] border border-[#3B5244] rounded-2xl p-4 text-left sm:text-right">
                <span className="text-[10px] text-[#C2BCB0] uppercase tracking-wider block">
                  {isSi ? 'දෛනික කුලිය' : 'Daily Rental'}
                </span>
                <div className="text-2xl font-bold font-mono text-[#D4AF37]">
                  Rs. {gear.pricePerDayLKR.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-[#C2BCB0] font-sans">{isSi ? '/ දිනකට' : '/ day'}</span>
                </div>
              </div>
            </div>

            {/* Quick Spec Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-[#14231B] border border-[#3B5244] rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#2C3E33] text-[#D4AF37] flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#C2BCB0] block uppercase">{isSi ? 'ධාරිතාව' : 'Capacity'}</span>
                  <span className="text-xs font-semibold text-[#F5F2EB]">
                    {gear.capacity || (isSi ? 'පුද්ගලයින් 2-4' : '2-4 Persons')}
                  </span>
                </div>
              </div>

              <div className="bg-[#14231B] border border-[#3B5244] rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#2C3E33] text-[#D4AF37] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#C2BCB0] block uppercase">{isSi ? 'තත්ත්වය' : 'Condition'}</span>
                  <span className="text-xs font-semibold text-[#F5F2EB]">
                    {isSi ? '100% ජලරෝධී සහ පරීක්ෂිත' : 'Waterproof & Tested'}
                  </span>
                </div>
              </div>

              <div className="bg-[#14231B] border border-[#3B5244] rounded-xl p-3 flex items-center gap-3 col-span-2 sm:col-span-1">
                <div className="w-9 h-9 rounded-lg bg-[#2C3E33] text-[#D4AF37] flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#C2BCB0] block uppercase">{isSi ? 'භාරදීම' : 'Delivery'}</span>
                  <span className="text-xs font-semibold text-[#F5F2EB]">
                    {isSi ? 'ලංකාගම තුළම' : 'At Lankagama'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {gear.description && (
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  {isSi ? 'විස්තරය' : 'Gear Overview'}
                </h2>
                <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed">
                  {gear.description}
                </p>
              </div>
            )}

            {/* Included Equipment Checklist */}
            {gear.includes && gear.includes.length > 0 && (
              <div className="space-y-3 bg-[#14231B] p-5 rounded-2xl border border-[#3B5244]">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isSi ? 'කට්ටලයට ඇතුළත් සියලුම අයිතම' : 'Items Included in Package'}</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {gear.includes.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#F5F2EB]">
                      <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span className="leading-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================
               3. MEALS SECTION (OPTIONAL - ONLY SHOWN IF PROVIDED)
               ============================================================ */}
            {gear.meals && (
              <div className="space-y-3 bg-gradient-to-br from-[#1E2A22] to-[#14231B] p-5 rounded-2xl border border-[#D4AF37]/40 shadow-md">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Utensils className="w-4 h-4 text-[#D4AF37]" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    {isSi ? 'ගමේ ආහාර පහසුකම් (Village Meals Available)' : 'Campsite & Village Meals Available'}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#F5F2EB] leading-relaxed font-normal">
                  {gear.meals}
                </p>
                <div className="text-[11px] text-[#C2BCB0] flex items-center gap-1.5 pt-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{isSi ? 'කඳවුරු බැඳීමේදී ඔබට අවශ්‍ය පරිදි උණුසුම් ගමේ ආහාර කලින් ඇණවුම් කළ හැක.' : 'Hot authentic village woodfire meals can be arranged upon request with your booking.'}</span>
                </div>
              </div>
            )}

            {/* Host / Agency Guarantee */}
            <div className="bg-[#14231B] p-4 rounded-xl border border-[#3B5244] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5F2EB]">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isSi ? 'සංචාරක සහය සහ උපදෙස්' : 'Local Nature Guidance & Support'}</span>
                </div>
                <p className="text-xs text-[#C2BCB0] font-normal">
                  {isSi 
                    ? 'කූඩාරම සවිකිරීමට සහ ලංකාගම ආරක්ෂිත කඳවුරු ස්ථාන තෝරාගැනීමට අපගේ ප්‍රදේශවාසී මඟපෙන්වන්නන් සහය වනු ඇත.' 
                    : 'Our native guides will assist you with safe campsite locations and gear assembly in Lankagama.'}
                </p>
              </div>

              <a
                href={whatsappInquireUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] font-semibold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer justify-center"
              >
                <MessageCircle className="w-4 h-4 fill-[#14231B]" />
                <span>{isSi ? 'වට්ස්ඇප් විමසන්න' : 'WhatsApp Agency'}</span>
              </a>
            </div>

          </div>
        </div>

        {/* ============================================================
           STICKY BOTTOM ACTION BAR
           ============================================================ */}
        <div className="sticky bottom-0 z-30 bg-[#1E2A22]/95 backdrop-blur-md border-t border-[#3B5244] p-3 sm:p-4 px-4 sm:px-8 flex items-center justify-between gap-3 shadow-lg">
          <div>
            <span className="text-[10px] text-[#C2BCB0] block uppercase tracking-wider">
              {isSi ? 'දිනකට මිල' : 'Price Per Day'}
            </span>
            <div className="text-lg sm:text-2xl font-bold text-[#D4AF37] font-mono">
              Rs. {gear.pricePerDayLKR.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#C2BCB0] font-sans">{isSi ? '/ දිනකට' : '/ day'}</span>
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
                setTimeout(() => {
                  onBookNow(gear);
                }, 50);
              }}
              className="py-3 px-5 sm:px-7 rounded-xl font-semibold text-xs sm:text-sm text-[#14231B] bg-[#D4AF37] hover:bg-[#C5A880] active:scale-98 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>{isSi ? 'උපකරණ වෙන්කරගන්න' : 'Reserve Equipment'}</span>
              <ArrowRight className="w-4 h-4 text-[#14231B]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
