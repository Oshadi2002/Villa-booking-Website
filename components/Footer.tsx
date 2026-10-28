'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Phone, Mail, MapPin, MessageCircle, Lock, ShieldCheck } from 'lucide-react';
import { AGENCY_CONFIG } from '@/lib/data';
import { useWhatsApp } from '@/lib/useWhatsApp';

export default function Footer() {
  const { formattedNumber, getWhatsAppLink } = useWhatsApp();
  const whatsappUrl = getWhatsAppLink('Hello The Sinharaja Collection Lankagama! I would like to make an inquiry.');

  return (
    <footer className="bg-[#14231B] text-[#F5F2EB] border-t border-[#2C3E33] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#2C3E33]">
          
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2C3E33] border border-[#3B5244] flex items-center justify-center text-[#D4AF37]">
                <Compass className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <span className="font-serif text-xl text-[#F5F2EB] font-medium">
                The Sinharaja <span className="text-[#D4AF37] italic font-normal">Collection</span>
              </span>
            </div>
            <p className="text-xs text-[#C2BCB0] leading-relaxed font-normal">
              <span className="text-[#D4AF37] font-semibold mr-1.5">ලංකාගම</span> • {AGENCY_CONFIG.sinhalaName}. Official agency for peaceful riverside stays, camping gear rentals, pure kithul, and trusted local guides in Lankagama.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D4AF37]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Sinharaja Buffer Zone Verified Agency</span>
            </div>
          </div>

          {/* Service Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F5F2EB] uppercase tracking-[0.16em]">Directory</h4>
            <ul className="space-y-2 text-xs text-[#C2BCB0]">
              <li><Link href="/#villas" className="hover:text-[#D4AF37] transition-colors">Private Villas & Stays</Link></li>
              <li><Link href="/#kithul" className="hover:text-[#D4AF37] transition-colors">Pure Kithul & Toddy</Link></li>
              <li><Link href="/#camping" className="hover:text-[#D4AF37] transition-colors">Expedition Camping Sets</Link></li>
              <li><Link href="/blogs" className="hover:text-[#D4AF37] transition-colors">Blogs & Waterfalls Guide</Link></li>
              <li><Link href="/reviews" className="hover:text-[#D4AF37] transition-colors">Guest Reviews & FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F5F2EB] uppercase tracking-[0.16em]">Direct Contact</h4>
            <div className="space-y-2.5 text-xs text-[#C2BCB0]">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>{AGENCY_CONFIG.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">
                  WhatsApp Direct Inquiry
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>{AGENCY_CONFIG.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{AGENCY_CONFIG.address}</span>
              </div>
            </div>
          </div>

          {/* Admin Management */}
          <div className="space-y-3 bg-[#2C3E33] p-5 rounded-2xl border border-[#3B5244]">
            <h4 className="text-xs font-semibold text-[#F5F2EB] uppercase tracking-[0.16em] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Agency Administration</span>
            </h4>
            <p className="text-[11px] text-[#C2BCB0] leading-relaxed font-normal">
              Internal portal for agency staff to verify host room availability, approve pending reservations, and dispatch customer notifications.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl bg-[#1E2A22] hover:bg-[#14231B] text-[#F5F2EB] text-xs font-medium transition-all border border-[#3B5244] hover:border-[#D4AF37]"
            >
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Agency Staff Login</span>
            </Link>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9EA89F] gap-4 font-normal">
          <p>© 2026 The Sinharaja Collection Lankagama. All rights reserved.</p>
          <p>
            Dedicated to community eco-tourism in Lankagama, Sri Lanka.
          </p>
        </div>
      </div>
    </footer>
  );
}
