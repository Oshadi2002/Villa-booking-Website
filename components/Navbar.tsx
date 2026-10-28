'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, Search, MessageCircle, Menu, X } from 'lucide-react';
import { useWhatsApp } from '@/lib/useWhatsApp';

interface NavbarProps {
  onOpenTrackModal: () => void;
}

export default function Navbar({ onOpenTrackModal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getWhatsAppLink } = useWhatsApp();

  const whatsappUrl = getWhatsAppLink('Hello The Sinharaja Collection Lankagama! I would like to inquire about stays, camping gear, and tour guides.');

  return (
    <header className="sticky top-0 z-40 bg-[#14231B]/95 backdrop-blur-md text-[#F5F2EB] border-b border-[#2C3E33] shadow-md transition-all">
      {/* Full width container with generous padding to push action buttons to the right corner */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo & Editorial Typography */}
          <Link href="/" className="flex items-center gap-3.5 group shrink-0 mr-4 lg:mr-6 xl:mr-10">
            <div className="w-10 h-10 rounded-xl bg-[#2C3E33] border border-[#3B5244] flex items-center justify-center text-[#D4AF37] shadow-inner group-hover:scale-102 transition-transform">
              <Compass className="w-5 h-5 text-[#D4AF37]" strokeWidth={1.75} />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-serif tracking-tight text-[#F5F2EB] font-medium block">
                The Sinharaja <span className="italic font-normal text-[#D4AF37]">Collection</span>
              </span>
              <p className="text-[11px] text-[#C2BCB0] font-normal tracking-wide hidden sm:block">
                <span className="text-[#D4AF37] font-medium tracking-normal mr-1">ලංකාගම</span>
                <span className="text-[#7A8A7F]">•</span>
                <span className="ml-1">Rainforest Gateway • Sri Lanka</span>
              </p>
            </div>
          </Link>

          {/* Clean Desktop Navigation Links with generous breathing room */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6 2xl:gap-8 text-[11px] xl:text-xs uppercase tracking-[0.08em] xl:tracking-[0.14em] font-semibold text-[#F5F2EB]/90 shrink-0">
            <Link href="/#why-us" className="hover:text-[#D4AF37] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#D4AF37] after:absolute after:bottom-0 after:left-0 after:transition-all">
              Why Us
            </Link>
            <Link href="/#villas" className="hover:text-[#D4AF37] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#D4AF37] after:absolute after:bottom-0 after:left-0 after:transition-all">
              Villas & Stays
            </Link>
            <Link href="/#kithul" className="hover:text-[#D4AF37] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#D4AF37] after:absolute after:bottom-0 after:left-0 after:transition-all text-[#D4AF37]">
              Kithul & Toddy
            </Link>
            <Link href="/#camping" className="hover:text-[#D4AF37] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#D4AF37] after:absolute after:bottom-0 after:left-0 after:transition-all">
              Camping Gear
            </Link>
            <Link href="/blogs" className="hover:text-[#D4AF37] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#D4AF37] after:absolute after:bottom-0 after:left-0 after:transition-all">
              Blogs & Guides
            </Link>
            <Link href="/reviews" className="hover:text-[#D4AF37] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#D4AF37] after:absolute after:bottom-0 after:left-0 after:transition-all">
              Reviews & FAQ
            </Link>
          </nav>

          {/* Action CTAs: Pushed to the right corner */}
          <div className="hidden sm:flex items-center gap-2.5 xl:gap-3 shrink-0 ml-auto lg:ml-4">
            {/* Status Tracking */}
            <button
              onClick={onOpenTrackModal}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-[#F5F2EB] hover:text-white border border-[#3B5244] hover:border-[#D4AF37]/60 bg-[#2C3E33] hover:bg-[#354A3D] transition-all cursor-pointer shadow-xs"
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
              className="flex items-center gap-2 px-3.5 xl:px-4 py-2 text-xs font-bold rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 fill-[#14231B] text-[#D4AF37]" />
              <span>WhatsApp Agency</span>
            </a>
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenTrackModal}
              className="p-2 rounded-xl bg-[#2C3E33] text-[#F5F2EB] border border-[#3B5244]"
              title="Track Booking"
            >
              <Search className="w-4 h-4 text-[#D4AF37]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#2C3E33] text-[#F5F2EB] border border-[#3B5244]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#14231B] border-b border-[#2C3E33] px-5 pt-4 pb-7 space-y-5 animate-in slide-in-from-top-3">
          <nav className="flex flex-col gap-3.5 text-xs uppercase tracking-[0.14em] font-semibold text-[#F5F2EB]/90">
            <a 
              href="#why-us" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#2C3E33]"
            >
              Why Choose Us
            </a>
            <Link 
              href="/#villas" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#2C3E33]"
            >
              Villas & Eco-Lodges
            </Link>
            <Link 
              href="/#kithul" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#2C3E33] text-[#D4AF37]"
            >
              Artisanal Kithul & Toddy
            </Link>
            <Link 
              href="/#camping" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#2C3E33]"
            >
              Camping Gear Rentals
            </Link>
            <Link 
              href="/blogs" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#2C3E33]"
            >
              Waterfalls & Travel Guides
            </Link>
            <Link 
              href="/reviews" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#2C3E33]"
            >
              Guest Reviews & FAQ
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
