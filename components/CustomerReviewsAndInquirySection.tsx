'use client';

import React, { useState } from 'react';
import { 
  Star, MessageSquare, Send, CheckCircle2, 
  HelpCircle, User, Phone, Mail, Sparkles, 
  ShieldCheck, AlertCircle, MessageCircle, ArrowRight
} from 'lucide-react';
import { CustomerComment, CustomerInquiry } from '@/lib/types';
import { CUSTOMER_COMMENTS, AGENCY_CONFIG } from '@/lib/data';
import { useWhatsApp } from '@/lib/useWhatsApp';

interface CustomerReviewsAndInquirySectionProps {
  comments?: CustomerComment[];
}

export default function CustomerReviewsAndInquirySection({ 
  comments = CUSTOMER_COMMENTS 
}: CustomerReviewsAndInquirySectionProps) {
  const { phone: agencyPhone, email: agencyEmail, getWhatsAppLink } = useWhatsApp();
  const [commentList, setCommentList] = useState<CustomerComment[]>(comments);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  // New Comment Form State
  const [commentForm, setCommentForm] = useState({
    author: '',
    cityOrCountry: '',
    rating: 5,
    category: 'Pure Kithul & Hakuru' as CustomerComment['category'],
    stayedAtOrOrdered: '',
    comment: ''
  });
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState('');
  const [commentError, setCommentError] = useState('');

  // Inquiry Form State
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Kithul Delivery to Villa & Stay Details',
    message: ''
  });
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState('');
  const [inquiryError, setInquiryError] = useState('');

  // Handle Submit Comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');

    if (!commentForm.author.trim() || !commentForm.comment.trim()) {
      setCommentError('Please fill in your name and comment text.');
      return;
    }

    setCommentSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm)
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setCommentList(prev => [data.comment, ...prev]);
        setCommentSuccess('Thank you! Your feedback has been published on the wall.');
        setCommentForm({
          author: '',
          cityOrCountry: '',
          rating: 5,
          category: 'Pure Kithul & Hakuru',
          stayedAtOrOrdered: '',
          comment: ''
        });
        setTimeout(() => {
          setIsCommentModalOpen(false);
          setCommentSuccess('');
        }, 2200);
      } else {
        setCommentError(data.message || 'Failed to submit comment.');
      }
    } catch {
      setCommentError('Network error. Please try again.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Handle Submit Inquiry
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryError('');

    if (!inquiryForm.name.trim() || !inquiryForm.phone.trim() || !inquiryForm.message.trim()) {
      setInquiryError('Please enter your name, phone number and inquiry message.');
      return;
    }

    setInquirySubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryForm)
      });
      const data = await res.json();
      if (data.success) {
        setInquirySuccess('Inquiry sent! Our Lankagama team will reply to your WhatsApp shortly.');
        setInquiryForm({
          name: '',
          phone: '',
          email: '',
          subject: 'Kithul Delivery to Villa & Stay Details',
          message: ''
        });
        setTimeout(() => setInquirySuccess(''), 5000);
      } else {
        setInquiryError(data.message || 'Failed to send inquiry.');
      }
    } catch {
      setInquiryError('Network error. You can also chat with us directly on WhatsApp.');
    } finally {
      setInquirySubmitting(false);
    }
  };

  const directWhatsAppInquiryUrl = getWhatsAppLink(
    `Hello The Sinharaja Collection Lankagama! 🌿\nI have an inquiry:\nName: ${inquiryForm.name || 'Guest'}\nTopic: ${inquiryForm.subject}\nMessage: ${inquiryForm.message || 'I would like more information.'}`
  );

  return (
    <section id="reviews" className="py-24 bg-[#16271E] text-[#F5F2EB] relative border-b border-[#2C3E33]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ============================================================
           PART 1: CUSTOMER COMMENTS & EXPERIENCES
           ============================================================ */}
        <div className="space-y-4 mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#2C3E33] pb-8">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2C3E33] border border-[#3B5244] text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Guest Testimonials • Verified Experiences</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#F5F2EB]">
                What Travelers Say About Our <span className="italic text-[#D4AF37]">Stays & Kithul</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed">
                Authentic impressions from international trekkers, nature lovers, and travelers who experienced our stays, pure rainforest Kithul, fresh toddy, and camping adventures.
              </p>
            </div>

            <button
              onClick={() => setIsCommentModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md self-start md:self-auto shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Testimonial Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {commentList.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="bg-[#1E2A22] rounded-3xl p-6 border border-[#3B5244] hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  {/* Rating Stars and Category Badge */}
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
                  <p className="text-xs text-[#E1DCD3] leading-relaxed italic mb-4">
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
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================
           PART 2: INQUIRIES & QUESTIONS FORM
           ============================================================ */}
        <div className="bg-[#1E2A22] rounded-3xl p-6 sm:p-10 border border-[#3B5244] shadow-2xl mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14231B] border border-[#3B5244] text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions & Concierge • Support</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif text-[#F5F2EB] font-medium">
              Have Questions Before Visiting Lankagama?
            </h3>

            <p className="text-xs sm:text-sm text-[#C2BCB0] leading-relaxed">
              Planning your rainforest journey to Lankagama? Inquire about real-time road conditions, private villa vacancies, doorstep Kithul delivery, or camping gear rentals.
            </p>

            <div className="space-y-3 pt-3 border-t border-[#3B5244]">
              <div className="flex items-start gap-3 text-xs text-[#E1DCD3]">
                <div className="w-7 h-7 rounded-lg bg-[#14231B] flex items-center justify-center text-[#D4AF37] shrink-0 border border-[#3B5244]">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#C2BCB0] block text-[11px]">Phone & WhatsApp Desk</span>
                  <span className="font-semibold">{agencyPhone || AGENCY_CONFIG.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-[#E1DCD3]">
                <div className="w-7 h-7 rounded-lg bg-[#14231B] flex items-center justify-center text-[#D4AF37] shrink-0 border border-[#3B5244]">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[#C2BCB0] block text-[11px]">Email Desk</span>
                  <span className="font-semibold">{agencyEmail || AGENCY_CONFIG.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={directWhatsAppInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C3E33] hover:bg-[#3B5244] text-[#D4AF37] border border-[#3B5244] text-xs font-semibold transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-[#D4AF37]" />
                <span>Quick Inquiry via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Inquiry Form Column */}
          <div className="lg:col-span-7 bg-[#14231B] p-6 sm:p-7 rounded-2xl border border-[#3B5244]">
            <h4 className="text-base font-serif text-[#F5F2EB] font-medium mb-1">
              Send an Instant Inquiry
            </h4>
            <p className="text-xs text-[#C2BCB0] mb-5">
              Fill out the form below. We log your request in our system and reply directly to your WhatsApp.
            </p>

            {inquirySuccess && (
              <div className="mb-4 p-3.5 bg-emerald-950/70 border border-emerald-600 rounded-xl flex items-center gap-2 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{inquirySuccess}</span>
              </div>
            )}

            {inquiryError && (
              <div className="mb-4 p-3.5 bg-red-950/70 border border-red-700 rounded-xl flex items-center gap-2 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{inquiryError}</span>
              </div>
            )}

            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1">
                    Your Name <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ruwan Silva"
                    value={inquiryForm.name}
                    onChange={e => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#1E2A22] text-[#F5F2EB] placeholder:text-[#9EA89F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1">
                    WhatsApp Number <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 077 123 4567"
                    value={inquiryForm.phone}
                    onChange={e => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#1E2A22] text-[#F5F2EB] placeholder:text-[#9EA89F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1">
                  Inquiry Topic
                </label>
                <select
                  value={inquiryForm.subject}
                  onChange={e => setInquiryForm({ ...inquiryForm, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#1E2A22] text-[#F5F2EB]"
                >
                  <option value="Kithul Delivery to Villa & Stay Details">Pure Kithul Treacle & Jaggery Villa Delivery</option>
                  <option value="Fresh Kithul Raa & Tasting Experience">Fresh Toddy Tasting & Live Palm Tour</option>
                  <option value="Villa Availability & Bookings">Villa & Homestay Availability</option>
                  <option value="Expedition Camping Sets & BBQ">Camping Equipment & Tent Packages</option>
                  <option value="Road Conditions & 4WD Need">Road Conditions (Neluwa to Lankagama route)</option>
                  <option value="Other Custom Group Inquiries">Other Custom Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1">
                  Message / Question <span className="text-[#D4AF37]">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ask us anything about your upcoming Lankagama stay, kithul orders, or activities..."
                  value={inquiryForm.message}
                  onChange={e => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#1E2A22] text-[#F5F2EB] placeholder:text-[#9EA89F]"
                />
              </div>

              <button
                type="submit"
                disabled={inquirySubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {inquirySubmitting ? (
                  <span>Sending Inquiry...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Inquiry to Agency Desk</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* ============================================================
         LEAVE A REVIEW MODAL
         ============================================================ */}
      {isCommentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-[#1E2A22] text-[#F5F2EB] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-[#3B5244] animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#14231B] p-5 flex items-center justify-between border-b border-[#3B5244]">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#D4AF37] block">
                  Guest Feedback • Verified Reviews
                </span>
                <h3 className="text-base font-serif font-medium text-[#F5F2EB]">
                  Write a Review or Comment
                </h3>
              </div>
              <button
                onClick={() => setIsCommentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#2C3E33] flex items-center justify-center text-[#F5F2EB] hover:bg-[#3B5244] transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCommentSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {commentSuccess && (
                <div className="p-3 bg-emerald-950/70 border border-emerald-600 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{commentSuccess}</span>
                </div>
              )}

              {commentError && (
                <div className="p-3 bg-red-950/70 border border-red-700 rounded-xl text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{commentError}</span>
                </div>
              )}

              {/* Star Rating Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1.5">
                  Your Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCommentForm({ ...commentForm, rating: star })}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= commentForm.rating
                            ? 'fill-[#D4AF37] text-[#D4AF37]'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-[#D4AF37] font-bold ml-2">
                    {commentForm.rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Author Name */}
              <div>
                <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1">
                  Your Full Name <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Fernando"
                  value={commentForm.author}
                  onChange={e => setCommentForm({ ...commentForm, author: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#14231B] text-[#F5F2EB]"
                />
              </div>

              {/* City or Country */}
              <div>
                <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1">
                  City or Country
                </label>
                <input
                  type="text"
                  placeholder="e.g. Colombo, Sri Lanka / Melbourne, Australia"
                  value={commentForm.cityOrCountry}
                  onChange={e => setCommentForm({ ...commentForm, cityOrCountry: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#14231B] text-[#F5F2EB]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1">
                  Experience Category
                </label>
                <select
                  value={commentForm.category}
                  onChange={e => setCommentForm({ ...commentForm, category: e.target.value as CustomerComment['category'] })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#14231B] text-[#F5F2EB]"
                >
                  <option value="Pure Kithul & Hakuru">Pure Kithul Treacle & Jaggery</option>
                  <option value="Fresh Raa Experience">Fresh Kithul Raa & Tasting Tour</option>
                  <option value="Villa Stay">Villa & Nature Stay</option>
                  <option value="Camping Gear">Camping Gear & Tents</option>
                  <option value="General">General Trip Experience</option>
                </select>
              </div>

              {/* Stayed At or Ordered */}
              <div>
                <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1">
                  Villa Stayed at or Item Ordered (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gin Ganga River Edge Villa / 750ml Kithul Bottle"
                  value={commentForm.stayedAtOrOrdered}
                  onChange={e => setCommentForm({ ...commentForm, stayedAtOrOrdered: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#14231B] text-[#F5F2EB]"
                />
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1">
                  Your Review / Comment <span className="text-[#D4AF37]">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share your experience about the villa stay, taste of the pure kithul treacle, fresh toddy, or camping..."
                  value={commentForm.comment}
                  onChange={e => setCommentForm({ ...commentForm, comment: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#14231B] text-[#F5F2EB]"
                />
              </div>

              <button
                type="submit"
                disabled={commentSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {commentSubmitting ? (
                  <span>Publishing Review...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Post Review to Wall</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}
