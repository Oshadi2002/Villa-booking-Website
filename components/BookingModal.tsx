'use client';

import React, { useState } from 'react';
import { 
  X, Calendar, User, Phone, Users, FileText, Clock, 
  MessageCircle, AlertCircle, ArrowRight, Compass,
  Snowflake, Wind, Utensils
} from 'lucide-react';
import { AGENCY_CONFIG } from '@/lib/data';
import { BookingType } from '@/lib/types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingType: BookingType;
  item: {
    id: string;
    name: string;
    sinhalaName?: string;
    price: number;
    unitLabel?: string;
    imageUrl?: string;
    acType?: 'ac' | 'non-ac' | 'both';
    hasKitchen?: boolean;
  } | null;
}

export default function BookingModal({ isOpen, onClose, bookingType, item }: BookingModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    checkInDate: '',
    checkOutDate: '',
    guestsCount: 2,
    specialNotes: ''
  });

  const GUIDE_DAILY_RATE = 4000;
  const [needGuide, setNeedGuide] = useState(false);
  const [acPreference, setAcPreference] = useState<'ac' | 'non-ac'>(
    item?.acType === 'non-ac' ? 'non-ac' : 'ac'
  );
  const [orderMeals, setOrderMeals] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedBooking, setSubmittedBooking] = useState<{
    id: string;
    status: string;
    totalLKR: number;
    itemName: string;
    checkInDate: string;
    checkOutDate?: string;
    guestsCount: number;
    needGuide?: boolean;
    guideFee?: number;
    acPreference?: 'ac' | 'non-ac';
    orderMeals?: boolean;
  } | null>(null);

  if (!isOpen || !item) return null;

  const calculateDays = () => {
    if (!formData.checkInDate) return 1;
    if (!formData.checkOutDate || bookingType === 'guide') return 1;
    const start = new Date(formData.checkInDate);
    const end = new Date(formData.checkOutDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 1;
  };

  const days = calculateDays();
  const basePrice = item.price * days;
  const guideFee = needGuide ? (GUIDE_DAILY_RATE * days) : 0;
  const estimatedTotal = basePrice + guideFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.customerName.trim()) {
      setError('Please enter your full name (කරුණාකර ඔබේ නම ඇතුළත් කරන්න)');
      return;
    }
    if (!formData.customerPhone.trim() || formData.customerPhone.length < 9) {
      setError('Please provide a valid WhatsApp/Phone number (වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න)');
      return;
    }
    if (!formData.checkInDate) {
      setError('Please select your arrival date (පැමිණෙන දිනය තෝරන්න)');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: bookingType,
          itemId: item.id,
          itemName: item.name,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerEmail: formData.customerEmail,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate || formData.checkInDate,
          guestsCount: formData.guestsCount,
          needGuide: needGuide,
          guideFee: guideFee,
          totalLKR: estimatedTotal,
          specialNotes: formData.specialNotes,
          acPreference: bookingType === 'villa' ? acPreference : undefined,
          orderMeals: bookingType === 'villa' ? orderMeals : undefined
        })
      });

      const data = await res.json();

      if (data.success && data.booking) {
        setSubmittedBooking(data.booking);
      } else {
        setError(data.message || 'Failed to submit booking request.');
      }
    } catch {
      setError('Network error. Please try again or message us on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setSubmittedBooking(null);
    setNeedGuide(false);
    setOrderMeals(false);
    setAcPreference(item?.acType === 'non-ac' ? 'non-ac' : 'ac');
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      checkInDate: '',
      checkOutDate: '',
      guestsCount: 2,
      specialNotes: ''
    });
    setError('');
    onClose();
  };

  const getWhatsAppBookingText = () => {
    if (!submittedBooking) return '';
    const acLine = bookingType === 'villa' 
      ? `❄️ Room Type: ${submittedBooking.acPreference === 'ac' ? 'A/C Room (A/C කාමරය)' : 'Non-A/C Room (Non-A/C කාමරය)'}\n` 
      : '';
    const mealLine = bookingType === 'villa'
      ? `🍲 Village Meals: ${submittedBooking.orderMeals ? 'YES (ගමේ කෑම ඇනවුම් කර ඇත)' : 'NO (කෑම අවශ්‍ය නැත)'}\n`
      : '';

    return `Hello The Sinharaja Collection Lankagama! 🌿
I just submitted a booking request on your website.

📌 Booking Ref: ${submittedBooking.id}
🏠 Item: ${submittedBooking.itemName}
${acLine}${mealLine}📅 Date: ${submittedBooking.checkInDate} ${submittedBooking.checkOutDate ? 'to ' + submittedBooking.checkOutDate : ''}
👥 Guests: ${submittedBooking.guestsCount}
🧭 Tour Guide: ${submittedBooking.needGuide ? `YES (Rs. ${(submittedBooking.guideFee || 4000).toLocaleString()} included)` : 'NO (Not needed)'}
💰 Total Est: Rs. ${submittedBooking.totalLKR.toLocaleString()}
👤 Name: ${formData.customerName}
📞 Phone: ${formData.customerPhone}

Please verify live availability with the host and confirm my booking. Thank you!`;
  };

  const whatsappShareUrl = `https://wa.me/${AGENCY_CONFIG.whatsappNumber}?text=${encodeURIComponent(getWhatsAppBookingText())}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-[#1E2A22] text-[#F5F2EB] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#3B5244] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#14231B] text-[#F5F2EB] p-5 px-6 flex items-center justify-between border-b border-[#3B5244]">
          <div>
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#D4AF37] block">
              {bookingType === 'villa' ? 'Private Villa Reservation' : bookingType === 'camping' ? 'Expedition Gear Rental' : 'Field Guide Reservation'}
            </span>
            <h3 className="text-lg font-serif font-medium text-[#F5F2EB] line-clamp-1 mt-0.5">
              {item.name}
            </h3>
          </div>
          <button
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-[#2C3E33] hover:bg-[#3B5244] flex items-center justify-center text-[#F5F2EB] transition-colors cursor-pointer border border-[#3B5244]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body or Confirmation */}
        {!submittedBooking ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Price Preview Card */}
            <div className="bg-[#2C3E33] rounded-2xl p-4 border border-[#3B5244] flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#C2BCB0] font-medium">Standard Rate</span>
                <div className="text-lg font-bold text-[#F5F2EB] font-mono">
                  Rs. {item.price.toLocaleString()} <span className="text-xs font-normal text-[#C2BCB0] font-sans">/{item.unitLabel || 'day'}</span>
                </div>
                {needGuide && (
                  <span className="text-[11px] text-[#D4AF37] block mt-0.5 font-medium">
                    + Guide: Rs. {(GUIDE_DAILY_RATE * days).toLocaleString()} ({days} {days === 1 ? 'day' : 'days'})
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#C2BCB0] font-medium">Estimated Total ({days} {days === 1 ? 'day' : 'days'})</span>
                <div className="text-lg font-bold text-[#D4AF37] font-mono">
                  Rs. {estimatedTotal.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-950/70 border border-red-700/80 rounded-xl flex items-center gap-2 text-xs text-red-200 font-normal">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1.5">
                Full Name <span className="text-[#D4AF37]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Perera"
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-[#14231B] text-[#F5F2EB] placeholder:text-[#9EA89F]"
                />
              </div>
            </div>

            {/* Phone & WhatsApp */}
            <div>
              <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1.5">
                WhatsApp / Phone Number <span className="text-[#D4AF37]">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 077 123 4567"
                  value={formData.customerPhone}
                  onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-[#14231B] text-[#F5F2EB] font-medium placeholder:text-[#9EA89F]"
                />
              </div>
              <p className="text-[11px] text-[#C2BCB0] mt-1 font-normal">
                We will dispatch your official reservation approval to this WhatsApp number.
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1.5">
                  {bookingType === 'camping' ? 'Rental Start Date' : 'Check-in Date'} <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                  <input
                    type="date"
                    required
                    value={formData.checkInDate}
                    onChange={e => setFormData({ ...formData, checkInDate: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-[#14231B] text-[#F5F2EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1.5">
                  {bookingType === 'camping' ? 'Rental End Date' : 'Check-out Date'}
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                  <input
                    type="date"
                    value={formData.checkOutDate}
                    onChange={e => setFormData({ ...formData, checkOutDate: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-[#14231B] text-[#F5F2EB]"
                  />
                </div>
              </div>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1.5">
                Number of Guests / Trekkers
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.guestsCount}
                  onChange={e => setFormData({ ...formData, guestsCount: Number(e.target.value) || 1 })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-[#14231B] text-[#F5F2EB]"
                />
              </div>
            </div>

            {/* Villa Specific Options: A/C Preference & Village Meals */}
            {bookingType === 'villa' && (
              <>
                {/* 1. A/C Selection */}
                <div className="bg-[#243329] p-3.5 rounded-2xl border border-[#3B5244] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#F5F2EB] flex items-center gap-1.5">
                      <Snowflake className="w-4 h-4 text-[#D4AF37]" />
                      <span>Room A/C Preference (A/C කාමරයක් අවශ්‍යද?)</span>
                    </label>
                    <span className="text-[10px] text-[#D4AF37] font-semibold bg-[#1E2A22] px-2 py-0.5 rounded border border-[#3B5244]">
                      {item?.acType === 'ac' ? 'A/C Only' : item?.acType === 'non-ac' ? 'Non-A/C Only' : 'A/C & Non-A/C Available'}
                    </span>
                  </div>

                  {item?.acType === 'ac' ? (
                    <div className="p-2.5 bg-[#14231B] rounded-xl border border-[#3B5244] text-xs text-[#F5F2EB] flex items-center gap-2">
                      <Snowflake className="w-4 h-4 text-[#D4AF37]" />
                      <span>❄️ Air Conditioned (A/C) Room included</span>
                    </div>
                  ) : item?.acType === 'non-ac' ? (
                    <div className="p-2.5 bg-[#14231B] rounded-xl border border-[#3B5244] text-xs text-[#F5F2EB] flex items-center gap-2">
                      <Wind className="w-4 h-4 text-[#D4AF37]" />
                      <span>🍃 Non-A/C Natural Rainforest Breeze Room</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setAcPreference('ac')}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                          acPreference === 'ac'
                            ? 'bg-[#D4AF37] text-[#14231B] border-[#D4AF37] font-bold shadow-xs'
                            : 'bg-[#1E2A22] text-[#F5F2EB] border-[#3B5244] hover:border-[#D4AF37]'
                        }`}
                      >
                        <Snowflake className={`w-3.5 h-3.5 ${acPreference === 'ac' ? 'text-[#14231B]' : 'text-[#D4AF37]'}`} />
                        <span>❄️ A/C Room (A/C)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAcPreference('non-ac')}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                          acPreference === 'non-ac'
                            ? 'bg-[#D4AF37] text-[#14231B] border-[#D4AF37] font-bold shadow-xs'
                            : 'bg-[#1E2A22] text-[#F5F2EB] border-[#3B5244] hover:border-[#D4AF37]'
                        }`}
                      >
                        <Wind className={`w-3.5 h-3.5 ${acPreference === 'non-ac' ? 'text-[#14231B]' : 'text-[#D4AF37]'}`} />
                        <span>🍃 Non-A/C Room</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Village Food & Meals Option */}
                <div className="bg-[#243329] p-3.5 rounded-2xl border border-[#3B5244] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#F5F2EB] flex items-center gap-1.5">
                      <Utensils className="w-4 h-4 text-[#D4AF37]" />
                      <span>Village Meals & Food (කෑම ඇනවුම් කරනවාද?)</span>
                    </label>
                    <span className="text-[10px] text-[#D4AF37] font-semibold font-mono bg-[#1E2A22] px-2 py-0.5 rounded border border-[#3B5244]">
                      Woodfire Meals
                    </span>
                  </div>
                  <p className="text-[11px] text-[#C2BCB0] leading-snug">
                    දර ලිපේ මැටි ඇතිලිවල පිසින සාම්ප්‍රදායික උණුසුම් ගමේ බත් සහ වෑංජන, දේශීය එළවළු, ගඟේ මාළු සහ ගමේ උදෑසන ආහාර.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setOrderMeals(false)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        !orderMeals
                          ? 'bg-[#14231B] text-[#F5F2EB] border-[#D4AF37] ring-1 ring-[#D4AF37]'
                          : 'bg-[#1E2A22] text-[#C2BCB0] border-[#3B5244] hover:bg-[#2C3E33]'
                      }`}
                    >
                      <span>✕ No Meals (කෑම අවශ්‍ය නැත)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderMeals(true)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        orderMeals
                          ? 'bg-[#D4AF37] text-[#14231B] border-[#D4AF37] font-bold shadow-xs'
                          : 'bg-[#1E2A22] text-[#F5F2EB] border-[#3B5244] hover:border-[#D4AF37]'
                      }`}
                    >
                      <Utensils className={`w-3.5 h-3.5 ${orderMeals ? 'text-[#14231B]' : 'text-[#D4AF37]'}`} />
                      <span>✓ Order Meals (කෑම අවශ්‍යයි)</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Native Rainforest Guide Option (Need / No Need) */}
            <div className="bg-[#243329] p-3.5 rounded-2xl border border-[#3B5244] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#F5F2EB] flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#D4AF37]" />
                  <span>Sinharaja Tour Guide (මගපෙන්වන්නෙක් අවශ්‍යද?)</span>
                </label>
                <span className="text-[10px] text-[#D4AF37] font-semibold font-mono bg-[#1E2A22] px-2 py-0.5 rounded border border-[#3B5244]">
                  +Rs. 4,000 / day
                </span>
              </div>
              <p className="text-[11px] text-[#C2BCB0] leading-snug">
                ගිං ගඟේ ආරක්ෂිත දියනාන තැන්, බ්‍රාහ්මණ ඇල්ල සහ සිංහරාජ මායිම් වනාන්තරය නැරඹීමට ප්‍රදේශයේ පළපුරුදු ස්වදේශික ගයිඩ් කෙනෙක්.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setNeedGuide(false)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                    !needGuide
                      ? 'bg-[#14231B] text-[#F5F2EB] border-[#D4AF37] ring-1 ring-[#D4AF37]'
                      : 'bg-[#1E2A22] text-[#C2BCB0] border-[#3B5244] hover:bg-[#2C3E33]'
                  }`}
                >
                  <span>✕ No Need (අවශ්‍ය නැත)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNeedGuide(true)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                    needGuide
                      ? 'bg-[#D4AF37] text-[#14231B] border-[#D4AF37] font-bold shadow-xs'
                      : 'bg-[#1E2A22] text-[#F5F2EB] border-[#3B5244] hover:border-[#D4AF37]'
                  }`}
                >
                  <Compass className={`w-3.5 h-3.5 ${needGuide ? 'text-[#14231B]' : 'text-[#D4AF37]'}`} />
                  <span>✓ Need Guide (අවශ්‍යයි)</span>
                </button>
              </div>
            </div>

            {/* Special Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1.5">
                Special Requests or Dietary Requirements
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                <textarea
                  rows={2}
                  placeholder="e.g. Vegetarian village meals, late arrival, extra leech socks..."
                  value={formData.specialNotes}
                  onChange={e => setFormData({ ...formData, specialNotes: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-[#14231B] text-[#F5F2EB] placeholder:text-[#9EA89F]"
                />
              </div>
            </div>

            {/* Agency Verification Notice */}
            <div className="p-3.5 bg-[#2C3E33] rounded-2xl border border-[#3B5244] text-xs text-[#C2BCB0] leading-relaxed font-normal">
              <div className="font-semibold text-[#F5F2EB] flex items-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>Verification & Approval Protocol</span>
              </div>
              Your booking request is logged as <strong className="text-[#D4AF37]">Pending</strong>. Our agency immediately contacts the host to verify live vacancy, then delivers your approved booking voucher via WhatsApp. No advance card charge is required now.
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-xs sm:text-sm text-[#14231B] bg-[#D4AF37] hover:bg-[#C5A880] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <span>Submitting Request...</span>
              ) : (
                <>
                  <span>Request Booking (Status: Pending)</span>
                  <ArrowRight className="w-4 h-4 text-[#14231B]" />
                </>
              )}
            </button>

          </form>
        ) : (
          /* Confirmation Screen */
          <div className="p-7 text-center space-y-6">
            
            <div className="w-14 h-14 rounded-full bg-[#2C3E33] border border-[#3B5244] flex items-center justify-center mx-auto text-[#D4AF37]">
              <Clock className="w-7 h-7" strokeWidth={1.75} />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#2C3E33] text-[#D4AF37] border border-[#3B5244] text-[10px] font-semibold uppercase tracking-[0.16em] mb-2">
                Status: Pending Verification
              </span>
              <h4 className="text-2xl font-serif text-[#F5F2EB] font-medium">
                Booking Request Placed
              </h4>
              <p className="text-xs text-[#C2BCB0] mt-1 max-w-sm mx-auto font-normal leading-relaxed">
                ඉල්ලීම සාර්ථකව ලැබුණා! අපගේ කණ්ඩායම දැන් සත්කාරකයාගෙන් vacancy එක තහවුරු කර විනාඩි 15කින් ඔබට WhatsApp මගින් දන්වනු ඇත.
              </p>
            </div>

            <div className="bg-[#2C3E33] rounded-2xl p-4 border border-[#3B5244] text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#3B5244] pb-2">
                <span className="text-[#C2BCB0] font-medium">Reference Code:</span>
                <span className="font-mono font-bold text-[#F5F2EB]">{submittedBooking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C2BCB0]">Reserved Property / Gear:</span>
                <span className="font-medium text-[#F5F2EB] line-clamp-1">{submittedBooking.itemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C2BCB0]">Arrival:</span>
                <span className="font-medium text-[#F5F2EB]">{submittedBooking.checkInDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C2BCB0]">Guests:</span>
                <span className="font-medium text-[#F5F2EB]">{submittedBooking.guestsCount} Trekkers</span>
              </div>
              {submittedBooking.acPreference && (
                <div className="flex justify-between">
                  <span className="text-[#C2BCB0]">Room A/C Type:</span>
                  <span className="font-medium text-[#F5F2EB]">
                    {submittedBooking.acPreference === 'ac' ? '❄️ A/C Room' : '🍃 Non-A/C Room'}
                  </span>
                </div>
              )}
              {submittedBooking.orderMeals !== undefined && (
                <div className="flex justify-between">
                  <span className="text-[#C2BCB0]">Village Food:</span>
                  <span className={`font-semibold ${submittedBooking.orderMeals ? 'text-[#D4AF37]' : 'text-[#C2BCB0]'}`}>
                    {submittedBooking.orderMeals ? '🍲 Yes, Village Meals Ordered' : '✕ No Meals'}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#C2BCB0]">Tour Guide:</span>
                <span className={`font-semibold ${submittedBooking.needGuide ? 'text-[#D4AF37]' : 'text-[#F5F2EB]'}`}>
                  {submittedBooking.needGuide ? `✓ Requested (+Rs. ${(submittedBooking.guideFee || 4000).toLocaleString()})` : '✕ Not needed'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#3B5244] font-bold">
                <span className="text-[#C2BCB0]">Estimated Total:</span>
                <span className="text-[#D4AF37] font-mono">Rs. {submittedBooking.totalLKR.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-xs text-[#14231B] bg-[#D4AF37] hover:bg-[#C5A880] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-[#14231B]" />
                <span>Notify Agency on WhatsApp</span>
              </a>
              <p className="text-[11px] text-[#C2BCB0] font-normal">
                Transfers your booking details straight to our Lankagama desk.
              </p>
            </div>

            <button
              onClick={resetAndClose}
              className="text-xs text-[#C2BCB0] hover:text-[#F5F2EB] font-medium underline cursor-pointer"
            >
              Done, close window
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
