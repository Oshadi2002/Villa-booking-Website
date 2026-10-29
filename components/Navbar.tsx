'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Search, MessageCircle, Menu, X } from 'lucide-react';
import { useWhatsApp } from '@/lib/useWhatsApp';

interface NavbarProps {
  onOpenTrackModal: () => void;
}

export default function Navbar({ onOpenTrackModal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [activeScrollSection, setActiveScrollSection] = useState<string>('');
  const { getWhatsAppLink } = useWhatsApp();

  const activeSection = pathname === '/reviews'
    ? 'reviews'
    : pathname === '/blogs'
    ? 'blogs'
    : pathname === '/'
    ? activeScrollSection
    : '';

  useEffect(() => {
    if (pathname !== '/') return;

    const sectionIds = ['why-us', 'villas', 'kithul', 'camping'];
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

  const getNavClass = (sectionKey: string) => {
    const isActive = activeSection === sectionKey;
    return `transition-all py-1 relative hover:after:w-full after:h-0.5 after:bg-[#D4AF37] after:absolute after:bottom-0 after:left-0 after:transition-all ${
      isActive
        ? 'text-[#D4AF37] font-bold after:w-full'
        : 'text-[#F5F2EB]/90 hover:text-[#D4AF37] after:w-0'
    }`;
  };

  const getMobileNavClass = (sectionKey: string) => {
    const isActive = activeSection === sectionKey;
    return `p-2 rounded-lg transition-colors flex items-center justify-between ${
      isActive
        ? 'bg-[#2C3E33] text-[#D4AF37] font-bold'
        : 'text-[#F5F2EB]/90 hover:bg-[#2C3E33] hover:text-[#D4AF37]'
    }`;
  };

  const whatsappUrl = getWhatsAppLink('Hello The Sinharaja Collection Lankagama! I would like to inquire about stays, camping gear, and tour guides.');

  return (
    <header className="sticky top-0 z-40 bg-[#14231B]/95 backdrop-blur-md text-[#F5F2EB] border-b border-[#2C3E33] shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          
          {/* Brand Logo & Editorial Typography */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 group shrink min-w-0 mr-1 sm:mr-3 lg:mr-4 xl:mr-6">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2C3E33] border border-[#3B5244] flex items-center justify-center text-[#D4AF37] shadow-inner group-hover:scale-102 transition-transform shrink-0">
              <Compass className="w-5 h-5 text-[#D4AF37]" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-xl xl:text-2xl font-serif tracking-tight text-[#F5F2EB] font-medium block whitespace-nowrap">
                The Sinharaja <span className="italic font-normal text-[#D4AF37]">Collection</span>
              </span>
              <p className="text-[11px] text-[#C2BCB0] font-normal tracking-wide hidden md:block whitespace-nowrap">
                <span className="text-[#D4AF37] font-medium tracking-normal mr-1">ලංකාගම</span>
                <span className="text-[#7A8A7F]">•</span>
                <span className="ml-1">Rainforest Gateway • Sri Lanka</span>
              </p>
            </div>
          </Link>

          {/* Clean Desktop Navigation Links with dynamic section scroll spy */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 2xl:gap-6 text-[11px] xl:text-xs uppercase tracking-wide font-semibold shrink min-w-0">
            <Link href="/#why-us" className={getNavClass('why-us')}>
              Why Us
            </Link>
            <Link href="/#villas" className={getNavClass('villas')}>
              Villas & Stays
            </Link>
            <Link href="/#kithul" className={getNavClass('kithul')}>
              Kithul & Toddy
            </Link>
            <Link href="/#camping" className={getNavClass('camping')}>
              Camping Gear
            </Link>
            <Link href="/blogs" className={getNavClass('blogs')}>
              Blogs & Guides
            </Link>
            <Link href="/reviews" className={getNavClass('reviews')}>
              Reviews & FAQ
            </Link>
          </nav>

          {/* Action CTAs: Track Booking & WhatsApp */}
          <div className="hidden sm:flex items-center gap-2 xl:gap-3 shrink-0 ml-auto lg:ml-2 xl:ml-4">
            {/* Status Tracking */}
            <button
              onClick={onOpenTrackModal}
              className="flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 py-2 text-xs font-semibold rounded-xl text-[#F5F2EB] hover:text-white border border-[#3B5244] hover:border-[#D4AF37]/60 bg-[#2C3E33] hover:bg-[#354A3D] transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden xl:inline">Track Booking</span>
              <span className="xl:hidden">Track</span>
            </button>

            {/* Direct WhatsApp Concierge */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 py-2 text-xs font-bold rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 fill-[#14231B] text-[#D4AF37]" />
              <span className="hidden xl:inline">WhatsApp Agency</span>
              <span className="xl:hidden">WhatsApp</span>
            </a>
          </div>

          {/* Mobile & Tablet Menu Controls */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
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
          <nav className="flex flex-col gap-2 text-xs uppercase tracking-[0.12em] font-semibold">
            <Link 
              href="/#why-us" 
              onClick={() => setMobileMenuOpen(false)}
              className={getMobileNavClass('why-us')}
            >
              <span>Why Choose Us</span>
            </Link>
            <Link 
              href="/#villas" 
              onClick={() => setMobileMenuOpen(false)}
              className={getMobileNavClass('villas')}
            >
              <span>Villas & Eco-Lodges</span>
            </Link>
            <Link 
              href="/#kithul" 
              onClick={() => setMobileMenuOpen(false)}
              className={getMobileNavClass('kithul')}
            >
              <span>Artisanal Kithul & Toddy</span>
            </Link>
            <Link 
              href="/#camping" 
              onClick={() => setMobileMenuOpen(false)}
              className={getMobileNavClass('camping')}
            >
              <span>Camping Gear Rentals</span>
            </Link>
            <Link 
              href="/blogs" 
              onClick={() => setMobileMenuOpen(false)}
              className={getMobileNavClass('blogs')}
            >
              <span>Waterfalls & Travel Guides</span>
            </Link>
            <Link 
              href="/reviews" 
              onClick={() => setMobileMenuOpen(false)}
              className={getMobileNavClass('reviews')}
            >
              <span>Guest Reviews & FAQ</span>
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
              <span>Track Your Booking Status</span>
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
