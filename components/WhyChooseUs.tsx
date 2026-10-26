'use client';

import React from 'react';
import { 
  CheckCircle2, Sparkles, Home, ShoppingBag, 
  Wine, Tent, Compass, ShieldCheck, ArrowRight,
  Clock, HeartHandshake, PhoneCall
} from 'lucide-react';
import { AGENCY_CONFIG } from '@/lib/data';

interface WhyChooseUsProps {
  onExploreVillas?: () => void;
  onExploreKithul?: () => void;
  onExploreCamping?: () => void;
}

export default function WhyChooseUs({ onExploreVillas, onExploreKithul, onExploreCamping }: WhyChooseUsProps) {
  const whatsappUrl = `https://wa.me/${AGENCY_CONFIG.whatsappNumber}?text=${encodeURIComponent('Hello The Sinharaja Collection Lankagama! I want to organize a trip with stays, pure kithul delivery, and camping gear.')}`;

  const pillars = [
    {
      icon: Home,
      title: 'Villas & Nature Stays',
      sinhalaTitle: 'ලංකාගම හොඳම නවාතැන්',
      description: 'Carefully vetted riverside chalets and waterfall-view eco lodges bordering Sinharaja Rainforest. Verified vacancy and transparent pricing.',
      benefit: 'River bathing pools & home-cooked meals included',
      ctaText: 'View Stays',
      href: '#villas',
      onClick: onExploreVillas,
      badge: 'Handpicked Stays'
    },
    {
      icon: ShoppingBag,
      title: '100% Pure Kithul Direct to Villa',
      sinhalaTitle: 'විලා එකටම පිරිසිදු කිතුල් පැණි & හකුරු',
      description: 'Zero added sugar, zero chemicals. Pure organic Kithul treacle and solid jaggery halves tapped in Lankagama, delivered right to your villa door.',
      benefit: 'Doorstep delivery to your room or campsite',
      ctaText: 'Order Kithul',
      href: '#kithul',
      onClick: onExploreKithul,
      badge: 'Villa Doorstep Delivery'
    },
    {
      icon: Wine,
      title: 'Fresh Kithul Raa & Tapping Tour',
      sinhalaTitle: 'නැවුම් කිතුල් රා සහ සජීවී අත්දැකීම',
      description: 'Experience genuine Sinharaja palm culture. Enjoy freshly tapped sweet morning toddy delivered chilled, or join a master tapper on a live tree-climbing session.',
      benefit: 'Tapped fresh at dawn from rainforest palms',
      ctaText: 'Toddy Experience',
      href: '#kithul',
      onClick: onExploreKithul,
      badge: 'Exclusive Privilege'
    },
    {
      icon: Tent,
      title: 'Expedition Camping & BBQ Sets',
      sinhalaTitle: 'සම්පූර්ණ කඳවුරු සහ BBQ උපකරණ',
      description: 'High-grade 3000mm rainproof tents, sleeping bags, gas cookers, lanterns, and charcoal BBQ kits. Ready-to-camp packs ready when you arrive.',
      benefit: 'No need to transport bulky gear from home',
      ctaText: 'Browse Gear',
      href: '#camping',
      onClick: onExploreCamping,
      badge: 'Full Sets for Rent'
    },
    {
      icon: Compass,
      title: 'Native Rainforest Field Guides',
      sinhalaTitle: 'ස්වදේශික පළපුරුදු මගපෙන්වන්නන්',
      description: 'Born-and-raised local guides who know every hidden cascade, safe rock pool in Gin Ganga, and endemic bird trails while keeping you safe from flash floods.',
      benefit: 'Safety first + leech socks provided',
      ctaText: 'Explore Waterfalls',
      href: '#attractions',
      badge: 'Local Sinharaja Guides'
    }
  ];

  return (
    <section id="why-us" className="py-20 bg-[#16271E] relative border-b border-[#2C3E33] overflow-hidden">
      {/* Decorative subtle ambient lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2C3E33]/90 border border-[#3B5244] text-[#D4AF37] text-xs font-semibold tracking-wider uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>All-In-One Platform • ඇයි අපව තෝරාගත යුත්තේ?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-[#F5F2EB] tracking-tight">
            Everything in One Place for Your <br className="hidden sm:inline" />
            <span className="italic text-[#D4AF37] font-normal">Lankagama Experience</span>
          </h2>

          <p className="text-sm sm:text-base text-[#C2BCB0] leading-relaxed max-w-2xl mx-auto">
            ලංකාගම සංචාරයේදී නවාතැන්, පිරිසිදු කිතුල් පැණි සහ හකුරු, නැවුම් රා, කඳවුරු බඩු සහ මගපෙන්වන්නන් — 
            සියල්ල එකම විශ්වාසනීය තැනකින්, විලා එකටම ඩිලිවරි පහසුකම සමගින් ලබාගන්න.
          </p>
        </div>

        {/* 5 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`relative bg-[#1E2A22]/90 hover:bg-[#243329] rounded-3xl p-7 border border-[#3B5244] hover:border-[#D4AF37]/60 transition-all duration-300 flex flex-col justify-between group shadow-lg ${
                  idx === 0 ? 'lg:col-span-1' : ''
                }`}
              >
                <div>
                  {/* Top Bar with Icon and Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#2C3E33] border border-[#3B5244] flex items-center justify-center text-[#D4AF37] group-hover:scale-105 group-hover:bg-[#D4AF37] group-hover:text-[#14231B] transition-all shadow-inner">
                      <Icon className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#14231B] text-[#D4AF37] border border-[#3B5244]">
                      {item.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-serif text-[#F5F2EB] font-medium group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  <span className="text-xs text-[#D4AF37] font-medium block mt-1">
                    {item.sinhalaTitle}
                  </span>

                  {/* Description */}
                  <p className="text-xs text-[#C2BCB0] leading-relaxed mt-3.5 mb-4">
                    {item.description}
                  </p>
                </div>

                <div>
                  {/* Key Value Highlight */}
                  <div className="p-3 rounded-xl bg-[#14231B]/70 border border-[#3B5244]/80 flex items-center gap-2 text-xs text-[#E1DCD3] mb-5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-medium text-[11px]">{item.benefit}</span>
                  </div>

                  {/* CTA link */}
                  <a
                    href={item.href}
                    onClick={item.onClick}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#D4AF37] hover:text-[#F5F2EB] group-hover:translate-x-1 transition-all"
                  >
                    <span>{item.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}

          {/* 6th Card: All-In-One Unified Concierge Box */}
          <div className="bg-gradient-to-br from-[#2C3E33] via-[#1E2A22] to-[#14231B] rounded-3xl p-7 border-2 border-[#D4AF37]/50 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37] text-[#14231B] flex items-center justify-center font-bold shadow-md">
                <HeartHandshake className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] block">
                  The Lankagama Advantage
                </span>
                <h3 className="text-xl font-serif text-[#F5F2EB] font-bold mt-1">
                  One Contact. Zero Hassle.
                </h3>
                <p className="text-xs text-[#C2BCB0] mt-2.5 leading-relaxed">
                  You don’t need to coordinate with 5 different village contacts for rooms, honey, gear, and trails. 
                  Our local concierge coordinates everything seamlessly before you even depart home.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#3B5244]/80 text-xs text-[#F5F2EB]">
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Doorstep delivery to any villa in Lankagama</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>No upfront credit card deposit needed</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>24/7 Local assistance & road condition alerts</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Chat with Local Concierge</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
