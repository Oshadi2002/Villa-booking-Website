'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Search, MessageCircle, Menu, X } from 'lucide-react';
import { useWhatsApp } from '@/lib/useWhatsApp';
import { useLanguage, LanguageSwitcher } from '@/lib/LanguageContext';

interface NavbarProps {
  onOpenTrackModal: () => void;
}

export default function Navbar({ onOpenTrackModal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [activeScrollSection, setActiveScrollSection] = useState<string>('');
  const { getWhatsAppLink } = useWhatsApp();
  const { isSi, t } = useLanguage();

  const activeSection = pathname === '/reviews'
    ? 'reviews'
    : pathname === '/blogs'
    ? 'blogs'
    : pathname === '/'
    ? activeScrollSection
    : '';

  useEffect(() => {
    if (pathname !== '/') return;

    const sectionIds = ['villas', 'kithul', 'camping', 'why-us'];
    const handleScroll = () => {
      if (window.scrollY < 160) {
        setActiveScrollSection('');
        return;
      }

      let current = '';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Active when the section occupies the upper reading area below the 80px navbar
          if (rect.top <= 260 && rect.bottom >= 120) {
            current = id;
            break;
          }
        }
      }
      setActiveScrollSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (pathname === '/') {
      e.preventDefault();
      const id = hash.replace(/^#/, '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        try {
          window.history.pushState(null, '', hash);
        } catch {}
      }
    }
  };

  const handleMobileSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    setMobileMenuOpen(false);
    if (pathname === '/') {
      e.preventDefault();
      const id = hash.replace(/^#/, '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        try {
          window.history.pushState(null, '', hash);
        } catch {}
      }
    }
  };

  const getNavClass = (sectionKey: string) => {
    const isActive = activeSection === sectionKey;
    return `transition-all py-1.5 px-1 relative whitespace-nowrap shrink-0 hover:after:w-full after:h-0.5 after:bg-[#D4AF37] after:absolute after:bottom-0 after:left-0 after:transition-all ${
      isActive
        ? 'text-[#D4AF37] font-bold after:w-full'
        : 'text-[#F5F2EB]/90 hover:text-[#D4AF37] after:w-0'
    }`;
  };

  const getMobileNavClass = (sectionKey: string) => {
    const isActive = activeSection === sectionKey;
    return `p-2.5 rounded-xl transition-colors flex items-center justify-between ${
      isActive
        ? 'bg-[#2C3E33] text-[#D4AF37] font-bold'
        : 'text-[#F5F2EB]/90 hover:bg-[#2C3E33] hover:text-[#D4AF37]'
    }`;
  };

  const whatsappUrl = getWhatsAppLink('Hello The Sinharaja Collection Lankagama! I would like to inquire about stays, camping gear, and tour guides.');

  return (
    <header className="sticky top-0 z-40 bg-[#14231B]/95 backdrop-blur-md text-[#F5F2EB] border-b border-[#2C3E33] shadow-md transition-all">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4 lg:gap-6">
          
          {/* Brand Logo & Editorial Typography */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 mr-1 sm:mr-2 xl:mr-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2C3E33] border border-[#3B5244] flex items-center justify-center text-[#D4AF37] shadow-inner group-hover:scale-102 transition-transform shrink-0">
              <Compass className="w-5 h-5 text-[#D4AF37]" strokeWidth={1.75} />
            </div>
            <div className="shrink-0">
              <span className="text-base sm:text-lg xl:text-xl font-serif tracking-tight text-[#F5F2EB] font-medium block whitespace-nowrap">
                The Sinharaja <span className="italic font-normal text-[#D4AF37]">Collection</span>
              </span>
              <p className="text-[10px] text-[#C2BCB0] font-normal tracking-wide hidden 2xl:block whitespace-nowrap">
                <span className="text-[#D4AF37] font-medium tracking-normal mr-1">ලංකාගම</span>
                <span className="text-[#7A8A7F]">•</span>
                <span className="ml-1">Rainforest Gateway • Sri Lanka</span>
              </p>
            </div>
          </Link>

          {/* Clean Desktop Navigation Links with dynamic section scroll spy */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 2xl:gap-6 text-xs xl:text-[13px] tracking-wide font-medium shrink-0">
            <Link 
              href="/#villas" 
              onClick={(e) => handleSectionClick(e, '#villas')}
              className={getNavClass('villas')}
            >
              {t('nav.villas', 'Villas & Stays')}
            </Link>
            <Link 
              href="/#kithul" 
              onClick={(e) => handleSectionClick(e, '#kithul')}
              className={getNavClass('kithul')}
            >
              {t('nav.kithul', 'Kithul & Toddy')}
            </Link>
            <Link 
              href="/#camping" 
              onClick={(e) => handleSectionClick(e, '#camping')}
              className={getNavClass('camping')}
            >
              {t('nav.camping', 'Camping Gear')}
            </Link>
            <Link 
              href="/#why-us" 
              onClick={(e) => handleSectionClick(e, '#why-us')}
              className={getNavClass('why-us')}
            >
              {t('nav.whyUs', 'Why Us')}
            </Link>
            <Link href="/blogs" className={getNavClass('blogs')}>
              {t('nav.blogs', 'Blogs & Guides')}
            </Link>
            <Link href="/reviews" className={getNavClass('reviews')}>
              {t('nav.reviews', 'Reviews & FAQ')}
            </Link>
          </nav>

          {/* Action CTAs: Language Switcher, Track Booking & WhatsApp */}
          <div className="hidden sm:flex items-center gap-2 xl:gap-3 shrink-0 ml-auto">
            {/* Global Language Toggle Switch */}
            <LanguageSwitcher />

            {/* Status Tracking */}
            <button
              onClick={onOpenTrackModal}
              className="flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 py-1.5 text-xs font-semibold rounded-xl text-[#F5F2EB] hover:text-white border border-[#3B5244] hover:border-[#D4AF37]/60 bg-[#2C3E33] hover:bg-[#354A3D] transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0"
              title={t('nav.track', 'Track Booking')}
            >
              <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden xl:inline">{t('nav.track', 'Track Booking')}</span>
            </button>

            {/* Direct WhatsApp Concierge */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 xl:gap-2 px-3 xl:px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
              title="Direct WhatsApp Concierge"
            >
              <MessageCircle className="w-4 h-4 fill-[#14231B] text-[#D4AF37]" />
              <span className="hidden xl:inline">{t('nav.whatsapp', 'WhatsApp Agency')}</span>
            </a>
          </div>

          {/* Mobile & Tablet Menu Controls */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            <LanguageSwitcher className="sm:hidden" />
            <button
              onClick={onOpenTrackModal}
              className="sm:hidden p-2 rounded-xl bg-[#2C3E33] text-[#F5F2EB] border border-[#3B5244] hover:border-[#D4AF37]"
              title="Track Booking"
            >
              <Search className="w-4 h-4 text-[#D4AF37]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#2C3E33] text-[#F5F2EB] border border-[#3B5244] hover:border-[#D4AF37] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#14231B] border-b border-[#2C3E33] px-5 pt-4 pb-7 space-y-5 animate-in slide-in-from-top-3">
          {/* Mobile Language Switcher Row */}
          <div className="flex items-center justify-between pb-3 border-b border-[#2C3E33]">
            <span className="text-xs text-[#C2BCB0] uppercase font-semibold tracking-wider">
              {isSi ? 'භාෂාව තෝරන්න' : 'Select Language'}
            </span>
            <LanguageSwitcher />
          </div>

          <nav className="flex flex-col gap-2 text-xs uppercase tracking-[0.12em] font-semibold">
            <Link 
              href="/#villas" 
              onClick={(e) => handleMobileSectionClick(e, '#villas')}
              className={getMobileNavClass('villas')}
            >
              <span>{t('nav.villas', 'Villas & Stays')}</span>
            </Link>
            <Link 
              href="/#kithul" 
              onClick={(e) => handleMobileSectionClick(e, '#kithul')}
              className={getMobileNavClass('kithul')}
            >
              <span>{t('nav.kithul', 'Kithul & Toddy')}</span>
            </Link>
            <Link 
              href="/#camping" 
              onClick={(e) => handleMobileSectionClick(e, '#camping')}
              className={getMobileNavClass('camping')}
            >
              <span>{t('nav.camping', 'Camping Gear')}</span>
            </Link>
            <Link 
              href="/#why-us" 
              onClick={(e) => handleMobileSectionClick(e, '#why-us')}
              className={getMobileNavClass('why-us')}
            >
              <span>{t('nav.whyUs', 'Why Us')}</span>
            </Link>
            <Link 
              href="/blogs" 
              onClick={() => setMobileMenuOpen(false)}
              className={getMobileNavClass('blogs')}
            >
              <span>{t('nav.blogs', 'Blogs & Guides')}</span>
            </Link>
            <Link 
              href="/reviews" 
              onClick={() => setMobileMenuOpen(false)}
              className={getMobileNavClass('reviews')}
            >
              <span>{t('nav.reviews', 'Reviews & FAQ')}</span>
            </Link>
          </nav>

          <div className="pt-3 flex flex-col gap-2.5 border-t border-[#2C3E33]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrackModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#3B5244] text-[#F5F2EB] text-xs font-semibold bg-[#2C3E33]"
            >
              <Search className="w-4 h-4 text-[#D4AF37]" />
              <span>{t('nav.track', 'Track Booking')}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#D4AF37] text-[#14231B] font-bold text-xs shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-[#14231B]" />
              <span>Connect on WhatsApp</span>
            </a>

            <Link
              href="/admin"
              className="text-center text-[11px] text-[#C2BCB0] hover:text-[#F5F2EB] py-1"
            >
              Agency Staff Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
