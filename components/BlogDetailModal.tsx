'use client';

import React, { useState } from 'react';
import { 
  X, Share2, Sparkles, AlertCircle, Clock, 
  User, Calendar, Compass, ArrowRight, Check,
  Languages, ChevronLeft, ChevronRight
} from 'lucide-react';
import { BlogPost } from '@/lib/types';
import { AGENCY_CONFIG } from '@/lib/data';
import { useModalHistory } from '@/lib/useModalHistory';

interface BlogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: BlogPost | null;
  initialLang?: 'en' | 'si';
}

export default function BlogDetailModal({ 
  isOpen, 
  onClose, 
  blog,
  initialLang = 'en'
}: BlogDetailModalProps) {
  const [lang, setLang] = useState<'en' | 'si'>(initialLang);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  useModalHistory({
    isOpen: Boolean(isOpen && blog),
    onClose,
    modalId: blog ? `blog-${blog.id}` : 'blog-detail'
  });

  if (!isOpen || !blog) return null;

  const images = blog.images && blog.images.length > 0 ? blog.images : [blog.imageUrl];

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/blogs#${blog.id}`;
      navigator.clipboard?.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Determine language-specific content
  const isSi = lang === 'si';
  const displayTitle = isSi && blog.sinhalaTitle ? blog.sinhalaTitle : blog.title;
  const secondaryTitle = isSi ? blog.title : blog.sinhalaTitle;
  const displaySummary = isSi && blog.summarySi ? blog.summarySi : blog.summary;
  const displayContent = isSi && blog.contentSi ? blog.contentSi : (blog.content || blog.summary);
  const displayCaution = isSi && blog.cautionSi ? blog.cautionSi : blog.caution;
  const displayAuthor = isSi && blog.authorSi ? blog.authorSi : blog.author;
  const displayHighlights = isSi && blog.highlightsSi && blog.highlightsSi.length > 0 
    ? blog.highlightsSi 
    : blog.highlights;

  const paragraphs = displayContent
    ? displayContent.split('\n\n').filter(p => p.trim().length > 0)
    : [displaySummary];

  const whatsappInquireUrl = `https://wa.me/${AGENCY_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hello The Sinharaja Collection! I read your field guide "${blog.title}" and would like to arrange a guided trek / visit with a local guide.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Modal Container */}
      <div className="relative bg-[#1E2A22] text-[#F5F2EB] w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 border border-[#3B5244]">
        
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 bg-[#1E2A22]/95 backdrop-blur-md border-b border-[#3B5244] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          
          {/* Badge & Category */}
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-[#D4AF37] bg-[#14231B] px-3 py-1 rounded-full border border-[#3B5244] truncate">
              {blog.category}
            </span>
            <span className="text-xs text-[#9EA89F] hidden sm:inline">•</span>
            <span className="text-xs text-[#9EA89F] hidden sm:inline">{blog.badge}</span>
          </div>

          {/* Controls: Language Toggle, Share, Close */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center rounded-full bg-[#14231B] p-1 border border-[#3B5244]">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#D4AF37] text-[#14231B] shadow-xs'
                    : 'text-[#9EA89F] hover:text-[#F5F2EB]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('si')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  lang === 'si'
                    ? 'bg-[#D4AF37] text-[#14231B] shadow-xs'
                    : 'text-[#9EA89F] hover:text-[#F5F2EB]'
                }`}
              >
                සිංහල
              </button>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-[#2C3E33] text-[#F5F2EB] transition-colors text-xs flex items-center gap-1 cursor-pointer border border-transparent hover:border-[#3B5244]"
              title="Share"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4 text-[#D4AF37]" />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#2C3E33] hover:bg-[#3B5244] text-[#F5F2EB] transition-colors cursor-pointer border border-[#3B5244]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-8 space-y-6">
          
          {/* Photo Stage */}
          <div className="relative rounded-2xl overflow-hidden bg-[#14231B] border border-[#3B5244]/80 shadow-lg group">
            <div className="relative h-60 sm:h-80 w-full overflow-hidden">
              <img
                src={images[activePhotoIdx]}
                alt={displayTitle}
                className="w-full h-full object-cover transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14231B]/90 via-transparent to-transparent" />
            </div>

            {/* Carousel navigation arrows if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActivePhotoIdx((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoIdx((prev) => (prev + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Photo indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIdx(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activePhotoIdx === i ? 'w-5 bg-[#D4AF37]' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Gallery Thumbnail Strip if multiple photos */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActivePhotoIdx(i)}
                  className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activePhotoIdx === i
                      ? 'border-[#D4AF37] scale-102 shadow-md ring-2 ring-[#D4AF37]/40'
                      : 'border-[#3B5244] opacity-60 hover:opacity-100 hover:border-[#D4AF37]/60'
                  }`}
                >
                  <img src={img} alt={`Gallery photo ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Article Header & Metadata */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#A6B2A8]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                {blog.readTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                {blog.publishedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                {displayAuthor}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#F5F2EB] leading-tight">
              {displayTitle}
            </h1>

            {secondaryTitle && (
              <p className="text-sm font-medium text-[#D4AF37]/90 italic">
                {secondaryTitle}
              </p>
            )}
          </div>

          {/* Quick Summary Lead Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#14231B] border border-[#3B5244] text-[#C2BCB0] text-sm sm:text-base leading-relaxed">
            <p className="font-normal italic">
              &ldquo;{displaySummary}&rdquo;
            </p>
          </div>

          {/* Key Highlights */}
          {displayHighlights && displayHighlights.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#16271E] border border-[#2C3E33] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>{isSi ? 'විශේෂ ආකර්ෂණ සහ කරුණු' : 'Key Highlights & Features'}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {displayHighlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#F5F2EB]">
                    <span className="text-[#D4AF37] mt-0.5">•</span>
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Article Content */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9EA89F] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#D4AF37]" />
              <span>{isSi ? 'සම්පූර්ණ සංචාරක සටහන' : 'Field Notes & Guide Details'}</span>
            </h3>

            <div className="space-y-4 text-sm sm:text-base text-[#D4CFCE] leading-relaxed font-normal">
              {paragraphs.map((p, idx) => (
                <p key={idx} className="leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Field Advice & Safety Caution */}
          {displayCaution && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#2A1E1E]/80 border border-red-900/50 text-xs sm:text-sm text-amber-200/95 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-300 font-bold mb-1">
                  {isSi ? 'ආරක්ෂිත උපදෙස් සහ පූර්ව සූදානම:' : 'Field Advice & Safety Caution:'}
                </strong>
                <span>{displayCaution}</span>
              </div>
            </div>
          )}

          {/* Action Callout: WhatsApp Guide Booking */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#14231B] to-[#1E2A22] border border-[#D4AF37]/40 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm sm:text-base font-bold text-[#F5F2EB]">
                {isSi ? 'මෙම ස්ථානය නැරඹීමට පළපුරුදු මඟපෙන්වන්නෙකු අවශ්‍යද?' : 'Want to explore this spot with a native guide?'}
              </h4>
              <p className="text-xs text-[#A6B2A8]">
                {isSi ? 'ලංකාගම ප්‍රදේශවාසී මඟපෙන්වන්නන් සමඟ ආරක්ෂිතව සංචාරය කරන්න.' : 'Reserve an accredited Sinharaja local naturalist for your trek.'}
              </p>
            </div>

            <a
              href={whatsappInquireUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <span>{isSi ? 'වට්ස්ඇප් මගින් මඟපෙන්වන්නෙකු වෙන්කරන්න' : 'Hire Guide via WhatsApp'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
