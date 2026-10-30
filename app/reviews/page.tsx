'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrackModal from '@/components/TrackModal';
import { useModalHistory } from '@/lib/useModalHistory';
import { CustomerComment } from '@/lib/types';
import { CUSTOMER_COMMENTS, AGENCY_CONFIG } from '@/lib/data';
import { useWhatsApp } from '@/lib/useWhatsApp';
import { 
  Star, ShieldCheck, MessageSquare, Send, Sparkles, 
  HelpCircle, ChevronDown, ChevronUp, MessageCircle, 
  CheckCircle2, ChevronRight, Filter 
} from 'lucide-react';

export default function ReviewsPage() {
  const { formattedNumber, phone, getWhatsAppLink } = useWhatsApp();
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [comments, setComments] = useState<CustomerComment[]>(CUSTOMER_COMMENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Review submission modal state
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  useModalHistory({
    isOpen: isCommentModalOpen,
    onClose: () => setIsCommentModalOpen(false),
    modalId: 'review-submission'
  });
  const [commentForm, setCommentForm] = useState({
    author: '',
    cityOrCountry: '',
    rating: 5,
    category: 'Villa Stay',
    stayedAtOrOrdered: '',
    comment: ''
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Inquiry form state
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    phone: '',
    subject: 'General Question',
    message: ''
  });
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useEffect(() => {
    fetch('/api/comments')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.comments) && data.comments.length > 0) {
          setComments(data.comments);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ['All', 'Villa Stay', 'Pure Kithul', 'Camping Gear', 'Waterfalls & Trekking'];

  const filteredComments = comments.filter(c => {
    if (selectedCategory === 'All') return true;
    return c.category?.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.author || !commentForm.comment) return;

    setSubmittingComment(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm)
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setComments(prev => [data.comment, ...prev]);
        setCommentSuccess(true);
        setTimeout(() => {
          setCommentSuccess(false);
          setIsCommentModalOpen(false);
          setCommentForm({
            author: '',
            cityOrCountry: '',
            rating: 5,
            category: 'Villa Stay',
            stayedAtOrOrdered: '',
            comment: ''
          });
        }, 1800);
      }
    } catch {
      alert('Could not submit review. Please try again or WhatsApp us.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.name || !inquiryForm.phone || !inquiryForm.message) return;

    setInquirySubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryForm)
      });
      const data = await res.json();
      if (data.success) {
        setInquirySuccess(true);
        setTimeout(() => {
          setInquirySuccess(false);
          setInquiryForm({ name: '', phone: '', subject: 'General Question', message: '' });
        }, 3000);
      }
    } catch {
      alert('Error sending message. Please WhatsApp us directly.');
    } finally {
      setInquirySubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How do we reach Lankagama village? What vehicles can go?',
      a: 'The route connects via Neluwa and takes approximately 45 minutes from Neluwa town. The road is paved concrete for most stretches; cars, vans, and 4x4s can reach safely. We provide exact directions and assistance upon booking.'
    },
    {
      q: 'Can we buy 100% pure Kithul treacle and toddy delivered to our villa?',
      a: 'Yes! Our collection directly supports local certified palm tappers in Lankagama. We deliver fresh morning toddy and warm, woodfire-boiled 100% pure treacle directly to your villa dining table.'
    },
    {
      q: 'Do we need a tour guide for Brahmana Ella and Doowili Ella waterfalls?',
      a: 'Brahmana Ella is a short 15-minute nature walk from village villas and easily accessible. However, deeper rainforest treks such as Doowili Ella and virgin jungle trails require a certified native guide for safety, directions, and wildlife identification.'
    },
    {
      q: 'What is included in the Camping Gear rental?',
      a: 'Our rental sets include heavy-duty 3000mm waterproof dome tents, thermal sleeping bags, moisture-proof ground mats, portable gas cookers with gas cartridges, camping lanterns, and complimentary anti-leech socks.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#14231B] text-[#F5F2EB]">
      {/* Navigation */}
      <Navbar onOpenTrackModal={() => setIsTrackModalOpen(true)} />

      {/* Hero Header */}
      <section className="relative py-20 lg:py-24 bg-gradient-to-b from-[#0E1913] to-[#14231B] border-b border-[#2C3E33] overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E2A22] border border-[#3B5244] text-[#D4AF37] text-xs font-semibold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guest Testimonials & Verified Stays</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-[#F5F2EB] mb-6">
            What Travelers Say About <span className="italic text-[#D4AF37]">The Collection</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#C2BCB0] leading-relaxed font-normal">
            Read verified reviews from guests who experienced our river-edge villas, pure Sinharaja Kithul deliveries, expedition camping sets, and guided rainforest trails.
          </p>

          {/* Quick Breadcrumb back to Home */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#9EA89F]">
            <Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
            <span className="text-[#F5F2EB] font-medium">Guest Reviews & FAQ</span>
          </div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="py-8 bg-[#16271E] border-b border-[#2C3E33]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-[#1E2A22] border border-[#3B5244]">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37]">4.9 / 5.0</div>
              <div className="text-[11px] text-[#C2BCB0] uppercase tracking-wider mt-1">Average Guest Rating</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#1E2A22] border border-[#3B5244]">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37]">100%</div>
              <div className="text-[11px] text-[#C2BCB0] uppercase tracking-wider mt-1">Verified Village Stays</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#1E2A22] border border-[#3B5244]">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37]">Pure Grade</div>
              <div className="text-[11px] text-[#C2BCB0] uppercase tracking-wider mt-1">Direct Forest Kithul</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#1E2A22] border border-[#3B5244]">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37]">Certified</div>
              <div className="text-[11px] text-[#C2BCB0] uppercase tracking-wider mt-1">Native Rainforest Guides</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Reviews List Section */}
      <section className="py-16 sm:py-20 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Controls: Categories & Leave Review CTA */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-[#2C3E33]">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              <span className="text-xs text-[#9EA89F] uppercase tracking-wider font-semibold mr-2 flex items-center gap-1.5 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                Filter:
              </span>
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

            <button
              onClick={() => setIsCommentModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shrink-0 self-start md:self-auto"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Leave a Review</span>
            </button>
          </div>

          {/* Testimonial Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComments.map((item) => (
              <div
                key={item.id}
                className="bg-[#1E2A22] rounded-3xl p-6 sm:p-7 border border-[#3B5244] hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  {/* Stars and Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-[#D4AF37]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < item.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#14231B] text-[#D4AF37] border border-[#3B5244]">
                      {item.category}
                    </span>
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs sm:text-sm text-[#E1DCD3] leading-relaxed italic mb-6">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-[#3B5244]/80 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-semibold text-[#F5F2EB] text-xs">
                      {item.author}
                    </h4>
                    <span className="text-[11px] text-[#C2BCB0] block">
                      {item.cityOrCountry}
                    </span>
                    {item.stayedAtOrOrdered && (
                      <span className="text-[10px] text-[#D4AF37] block mt-0.5">
                        {item.stayedAtOrOrdered}
                      </span>
                    )}
                  </div>

                  {item.isVerified && (
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Stay</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Part 2: Direct Trip Inquiry & WhatsApp Support */}
      <section className="py-20 bg-[#16271E] border-t border-[#2C3E33]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Contact Info */}
            <div className="space-y-6">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#D4AF37] block">
                Direct Travel Concierge
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#F5F2EB] font-medium leading-tight">
                Planning a Trip to Lankagama? Ask Us Anything.
              </h2>
              <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed font-normal">
                Whether you need advice on river water levels, villa vacancies for large family groups, special meal requirements, or native trail guides, we respond promptly.
              </p>

              <div className="space-y-3 pt-2">
                <a
                  href={getWhatsAppLink('Hello The Sinharaja Collection Lankagama! I would like to make an inquiry about visiting.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-[#14231B]" />
                  <span>Instant WhatsApp Chat: {phone || formattedNumber || AGENCY_CONFIG.phone}</span>
                </a>
              </div>
            </div>

            {/* Right: Message Form */}
            <div className="bg-[#1E2A22] rounded-3xl p-6 sm:p-8 border border-[#3B5244] shadow-xl">
              <h3 className="text-lg font-serif font-semibold text-[#F5F2EB] mb-4">
                Send an Online Inquiry
              </h3>

              {inquirySuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-300">Message Received!</h4>
                  <p className="text-xs text-emerald-200/80">Thank you. Our Lankagama team will call or WhatsApp you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C2BCB0] font-semibold mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                        placeholder="e.g. Kasun Silva"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14231B] border border-[#3B5244] text-xs text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C2BCB0] font-semibold mb-1">WhatsApp / Phone</label>
                      <input
                        type="text"
                        required
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                        placeholder="077 XXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14231B] border border-[#3B5244] text-xs text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#C2BCB0] font-semibold mb-1">Topic</label>
                    <select
                      value={inquiryForm.subject}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#14231B] border border-[#3B5244] text-xs text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-hidden"
                    >
                      <option value="Villa Availability">Villa Availability & Pricing</option>
                      <option value="Camping Gear Rental">Camping Gear Rental</option>
                      <option value="Tour Guide Booking">Tour Guide & Waterfall Trek</option>
                      <option value="Kithul & Toddy Order">Pure Kithul & Toddy Orders</option>
                      <option value="General Question">General Question</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#C2BCB0] font-semibold mb-1">Message / Your Question</label>
                    <textarea
                      required
                      rows={3}
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      placeholder="Let us know your travel dates, group size, or questions..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#14231B] border border-[#3B5244] text-xs text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={inquirySubmitting}
                    className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{inquirySubmitting ? 'Sending...' : 'Send Inquiry to Agency'}</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Part 3: Frequently Asked Questions (FAQ) */}
      <section className="py-20 bg-[#14231B] border-t border-[#2C3E33]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#D4AF37] block mb-2">
              Help & Information
            </span>
            <h2 className="text-3xl font-serif text-[#F5F2EB] font-medium">
              Frequently Asked Questions (FAQ)
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#1E2A22] rounded-2xl border border-[#3B5244] overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-[#F5F2EB] hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {expandedFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#9EA89F] shrink-0" />
                  )}
                </button>
                {expandedFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-[#C2BCB0] leading-relaxed border-t border-[#2C3E33]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Leave Review Modal */}
      {isCommentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E2A22] rounded-3xl border border-[#3B5244] max-w-md w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2C3E33]">
              <h3 className="text-base font-serif font-bold text-[#F5F2EB]">
                Share Your Experience
              </h3>
              <button
                onClick={() => setIsCommentModalOpen(false)}
                className="text-xs text-[#C2BCB0] hover:text-[#F5F2EB] px-2 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {commentSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-300">Thank you!</h4>
                <p className="text-xs text-[#C2BCB0]">Your review has been submitted successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] text-[#C2BCB0] font-semibold mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={commentForm.author}
                    onChange={(e) => setCommentForm({ ...commentForm, author: e.target.value })}
                    placeholder="e.g. Ruwan Jayawardena"
                    className="w-full px-3 py-2 rounded-xl bg-[#14231B] border border-[#3B5244] text-xs text-[#F5F2EB]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#C2BCB0] font-semibold mb-1">Your City / Country</label>
                  <input
                    type="text"
                    required
                    value={commentForm.cityOrCountry}
                    onChange={(e) => setCommentForm({ ...commentForm, cityOrCountry: e.target.value })}
                    placeholder="e.g. Colombo, Sri Lanka / London, UK"
                    className="w-full px-3 py-2 rounded-xl bg-[#14231B] border border-[#3B5244] text-xs text-[#F5F2EB]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#C2BCB0] font-semibold mb-1">Experience Type</label>
                    <select
                      value={commentForm.category}
                      onChange={(e) => setCommentForm({ ...commentForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#14231B] border border-[#3B5244] text-xs text-[#F5F2EB]"
                    >
                      <option value="Villa Stay">Villa Stay</option>
                      <option value="Pure Kithul">Pure Kithul</option>
                      <option value="Camping Gear">Camping Gear</option>
                      <option value="Tour Guide">Tour Guide</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#C2BCB0] font-semibold mb-1">Rating</label>
                    <select
                      value={commentForm.rating}
                      onChange={(e) => setCommentForm({ ...commentForm, rating: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#14231B] border border-[#3B5244] text-xs text-[#F5F2EB]"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#C2BCB0] font-semibold mb-1">Stayed Villa / Product</label>
                  <input
                    type="text"
                    value={commentForm.stayedAtOrOrdered}
                    onChange={(e) => setCommentForm({ ...commentForm, stayedAtOrOrdered: e.target.value })}
                    placeholder="e.g. Sinharaja Gin Ganga Villa"
                    className="w-full px-3 py-2 rounded-xl bg-[#14231B] border border-[#3B5244] text-xs text-[#F5F2EB]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#C2BCB0] font-semibold mb-1">Your Review / Comment</label>
                  <textarea
                    required
                    rows={3}
                    value={commentForm.comment}
                    onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                    placeholder="Share your experience with the stay, food, nature, or service..."
                    className="w-full px-3 py-2 rounded-xl bg-[#14231B] border border-[#3B5244] text-xs text-[#F5F2EB]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingComment}
                  className="w-full py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] font-bold text-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingComment ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Track Booking Modal */}
      <TrackModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
      />
    </div>
  );
}
