'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrackModal from '@/components/TrackModal';
import BlogDetailModal from '@/components/BlogDetailModal';
import { BlogPost } from '@/lib/types';
import { AGENCY_CONFIG } from '@/lib/data';
import { useLanguage, LanguageSwitcher } from '@/lib/LanguageContext';
import { 
  AlertCircle, Compass, Clock, BookOpen, 
  ArrowRight, Sparkles, ChevronRight, Eye, Search
} from 'lucide-react';

export default function BlogsPage() {
  const { lang, isSi, t } = useLanguage();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch blogs from DB backend
  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.blogs)) {
          setBlogs(data.blogs);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Error fetching blogs from API:', err);
        setIsLoading(false);
      });
  }, []);

  // Listen to hash change (e.g. #guide-brahmana)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash && blogs.length > 0) {
        const found = blogs.find(b => b.id === hash);
        if (found) {
          setSelectedBlog(found);
          setIsDetailModalOpen(true);
        }
      }
    }
  }, [blogs]);

  const categories = ['All', 'Waterfalls', 'Trekking', 'Rainforest Tips', 'Village Culture'];

  const filteredPosts = blogs.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      post.title.toLowerCase().includes(q) ||
      post.summary.toLowerCase().includes(q) ||
      (post.sinhalaTitle && post.sinhalaTitle.toLowerCase().includes(q)) ||
      (post.summarySi && post.summarySi.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleOpenDetail = (post: BlogPost) => {
    setSelectedBlog(post);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#14231B] text-[#F5F2EB]">
      {/* Navigation */}
      <Navbar onOpenTrackModal={() => setIsTrackModalOpen(true)} />

      {/* Hero Header */}
      <section className="relative py-20 lg:py-24 bg-gradient-to-b from-[#0E1913] to-[#14231B] border-b border-[#2C3E33] overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Top Pill & Language Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E2A22] border border-[#3B5244] text-[#D4AF37] text-xs font-semibold uppercase tracking-widest">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isSi ? 'සිංහරාජ ක්ෂේත්‍ර සටහන් සහ මඟපෙන්වීම්' : 'Rainforest Field Notes & Guides'}</span>
            </div>

            {/* Language Switcher Pill */}
            <LanguageSwitcher />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-[#F5F2EB] mb-6">
            {isSi ? (
              <>
                ලංකාගම දියඇලි සහ <span className="italic text-[#D4AF37]">සිංහරාජ ගවේෂණ</span>
              </>
            ) : (
              <>
                Stories, Waterfalls & <span className="italic text-[#D4AF37]">Sinharaja Guides</span>
              </>
            )}
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#C2BCB0] leading-relaxed font-normal">
            {isSi
              ? 'නොමියෙන වැසි වනාන්තර මතකයන් සඳහා අවශ්‍ය සියල්ල: මනරම් දියඇලි මාර්ග, ගමන් මලු සූදානම, කූඩැලු ආරක්ෂාව සහ ලංකාගම පාරම්පරික උරුමයන්.'
              : 'Everything you need for an unforgettable rainforest expedition: waterfall guides, trekking safety, leech defense, and authentic village heritage in Lankagama.'
            }
          </p>

          {/* Quick Breadcrumb back to Home */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#9EA89F]">
            <Link href="/" className="hover:text-[#D4AF37] transition-colors">{isSi ? 'මුල් පිටුව' : 'Home'}</Link>
            <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
            <span className="text-[#F5F2EB] font-medium">{isSi ? 'බ්ලොග් සහ දියඇලි' : 'Blogs & Waterfalls'}</span>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="py-6 sm:py-8 bg-[#16271E] border-b border-[#2C3E33] sticky top-20 z-30 backdrop-blur-md bg-[#16271E]/95">
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
                  {cat === 'All' ? (isSi ? 'සියල්ල (All)' : 'All') : cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                placeholder={isSi ? 'ලිපි, දියඇලි සොයන්න...' : 'Search guides, waterfalls...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#1E2A22] border border-[#3B5244] text-xs text-[#F5F2EB] placeholder-[#9EA89F] focus:outline-hidden focus:border-[#D4AF37] transition-colors"
              />
              <Search className="w-4 h-4 text-[#9EA89F] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 sm:py-20 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#1E2A22] rounded-3xl overflow-hidden border border-[#3B5244] h-[380px] animate-pulse">
                  <div className="h-56 bg-[#14231B]" />
                  <div className="p-6 space-y-3">
                    <div className="w-1/3 h-3 rounded bg-[#3B5244]" />
                    <div className="w-3/4 h-5 rounded bg-[#2C3E33]" />
                    <div className="w-full h-3 rounded bg-[#26372B]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => {
              const cardTitle = isSi && post.sinhalaTitle ? post.sinhalaTitle : post.title;
              const cardSummary = isSi && post.summarySi ? post.summarySi : post.summary;
              const cardAuthor = isSi && post.authorSi ? post.authorSi : post.author;
              const cardHighlights = isSi && post.highlightsSi && post.highlightsSi.length > 0 
                ? post.highlightsSi 
                : post.highlights;

              return (
                <article
                  key={post.id}
                  onClick={() => handleOpenDetail(post)}
                  className="bg-[#1E2A22] rounded-3xl overflow-hidden border border-[#3B5244] hover:border-[#D4AF37] transition-all duration-300 shadow-xl flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Article Image Stage */}
                    <div className="relative h-56 overflow-hidden bg-[#14231B]">
                      <img
                        src={post.imageUrl}
                        alt={cardTitle}
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

                      {/* Click indicator badge on hover */}
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-[#D4AF37] text-[#14231B] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isSi ? 'විස්තර බලන්න' : 'View Details'}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-7 space-y-4">
                      <div className="space-y-1.5">
                        <h2 className="text-xl font-serif font-semibold text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors leading-snug line-clamp-2">
                          {cardTitle}
                        </h2>
                        {isSi && post.title && (
                          <p className="text-xs text-[#D4AF37] font-medium italic line-clamp-1">
                            {post.title}
                          </p>
                        )}
                        {!isSi && post.sinhalaTitle && (
                          <p className="text-xs text-[#D4AF37] font-medium line-clamp-1">
                            {post.sinhalaTitle}
                          </p>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed line-clamp-3">
                        {cardSummary}
                      </p>

                      {/* Highlights bullet points */}
                      {cardHighlights && cardHighlights.length > 0 && (
                        <div className="pt-2 space-y-1.5 border-t border-[#2C3E33]">
                          {cardHighlights.slice(0, 3).map((h, i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px] text-[#A6B2A8] truncate">
                              <Sparkles className="w-3 h-3 text-[#D4AF37] shrink-0" />
                              <span className="truncate">{h}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Safety Caution Notice preview */}
                      {(isSi ? post.cautionSi || post.caution : post.caution) && (
                        <div className="p-3 rounded-xl bg-[#2A1E1E]/80 border border-red-900/40 text-[11px] text-amber-200/90 flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            <strong>{isSi ? 'උපදෙස්:' : 'Field Advice:'}</strong> {isSi ? (post.cautionSi || post.caution) : post.caution}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer metadata & Action */}
                  <div className="p-6 pt-0 border-t border-[#2C3E33]/60 flex items-center justify-between mt-4">
                    <div className="text-[11px] text-[#9EA89F]">
                      <span>{isSi ? 'කර්තෘ:' : 'By'} {cardAuthor}</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] group-hover:text-white transition-colors">
                      <span>{isSi ? 'සම්පූර්ණ විස්තරය' : 'Read Guide'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          )}

          {!isLoading && filteredPosts.length === 0 && (
            <div className="py-20 text-center space-y-3">
              <p className="text-base text-[#C2BCB0]">
                {isSi ? `"${searchQuery}" සඳහා ප්‍රතිඵල හමු නොවීය.` : `No guides found matching "${searchQuery}".`}
              </p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#14231B] text-xs font-bold cursor-pointer hover:bg-[#C5A880] transition-colors"
              >
                {isSi ? 'සොයුම් පෙරහන යළි සකසන්න' : 'Reset Filters'}
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
            <span>{isSi ? 'සිංහරාජ බලපත්‍රලාභී ප්‍රදේශවාසී මඟපෙන්වන්නන්' : 'Sinharaja Buffer Zone Certified Guides'}</span>
          </div>

          <h2 className="text-3xl font-serif text-[#F5F2EB] font-medium">
            {isSi ? 'පළපුරුදු මඟපෙන්වන්නන් සමඟ දියඇලි ආරක්ෂිතව නරඹන්න' : 'Explore Waterfalls Safely with Native Guides'}
          </h2>

          <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed max-w-xl mx-auto">
            {isSi
              ? 'ලංකාගම වනාන්තර අඩිපාරවල් ලිස්සන සුළු විය හැක. අපගේ බලපත්‍රලාභී දේශීය මඟපෙන්වන්නන් කූඩැලු ආරක්ෂාව, ප්‍රථමාධාර සහ වනජීවී නිරීක්ෂණ පළපුරුද්දෙන් සන්නද්ධව සිටී.'
              : 'Lankagama trails can be slippery and confusing deep inside virgin rainforest. Our certified native guides are equipped with leech protection, first-aid knowledge, and unmatched endemic wildlife spotting skills.'
            }
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`https://wa.me/${AGENCY_CONFIG.whatsappNumber}?text=${encodeURIComponent('Hello The Sinharaja Collection! I would like to reserve a certified local guide for waterfall trekking.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {isSi ? 'මඟපෙන්වන්නෙකු වෙන්කරවා ගන්න (දිනකට රු. 4,000)' : 'Hire a Local Naturalist Guide (Rs. 4,000/day)'}
            </a>

            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1E2A22] hover:bg-[#2C3E33] text-[#F5F2EB] border border-[#3B5244] text-xs font-semibold transition-all"
            >
              {isSi ? 'නැවත මුල් පිටුවට' : 'Back to Home & Villas'}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Blog Details Popup Modal with EN/SI Toggle */}
      <BlogDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        blog={selectedBlog}
        initialLang={lang}
      />

      {/* Track Booking Modal */}
      <TrackModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
      />
    </div>
  );
}
