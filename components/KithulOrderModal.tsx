'use client';

import React, { useState } from 'react';
import { 
  X, ShoppingBag, MapPin, Calendar, Clock, 
  User, Phone, FileText, CheckCircle2, MessageCircle, 
  AlertCircle, Sparkles, Plus, Minus, ArrowRight, ShieldCheck, Wine
} from 'lucide-react';
import { KithulProduct, Villa } from '@/lib/types';
import { AGENCY_CONFIG } from '@/lib/data';

interface KithulOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: KithulProduct | null;
  villas: Villa[];
}

export default function KithulOrderModal({ isOpen, onClose, product, villas }: KithulOrderModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [deliveryLocationType, setDeliveryLocationType] = useState<'villa' | 'campsite' | 'takeaway'>('villa');
  const [selectedVillaName, setSelectedVillaName] = useState(villas[0]?.name || 'Sinharaja Gin Ganga River Edge Villa');
  const [customLocation, setCustomLocation] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning Breakfast (7:30 AM - 9:00 AM)');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState<{
    id: string;
    productName: string;
    quantity: number;
    totalLKR: number;
    destination: string;
    date: string;
    time: string;
  } | null>(null);

  if (!isOpen || !product) return null;

  const unitPrice = product.priceLKR;
  const totalPrice = unitPrice * quantity;

  const effectiveLocation = deliveryLocationType === 'villa'
    ? `Villa: ${selectedVillaName}`
    : deliveryLocationType === 'campsite'
    ? `Campsite: ${customLocation || 'Lankagama Riverside Camp'}`
    : `Pickup / Travel: ${customLocation || 'Lankagama Bridge Office'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 9) {
      setError('Please provide a valid WhatsApp contact number');
      return;
    }
    if (!deliveryDate) {
      setError('Please select a preferred delivery date');
      return;
    }

    setLoading(true);

    try {
      const isToddy = product.category === 'toddy' || product.category === 'experience';
      const bookingType = isToddy ? 'toddy' : 'kithul';

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: bookingType,
          itemId: product.id,
          itemName: `${product.name} (x${quantity})`,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          checkInDate: deliveryDate,
          checkOutDate: deliveryDate,
          guestsCount: quantity,
          totalLKR: totalPrice,
          deliveryLocation: effectiveLocation,
          quantity: quantity,
          itemsSummary: `${quantity}x ${product.name} (${product.weightOrVolume})`,
          specialNotes: `[DELIVERY TO: ${effectiveLocation}] [TIME: ${preferredTime}] ${specialNotes ? 'Note: ' + specialNotes : ''}`
        })
      });

      const data = await res.json();
      if (data.success && data.booking) {
        setSubmittedOrder({
          id: data.booking.id,
          productName: product.name,
          quantity,
          totalLKR: totalPrice,
          destination: effectiveLocation,
          date: deliveryDate,
          time: preferredTime
        });
      } else {
        setError(data.message || 'Failed to submit order. Please try again or WhatsApp us.');
      }
    } catch {
      setError('Network error while placing order. Please message us directly on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setSubmittedOrder(null);
    setQuantity(1);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryDate('');
    setSpecialNotes('');
    setError('');
    onClose();
  };

  const whatsappOrderText = () => {
    if (!submittedOrder) return '';
    return `Hello The Sinharaja Collection Lankagama! 🍯
I just placed an order for Pure Kithul / Fresh Toddy on your website.

📌 Order Ref: ${submittedOrder.id}
🛍️ Item: ${submittedOrder.productName}
📦 Quantity: ${submittedOrder.quantity} (${product.weightOrVolume})
📍 Delivery Destination: ${submittedOrder.destination}
📅 Delivery Date: ${submittedOrder.date}
⏰ Preferred Time: ${submittedOrder.time}
💰 Total Amount: Rs. ${submittedOrder.totalLKR.toLocaleString()}
👤 Customer: ${customerName}
📞 Phone: ${customerPhone}

Please confirm delivery to my location in Lankagama. Thank you!`;
  };

  const whatsappShareUrl = `https://wa.me/${AGENCY_CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappOrderText())}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-[#1E2A22] text-[#F5F2EB] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#3B5244] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#14231B] text-[#F5F2EB] p-5 px-6 flex items-center justify-between border-b border-[#3B5244]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2C3E33] border border-[#3B5244] flex items-center justify-center text-[#D4AF37]">
              {product.category === 'toddy' || product.category === 'experience' ? (
                <Wine className="w-5 h-5 text-[#D4AF37]" />
              ) : (
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4AF37] block">
                {product.category === 'experience' ? 'Live Rainforest Experience' : 'Direct Villa & Stay Delivery'}
              </span>
              <h3 className="text-base sm:text-lg font-serif font-medium text-[#F5F2EB] line-clamp-1">
                {product.name}
              </h3>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-[#2C3E33] hover:bg-[#3B5244] flex items-center justify-center text-[#F5F2EB] transition-colors cursor-pointer border border-[#3B5244]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!submittedOrder ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[82vh] overflow-y-auto">
            
            {/* Product summary card & Quantity Stepper */}
            <div className="bg-[#243329] p-4 rounded-2xl border border-[#3B5244] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] block">
                  {product.purityBadge}
                </span>
                <span className="text-xs text-[#C2BCB0] block mt-0.5">
                  Package: {product.weightOrVolume}
                </span>
                <div className="text-base font-bold text-[#F5F2EB] font-mono mt-1">
                  Rs. {unitPrice.toLocaleString()} <span className="text-xs font-normal text-[#C2BCB0] font-sans">/{product.unit}</span>
                </div>
              </div>

              {/* Quantity controller */}
              <div className="flex items-center gap-3 bg-[#14231B] px-3 py-1.5 rounded-xl border border-[#3B5244] self-start sm:self-auto">
                <span className="text-xs text-[#C2BCB0] font-medium mr-1">Qty:</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg bg-[#2C3E33] hover:bg-[#3B5244] text-[#F5F2EB] flex items-center justify-center text-xs transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold text-sm text-[#D4AF37] min-w-5 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-[#2C3E33] hover:bg-[#3B5244] text-[#F5F2EB] flex items-center justify-center text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Total Preview */}
            <div className="bg-[#2C3E33] p-3 rounded-xl border border-[#3B5244] flex items-center justify-between text-xs">
              <span className="text-[#C2BCB0] font-medium">Estimated Order Total:</span>
              <span className="text-lg font-bold text-[#D4AF37] font-mono">
                Rs. {totalPrice.toLocaleString()}
              </span>
            </div>

            {error && (
              <div className="p-3 bg-red-950/70 border border-red-700/80 rounded-xl flex items-center gap-2 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Delivery Destination Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider">
                Delivery Location in Lankagama <span className="text-[#D4AF37]">*</span>
              </label>

              {/* Destination Type Toggle */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryLocationType('villa')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                    deliveryLocationType === 'villa'
                      ? 'bg-[#14231B] text-[#D4AF37] border-[#D4AF37] ring-1 ring-[#D4AF37]'
                      : 'bg-[#243329] text-[#C2BCB0] border-[#3B5244] hover:bg-[#2C3E33]'
                  }`}
                >
                  Villa / Homestay
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryLocationType('campsite')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                    deliveryLocationType === 'campsite'
                      ? 'bg-[#14231B] text-[#D4AF37] border-[#D4AF37] ring-1 ring-[#D4AF37]'
                      : 'bg-[#243329] text-[#C2BCB0] border-[#3B5244] hover:bg-[#2C3E33]'
                  }`}
                >
                  Campsite
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryLocationType('takeaway')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                    deliveryLocationType === 'takeaway'
                      ? 'bg-[#14231B] text-[#D4AF37] border-[#D4AF37] ring-1 ring-[#D4AF37]'
                      : 'bg-[#243329] text-[#C2BCB0] border-[#3B5244] hover:bg-[#2C3E33]'
                  }`}
                >
                  Pickup / Travel
                </button>
              </div>

              {/* Villa Dropdown or Custom input */}
              {deliveryLocationType === 'villa' ? (
                <div className="relative mt-2">
                  <MapPin className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                  <select
                    value={selectedVillaName}
                    onChange={e => setSelectedVillaName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#14231B] text-[#F5F2EB]"
                  >
                    {villas.map(v => (
                      <option key={v.id} value={v.name} className="bg-[#14231B] text-[#F5F2EB]">
                        {v.name}
                      </option>
                    ))}
                    <option value="Other Villa in Lankagama" className="bg-[#14231B] text-[#F5F2EB]">
                      Other Villa / Private Homestay in Lankagama
                    </option>
                  </select>
                </div>
              ) : (
                <div className="relative mt-2">
                  <MapPin className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={
                      deliveryLocationType === 'campsite' 
                        ? 'e.g. Gin Ganga Riverbank Camp, Tent #3' 
                        : 'e.g. Pack for travel to Colombo / Departure pickup'
                    }
                    value={customLocation}
                    onChange={e => setCustomLocation(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#14231B] text-[#F5F2EB] placeholder:text-[#9EA89F]"
                  />
                </div>
              )}
            </div>

            {/* Date & Preferred Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1.5">
                  Delivery / Tour Date <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#14231B] text-[#F5F2EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1.5">
                  Preferred Time Slot
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                  <select
                    value={preferredTime}
                    onChange={e => setPreferredTime(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#14231B] text-[#F5F2EB]"
                  >
                    <option value="Morning Breakfast (7:30 AM - 9:00 AM)">Morning (7:30 AM - 9:00 AM)</option>
                    <option value="Lunch Time (12:30 PM - 2:00 PM)">Lunch Time (12:30 PM - 2:00 PM)</option>
                    <option value="Evening Campfire & Sunset (5:00 PM - 7:00 PM)">Evening (5:00 PM - 7:00 PM)</option>
                    <option value="Upon Checkout Departure">Upon Departure</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1.5">
                  Your Name <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nimal Perera"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#14231B] text-[#F5F2EB] placeholder:text-[#9EA89F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1.5">
                  WhatsApp Number <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 077 123 4567"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#14231B] text-[#F5F2EB] placeholder:text-[#9EA89F]"
                  />
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-[11px] font-semibold text-[#C2BCB0] uppercase tracking-wider mb-1.5">
                Special Delivery Notes (Optional)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                <textarea
                  rows={2}
                  placeholder="e.g. Deliver chilled in an ice box, pack tightly for flight to UK, bring curd..."
                  value={specialNotes}
                  onChange={e => setSpecialNotes(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-[#3B5244] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#14231B] text-[#F5F2EB] placeholder:text-[#9EA89F]"
                />
              </div>
            </div>

            {/* Delivery Guarantee Notice */}
            <div className="p-3 bg-[#14231B] rounded-2xl border border-[#3B5244] text-[11px] text-[#C2BCB0] leading-relaxed">
              <div className="font-semibold text-[#F5F2EB] flex items-center gap-1.5 mb-0.5">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>100% Genuine Sinharaja Forest Quality</span>
              </div>
              Tapped, slow-boiled, and packaged fresh right in Lankagama. Cash on delivery or bank transfer upon arrival at your villa.
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-[#14231B] bg-[#D4AF37] hover:bg-[#C5A880] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <span>Placing Order...</span>
              ) : (
                <>
                  <span>
                    {product.category === 'experience' ? 'Book Experience Now' : 'Confirm Order & Deliver to Villa'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        ) : (
          /* Confirmation Screen */
          <div className="p-7 text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-[#2C3E33] border border-[#3B5244] flex items-center justify-center mx-auto text-[#D4AF37]">
              <CheckCircle2 className="w-7 h-7 text-[#D4AF37]" strokeWidth={1.75} />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#2C3E33] text-[#D4AF37] border border-[#3B5244] text-[10px] font-semibold uppercase tracking-[0.16em] mb-2">
                Order Received • Concierge Verification
              </span>
              <h4 className="text-2xl font-serif text-[#F5F2EB] font-medium">
                Order Confirmed!
              </h4>
              <p className="text-xs text-[#C2BCB0] mt-1 max-w-sm mx-auto leading-relaxed">
                Our local concierge team will coordinate with the tappers and deliver your fresh Kithul harvest directly to your villa or campsite at your requested time.
              </p>
            </div>

            <div className="bg-[#2C3E33] rounded-2xl p-4 border border-[#3B5244] text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#3B5244] pb-2">
                <span className="text-[#C2BCB0]">Order Ref Code:</span>
                <span className="font-mono font-bold text-[#F5F2EB]">{submittedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C2BCB0]">Item:</span>
                <span className="font-medium text-[#F5F2EB] line-clamp-1">{submittedOrder.productName} (x{submittedOrder.quantity})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C2BCB0]">Delivery Destination:</span>
                <span className="font-medium text-[#F5F2EB] line-clamp-1">{submittedOrder.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C2BCB0]">Scheduled For:</span>
                <span className="font-medium text-[#F5F2EB]">{submittedOrder.date} • {submittedOrder.time}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#3B5244] font-bold">
                <span className="text-[#C2BCB0]">Total Payable:</span>
                <span className="text-[#D4AF37] font-mono">Rs. {submittedOrder.totalLKR.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs text-[#14231B] bg-[#D4AF37] hover:bg-[#C5A880] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-[#14231B]" />
                <span>Send Order Voucher to WhatsApp</span>
              </a>
              <p className="text-[11px] text-[#C2BCB0]">
                Directly sends delivery details to our Lankagama desk for instant coordination.
              </p>
            </div>

            <button
              onClick={resetAndClose}
              className="text-xs text-[#C2BCB0] hover:text-[#F5F2EB] underline cursor-pointer"
            >
              Done, close window
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
