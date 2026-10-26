'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrackModal from '@/components/TrackModal';
import { Attraction } from '@/lib/types';
import { ATTRACTIONS, AGENCY_CONFIG } from '@/lib/data';
import { 
  MapPin, AlertCircle, Compass, Clock, BookOpen, 
  ArrowRight, Droplets, Mountain, ShieldCheck, Sparkles, ChevronRight 
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  sinhalaTitle?: string;
  category: 'Waterfalls' | 'Trekking' | 'Rainforest Tips' | 'Village Culture';
  readTime: string;
  badge: string;
  summary: string;
  caution?: string;
  imageUrl: string;
  publishedDate: string;
  author: string;
  highlights: string[];
}

const FEATURED_GUIDES: BlogPost[] = [
  {
    id: 'guide-brahmana',
    title: 'Brahmana Ella: The 35-Meter Crown Jewel of Lankagama',
    sinhalaTitle: 'බ්‍රාහ්මණ ඇල්ල - ලංකාගම මහා දියඇලි අසිරිය',
    category: 'Waterfalls',
    readTime: '4 min read',
    badge: '35m Waterfall',
    summary: 'Roaring over tiered black rock amphitheaters into deep natural pools, Brahmana Ella is the undisputed icon of Lankagama. Just a 15-minute scenic riverside stroll from most village villas.',
    caution: 'Always bathe in designated calm rock pools below; strictly avoid slippery waterfall top ledges during sudden rain.',
    imageUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
    publishedDate: 'October 2026',
    author: 'Sunil Shantha (Native Guide)',
    highlights: ['15-min easy walk from villas', 'Natural swimming basins', 'Photogenic suspension bridge']
  },
  {
    id: 'guide-doowili',
    title: 'Doowili Ella: Chasing the Enchanted Rainforest Mist',
    sinhalaTitle: 'දූවිලි ඇල්ල - සිංහරාජයේ සැඟවුණු මීදුම් ඇල්ල',
    category: 'Waterfalls',
    readTime: '6 min read',
    badge: 'Mist Waterfall',
    summary: 'Named for the perpetual microscopic mist cloud that hovers beneath the canopy as water plunges through virgin jungle. This secluded waterfall offers an authentic deep-wilderness trekking experience.',
    caution: 'Dense rainforest trail. We strongly recommend entering with a certified native guide and wearing leech socks.',
    imageUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
    publishedDate: 'October 2026',
    author: 'Nalin Pradeep (Field Naturalist)',
    highlights: ['Virgin rainforest trail', 'Cool micro-climate mist', 'Rare bird spotting zone']
  },
  {
    id: 'guide-gin-ganga',
    title: 'Secret Rock Pools of Gin Ganga: Natural River Spa',
    sinhalaTitle: 'ගිං ගඟ ස්වභාවික ගල් තටාක සහ මත්ස්‍ය සම්භාහනය',
    category: 'Waterfalls',
    readTime: '3 min read',
    badge: 'Natural River Pools',
    summary: 'Flowing pristine and unpolluted straight from the Sinharaja reserve core, Upper Gin Ganga provides soothing cold-water baths and natural doctor-fish nibbles in shaded rock pools.',
    caution: 'Do not use chemical soaps, shampoos or single-use plastics to protect endemic freshwater fish species.',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    publishedDate: 'October 2026',
    author: 'The Sinharaja Collection Team',
    highlights: ['Crystal-clear water', 'Natural fish pedicure', 'Safe shallow wading zones']
  },
  {
    id: 'guide-trekking-tips',
    title: 'Sinharaja Trekking Checklist: Leech Defense & Gear Advice',
    sinhalaTitle: 'කූඩැල්ලන්ගෙන් ආරක්ෂා වී සිංහරාජයේ සංචාරය කරමු',
    category: 'Rainforest Tips',
    readTime: '5 min read',
    badge: 'Trekker Safety',
    summary: 'Everything first-timers need to know before entering the rainforest: why knee-high leech socks work best, choosing quick-drying clothing, waterproof bags, and keeping digital cameras safe from tropical humidity.',
    caution: 'Always carry a lightweight raincoat or poncho; sudden downpours are characteristic of the wet evergreen rainforest.',
    imageUrl: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=80',
    publishedDate: 'October 2026',
    author: 'Sunil Shantha (Native Guide)',
    highlights: ['Leech protection hacks', 'Footwear recommendations', 'Camera humidity precautions']
  },
  {
    id: 'guide-kithul-culture',
    title: 'The Ancient Art of Lankagama Rainforest Kithul Tapping',
    sinhalaTitle: 'ලංකාගම පාරම්පරික කිතුල් මැදීමේ කලාව සහ සැබෑ රසය',
    category: 'Village Culture',
    readTime: '5 min read',
    badge: 'Heritage & Food',
    summary: 'How native village tappers ascend towering Caryota urens palms at dawn in the Sinharaja buffer zone, collect pure floral sap, and slow-boil it in open earthen cauldrons with zero artificial sugar.',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
    publishedDate: 'October 2026',
    author: 'Local Elder Heritage Circle',
    highlights: ['Dawn tree tapping process', 'Clay pot slow boiling', 'How to test genuine treacle purity']
  },
  {
    id: 'guide-neluwa-road',
    title: 'Neluwa to Lankagama Route: Bridges, Rivers & Scenic Vistas',
    sinhalaTitle: 'නෙළුව - ලංකාගම මනරම් ගමනාන්ත මාර්ගය',
    category: 'Trekking',
    readTime: '4 min read',
    badge: 'Scenic Road & Bridges',
    summary: 'A breathtaking drive traversing emerald green tea estates, suspension footbridges, and mountain slopes flanking Gin Ganga into the village sanctuary.',
    caution: 'Drive with care; slow down for village pedestrians, monitors, and butterflies.',
    imageUrl: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=1200&q=80',
    publishedDate: 'October 2026',
    author: 'The Sinharaja Collection Team',
    highlights: ['Suspension footbridges', 'Panoramic mountain tea views', 'Accessible for most cars & vans']
  }
];

export default function BlogsPage() {
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [attractions, setAttractions] = useState<Attraction[]>(ATTRACTIONS);

  useEffect(() => {
    fetch('/api/attractions')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.attractions) && data.attractions.length > 0) {
          setAttractions(data.attractions);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ['All', 'Waterfalls', 'Trekking', 'Rainforest Tips', 'Village Culture'];

  const filteredPosts = FEATURED_GUIDES.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.sinhalaTitle && post.sinhalaTitle.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#14231B] text-[#F5F2EB]">
      {/* Navigation */}
      <Navbar onOpenTrackModal={() => setIsTrackModalOpen(true)} />

      {/* Hero Header */}
      <section className="relative py-20 lg:py-24 bg-gradient-to-b from-[#0E1913] to-[#14231B] border-b border-[#2C3E33] overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E2A22] border border-[#3B5244] text-[#D4AF37] text-xs font-semibold uppercase tracking-widest mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Rainforest Field Notes & Guides</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-[#F5F2EB] mb-6">
            Stories, Waterfalls & <span className="italic text-[#D4AF37]">Sinharaja Guides</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#C2BCB0] leading-relaxed font-normal">
            Everything you need for an unforgettable rainforest expedition: waterfall guides, trekking safety, leech defense, and authentic village heritage in Lankagama.
          </p>

          {/* Quick Breadcrumb back to Home */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#9EA89F]">
            <Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
            <span className="text-[#F5F2EB] font-medium">Blogs & Waterfalls</span>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="py-8 bg-[#16271E] border-b border-[#2C3E33] sticky top-20 z-30 backdrop-blur-md bg-[#16271E]/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#D4AF37] text-[#14231B] shadow-md'
                      : 'bg-[#1E2A22] text-[#C2BCB0] hover:text-[#F5F2EB] border border-[#3B5244]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="w-full md:w-72">
              <input
                type="text"
                placeholder="Search guides, waterfalls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[#1E2A22] border border-[#3B5244] text-xs text-[#F5F2EB] placeholder-[#9EA89F] focus:outline-hidden focus:border-[#D4AF37] transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 sm:py-20 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-[#1E2A22] rounded-3xl overflow-hidden border border-[#3B5244] hover:border-[#D4AF37] transition-all duration-300 shadow-xl flex flex-col justify-between group"
              >
                <div>
                  {/* Article Image */}
                  <div className="relative h-56 overflow-hidden bg-[#14231B]">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E2A22] via-transparent to-transparent opacity-80" />
                    
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#14231B]/90 backdrop-blur-md text-[#D4AF37] border border-[#3B5244] text-[10px] font-bold uppercase tracking-wider">
                        {post.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#F5F2EB] text-[10px] font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#D4AF37]" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 sm:p-7 space-y-4">
                    <div className="space-y-1.5">
                      <h2 className="text-xl font-serif font-semibold text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors leading-snug">
                        {post.title}
                      </h2>
                      {post.sinhalaTitle && (
                        <p className="text-xs text-[#D4AF37] font-medium">
                          {post.sinhalaTitle}
                        </p>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>

                    {/* Highlights bullet points */}
                    {post.highlights && post.highlights.length > 0 && (
                      <div className="pt-2 space-y-1.5 border-t border-[#2C3E33]">
                        {post.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11px] text-[#A6B2A8]">
                            <Sparkles className="w-3 h-3 text-[#D4AF37] shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Safety Caution Notice */}
                    {post.caution && (
                      <div className="p-3 rounded-xl bg-[#2A1E1E]/80 border border-red-900/40 text-[11px] text-amber-200/90 flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>Field Advice:</strong> {post.caution}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer metadata & Action */}
                <div className="p-6 pt-0 border-t border-[#2C3E33]/60 flex items-center justify-between mt-4">
                  <div className="text-[11px] text-[#9EA89F]">
                    <span>By {post.author}</span>
                  </div>

                  <a
                    href={`https://wa.me/${AGENCY_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hello The Sinharaja Collection! I read your article "${post.title}" and would like to hire a native guide for this trail.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] hover:text-white transition-colors"
                  >
                    <span>Hire Guide for Trek</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="py-20 text-center space-y-3">
              <p className="text-base text-[#C2BCB0]">No guides found matching &quot;{searchQuery}&quot;.</p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#14231B] text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          )}

        </div>
      </section>

      {/* Certified Native Guide Callout Banner */}
      <section className="py-16 bg-[#16271E] border-t border-[#2C3E33]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E2A22] border border-[#3B5244] text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Sinharaja Buffer Zone Certified Guides</span>
          </div>

          <h2 className="text-3xl font-serif text-[#F5F2EB] font-medium">
            Explore Waterfalls Safely with Native Guides
          </h2>

          <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed max-w-xl mx-auto">
            Lankagama trails can be slippery and confusing deep inside virgin rainforest. Our certified native guides are equipped with leech protection, first-aid knowledge, and unmatched endemic wildlife spotting skills.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`https://wa.me/${AGENCY_CONFIG.whatsappNumber}?text=${encodeURIComponent('Hello The Sinharaja Collection! I would like to reserve a certified local guide for waterfall trekking.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Hire a Local Naturalist Guide (Rs. 4,000/day)
            </a>

            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1E2A22] hover:bg-[#2C3E33] text-[#F5F2EB] border border-[#3B5244] text-xs font-semibold transition-all"
            >
              Back to Home & Villas
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Track Booking Modal */}
      <TrackModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
      />
    </div>
  );
}
