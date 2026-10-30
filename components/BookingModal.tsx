'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, Calendar, User, Phone, Users, FileText, Clock, 
  MessageCircle, AlertCircle, ArrowRight, Compass,
  Snowflake, Wind, Utensils, Home, BedDouble
} from 'lucide-react';
import { AGENCY_CONFIG } from '@/lib/data';
import { BookingType } from '@/lib/types';
import { useWhatsApp } from '@/lib/useWhatsApp';
import { useModalHistory } from '@/lib/useModalHistory';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingType: BookingType;
  item: {
    id: string;
    name: string;
    sinhalaName?: string;
    price: number;
    priceAc?: number;
    pricePerRoom?: number;
    pricePerRoomAc?: number;
    bookingScopeAvailable?: 'both' | 'full_only' | 'room_only';
    bedrooms?: number;
    maxGuests?: number;
    unitLabel?: string;
    imageUrl?: string;
    acType?: 'ac' | 'non-ac' | 'both';
    hasKitchen?: boolean;
  } | null;
}

export default function BookingModal({ isOpen, onClose, bookingType, item }: BookingModalProps) {
  const { getWhatsAppLink } = useWhatsApp();
  const [todayStr, setTodayStr] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setTodayStr(new Date().toISOString().split('T')[0]);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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
  const [bookingScope, setBookingScope] = useState<'full_villa' | 'room_only'>(
    item?.bookingScopeAvailable === 'room_only' ? 'room_only' : 'full_villa'
  );
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [acPreference, setAcPreference] = useState<'ac' | 'non-ac'>(
    item?.acType === 'non-ac' ? 'non-ac' : 'ac'
  );
  const [orderMeals, setOrderMeals] = useState<boolean>(false);

  useEffect(() => {
    if (item?.bookingScopeAvailable === 'room_only') {
      setBookingScope('room_only');
    } else {
      setBookingScope('full_villa');
    }
    setRoomsCount(1);
    setAcPreference(item?.acType === 'non-ac' ? 'non-ac' : 'ac');
  }, [item?.id, item?.bookingScopeAvailable, item?.acType]);

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
    bookingScope?: 'full_villa' | 'room_only';
    roomsCount?: number;
    orderMeals?: boolean;
  } | null>(null);

  const resetAndClose = useCallback(() => {
    setSubmittedBooking(null);
    setNeedGuide(false);
    setOrderMeals(false);
    setBookingScope(item?.bookingScopeAvailable === 'room_only' ? 'room_only' : 'full_villa');
    setRoomsCount(1);
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
  }, [item?.acType, item?.bookingScopeAvailable, onClose]);

  useModalHistory({
    isOpen: Boolean(isOpen && item),
    onClose: resetAndClose,
    modalId: item ? `booking-${item.id}` : 'booking'
  });

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

  const getRoomRate = () => {
    if (!item) return 0;
    if (acPreference === 'ac' && item.pricePerRoomAc) {
      return item.pricePerRoomAc;
    }
    if (item.pricePerRoom) {
      return item.pricePerRoom;
    }
    return Math.round(item.price * 0.55);
  };

  const getFullVillaRate = () => {
    if (!item) return 0;
    if (acPreference === 'ac' && item.priceAc) {
      return item.priceAc;
    }
    return item.price;
  };

  const getDailyRate = () => {
    if (bookingType === 'villa') {
      if (bookingScope === 'room_only') {
        return getRoomRate();
      }
      return getFullVillaRate();
    }
    return item?.price || 0;
  };

  const currentDailyRate = getDailyRate();
  const roomsMultiplier = (bookingType === 'villa' && bookingScope === 'room_only') ? roomsCount : 1;
  const basePrice = currentDailyRate * roomsMultiplier * days;
  const guideFee = needGuide ? (GUIDE_DAILY_RATE * days) : 0;
  const estimatedTotal = basePrice + guideFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.customerName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.customerPhone.trim() || formData.customerPhone.length < 9) {
      setError('Please provide a valid WhatsApp / contact number');
      return;
    }
    if (!formData.checkInDate) {
      setError('Please select your arrival date');
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
          bookingScope: bookingType === 'villa' ? bookingScope : undefined,
          roomsCount: bookingType === 'villa' && bookingScope === 'room_only' ? roomsCount : undefined,
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

  const getWhatsAppBookingText = () => {
    if (!submittedBooking) return '';
    const scopeLine = bookingType === 'villa'
      ? `🏡 Reservation Scope: ${submittedBooking.bookingScope === 'room_only' ? `ROOM ONLY (${submittedBooking.roomsCount || 1} Room${(submittedBooking.roomsCount || 1) > 1 ? 's' : ''})` : 'FULL VILLA (Entire Private Villa)'}\n`
      : '';
    const acLine = bookingType === 'villa' 
      ? `❄️ Room Type: ${submittedBooking.acPreference === 'ac' ? 'A/C Room' : 'Non-A/C Natural Breeze'}\n` 
      : '';
    const mealLine = bookingType === 'villa'
      ? `🍲 Village Meals: ${submittedBooking.orderMeals ? 'YES (Authentic Village Meals Requested)' : 'NO (Room Only)'}\n`
      : '';

    return `Hello The Sinharaja Collection Lankagama! 🌿
I just submitted a booking request on your website.

📌 Booking Ref: ${submittedBooking.id}
🏠 Item: ${submittedBooking.itemName}
${scopeLine}${acLine}${mealLine}📅 Date: ${submittedBooking.checkInDate} ${submittedBooking.checkOutDate ? 'to ' + submittedBooking.checkOutDate : ''}
👥 Guests: ${submittedBooking.guestsCount}
🧭 Tour Guide: ${submittedBooking.needGuide ? `YES (Rs. ${(submittedBooking.guideFee || 4000).toLocaleString()} included)` : 'NO (Not needed)'}
💰 Total Est: Rs. ${submittedBooking.totalLKR.toLocaleString()}
👤 Name: ${formData.customerName}
📞 Phone: ${formData.customerPhone}

Please verify live availability with the host and confirm my booking. Thank you!`;
  };

  const whatsappShareUrl = getWhatsAppLink(getWhatsAppBookingText());

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
                <span className="text-[10px] uppercase tracking-wider text-[#C2BCB0] font-medium block">
                  {bookingType === 'villa' 
                    ? (bookingScope === 'room_only' ? '🛏️ Single Room Rate' : '🏠 Full Villa Rate')
                    : 'Standard Rate'}
                </span>
                <div className="text-lg font-bold text-[#F5F2EB] font-mono">
                  Rs. {currentDailyRate.toLocaleString()} <span className="text-xs font-normal text-[#C2BCB0] font-sans">/{item.unitLabel || 'night'}{bookingType === 'villa' && bookingScope === 'room_only' ? ' / room' : ''}</span>
                </div>
                {bookingType === 'villa' && (
                  <span className="text-[11px] text-[#C2BCB0] block">
                    {bookingScope === 'room_only'
                      ? `${roomsCount} Room${roomsCount > 1 ? 's' : ''} • ${acPreference === 'ac' ? '❄️ A/C' : '🍃 Non-A/C'}`
                      : `Entire Property • ${acPreference === 'ac' ? '❄️ A/C' : '🍃 Non-A/C'}`}
                  </span>
                )}
                {needGuide && (
                  <span className="text-[11px] text-[#D4AF37] block mt-0.5 font-medium">
                    + Guide: Rs. {(GUIDE_DAILY_RATE * days).toLocaleString()} ({days} {days === 1 ? 'day' : 'days'})
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#C2BCB0] font-medium block">
                  Total ({days} {days === 1 ? (bookingType === 'villa' ? 'night' : 'day') : (bookingType === 'villa' ? 'nights' : 'days')})
                </span>
                <div className="text-lg font-bold text-[#D4AF37] font-mono">
                  Rs. {estimatedTotal.toLocaleString()}
                </div>
                {bookingType === 'villa' && bookingScope === 'room_only' && roomsCount > 1 && (
                  <span className="text-[10px] text-[#C2BCB0] block">({roomsCount} rooms)</span>
                )}
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
                    min={todayStr}
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
                    min={formData.checkInDate || todayStr}
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

            {/* Villa Specific Options: Scope, A/C Preference & Village Meals */}
            {bookingType === 'villa' && (
              <>
                {/* 1. Booking Scope Selection: Full Villa vs Room Only */}
                {item?.bookingScopeAvailable !== 'full_only' && item?.bookingScopeAvailable !== 'room_only' && (
                  <div className="bg-[#243329] p-3.5 rounded-2xl border border-[#3B5244] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#F5F2EB] flex items-center gap-1.5">
                        <Home className="w-4 h-4 text-[#D4AF37]" />
                        <span>Reservation Scope / වෙන්කිරීම් වර්ගය</span>
                      </label>
                      <span className="text-[10px] text-[#D4AF37] font-semibold bg-[#1E2A22] px-2 py-0.5 rounded border border-[#3B5244]">
                        {bookingScope === 'full_villa' ? 'Entire Villa' : 'Single Room(s)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBookingScope('full_villa')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                          bookingScope === 'full_villa'
                            ? 'bg-[#D4AF37] text-[#14231B] border-[#D4AF37] font-bold shadow-md'
                            : 'bg-[#1E2A22] text-[#F5F2EB] border-[#3B5244] hover:border-[#D4AF37]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Home className={`w-3.5 h-3.5 ${bookingScope === 'full_villa' ? 'text-[#14231B]' : 'text-[#D4AF37]'}`} />
                          <span>🏠 Full Villa</span>
                        </div>
                        <span className={`text-[10px] font-mono ${bookingScope === 'full_villa' ? 'text-[#14231B]/90' : 'text-[#D4AF37]'}`}>
                          Rs. {getFullVillaRate().toLocaleString()} / night
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBookingScope('room_only')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                          bookingScope === 'room_only'
                            ? 'bg-[#D4AF37] text-[#14231B] border-[#D4AF37] font-bold shadow-md'
                            : 'bg-[#1E2A22] text-[#F5F2EB] border-[#3B5244] hover:border-[#D4AF37]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <BedDouble className={`w-3.5 h-3.5 ${bookingScope === 'room_only' ? 'text-[#14231B]' : 'text-[#D4AF37]'}`} />
                          <span>🛏️ Room Only</span>
                        </div>
                        <span className={`text-[10px] font-mono ${bookingScope === 'room_only' ? 'text-[#14231B]/90' : 'text-[#D4AF37]'}`}>
                          Rs. {getRoomRate().toLocaleString()} / room
                        </span>
                      </button>
                    </div>

                    {bookingScope === 'room_only' && (
                      <div className="pt-2 border-t border-[#3B5244] flex items-center justify-between text-xs">
                        <span className="text-[#C2BCB0]">Number of Rooms:</span>
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: item.bedrooms || 2 }, (_, i) => i + 1).map(num => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setRoomsCount(num)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                roomsCount === num
                                  ? 'bg-[#D4AF37] text-[#14231B] border-[#D4AF37]'
                                  : 'bg-[#1E2A22] text-[#F5F2EB] border-[#3B5244] hover:border-[#D4AF37]'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                          <span className="text-[11px] text-[#C2BCB0]">room{roomsCount > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. A/C Selection */}
                <div className="bg-[#243329] p-3.5 rounded-2xl border border-[#3B5244] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#F5F2EB] flex items-center gap-1.5">
                      <Snowflake className="w-4 h-4 text-[#D4AF37]" />
                      <span>{bookingScope === 'room_only' ? 'Room A/C Preference' : 'Villa A/C Preference'}</span>
                    </label>
                    <span className="text-[10px] text-[#D4AF37] font-semibold bg-[#1E2A22] px-2 py-0.5 rounded border border-[#3B5244]">
                      {item?.acType === 'ac' ? 'A/C Only' : item?.acType === 'non-ac' ? 'Non-A/C Only' : 'A/C & Non-A/C Available'}
                    </span>
                  </div>

                  {item?.acType === 'ac' ? (
                    <div className="p-2.5 bg-[#14231B] rounded-xl border border-[#3B5244] text-xs text-[#F5F2EB] flex items-center gap-2">
                      <Snowflake className="w-4 h-4 text-[#D4AF37]" />
                      <span>❄️ Air Conditioned (A/C) {bookingScope === 'room_only' ? 'Room' : 'Villa'} included</span>
                    </div>
                  ) : item?.acType === 'non-ac' ? (
                    <div className="p-2.5 bg-[#14231B] rounded-xl border border-[#3B5244] text-xs text-[#F5F2EB] flex items-center gap-2">
                      <Wind className="w-4 h-4 text-[#D4AF37]" />
                      <span>🍃 Non-A/C Natural Rainforest Breeze</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setAcPreference('ac')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                          acPreference === 'ac'
                            ? 'bg-[#D4AF37] text-[#14231B] border-[#D4AF37] font-bold shadow-xs'
                            : 'bg-[#1E2A22] text-[#F5F2EB] border-[#3B5244] hover:border-[#D4AF37]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Snowflake className={`w-3.5 h-3.5 ${acPreference === 'ac' ? 'text-[#14231B]' : 'text-[#D4AF37]'}`} />
                          <span>❄️ A/C {bookingScope === 'room_only' ? 'Room' : 'Villa'}</span>
                        </div>
                        <span className={`text-[10px] font-mono ${acPreference === 'ac' ? 'text-[#14231B]/90' : 'text-[#D4AF37]'}`}>
                          Rs. {(bookingScope === 'room_only' ? (item.pricePerRoomAc || Math.round((item.priceAc || 15000) * 0.55)) : (item.priceAc || item.price)).toLocaleString()} / night
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAcPreference('non-ac')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                          acPreference === 'non-ac'
                            ? 'bg-[#D4AF37] text-[#14231B] border-[#D4AF37] font-bold shadow-xs'
                            : 'bg-[#1E2A22] text-[#F5F2EB] border-[#3B5244] hover:border-[#D4AF37]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Wind className={`w-3.5 h-3.5 ${acPreference === 'non-ac' ? 'text-[#14231B]' : 'text-[#D4AF37]'}`} />
                          <span>🍃 Non-A/C {bookingScope === 'room_only' ? 'Room' : 'Villa'}</span>
                        </div>
                        <span className={`text-[10px] font-mono ${acPreference === 'non-ac' ? 'text-[#14231B]/90' : 'text-[#C2BCB0]'}`}>
                          Rs. {(bookingScope === 'room_only' ? (item.pricePerRoom || Math.round(item.price * 0.55)) : item.price).toLocaleString()} / night
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Village Food & Meals Option */}
                <div className="bg-[#243329] p-3.5 rounded-2xl border border-[#3B5244] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#F5F2EB] flex items-center gap-1.5">
                      <Utensils className="w-4 h-4 text-[#D4AF37]" />
                      <span>Authentic Woodfire Village Dining</span>
                    </label>
                    <span className="text-[10px] text-[#D4AF37] font-semibold font-mono bg-[#1E2A22] px-2 py-0.5 rounded border border-[#3B5244]">
                      Woodfire Meals
                    </span>
                  </div>
                  <p className="text-[11px] text-[#C2BCB0] leading-snug">
                    Traditional Sri Lankan clay-pot curries prepared over woodfire with homegrown organic vegetables, freshwater catch, and village breakfast.
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
                      <span>✕ Room Only (No Meals)</span>
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
                      <span>✓ Add Village Meals</span>
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
                  <span>Accredited Sinharaja Rainforest Guide</span>
                </label>
                <span className="text-[10px] text-[#D4AF37] font-semibold font-mono bg-[#1E2A22] px-2 py-0.5 rounded border border-[#3B5244]">
                  +Rs. 4,000 / day
                </span>
              </div>
              <p className="text-[11px] text-[#C2BCB0] leading-snug">
                Certified native naturalist to safely guide you to secluded waterfalls, hidden river pools, and endemic wildlife trails.
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
                  <span>✕ No Guide Needed</span>
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
                  <span>✓ Include Local Guide</span>
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
                Your request has been received. Our concierge team is verifying real-time host availability and will confirm your reservation via WhatsApp within 15 minutes.
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
              {submittedBooking.bookingScope && (
                <div className="flex justify-between">
                  <span className="text-[#C2BCB0]">Booking Scope:</span>
                  <span className="font-semibold text-[#D4AF37]">
                    {submittedBooking.bookingScope === 'room_only' 
                      ? `🛏️ Room Only (${submittedBooking.roomsCount || 1} Room${(submittedBooking.roomsCount || 1) > 1 ? 's' : ''})` 
                      : '🏠 Full Villa (Entire Property)'}
                  </span>
                </div>
              )}
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
                <span>Open Pre-filled WhatsApp Voucher</span>
              </a>
              <p className="text-[11px] text-[#C2BCB0] font-normal leading-relaxed">
                Clicking opens WhatsApp with your pre-filled details. Please tap <strong className="text-[#D4AF37]">Send</strong> in WhatsApp to confirm directly with our lodge desk.
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
