'use client';

import React, { useState } from 'react';
import { X, Clock, CheckCircle2, XCircle, MessageCircle } from 'lucide-react';
import { Booking } from '@/lib/types';
import { useWhatsApp } from '@/lib/useWhatsApp';
import { useModalHistory } from '@/lib/useModalHistory';

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrackModal({ isOpen, onClose }: TrackModalProps) {
  useModalHistory({
    isOpen,
    onClose,
    modalId: 'track-booking'
  });

  const { getWhatsAppLink, waLink } = useWhatsApp();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);
    setBooking(null);

    try {
      const cleanQuery = encodeURIComponent(query.trim());
      const res = await fetch(`/api/bookings/${cleanQuery}`);
      const data = await res.json();

      if (data.success && data.booking) {
        setBooking(data.booking);
      } else {
        setError('No reservation found matching this reference code or phone number.');
      }
    } catch {
      setError('Communication error. Please verify your connection or inquire via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E2A22] text-[#D4AF37] text-xs font-semibold border border-[#3B5244]">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Pending Verification</span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E2A22] text-[#D4AF37] text-xs font-semibold border border-[#3B5244]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Confirmed & Reserved</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E2A22] text-[#C2BCB0] text-xs font-semibold border border-[#3B5244]">
            <XCircle className="w-3.5 h-3.5 text-[#C2BCB0]" />
            <span>Unavailable / Cancelled</span>
          </div>
        );
    }
  };

  const whatsappInquiryUrl = booking
    ? getWhatsAppLink(`Hello The Sinharaja Collection Lankagama! Inquiring about my reservation ${booking.id} (${booking.itemName}). Status is ${booking.status.toUpperCase()}.`)
    : waLink;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-[#1E2A22] text-[#F5F2EB] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-[#3B5244] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#14231B] text-[#F5F2EB] p-5 px-6 flex items-center justify-between border-b border-[#3B5244]">
          <div>
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#D4AF37] block">
              Guest Services
            </span>
            <h3 className="text-lg font-serif font-medium text-[#F5F2EB] mt-0.5">
              Track Reservation Status
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2C3E33] hover:bg-[#3B5244] flex items-center justify-center text-[#F5F2EB] cursor-pointer border border-[#3B5244]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider">
              Enter Booking Ref (e.g. LET-8401) or Phone:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. LET-8401 or 0771234567"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-[#14231B] text-[#F5F2EB] font-medium placeholder:text-[#9EA89F]"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-[#14231B] font-semibold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Searching...' : 'Locate'}
              </button>
            </div>
            <p className="text-[11px] text-[#C2BCB0] font-normal">
              Demo sample references: <span className="font-mono text-[#D4AF37] font-semibold cursor-pointer underline" onClick={() => setQuery('LET-8401')}>LET-8401</span> (Pending) or <span className="font-mono text-[#D4AF37] font-semibold cursor-pointer underline" onClick={() => setQuery('LET-8392')}>LET-8392</span> (Approved).
            </p>
          </form>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-950/70 border border-red-700/80 rounded-xl text-xs text-red-200 font-normal">
              {error}
            </div>
          )}

          {/* Result Card */}
          {booking && (
            <div className="bg-[#2C3E33] rounded-2xl p-5 border border-[#3B5244] space-y-4 shadow-lg animate-in fade-in duration-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-mono font-bold text-[#F5F2EB] text-base">
                  #{booking.id}
                </span>
                {getStatusBadge(booking.status)}
              </div>

              {/* Status Explanation */}
              {booking.status === 'pending' && (
                <div className="p-3 bg-[#1E2A22] border border-[#3B5244] rounded-xl text-xs text-[#C2BCB0] leading-relaxed font-normal">
                  Our agency desk is verifying vacancy with the property host. We will transmit confirmation to your WhatsApp shortly.
                </div>
              )}

              {booking.status === 'approved' && (
                <div className="p-3 bg-[#1E2A22] border border-[#3B5244] rounded-xl text-xs text-[#C2BCB0] leading-relaxed font-normal">
                  Your reservation is confirmed. Your sanctuary in Lankagama is reserved for the requested dates.
                </div>
              )}

              {booking.status === 'rejected' && (
                <div className="p-3 bg-[#1E2A22] border border-[#3B5244] rounded-xl text-xs text-[#C2BCB0] leading-relaxed font-normal">
                  The requested dates are fully occupied. Please connect with our concierge via WhatsApp for alternative dates or rooms.
                </div>
              )}

              {/* Specs Table */}
              <div className="bg-[#14231B] rounded-xl p-3.5 border border-[#3B5244] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#C2BCB0]">Reserved:</span>
                  <span className="font-medium text-[#F5F2EB] text-right">{booking.itemName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#C2BCB0]">Guest Name:</span>
                  <span className="font-medium text-[#F5F2EB]">{booking.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#C2BCB0]">Check-in:</span>
                  <span className="font-medium text-[#F5F2EB]">{booking.checkInDate}</span>
                </div>
                {booking.checkOutDate && (
                  <div className="flex justify-between">
                    <span className="text-[#C2BCB0]">Check-out:</span>
                    <span className="font-medium text-[#F5F2EB]">{booking.checkOutDate}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#C2BCB0]">Trekkers:</span>
                  <span className="font-medium text-[#F5F2EB]">{booking.guestsCount} Guests</span>
                </div>
                {booking.bookingScope && (
                  <div className="flex justify-between">
                    <span className="text-[#C2BCB0]">Booking Scope:</span>
                    <span className="font-medium text-[#D4AF37]">
                      {booking.bookingScope === 'room_only' 
                        ? `🛏️ Room Only (${booking.roomsCount || 1} Room${(booking.roomsCount || 1) > 1 ? 's' : ''})` 
                        : '🏠 Full Villa'}
                    </span>
                  </div>
                )}
                {booking.acPreference && (
                  <div className="flex justify-between">
                    <span className="text-[#C2BCB0]">A/C Preference:</span>
                    <span className="font-medium text-[#F5F2EB]">{booking.acPreference === 'ac' ? '❄️ A/C Room' : '🍃 Non-A/C'}</span>
                  </div>
                )}
                {booking.orderMeals !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-[#C2BCB0]">Village Food:</span>
                    <span className="font-medium text-[#D4AF37]">{booking.orderMeals ? '🍲 Yes (Ordered)' : '✕ Not ordered'}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1.5 border-t border-[#3B5244] font-bold">
                  <span className="text-[#C2BCB0]">Estimated Total:</span>
                  <span className="text-[#D4AF37] font-mono">Rs. {booking.totalLKR.toLocaleString()}</span>
                </div>
              </div>

              {/* WhatsApp Action */}
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-[#14231B] bg-[#D4AF37] hover:bg-[#C5A880] shadow-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-[#14231B]" />
                <span>Chat with Agency on WhatsApp</span>
              </a>
            </div>
          )}

          {searched && !booking && !loading && !error && (
            <p className="text-center text-xs text-[#C2BCB0] font-normal">No matching reservation found.</p>
          )}

        </div>

      </div>
    </div>
  );
}
