'use client';

import React, { useState } from 'react';
import { 
  X, ChevronLeft, ChevronRight, MapPin, ShieldCheck, 
  Share2, Sparkles, CheckCircle2, ShoppingBag,
  MessageCircle, ArrowRight, Droplets, Wine, Compass, Check
} from 'lucide-react';
import { KithulProduct } from '@/lib/types';
import { useWhatsApp } from '@/lib/useWhatsApp';
import { useLanguage } from '@/lib/LanguageContext';
import { useModalHistory } from '@/lib/useModalHistory';

interface KithulDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: KithulProduct | null;
  onOrderNow: (product: KithulProduct) => void;
}

export default function KithulDetailModal({ isOpen, onClose, product, onOrderNow }: KithulDetailModalProps) {
  useModalHistory({
    isOpen: Boolean(isOpen && product),
    onClose,
    modalId: product ? `kithul-detail-${product.id}` : 'kithul-detail'
  });

  const { isSi, t } = useLanguage();
  const { getWhatsAppLink } = useWhatsApp();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

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
    `Hello The Sinharaja Collection Lankagama! I am inquiring about "${product.name}" (Rs. ${product.priceLKR.toLocaleString()} / ${product.unit}). Is it currently available for delivery to our villa/camp?`
  );

  const getCategoryDetails = () => {
    switch (product.category) {
      case 'treacle':
        return {
          label: isSi ? 'ශුද්ධ කිතුල් පැණි' : 'Pure Kithul Treacle',
          icon: <Droplets className="w-3.5 h-3.5 text-[#D4AF37]" />,
          badgeColor: 'bg-[#D4AF37] text-[#14231B]'
        };
      case 'jaggery':
        return {
          label: isSi ? 'ගමේ කිතුල් හකුරු' : 'Artisanal Palm Jaggery',
          icon: <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />,
          badgeColor: 'bg-amber-600 text-white'
        };
      case 'toddy':
        return {
          label: isSi ? 'නැවුම් ස්වාභාවික රා' : 'Fresh Rainforest Toddy',
          icon: <Wine className="w-3.5 h-3.5 text-[#D4AF37]" />,
          badgeColor: 'bg-emerald-600 text-white'
        };
      case 'experience':
        return {
          label: isSi ? 'කිතුල් මැදීමේ අත්දැකීම' : 'Tapping & Boiling Tour',
          icon: <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />,
          badgeColor: 'bg-blue-600 text-white'
        };
      default:
        return {
          label: isSi ? 'කිතුල් නිෂ්පාදන' : 'Rainforest Harvest',
          icon: <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />,
          badgeColor: 'bg-[#D4AF37] text-[#14231B]'
        };
    }
  };

  const cat = getCategoryDetails();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      {/* Modal Container */}
      <div className="relative bg-[#1E2A22] text-[#F5F2EB] w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 border border-[#3B5244]">
        
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 bg-[#1E2A22]/95 backdrop-blur-md border-b border-[#3B5244] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#D4AF37] bg-[#2C3E33] px-2.5 py-1 rounded-full border border-[#3B5244] flex items-center gap-1.5">
              {cat.icon}
              <span>{cat.label}</span>
            </span>
            <span className="text-xs text-[#C2BCB0] hidden sm:inline">• Sinharaja Rainforest Harvest</span>
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
             1. PRODUCT PHOTO STAGE
             ============================================================ */}
          <div className="relative bg-[#14231B] group select-none">
            
            {/* Main Stage Image */}
            <div className="relative h-64 sm:h-96 w-full overflow-hidden">
              <img
                src={images[activePhotoIdx]}
                alt={`${product.name} photo ${activePhotoIdx + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E2A22] via-transparent to-black/30 pointer-events-none" />

              {/* Badges on Image */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 pointer-events-none">
                <span className="px-3 py-1.5 rounded-full bg-[#14231B]/90 backdrop-blur-md text-[#D4AF37] text-xs font-bold uppercase tracking-wider border border-[#3B5244] flex items-center gap-1.5 shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{product.purityBadge}</span>
                </span>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${cat.badgeColor} shadow-md`}>
                  {cat.label}
                </span>
              </div>

              {/* Package Volume Pill */}
              <div className="absolute bottom-4 left-4">
                <span className="text-xs font-semibold text-white bg-black/75 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20 shadow-md">
                  📦 {product.weightOrVolume}
                </span>
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
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-md text-white text-xs font-mono px-3 py-1.5 rounded-full border border-white/20">
                  {activePhotoIdx + 1} / {images.length}
                </div>
              )}
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
             2. TITLE, PRICING & ESSENTIAL DETAILS
             ============================================================ */}
          <div className="p-5 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#3B5244] pb-6">
              <div>
                <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider block mb-1">
                  {isSi ? product.name : product.sinhalaName}
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F2EB]">
                  {isSi && product.sinhalaName ? product.sinhalaName : product.name}
                </h1>
                <p className="text-xs sm:text-sm text-[#C2BCB0] mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>{isSi ? 'නිෂ්පාදනය: ' : 'Harvest Origin: '}{product.harvestOrigin}</span>
                </p>
              </div>

              {/* Price Tag */}
              <div className="shrink-0 bg-[#2C3E33] border border-[#3B5244] rounded-2xl p-4 text-left sm:text-right">
                <span className="text-[10px] text-[#C2BCB0] uppercase tracking-wider block">
                  {isSi ? 'මිල' : 'Price'}
                </span>
                <div className="text-2xl font-bold font-mono text-[#D4AF37]">
                  Rs. {product.priceLKR.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-[#C2BCB0] font-sans">/{product.unit}</span>
                </div>
              </div>
            </div>

            {/* Quick Guarantee Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#14231B] border border-[#3B5244] rounded-xl p-3 space-y-1">
                <span className="text-base block">🍯</span>
                <span className="text-xs font-bold text-[#F5F2EB] block">
                  {isSi ? '100% සීනි රහිතයි' : '100% Sugar-Free'}
                </span>
                <span className="text-[10px] text-[#C2BCB0] block">
                  {isSi ? 'ස්වාභාවික පැණි' : 'Pure Fishtail Sap'}
                </span>
              </div>

              <div className="bg-[#14231B] border border-[#3B5244] rounded-xl p-3 space-y-1">
                <span className="text-base block">🪵</span>
                <span className="text-xs font-bold text-[#F5F2EB] block">
                  {isSi ? 'දර ලිපේ පදම් කළ' : 'Woodfire Boiled'}
                </span>
                <span className="text-[10px] text-[#C2BCB0] block">
                  {isSi ? 'පාරම්පරික ක්‍රමවේදය' : 'Artisanal Hearth'}
                </span>
              </div>

              <div className="bg-[#14231B] border border-[#3B5244] rounded-xl p-3 space-y-1">
                <span className="text-base block">🌿</span>
                <span className="text-xs font-bold text-[#F5F2EB] block">
                  {isSi ? 'වනගත කිතුල්' : 'Wild Rainforest'}
                </span>
                <span className="text-[10px] text-[#C2BCB0] block">
                  {isSi ? 'ලංකාගම ගම්මානයෙන්' : 'Lankagama Tappers'}
                </span>
              </div>

              <div className="bg-[#14231B] border border-[#3B5244] rounded-xl p-3 space-y-1">
                <span className="text-base block">🏡</span>
                <span className="text-xs font-bold text-[#F5F2EB] block">
                  {isSi ? 'නවාතැනටම භාරදීම' : 'To Your Stay'}
                </span>
                <span className="text-[10px] text-[#C2BCB0] block">
                  {isSi ? 'විලා / කඳවුරු භූමියට' : 'Direct Delivery'}
                </span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  {isSi ? 'නිෂ්පාදන විස්තරය' : 'About This Delicacy'}
                </h2>
                <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Delivery Note Highlight Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1E2A22] to-[#14231B] border border-[#D4AF37]/40 shadow-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#F5F2EB] block">
                  {isSi ? 'විලා හෝ කඳවුරු භූමියටම ගෙනැවිත් දීම' : 'Direct Delivery to your Veranda'}
                </span>
                <p className="text-xs text-[#C2BCB0] leading-relaxed">
                  {product.deliveryNote}
                </p>
              </div>
            </div>

            {/* Authenticity Guarantee Note */}
            <div className="bg-[#14231B] p-4 rounded-xl border border-[#3B5244] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5F2EB]">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isSi ? '100% තත්ත්ව සහතිකය සහ සහාය' : 'Authenticity Guarantee'}</span>
                </div>
                <p className="text-xs text-[#C2BCB0] font-normal">
                  {isSi 
                    ? 'අපගේ කිතුල් නිෂ්පාදන කිසිදු සීනි හෝ කෘත්‍රිම රසකාරක නොමැතිව පිරිසිදුව පාරම්පරිකව නිපදවූ බවට වගකියනු ලැබේ.' 
                    : 'Unadulterated harvest direct from native tappers. Guaranteed cane-sugar-free and delivered fresh.'}
                </p>
              </div>

              <a
                href={whatsappInquireUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] font-semibold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer justify-center"
              >
                <MessageCircle className="w-4 h-4 fill-[#14231B]" />
                <span>{isSi ? 'වට්ස්ඇප් විමසන්න' : 'WhatsApp Us'}</span>
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
              {isSi ? 'ඒකකයක මිල' : 'Price'}
            </span>
            <div className="text-lg sm:text-2xl font-bold text-[#D4AF37] font-mono">
              Rs. {product.priceLKR.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#C2BCB0] font-sans">/{product.unit}</span>
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
                  onOrderNow(product);
                }, 50);
              }}
              className="py-3 px-5 sm:px-7 rounded-xl font-semibold text-xs sm:text-sm text-[#14231B] bg-[#D4AF37] hover:bg-[#C5A880] active:scale-98 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <ShoppingBag className="w-4 h-4 text-[#14231B]" />
              <span>
                {product.category === 'experience'
                  ? (isSi ? 'අත්දැකීම වෙන්කරන්න' : 'Book Experience')
                  : (isSi ? 'විලා එකට ඇණවුම් කරන්න' : 'Order to Villa')}
              </span>
              <ArrowRight className="w-4 h-4 text-[#14231B]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
