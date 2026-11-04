'use client';

import React from 'react';
import { 
  CheckCircle2, Sparkles, Home, ShoppingBag, 
  Wine, Tent, Compass, ShieldCheck, ArrowRight,
  Clock, HeartHandshake, PhoneCall
} from 'lucide-react';
import { AGENCY_CONFIG } from '@/lib/data';
import { useLanguage } from '@/lib/LanguageContext';

interface WhyChooseUsProps {
  onExploreVillas?: () => void;
  onExploreKithul?: () => void;
  onExploreCamping?: () => void;
}

export default function WhyChooseUs({ onExploreVillas, onExploreKithul, onExploreCamping }: WhyChooseUsProps) {
  const { isSi, t } = useLanguage();
  const whatsappUrl = `https://wa.me/${AGENCY_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    isSi 
      ? 'ආයුබෝවන් The Sinharaja Collection Lankagama! මට විලා වෙන්කරගැනීම, කිතුල් නිෂ්පාදන සහ කූඩාරම් උපකරණ පිළිබඳ විස්තර දැනගැනීමට අවශ්‍යයි.'
      : 'Hello The Sinharaja Collection Lankagama! I want to organize a trip with stays, pure kithul delivery, and camping gear.'
  )}`;

  const pillars = [
    {
      icon: Home,
      title: isSi ? 'විලා සහ ස්වභාවික නවාතැන්' : 'Villas & Nature Stays',
      subtitle: isSi ? 'ගංගාබඩ හා දියඇලි අසල පරිසර හිතකාමී නවාතැන්' : 'Curated Riverside & Waterfall Chalets',
      description: isSi 
        ? 'සිංහරාජ මායිමේ ඇති පිරිසිදු ගංගාබඩ චැලේ සහ දියඇලි දසුන් සහිත පරිසර හිතකාමී නවාතැන්. නිවැරදි මිල ගණන් සහ තහවුරු කළ කාමර පහසුකම්.'
        : 'Carefully vetted riverside chalets and waterfall-view eco lodges bordering Sinharaja Rainforest. Verified vacancy and transparent pricing.',
      benefit: isSi ? 'ස්වාභාවික දියනෑමේ තටාක සහ ගෙදර කෑම ඇතුළත්ය' : 'River bathing pools & home-cooked meals included',
      ctaText: isSi ? 'නවාතැන් බලන්න' : 'View Stays',
      href: '#villas',
      onClick: onExploreVillas,
      badge: isSi ? 'තෝරාගත් නවාතැන්' : 'Handpicked Stays'
    },
    {
      icon: ShoppingBag,
      title: isSi ? '100% පිරිසිදු කිතුල් විලා එකටම' : '100% Pure Kithul Direct to Villa',
      subtitle: isSi ? 'සීනි රහිත හා ස්වභාවික හකුරු' : 'Zero Additives & Organic Jaggery',
      description: isSi 
        ? 'කිසිදු සීනි හෝ කෘත්‍රිම රසකාරක නොමැතිව, ලංකාගම සැබෑ කිතුල් ගස්වලින් උණු උණුවේ පිසින ලද පැණි සහ හකුරු ඔබේ කාමරයේ දොරකඩටම ලබාදේ.'
        : 'Zero added sugar, zero chemicals. Pure organic Kithul treacle and solid jaggery halves tapped in Lankagama, delivered right to your villa door.',
      benefit: isSi ? 'ඔබ නැවතී සිටින විලා එකට හෝ කඳවුරටම බෙදාහැරීම' : 'Doorstep delivery to your room or campsite',
      ctaText: isSi ? 'කිතුල් ඇණවුම් කරන්න' : 'Order Kithul',
      href: '#kithul',
      onClick: onExploreKithul,
      badge: isSi ? 'කාමරයටම බෙදාහැරීම' : 'Villa Doorstep Delivery'
    },
    {
      icon: Wine,
      title: isSi ? 'නැවුම් කිතුල් රා සහ තෙලිදිය' : 'Fresh Kithul Raa & Tapping Tour',
      subtitle: isSi ? 'සැබෑ සිංහරාජ කිතුල් සංස්කෘතිය' : 'Living Sinharaja Palm Culture',
      description: isSi 
        ? 'අලුයම මලෙන් බාන ලද සිසිල් මිහිරි තෙලිදිය රසවිඳින්න. නැතහොත් පළපුරුදු කිතුල් මැදින්නෙකු සමඟ ගසට නගින සැබෑ අත්දැකීම විඳගන්න.'
        : 'Experience genuine Sinharaja palm culture. Enjoy freshly tapped sweet morning toddy delivered chilled, or join a master tapper on a live tree-climbing session.',
      benefit: isSi ? 'අලුයම වනගත තෙලිදියෙන් ලබාගත් නැවුම් බව' : 'Tapped fresh at dawn from rainforest palms',
      ctaText: isSi ? 'රා අත්දැකීම' : 'Toddy Experience',
      href: '#kithul',
      onClick: onExploreKithul,
      badge: isSi ? 'විශේෂ අත්දැකීමක්' : 'Exclusive Privilege'
    },
    {
      icon: Tent,
      title: isSi ? 'කූඩාරම් සහ BBQ උපකරණ' : 'Expedition Camping & BBQ Sets',
      subtitle: isSi ? '3000mm වර්ෂාවට ඔරොත්තු දෙන කූඩාරම්' : '3000mm Rainproof All-Weather Tents',
      description: isSi 
        ? 'වර්ෂාපතනයට ඔරොත්තු දෙන කූඩාරම්, නිදන බෑග්, ගෑස් ලිප්, ලන්තෑරුම් සහ අඟුරු BBQ උපකරණ. කොළඹින් බර උස්සන් ඒමෙන් තොරව මෙහිදී ලබාගන්න.'
        : 'High-grade 3000mm rainproof tents, sleeping bags, gas cookers, lanterns, and charcoal BBQ kits. Ready-to-camp packs ready when you arrive.',
      benefit: isSi ? 'නිවසේ සිට බර උපකරණ රැගෙන ඒම අවශ්‍ය නොවේ' : 'No need to transport bulky gear from home',
      ctaText: isSi ? 'උපකරණ බලන්න' : 'Browse Gear',
      href: '#camping',
      onClick: onExploreCamping,
      badge: isSi ? 'සම්පූර්ණ කට්ටල කුලියට' : 'Full Sets for Rent'
    },
    {
      icon: Compass,
      title: isSi ? 'ප්‍රදේශයේ පළපුරුදු මඟපෙන්වන්නන්' : 'Native Rainforest Field Guides',
      subtitle: isSi ? 'දේශීය සත්ත්ව හා ශාක ගවේෂකයින්' : 'Certified Endemic Flora & Fauna Trackers',
      description: isSi 
        ? 'ලංකාගමම ඉපදී හැදීවැඩුණු, සැඟවුණු සුන්දර දියඇලි, ගිං ගඟේ ආරක්ෂිත දියනෑමේ ස්ථාන සහ ආරක්ෂිත ගමන් මඟ දන්නා විශ්වාසවන්ත මඟපෙන්වන්නන්.'
        : 'Born-and-raised local guides who know every hidden cascade, safe rock pool in Gin Ganga, and endemic bird trails while keeping you safe from flash floods.',
      benefit: isSi ? 'ආරක්ෂාව මුල්තැන + කූඩැල්ලන්ගෙන් ආරක්ෂිත මේස්' : 'Safety first + leech socks provided',
      ctaText: isSi ? 'දියඇලි ගවේෂණය කරන්න' : 'Explore Waterfalls',
      href: '/blogs',
      badge: isSi ? 'ගම්වැසි මඟපෙන්වන්නන්' : 'Local Sinharaja Guides'
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
            <span>{t('whyUs.pill', 'Curated Rainforest Hospitality • Why Choose Us')}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-[#F5F2EB] tracking-tight">
            {t('whyUs.title1', 'Everything in One Place for Your')} <br className="hidden sm:inline" />
            <span className="italic text-[#D4AF37] font-normal">{t('whyUs.title2', 'Lankagama Experience')}</span>
          </h2>

          <p className="text-sm sm:text-base text-[#C2BCB0] leading-relaxed max-w-2xl mx-auto">
            {t('whyUs.desc', 'From peaceful riverfront stays and delicious home-cooked meals to pure village kithul, camping gear rentals, and trusted local guides — we make your entire trip to Lankagama easy and memorable.')}
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
                    {item.subtitle}
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
                  {isSi ? 'ලංකාගම විශේෂ වාසිය' : 'The Lankagama Advantage'}
                </span>
                <h3 className="text-xl font-serif text-[#F5F2EB] font-bold mt-1">
                  {isSi ? 'එක් සබඳතාවක්. කිසිදු කරදරයක් නැත.' : 'One Contact. Zero Hassle.'}
                </h3>
                <p className="text-xs text-[#C2BCB0] mt-2.5 leading-relaxed">
                  {isSi 
                    ? 'කාමර, පැණි, කූඩාරම් සහ මඟපෙන්වන්නන් සඳහා වෙන වෙනම පුද්ගලයින් සෙවීමට අවශ්‍ය නොවේ. ඔබ නිවසින් පිටත්වීමට පෙරම අපගේ දේශීය සහයක කණ්ඩායම සියල්ල සුදානම් කර දෙයි.'
                    : 'You don’t need to coordinate with 5 different village contacts for rooms, honey, gear, and trails. Our local concierge coordinates everything seamlessly before you even depart home.'}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#3B5244]/80 text-xs text-[#F5F2EB]">
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{isSi ? 'ලංකාගම ඕනෑම විලා එකකට දොරකඩටම ගෙනවිත් දීම' : 'Doorstep delivery to any villa in Lankagama'}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{isSi ? 'ක්‍රෙඩිට් කාඩ්පත් තැන්පතු අවශ්‍ය නොවේ' : 'No upfront credit card deposit needed'}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{isSi ? '24/7 දේශීය සහය සහ මාර්ග තත්ත්ව තොරතුරු' : '24/7 Local assistance & road condition alerts'}</span>
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
                <span>{isSi ? 'දේශීය සහයකයා අමතන්න (WhatsApp)' : 'Chat with Local Concierge'}</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
