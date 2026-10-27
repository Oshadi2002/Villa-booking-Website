'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Lock, CheckCircle2, Clock, XCircle, Phone, 
  MessageCircle, RefreshCw, ArrowLeft, Search, 
  Users, Home, Compass, ExternalLink, Save,
  Plus, Trash2, Bed, Bath, Image as ImageIcon,
  MapPin, X, Tent, Waves, Menu, ChevronRight,
  ShieldCheck, AlertCircle, FileText, ShoppingBag,
  Wine, Star, MessageSquare, HelpCircle, Mail, Pencil,
  Snowflake, Wind, Utensils
} from 'lucide-react';
import { Booking, Villa, HeroSlide, Attraction, CampingGear, KithulProduct, CustomerComment, CustomerInquiry } from '@/lib/types';
import { AGENCY_CONFIG } from '@/lib/data';
import ImageUploadDropzone from '@/components/ImageUploadDropzone';
import MultiImageUpload from '@/components/MultiImageUpload';
import { compressDataUrl } from '@/lib/imageCompressor';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Sidebar navigation tab
  const [activeTab, setActiveTab] = useState<'bookings' | 'slides' | 'villas' | 'kithul' | 'camping' | 'attractions' | 'comments' | 'inquiries'>('bookings');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({});

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isAddSlideModalOpen, setIsAddSlideModalOpen] = useState(false);
  const [newSlide, setNewSlide] = useState({
    title: '',
    sinhala: '',
    url: ''
  });

  const [villas, setVillas] = useState<Villa[]>([]);
  const [isAddVillaModalOpen, setIsAddVillaModalOpen] = useState(false);
  const [newVilla, setNewVilla] = useState({
    name: '',
    sinhalaName: '',
    tagline: '',
    description: '',
    pricePerNightLKR: 12000,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    bedConfig: '2 Queen Beds',
    checkInTime: '02:00 PM',
    checkOutTime: '11:00 AM',
    locationDetails: 'Lankagama, near Gin Ganga riverbank',
    ownerContact: '',
    imageUrl: '',
    galleryImages: [] as string[],
    acType: 'both' as 'ac' | 'non-ac' | 'both',
    hasKitchen: true,
    featuresText: 'Natural River Bathing Pool, Woodfire Village Meals, Solar Hot Water, Leech Protection Gear, Free Local Tea',
    foodText: 'Traditional Sri Lankan Village Rice & Curry, Fresh Village Breakfast',
    rulesText: 'Respect rainforest silence after 10 PM, Polythene prohibited in natural streams'
  });

  const [campingGear, setCampingGear] = useState<CampingGear[]>([]);
  const [isAddCampingModalOpen, setIsAddCampingModalOpen] = useState(false);
  const [newCamping, setNewCamping] = useState({
    name: '',
    sinhalaName: '',
    category: 'package' as 'package' | 'tent' | 'cooking' | 'accessory',
    description: '',
    includesText: '3000mm Waterproof Tent, 4x Insulated Ground Mats, Gas Cooker + Butane, 4x Leech Socks',
    pricePerDayLKR: 3500,
    capacity: '4 Persons',
    imageUrl: ''
  });

  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isAddAttractionModalOpen, setIsAddAttractionModalOpen] = useState(false);
  const [newAttraction, setNewAttraction] = useState({
    name: '',
    badge: 'Waterfall / Sanctuary',
    description: '',
    caution: 'Always check water currents; respect nature and refrain from leaving plastic or soap.',
    imageUrl: ''
  });

  const [kithulProducts, setKithulProducts] = useState<KithulProduct[]>([]);
  const [isAddKithulModalOpen, setIsAddKithulModalOpen] = useState(false);
  const [newKithul, setNewKithul] = useState({
    name: '',
    sinhalaName: '',
    category: 'treacle' as 'treacle' | 'jaggery' | 'toddy' | 'experience',
    description: '',
    priceLKR: 2200,
    unit: 'bottle',
    weightOrVolume: '750ml Glass Bottle',
    purityBadge: '100% Pure Forest Grade',
    harvestOrigin: 'Lankagama, Sinharaja',
    deliveryNote: 'Delivered directly to your Villa or Campsite in Lankagama',
    imageUrl: '',
    inStock: true
  });

  const [comments, setComments] = useState<CustomerComment[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);

  // Editing state variables for full CRUD (Edit / Update modals)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const [editingVilla, setEditingVilla] = useState<Villa | null>(null);
  const [editingVillaFeatures, setEditingVillaFeatures] = useState('');
  const [editingVillaFood, setEditingVillaFood] = useState('');
  const [editingVillaRules, setEditingVillaRules] = useState('');
  const [editingVillaAddImages, setEditingVillaAddImages] = useState('');
  const [editingVillaGallery, setEditingVillaGallery] = useState<string[]>([]);
  const [isSavingVilla, setIsSavingVilla] = useState(false);

  const [editingCamping, setEditingCamping] = useState<CampingGear | null>(null);
  const [editingCampingIncludes, setEditingCampingIncludes] = useState('');

  const [editingKithul, setEditingKithul] = useState<KithulProduct | null>(null);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null);
  const [editingComment, setEditingComment] = useState<CustomerComment | null>(null);

  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Check session storage on mount
  useEffect(() => {
    const authSession = sessionStorage.getItem('let_admin_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
      fetchAllData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === AGENCY_CONFIG.adminPin || pin === 'admin123' || pin === '1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('let_admin_auth', 'true');
      setPinError('');
      fetchAllData();
    } else {
      setPinError('Invalid PIN code. (Demo PIN: 1234)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('let_admin_auth');
    setPin('');
  };

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 4500);
  };

  // Cross-Tab & Local Storage Real-Time Sync Helpers
  const broadcastSync = (type: string, data: unknown) => {
    try {
      const bc = new BroadcastChannel('lankagama_sync_channel');
      bc.postMessage({ type, data });
      bc.close();
    } catch {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lankagama_data_updated', { detail: { type, data } }));
    }
  };

  const syncVillasState = (newVillas: Villa[]) => {
    setVillas(newVillas);
    try {
      localStorage.setItem('lankagama_synced_villas', JSON.stringify(newVillas));
    } catch {}
    broadcastSync('SYNC_VILLAS', newVillas);
  };

  const syncCampingState = (newGear: CampingGear[]) => {
    setCampingGear(newGear);
    try {
      localStorage.setItem('lankagama_synced_camping', JSON.stringify(newGear));
    } catch {}
    broadcastSync('SYNC_CAMPING', newGear);
  };

  const syncKithulState = (newProducts: KithulProduct[]) => {
    setKithulProducts(newProducts);
    try {
      localStorage.setItem('lankagama_synced_kithul', JSON.stringify(newProducts));
    } catch {}
    broadcastSync('SYNC_KITHUL', newProducts);
  };

  const syncSlidesState = (newSlides: HeroSlide[]) => {
    setSlides(newSlides);
    try {
      localStorage.setItem('lankagama_synced_slides', JSON.stringify(newSlides));
    } catch {}
    broadcastSync('SYNC_SLIDES', newSlides);
  };

  const syncAttractionsState = (newAttractions: Attraction[]) => {
    setAttractions(newAttractions);
    try {
      localStorage.setItem('lankagama_synced_attractions', JSON.stringify(newAttractions));
    } catch {}
    broadcastSync('SYNC_ATTRACTIONS', newAttractions);
  };

  const fetchAllData = async () => {
    setLoading(true);
    // 1. Initial check from localStorage for instant admin display
    try {
      const v = localStorage.getItem('lankagama_synced_villas');
      if (v) {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed) && parsed.length > 0) setVillas(parsed);
      }
      const s = localStorage.getItem('lankagama_synced_slides');
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length > 0) setSlides(parsed);
      }
      const g = localStorage.getItem('lankagama_synced_camping');
      if (g) {
        const parsed = JSON.parse(g);
        if (Array.isArray(parsed) && parsed.length > 0) setCampingGear(parsed);
      }
      const k = localStorage.getItem('lankagama_synced_kithul');
      if (k) {
        const parsed = JSON.parse(k);
        if (Array.isArray(parsed) && parsed.length > 0) setKithulProducts(parsed);
      }
      const a = localStorage.getItem('lankagama_synced_attractions');
      if (a) {
        const parsed = JSON.parse(a);
        if (Array.isArray(parsed) && parsed.length > 0) setAttractions(parsed);
      }
    } catch {}

    const timestamp = Date.now();
    try {
      // 1. Bookings
      fetch(`/api/bookings?t=${timestamp}`, { cache: 'no-store' }).then(r => r.json()).then(d => {
        if (d.success && Array.isArray(d.bookings)) {
          setBookings(d.bookings);
          const notesMap: { [id: string]: string } = {};
          d.bookings.forEach((b: Booking) => { notesMap[b.id] = b.adminNotes || ''; });
          setEditingNotes(notesMap);
        }
      }).catch(() => {});

      // 2. Slides
      fetch(`/api/hero-slides?t=${timestamp}`, { cache: 'no-store' }).then(r => r.json()).then(d => {
        if (d.success && Array.isArray(d.slides) && d.slides.length > 0) {
          setSlides(d.slides);
        }
      }).catch(() => {});

      // 3. Villas
      fetch(`/api/villas?t=${timestamp}`, { cache: 'no-store' }).then(r => r.json()).then(d => {
        if (d.success && Array.isArray(d.villas) && d.villas.length > 0) {
          setVillas(d.villas);
        }
      }).catch(() => {});

      // 4. Camping
      fetch(`/api/camping?t=${timestamp}`, { cache: 'no-store' }).then(r => r.json()).then(d => {
        if (d.success && Array.isArray(d.gear) && d.gear.length > 0) {
          setCampingGear(d.gear);
        }
      }).catch(() => {});

      // 5. Attractions
      fetch(`/api/attractions?t=${timestamp}`, { cache: 'no-store' }).then(r => r.json()).then(d => {
        if (d.success && Array.isArray(d.attractions) && d.attractions.length > 0) {
          setAttractions(d.attractions);
        }
      }).catch(() => {});

      // 6. Kithul & Toddy
      fetch(`/api/kithul?t=${timestamp}`, { cache: 'no-store' }).then(r => r.json()).then(d => {
        if (d.success && Array.isArray(d.products) && d.products.length > 0) {
          setKithulProducts(d.products);
        }
      }).catch(() => {});

      // 7. Comments & Reviews
      fetch(`/api/comments?t=${timestamp}`, { cache: 'no-store' }).then(r => r.json()).then(d => {
        if (d.success && Array.isArray(d.comments)) setComments(d.comments);
      }).catch(() => {});

      // 8. Inquiries
      fetch(`/api/inquiries?t=${timestamp}`, { cache: 'no-store' }).then(r => r.json()).then(d => {
        if (d.success && Array.isArray(d.inquiries)) setInquiries(d.inquiries);
      }).catch(() => {});
    } catch {
      showNotification('Error loading data from server.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- BOOKINGS ACTIONS ---------------- //
  const handleUpdateBookingStatus = async (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      const currentNotes = editingNotes[id] || '';
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNotes: currentNotes })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus, adminNotes: currentNotes } : b));
        showNotification(`Booking ${id} marked as: ${newStatus.toUpperCase()}`);
      }
    } catch {
      alert('Failed to update booking status.');
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const currentBooking = bookings.find(b => b.id === id);
      if (!currentBooking) return;
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentBooking.status, adminNotes: editingNotes[id] || '' })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Internal note saved for ${id}.`);
      }
    } catch {
      alert('Failed to save note.');
    }
  };

  const handleDeleteBooking = async (id: string, name: string) => {
    if (!window.confirm(`Delete booking record #${id} for "${name}"?`)) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.filter(b => b.id !== id));
        showNotification(`Booking #${id} deleted.`);
      } else {
        alert(data.message || 'Failed to delete booking.');
      }
    } catch {
      alert('Error deleting booking.');
    }
  };

  const handleUpdateBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    try {
      const res = await fetch(`/api/bookings/${editingBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBooking)
      });
      const data = await res.json();
      if (data.success && data.booking) {
        setBookings(prev => prev.map(b => b.id === editingBooking.id ? data.booking : b));
        setEditingBooking(null);
        showNotification(`Booking #${editingBooking.id} updated successfully!`);
      } else {
        alert(data.message || 'Failed to update booking.');
      }
    } catch {
      alert('Error updating booking.');
    }
  };

  const getApprovalWhatsAppUrl = (b: Booking) => {
    const cleanPhone = b.customerPhone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '94' + cleanPhone.substring(1) : cleanPhone;
    const guideLine = b.needGuide
      ? `🧭 Tour Guide: YES (Dedicated native guide assigned - +Rs. ${(b.guideFee || 4000).toLocaleString()})\n`
      : '🧭 Tour Guide: Not requested\n';
    const acLine = b.acPreference
      ? `❄️ Room Type: ${b.acPreference === 'ac' ? 'A/C Room' : 'Non-A/C Room'}\n`
      : '';
    const mealLine = b.orderMeals !== undefined
      ? `🍲 Village Food: ${b.orderMeals ? 'YES (Woodfire Village Meals Ordered)' : 'NO'}\n`
      : '';

    const text = `🌿 Greetings from The Sinharaja Collection Lankagama! 🇱🇰

Hello ${b.customerName},
Great news! We have contacted the host and your booking request has been APPROVED & CONFIRMED.

📌 Booking Ref: ${b.id}
🏠 Item: ${b.itemName}
${acLine}${mealLine}📅 Check-in Date: ${b.checkInDate} ${b.checkOutDate ? 'to ' + b.checkOutDate : ''}
👥 Guests: ${b.guestsCount} Persons
${guideLine}💰 Total: Rs. ${b.totalLKR.toLocaleString()}

Your sanctuary in Lankagama is reserved. Looking forward to welcoming you!`;
    return `https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`;
  };

  // ---------------- HERO SLIDES ACTIONS ---------------- //
  const handleCreateSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlide.url || !newSlide.title) {
      alert('Please upload or select an image and enter a title.');
      return;
    }

    try {
      const res = await fetch('/api/hero-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlide)
      });
      const data = await res.json();
      if (data.success && data.slide) {
        syncSlidesState([...slides, data.slide]);
        setIsAddSlideModalOpen(false);
        showNotification(`New Hero Slide "${data.slide.title}" added!`);
        setNewSlide({ title: '', sinhala: '', url: '' });
      } else {
        alert(data.message || 'Failed to add slide.');
      }
    } catch {
      alert('Error creating slide.');
    }
  };

  const handleDeleteSlide = async (id: string, title: string) => {
    if (!window.confirm(`Delete slide "${title}"?`)) return;
    try {
      const res = await fetch(`/api/hero-slides/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        syncSlidesState(slides.filter(s => s.id !== id));
        showNotification(`Slide "${title}" removed.`);
      } else {
        alert(data.message || 'Failed to delete slide (at least 1 slide must remain).');
      }
    } catch {
      alert('Error deleting slide.');
    }
  };

  // ---------------- VILLAS ACTIONS ---------------- //
  const handleCreateVilla = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVilla.name.trim() || !newVilla.pricePerNightLKR) {
      alert('Please enter villa name and price.');
      return;
    }

    try {
      const allImages = [
        ...(newVilla.imageUrl ? [newVilla.imageUrl] : []),
        ...newVilla.galleryImages
      ];
      const finalImages = allImages.length > 0
        ? allImages
        : ['https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1000&q=80'];
      const coverUrl = newVilla.imageUrl || finalImages[0];

      // Compress all images before uploading to stay well below 4.5MB
      const compressedCover = await compressDataUrl(coverUrl);
      const compressedImages = await Promise.all(finalImages.map(img => compressDataUrl(img)));

      const featuresList = newVilla.featuresText.split(',').map(f => f.trim()).filter(f => f.length > 0);
      const foodList = newVilla.foodText.split(',').map(f => f.trim()).filter(f => f.length > 0);
      const rulesList = newVilla.rulesText.split(',').map(f => f.trim()).filter(f => f.length > 0);

      const res = await fetch('/api/villas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newVilla.name,
          sinhalaName: newVilla.sinhalaName || newVilla.name,
          tagline: newVilla.tagline,
          description: newVilla.description,
          pricePerNightLKR: Number(newVilla.pricePerNightLKR),
          maxGuests: Number(newVilla.maxGuests),
          bedrooms: Number(newVilla.bedrooms),
          bathrooms: Number(newVilla.bathrooms),
          bedConfig: newVilla.bedConfig,
          checkInTime: newVilla.checkInTime,
          checkOutTime: newVilla.checkOutTime,
          locationDetails: newVilla.locationDetails,
          ownerContact: newVilla.ownerContact,
          imageUrl: compressedCover,
          images: compressedImages,
          acType: newVilla.acType,
          hasKitchen: newVilla.hasKitchen,
          features: featuresList,
          foodOptions: foodList,
          houseRules: rulesList,
          facilities: [
            {
              category: 'Room Comfort & Setup',
              items: [
                `${newVilla.bedrooms} Separate Bedrooms with fresh linens`,
                `${newVilla.bathrooms} Bathrooms with hot showers`,
                `Bed configuration: ${newVilla.bedConfig}`,
                'Private river viewing balcony'
              ]
            },
            {
              category: 'Included Amenities',
              items: featuresList.slice(0, 4)
            }
          ]
        })
      });

      const data = await res.json();
      if (data.success && data.villa) {
        syncVillasState([data.villa, ...villas]);
        setIsAddVillaModalOpen(false);
        showNotification(`Villa "${data.villa.name}" added successfully to website!`);
        setNewVilla({
          name: '',
          sinhalaName: '',
          tagline: '',
          description: '',
          pricePerNightLKR: 12000,
          maxGuests: 4,
          bedrooms: 2,
          bathrooms: 2,
          bedConfig: '2 Queen Beds',
          checkInTime: '02:00 PM',
          checkOutTime: '11:00 AM',
          locationDetails: 'Lankagama, near Gin Ganga riverbank',
          ownerContact: '',
          imageUrl: '',
          galleryImages: [],
          acType: 'both',
          hasKitchen: true,
          featuresText: 'Natural River Bathing Pool, Woodfire Village Meals, Solar Hot Water, Leech Protection Gear, Free Local Tea',
          foodText: 'Traditional Sri Lankan Village Rice & Curry, Fresh Village Breakfast',
          rulesText: 'Respect rainforest silence after 10 PM, Polythene prohibited in natural streams'
        });
      } else {
        alert(data.message || 'Failed to add villa.');
      }
    } catch {
      alert('Error connecting to server.');
    }
  };

  const handleDeleteVilla = async (id: string, name: string) => {
    if (!window.confirm(`Delete villa "${name}" from website?`)) return;
    try {
      const res = await fetch(`/api/villas/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        syncVillasState(villas.filter(v => v.id !== id));
        showNotification(`Villa "${name}" deleted.`);
      } else {
        alert(data.message || 'Failed to delete villa.');
      }
    } catch {
      alert('Error deleting villa.');
    }
  };

  // ---------------- CAMPING ACTIONS ---------------- //
  const handleCreateCamping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamping.name || !newCamping.pricePerDayLKR) {
      alert('Please enter camping equipment name and daily price.');
      return;
    }

    try {
      const includesList = newCamping.includesText.split(',').map(i => i.trim()).filter(i => i.length > 0);

      const res = await fetch('/api/camping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCamping.name,
          sinhalaName: newCamping.sinhalaName || newCamping.name,
          category: newCamping.category,
          description: newCamping.description,
          includes: includesList,
          pricePerDayLKR: Number(newCamping.pricePerDayLKR),
          capacity: newCamping.capacity,
          imageUrl: newCamping.imageUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80'
        })
      });

      const data = await res.json();
      if (data.success && data.gear) {
        syncCampingState([data.gear, ...campingGear]);
        setIsAddCampingModalOpen(false);
        showNotification(`Camping item "${data.gear.name}" added to website!`);
        setNewCamping({
          name: '',
          sinhalaName: '',
          category: 'package',
          description: '',
          includesText: '3000mm Waterproof Tent, 4x Insulated Ground Mats, Gas Cooker + Butane, 4x Leech Socks',
          pricePerDayLKR: 3500,
          capacity: '4 Persons',
          imageUrl: ''
        });
      } else {
        alert(data.message || 'Failed to add camping gear.');
      }
    } catch {
      alert('Error creating camping gear.');
    }
  };

  const handleDeleteCamping = async (id: string, name: string) => {
    if (!window.confirm(`Delete camping gear "${name}"?`)) return;
    try {
      const res = await fetch(`/api/camping/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        syncCampingState(campingGear.filter(g => g.id !== id));
        showNotification(`Camping item "${name}" deleted.`);
      } else {
        alert(data.message || 'Failed to delete gear.');
      }
    } catch {
      alert('Error deleting camping gear.');
    }
  };

  // ---------------- ATTRACTIONS ACTIONS ---------------- //
  const handleCreateAttraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttraction.name || !newAttraction.description) {
      alert('Please enter attraction name and description.');
      return;
    }

    try {
      const res = await fetch('/api/attractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAttraction)
      });
      const data = await res.json();
      if (data.success && data.attraction) {
        syncAttractionsState([...attractions, data.attraction]);
        setIsAddAttractionModalOpen(false);
        showNotification(`Attraction "${data.attraction.name}" added to website!`);
        setNewAttraction({
          name: '',
          badge: 'Waterfall / Sanctuary',
          description: '',
          caution: 'Always check water currents; respect nature and refrain from leaving plastic or soap.',
          imageUrl: ''
        });
      } else {
        alert(data.message || 'Failed to add attraction.');
      }
    } catch {
      alert('Error creating attraction.');
    }
  };

  const handleDeleteAttraction = async (id: string, name: string) => {
    if (!window.confirm(`Delete attraction "${name}"?`)) return;
    try {
      const res = await fetch(`/api/attractions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        syncAttractionsState(attractions.filter(a => a.id !== id));
        showNotification(`Attraction "${name}" removed.`);
      } else {
        alert(data.message || 'Failed to delete attraction.');
      }
    } catch {
      alert('Error deleting attraction.');
    }
  };

  // ---------------- KITHUL & TODDY ACTIONS ---------------- //
  const handleCreateKithul = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKithul.name || !newKithul.priceLKR) {
      alert('Please enter product name and price.');
      return;
    }

    try {
      const res = await fetch('/api/kithul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKithul)
      });
      const data = await res.json();
      if (data.success && data.product) {
        syncKithulState([data.product, ...kithulProducts]);
        setIsAddKithulModalOpen(false);
        showNotification(`Kithul product "${data.product.name}" added to website!`);
        setNewKithul({
          name: '',
          sinhalaName: '',
          category: 'treacle',
          description: '',
          priceLKR: 2200,
          unit: 'bottle',
          weightOrVolume: '750ml Glass Bottle',
          purityBadge: '100% Pure Forest Grade',
          harvestOrigin: 'Lankagama, Sinharaja',
          deliveryNote: 'Delivered directly to your Villa or Campsite in Lankagama',
          imageUrl: '',
          inStock: true
        });
      } else {
        alert(data.message || 'Failed to add product.');
      }
    } catch {
      alert('Error creating kithul product.');
    }
  };

  const handleDeleteKithul = async (id: string, name: string) => {
    if (!window.confirm(`Delete Kithul product "${name}"?`)) return;
    try {
      const res = await fetch(`/api/kithul/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        syncKithulState(kithulProducts.filter(p => p.id !== id));
        showNotification(`Product "${name}" deleted.`);
      } else {
        alert(data.message || 'Failed to delete product.');
      }
    } catch {
      alert('Error deleting product.');
    }
  };

  // ---------------- COMMENTS ACTIONS ---------------- //
  const handleDeleteComment = async (id: string, author: string) => {
    if (!window.confirm(`Delete review from "${author}"?`)) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setComments(prev => prev.filter(c => c.id !== id));
        showNotification(`Review by "${author}" deleted.`);
      } else {
        alert(data.message || 'Failed to delete review.');
      }
    } catch {
      alert('Error deleting review.');
    }
  };

  // ---------------- INQUIRIES ACTIONS ---------------- //
  const handleUpdateInquiryStatus = async (id: string, newStatus: 'new' | 'contacted' | 'resolved') => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
        showNotification(`Inquiry updated to: ${newStatus.toUpperCase()}`);
      }
    } catch {
      alert('Failed to update inquiry status.');
    }
  };

  const handleDeleteInquiry = async (id: string, name: string) => {
    if (!window.confirm(`Delete inquiry from "${name}"?`)) return;
    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setInquiries(prev => prev.filter(i => i.id !== id));
        showNotification(`Inquiry from "${name}" deleted.`);
      } else {
        alert(data.message || 'Failed to delete inquiry.');
      }
    } catch {
      alert('Error deleting inquiry.');
    }
  };

  // ---------------- EDIT HANDLERS (FULL CRUD) ---------------- //
  const handleOpenEditVilla = (v: Villa) => {
    setEditingVilla({
      ...v,
      acType: v.acType || 'both',
      hasKitchen: v.hasKitchen !== undefined ? v.hasKitchen : true
    });
    setEditingVillaFeatures(v.features ? v.features.join(', ') : '');
    setEditingVillaFood(v.foodOptions ? v.foodOptions.join(', ') : '');
    setEditingVillaRules(v.houseRules ? v.houseRules.join(', ') : '');
    const existingImgs = v.images && v.images.length > 0 ? v.images : (v.imageUrl ? [v.imageUrl] : []);
    setEditingVillaGallery(existingImgs);
    setEditingVillaAddImages(v.images && v.images.length > 1 ? v.images.slice(1).join('\n') : '');
  };

  const handleUpdateVillaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVilla) return;

    setIsSavingVilla(true);
    try {
      const allImgs = editingVillaGallery.length > 0 
        ? editingVillaGallery 
        : (editingVilla.imageUrl ? [editingVilla.imageUrl] : ['https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1000&q=80']);
      const coverUrl = editingVilla.imageUrl || allImgs[0];
      const feats = editingVillaFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0);
      const foods = editingVillaFood.split(',').map(f => f.trim()).filter(f => f.length > 0);
      const rules = editingVillaRules.split(',').map(f => f.trim()).filter(f => f.length > 0);

      // Pre-compress all images to guarantee total payload is small and fits within Vercel's 4.5MB limit
      const compressedCover = await compressDataUrl(coverUrl);
      const compressedImgs = await Promise.all(allImgs.map(img => compressDataUrl(img)));

      const res = await fetch(`/api/villas/${encodeURIComponent(editingVilla.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingVilla,
          imageUrl: compressedCover,
          images: compressedImgs,
          features: feats,
          foodOptions: foods,
          houseRules: rules
        })
      });
      const data = await res.json();
      if (data.success && data.villa) {
        syncVillasState(villas.map(v => v.id === editingVilla.id ? data.villa : v));
        setEditingVilla(null);
        showNotification(`Villa "${data.villa.name}" updated successfully!`);
      } else {
        alert(data.message || 'Failed to update villa.');
      }
    } catch {
      alert('Error updating villa.');
    } finally {
      setIsSavingVilla(false);
    }
  };

  const handleOpenEditCamping = (g: CampingGear) => {
    setEditingCamping(g);
    setEditingCampingIncludes(g.includes ? g.includes.join(', ') : '');
  };

  const handleUpdateCampingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCamping) return;

    try {
      const incList = editingCampingIncludes.split(',').map(i => i.trim()).filter(i => i.length > 0);
      const compressedImage = editingCamping.imageUrl ? await compressDataUrl(editingCamping.imageUrl) : '';
      const res = await fetch(`/api/camping/${encodeURIComponent(editingCamping.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingCamping,
          imageUrl: compressedImage || editingCamping.imageUrl,
          includes: incList
        })
      });
      const data = await res.json();
      if (data.success && data.gear) {
        syncCampingState(campingGear.map(g => g.id === editingCamping.id ? data.gear : g));
        setEditingCamping(null);
        showNotification(`Camping item "${data.gear.name}" updated successfully!`);
      } else {
        alert(data.message || 'Failed to update camping gear.');
      }
    } catch {
      alert('Error updating camping gear.');
    }
  };

  const handleOpenEditKithul = (prod: KithulProduct) => {
    setEditingKithul(prod);
  };

  const handleUpdateKithulSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKithul) return;

    try {
      const compressedImage = editingKithul.imageUrl ? await compressDataUrl(editingKithul.imageUrl) : '';
      const res = await fetch(`/api/kithul/${encodeURIComponent(editingKithul.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingKithul,
          imageUrl: compressedImage || editingKithul.imageUrl
        })
      });
      const data = await res.json();
      if (data.success && data.product) {
        syncKithulState(kithulProducts.map(p => p.id === editingKithul.id ? data.product : p));
        setEditingKithul(null);
        showNotification(`Product "${data.product.name}" updated successfully!`);
      } else {
        alert(data.message || 'Failed to update product.');
      }
    } catch {
      alert('Error updating kithul product.');
    }
  };

  const handleOpenEditSlide = (slide: HeroSlide) => {
    setEditingSlide(slide);
  };

  const handleUpdateSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    try {
      const compressedUrl = editingSlide.url ? await compressDataUrl(editingSlide.url) : '';
      const res = await fetch(`/api/hero-slides/${encodeURIComponent(editingSlide.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingSlide,
          url: compressedUrl || editingSlide.url
        })
      });
      const data = await res.json();
      if (data.success && data.slide) {
        syncSlidesState(slides.map(s => s.id === editingSlide.id ? data.slide : s));
        setEditingSlide(null);
        showNotification(`Slide "${data.slide.title}" updated successfully!`);
      } else {
        alert(data.message || 'Failed to update slide.');
      }
    } catch {
      alert('Error updating slide.');
    }
  };

  const handleOpenEditAttraction = (attr: Attraction) => {
    setEditingAttraction(attr);
  };

  const handleUpdateAttractionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttraction) return;

    try {
      const compressedImage = editingAttraction.imageUrl ? await compressDataUrl(editingAttraction.imageUrl) : '';
      const res = await fetch(`/api/attractions/${encodeURIComponent(editingAttraction.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingAttraction,
          imageUrl: compressedImage || editingAttraction.imageUrl
        })
      });
      const data = await res.json();
      if (data.success && data.attraction) {
        syncAttractionsState(attractions.map(a => a.id === editingAttraction.id ? data.attraction : a));
        setEditingAttraction(null);
        showNotification(`Attraction "${data.attraction.name}" updated successfully!`);
      } else {
        alert(data.message || 'Failed to update attraction.');
      }
    } catch {
      alert('Error updating attraction.');
    }
  };

  const handleOpenEditComment = (com: CustomerComment) => {
    setEditingComment(com);
  };

  const handleUpdateCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComment) return;

    try {
      const res = await fetch(`/api/comments/${editingComment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingComment)
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setComments(prev => prev.map(c => c.id === editingComment.id ? data.comment : c));
        setEditingComment(null);
        showNotification(`Review by "${data.comment.author}" updated successfully!`);
      } else {
        alert(data.message || 'Failed to update review.');
      }
    } catch {
      alert('Error updating review.');
    }
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    if (bookingFilter === 'pending' && b.status !== 'pending') return false;
    if (bookingFilter === 'approved' && b.status !== 'approved') return false;
    if (bookingFilter === 'rejected' && b.status !== 'rejected') return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q) ||
        b.itemName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;

  // -------------------------------------------------------------
  // LOGIN SCREEN (Normal, clean, clear)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="bg-white border border-slate-200 max-w-sm w-full rounded-2xl p-8 shadow-md space-y-6">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Admin Login</h1>
            <p className="text-xs text-slate-500">
              The Sinharaja Collection Lankagama • Management System
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                PIN Code:
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter PIN (Demo: 1234)"
                value={pin}
                onChange={e => setPin(e.target.value)}
                className="w-full px-4 py-2.5 text-center text-lg tracking-widest font-mono rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {pinError && (
              <p className="text-xs text-red-600 text-center font-medium">{pinError}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              Sign In to Dashboard
            </button>

            <div className="text-center pt-2">
              <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Main Website</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED DASHBOARD WITH SIDEBAR NAVIGATION
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row">
      
      {/* ============================================================
         SIDEBAR (Easy, clear navigation for all sections)
         ============================================================ */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                LE
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 block leading-tight">
                  Lankagama Travels
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">
                  Website Control CMS
                </span>
              </div>
            </Link>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
              Main Management
            </span>

            {/* 1. Bookings */}
            <button
              onClick={() => { setActiveTab('bookings'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4" />
                <span>Customer Bookings</span>
              </div>
              {pendingBookingsCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'bookings' ? 'bg-white text-blue-700' : 'bg-amber-500 text-white'
                }`}>
                  {pendingBookingsCount}
                </span>
              )}
            </button>

            {/* 2. Hero Slideshow */}
            <button
              onClick={() => { setActiveTab('slides'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'slides'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4" />
                <span>Hero Slideshow Photos</span>
              </div>
              <span className="text-[11px] opacity-75">{slides.length}</span>
            </button>

            {/* 3. Villas */}
            <button
              onClick={() => { setActiveTab('villas'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'villas'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4" />
                <span>Villas & Homestays</span>
              </div>
              <span className="text-[11px] opacity-75">{villas.length}</span>
            </button>

            {/* 4. Camping */}
            <button
              onClick={() => { setActiveTab('camping'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'camping'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tent className="w-4 h-4" />
                <span>Camping Equipment</span>
              </div>
              <span className="text-[11px] opacity-75">{campingGear.length}</span>
            </button>

            {/* 5. Attractions */}
            <button
              onClick={() => { setActiveTab('attractions'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'attractions'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Waves className="w-4 h-4" />
                <span>Waterfalls & Sights</span>
              </div>
              <span className="text-[11px] opacity-75">{attractions.length}</span>
            </button>

            {/* 6. Kithul & Toddy */}
            <button
              onClick={() => { setActiveTab('kithul'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'kithul'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Kithul & Toddy</span>
              </div>
              <span className="text-[11px] opacity-75">{kithulProducts.length}</span>
            </button>

            {/* 7. Inquiries */}
            <button
              onClick={() => { setActiveTab('inquiries'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4" />
                <span>Customer Inquiries</span>
              </div>
              {inquiries.filter(i => i.status === 'new').length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'inquiries' ? 'bg-white text-blue-700' : 'bg-red-500 text-white'
                }`}>
                  {inquiries.filter(i => i.status === 'new').length}
                </span>
              )}
            </button>

            {/* 8. Customer Comments */}
            <button
              onClick={() => { setActiveTab('comments'); setIsMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'comments'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>Customer Reviews</span>
              </div>
              <span className="text-[11px] opacity-75">{comments.length}</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 flex items-center gap-2 border border-slate-200"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>Open Live Website</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 flex items-center justify-center gap-1.5 border border-red-200 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      {/* ============================================================
         MAIN CONTENT AREA
         ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold text-slate-900 capitalize flex items-center gap-2">
              <span>{
                activeTab === 'bookings' ? 'Customer Bookings & Approvals' : 
                activeTab === 'slides' ? 'Hero Slideshow Photos' : 
                activeTab === 'villas' ? 'Villas & Homestays' : 
                activeTab === 'kithul' ? 'Kithul Treacle, Jaggery & Toddy' : 
                activeTab === 'camping' ? 'Expedition Camping Sets' : 
                activeTab === 'inquiries' ? 'Customer Questions & Inquiries' : 
                activeTab === 'comments' ? 'Customer Reviews Wall' : 
                'Waterfalls & Sanctuaries'
              }</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </header>

        {/* Inner Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Notification Alert */}
          {actionMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* ============================================================
             1. TAB: BOOKINGS
             ============================================================ */}
          {activeTab === 'bookings' && (
            <div className="space-y-5">
              {/* Quick stats cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Requests</span>
                  <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{bookings.length}</div>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-amber-800 uppercase">Pending Review</span>
                  <div className="text-2xl font-bold text-amber-900 font-mono mt-1">{pendingBookingsCount}</div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase">Confirmed</span>
                  <div className="text-2xl font-bold text-emerald-900 font-mono mt-1">
                    {bookings.filter(b => b.status === 'approved').length}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Revenue (Confirmed)</span>
                  <div className="text-xl font-bold text-slate-900 font-mono mt-1">
                    Rs. {bookings.filter(b => b.status === 'approved').reduce((acc, b) => acc + (b.totalLKR || 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Filter and search bar */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                  <button
                    onClick={() => setBookingFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      bookingFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All ({bookings.length})
                  </button>
                  <button
                    onClick={() => setBookingFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      bookingFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    Pending ({pendingBookingsCount})
                  </button>
                  <button
                    onClick={() => setBookingFilter('approved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      bookingFilter === 'approved' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    Confirmed ({bookings.filter(b => b.status === 'approved').length})
                  </button>
                  <button
                    onClick={() => setBookingFilter('rejected')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      bookingFilter === 'rejected' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Cancelled
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search code, name, phone..."
                    value={bookingSearch}
                    onChange={e => setBookingSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
                  />
                </div>
              </div>

              {/* Bookings list */}
              {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold">No bookings match the filter criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      className={`bg-white rounded-2xl p-5 border shadow-xs transition-all ${
                        b.status === 'pending' ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-mono font-bold text-base text-slate-900">#{b.id}</span>
                            {b.status === 'pending' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                🟡 Pending Host Check
                              </span>
                            )}
                            {b.status === 'approved' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                🟢 Confirmed & Reserved
                              </span>
                            )}
                            {b.status === 'rejected' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                                ⚪ Cancelled / Unavailable
                              </span>
                            )}
                            <span className="text-xs text-slate-400">
                              {new Date(b.createdAt).toLocaleDateString()} at {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                              <span className="text-blue-600 font-bold">•</span>
                              <span>{b.itemName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {b.acPreference && (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                                  {b.acPreference === 'ac' ? '❄️ A/C Room' : '🍃 Non-A/C Room'}
                                </span>
                              )}
                              {b.orderMeals !== undefined && (
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                                  b.orderMeals ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  🍲 {b.orderMeals ? 'Meals: YES' : 'Meals: NO'}
                                </span>
                              )}
                              {b.needGuide ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-1 shadow-xs">
                                  🧭 Guide: YES (+Rs. {(b.guideFee || 4000).toLocaleString()})
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                  Guide: No
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                            <div>
                              <span className="text-slate-400 block">Customer Name:</span>
                              <span className="font-bold text-slate-800">{b.customerName}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Phone & WhatsApp:</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-bold text-slate-800 font-mono">{b.customerPhone}</span>
                                <a
                                  href={`https://wa.me/${b.customerPhone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700"
                                >
                                  <MessageCircle className="w-4 h-4 fill-emerald-600 text-white" />
                                </a>
                                <a
                                  href={`tel:${b.customerPhone}`}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Date & Total:</span>
                              <span className="font-medium text-slate-800">{b.checkInDate} ({b.guestsCount} Guests)</span>
                              <span className="font-mono font-bold text-emerald-700 block">Rs. {b.totalLKR.toLocaleString()}</span>
                            </div>
                          </div>

                          {b.deliveryLocation && (
                            <div className="text-xs bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-emerald-900">
                              <strong>Delivery Destination:</strong> {b.deliveryLocation}
                            </div>
                          )}

                          {b.itemsSummary && (
                            <div className="text-xs bg-blue-50 p-2.5 rounded-lg border border-blue-200 text-blue-900">
                              <strong>Items Ordered:</strong> {b.itemsSummary}
                            </div>
                          )}

                          {b.specialNotes && (
                            <div className="text-xs bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 text-amber-900">
                              <strong>Customer Request:</strong> {b.specialNotes}
                            </div>
                          )}

                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Agency internal note (e.g. called host, confirmed room)..."
                              value={editingNotes[b.id] ?? ''}
                              onChange={e => setEditingNotes({ ...editingNotes, [b.id]: e.target.value })}
                              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleSaveNotes(b.id)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              <span>Save Note</span>
                            </button>
                          </div>
                        </div>

                        <div className="lg:w-64 shrink-0 space-y-2 border-t lg:border-t-0 lg:border-l border-slate-200 pt-3 lg:pt-0 lg:pl-5 flex flex-col justify-center">
                          <span className="text-[11px] font-bold text-slate-500 uppercase block">Agency Action:</span>
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'approved')}
                            className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                              b.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{b.status === 'approved' ? 'Approved (Confirmed)' : 'Approve Booking'}</span>
                          </button>

                          <a
                            href={getApprovalWhatsAppUrl(b)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 rounded-lg font-semibold text-xs text-white bg-emerald-700 hover:bg-emerald-800 flex items-center justify-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-white" />
                            <span>WhatsApp Confirmation</span>
                          </a>

                          {b.status !== 'pending' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'pending')}
                              className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 cursor-pointer"
                            >
                              Reset to Pending
                            </button>
                          )}

                          {b.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'rejected')}
                              className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 cursor-pointer"
                            >
                              Mark Room Busy (Reject)
                            </button>
                          )}

                          <div className="flex gap-2 pt-1 border-t border-slate-100">
                            <button
                              onClick={() => setEditingBooking(b)}
                              className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit Details</span>
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(b.id, b.customerName)}
                              className="py-1.5 px-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 flex items-center justify-center gap-1 cursor-pointer"
                              title="Delete booking record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================
             2. TAB: HERO SLIDESHOW (Drag & Drop or Select Images)
             ============================================================ */}
          {activeTab === 'slides' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Main Website Hero Slideshow Photos
                  </h2>
                  <p className="text-xs text-slate-500">
                    Control the large cinematic slideshow at the top of the homepage. You can drag and drop new photos directly.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddSlideModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Slide Photo</span>
                </button>
              </div>

              {/* Slides Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {slides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 bg-slate-100">
                        <img src={slide.url} alt={slide.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded">
                          Slide #{idx + 1}
                        </div>
                      </div>

                      <div className="p-4 space-y-1">
                        <h3 className="text-sm font-bold text-slate-900">{slide.title}</h3>
                        <p className="text-xs text-slate-500">{slide.sinhala}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                      <button
                        onClick={() => handleOpenEditSlide(slide)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit Slide</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.id, slide.title)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================
             3. TAB: VILLAS & HOMESTAYS
             ============================================================ */}
          {activeTab === 'villas' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Lankagama Villas & Stays Directory
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage properties, rooms count, facilities, and upload pictures directly.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddVillaModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Villa</span>
                </button>
              </div>

              {/* Villas List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {villas.map((villa) => (
                  <div
                    key={villa.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="relative h-48 bg-slate-100 overflow-hidden">
                        <img src={villa.imageUrl} alt={villa.name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 right-2 bg-slate-900/90 text-white px-3 py-1 rounded-lg text-xs font-mono font-bold shadow">
                          Rs. {villa.pricePerNightLKR.toLocaleString()} / night
                        </div>
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                          <span className="bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-bold text-slate-800 shadow-xs">
                            {villa.images?.length || 1} Photos
                          </span>
                          {villa.acType && (
                            <span className="bg-blue-600/90 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-xs">
                              {villa.acType === 'ac' ? '❄️ A/C Only' : villa.acType === 'non-ac' ? '🍃 Non-A/C' : '❄️🍃 Both'}
                            </span>
                          )}
                          {villa.hasKitchen && (
                            <span className="bg-amber-600/90 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-xs">
                              🍳 Kitchen
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <span className="text-xs font-medium text-blue-600 block">{villa.sinhalaName}</span>
                          <h3 className="text-base font-bold text-slate-900">{villa.name}</h3>
                          <p className="text-xs text-slate-500 italic mt-0.5">&ldquo;{villa.tagline}&rdquo;</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                          <div className="text-center">
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Bedrooms</span>
                            <span className="font-bold text-slate-800 flex items-center justify-center gap-1">
                              <Bed className="w-3.5 h-3.5 text-slate-500" />
                              {villa.bedrooms} Rooms
                            </span>
                          </div>
                          <div className="text-center border-x border-slate-200">
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Bathrooms</span>
                            <span className="font-bold text-slate-800 flex items-center justify-center gap-1">
                              <Bath className="w-3.5 h-3.5 text-slate-500" />
                              {villa.bathrooms} Hot Showers
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Max Guests</span>
                            <span className="font-bold text-slate-800 flex items-center justify-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-500" />
                              {villa.maxGuests} Guests
                            </span>
                          </div>
                        </div>

                        <div className="text-xs space-y-1 text-slate-600">
                          <div><strong>Bed Layout:</strong> {villa.bedConfig}</div>
                          <div><strong>Host Contact:</strong> {villa.ownerContact || 'Lankagama Partner'}</div>
                          <div className="text-slate-500 line-clamp-2 pt-1 text-[11px]">{villa.description}</div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {villa.features.slice(0, 4).map((f, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">ID: {villa.id}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditVilla(villa)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit Villa</span>
                        </button>
                        <button
                          onClick={() => handleDeleteVilla(villa.id, villa.name)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================
             4. TAB: CAMPING EQUIPMENT
             ============================================================ */}
          {activeTab === 'camping' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Expedition Camping Equipment Rentals
                  </h2>
                  <p className="text-xs text-slate-500">
                    Control tents, butane stoves, and gear packages available for travelers in Lankagama.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddCampingModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Equipment</span>
                </button>
              </div>

              {/* Camping List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {campingGear.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 bg-slate-100">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                          {item.category}
                        </div>
                        <div className="absolute bottom-2 right-2 bg-slate-900/90 text-white px-2.5 py-1 rounded text-xs font-mono font-bold">
                          Rs. {item.pricePerDayLKR.toLocaleString()} / day
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <span className="text-[11px] font-semibold text-blue-600 block">{item.sinhalaName}</span>
                        <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>

                        <div className="pt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Includes:</span>
                          <div className="space-y-0.5">
                            {item.includes.map((inc, i) => (
                              <div key={i} className="text-xs text-slate-700 flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span className="line-clamp-1">{inc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                      <button
                        onClick={() => handleOpenEditCamping(item)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit Gear</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCamping(item.id, item.name)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================
             5. TAB: WATERFALLS & SANCTUARIES
             ============================================================ */}
          {activeTab === 'attractions' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Natural Waterfalls & Sanctuaries in Lankagama
                  </h2>
                  <p className="text-xs text-slate-500">
                    Add new waterfall spots, natural pools, and travel advisory notices with photos.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddAttractionModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Waterfall / Sight</span>
                </button>
              </div>

              {/* Attractions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {attractions.map((attraction) => (
                  <div
                    key={attraction.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {attraction.imageUrl && (
                        <div className="relative h-44 bg-slate-100">
                          <img src={attraction.imageUrl} alt={attraction.name} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {attraction.badge}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>{attraction.name}</span>
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed">{attraction.description}</p>

                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span><strong>Caution Note:</strong> {attraction.caution}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                      <button
                        onClick={() => handleOpenEditAttraction(attraction)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit Attraction</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAttraction(attraction.id, attraction.name)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================
             6. TAB: KITHUL & TODDY PRODUCTS
             ============================================================ */}
          {activeTab === 'kithul' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    100% Pure Kithul Products & Fresh Toddy
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage treacle, jaggery halves, fresh chilled toddy bottles, and live tapping tours delivered to villas.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddKithulModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Kithul Product / Tour</span>
                </button>
              </div>

              {/* Kithul Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {kithulProducts.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {item.imageUrl && (
                        <div className="relative h-44 bg-slate-100">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-600 text-white">
                            {item.category}
                          </span>
                        </div>
                      )}

                      <div className="p-5 space-y-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 inline-block">
                          {item.purityBadge}
                        </span>

                        <h3 className="text-base font-bold text-slate-900">
                          {item.name}
                        </h3>
                        <p className="text-xs text-amber-800 font-medium">
                          {item.sinhalaName}
                        </p>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {item.description}
                        </p>

                        <div className="text-xs text-slate-500 space-y-1 pt-1">
                          <div><strong>Package:</strong> {item.weightOrVolume}</div>
                          <div><strong>Origin:</strong> {item.harvestOrigin}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                      <div className="text-sm font-bold text-blue-700 font-mono">
                        Rs. {item.priceLKR.toLocaleString()} <span className="text-xs font-normal text-slate-500">/{item.unit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditKithul(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteKithul(item.id, item.name)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================
             7. TAB: CUSTOMER INQUIRIES
             ============================================================ */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Customer Inquiries & Trip Questions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Travelers inquiring about villa availability, Kithul doorstep deliveries, road conditions, and custom packages.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    Total: {inquiries.length}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                    New: {inquiries.filter(i => i.status === 'new').length}
                  </span>
                </div>
              </div>

              {inquiries.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
                  No inquiries received yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq) => {
                    const cleanPhone = inq.phone.replace(/[^0-9]/g, '');
                    const intlPhone = cleanPhone.startsWith('0') ? '94' + cleanPhone.substring(1) : cleanPhone;
                    const replyText = `Hello ${inq.name}! 🌿 Thank you for reaching out to The Sinharaja Collection Lankagama regarding "${inq.subject}". How can we assist you with your trip?`;
                    const waReplyUrl = `https://wa.me/${intlPhone}?text=${encodeURIComponent(replyText)}`;

                    return (
                      <div
                        key={inq.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                              {inq.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">{inq.name}</h3>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span>📞 {inq.phone}</span>
                                {inq.email && <span>✉️ {inq.email}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              inq.status === 'new'
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : inq.status === 'contacted'
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}>
                              {inq.status}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(inq.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-xs font-semibold text-blue-700 block mb-1">
                            Topic: {inq.subject}
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                            &ldquo;{inq.message}&rdquo;
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-medium">Update Status:</span>
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq.id, 'new')}
                              className={`px-2 py-1 rounded text-[11px] font-medium border cursor-pointer ${
                                inq.status === 'new' ? 'bg-red-50 text-red-700 border-red-300 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              New
                            </button>
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq.id, 'contacted')}
                              className={`px-2 py-1 rounded text-[11px] font-medium border cursor-pointer ${
                                inq.status === 'contacted' ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Contacted
                            </button>
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq.id, 'resolved')}
                              className={`px-2 py-1 rounded text-[11px] font-medium border cursor-pointer ${
                                inq.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Resolved
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={waReplyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Reply on WhatsApp</span>
                            </a>

                            <button
                              onClick={() => handleDeleteInquiry(inq.id, inq.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Delete inquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================
             8. TAB: CUSTOMER REVIEWS WALL
             ============================================================ */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Customer Testimonials & Reviews Wall
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage reviews posted by guests regarding villas, pure kithul treacle, fresh toddy, and camping.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Total Reviews: {comments.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {comments.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                        &ldquo;{item.comment}&rdquo;
                      </p>

                      <div className="text-xs">
                        <h4 className="font-bold text-slate-900">{item.author}</h4>
                        <span className="text-slate-500 text-[11px] block">{item.cityOrCountry}</span>
                        {item.stayedAtOrOrdered && (
                          <span className="text-blue-700 text-[11px] font-medium block mt-0.5">
                            {item.stayedAtOrOrdered}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">{item.createdAt}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditComment(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteComment(item.id, item.author)}
                          className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ============================================================
         MODAL 1: ADD HERO SLIDE
         ============================================================ */}
      {isAddSlideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Hero Slideshow Photo</h3>
              <button onClick={() => setIsAddSlideModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlide} className="space-y-4">
              <ImageUploadDropzone
                value={newSlide.url}
                onChange={url => setNewSlide({ ...newSlide, url })}
                label="Slide Photo (Drag & Drop or Select File) *"
                hint="High-resolution landscape photo for main banner"
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Title (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brahmana Ella & Cascades"
                  value={newSlide.title}
                  onChange={e => setNewSlide({ ...newSlide, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Slide Subtitle / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pristine waterfalls and tranquil bathing basins"
                  value={newSlide.sinhala}
                  onChange={e => setNewSlide({ ...newSlide, sinhala: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddSlideModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-sm"
                >
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
         MODAL 2: ADD VILLA (with drag and drop image upload)
         ============================================================ */}
      {isAddVillaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Villa & Stays</h3>
                <p className="text-xs text-slate-500">Configure room details, amenities, and upload photos directly.</p>
              </div>
              <button onClick={() => setIsAddVillaModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVilla} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Villa Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rainforest Whisper River Edge Villa"
                    value={newVilla.name}
                    onChange={e => setNewVilla({ ...newVilla, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Local / Sinhala Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Traditional Riverside Lodge"
                    value={newVilla.sinhalaName}
                    onChange={e => setNewVilla({ ...newVilla, sinhalaName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Short Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Steps away from pure river pool"
                    value={newVilla.tagline}
                    onChange={e => setNewVilla({ ...newVilla, tagline: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location in Lankagama</label>
                  <input
                    type="text"
                    placeholder="e.g. 500m past Lankagama bridge along Gin Ganga"
                    value={newVilla.locationDetails}
                    onChange={e => setNewVilla({ ...newVilla, locationDetails: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Room Config Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <span className="text-xs font-bold text-slate-800 uppercase block tracking-wider">
                  Room Configuration & Rates
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Price / Night (LKR) *</label>
                    <input
                      type="number"
                      required
                      min="1000"
                      value={newVilla.pricePerNightLKR}
                      onChange={e => setNewVilla({ ...newVilla, pricePerNightLKR: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bedrooms Count *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newVilla.bedrooms}
                      onChange={e => setNewVilla({ ...newVilla, bedrooms: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bathrooms *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newVilla.bathrooms}
                      onChange={e => setNewVilla({ ...newVilla, bathrooms: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Guests *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newVilla.maxGuests}
                      onChange={e => setNewVilla({ ...newVilla, maxGuests: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono font-bold bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bed Arrangement</label>
                    <input
                      type="text"
                      placeholder="e.g. 2 King Beds, 1 Bunk Bed"
                      value={newVilla.bedConfig}
                      onChange={e => setNewVilla({ ...newVilla, bedConfig: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Owner Contact Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +94 71 234 5678 (Mr. Bandara)"
                      value={newVilla.ownerContact}
                      onChange={e => setNewVilla({ ...newVilla, ownerContact: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* A/C Selection */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                      <Snowflake className="w-3.5 h-3.5 text-blue-600" />
                      <span>A/C Availability *</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNewVilla({ ...newVilla, acType: 'ac' })}
                        className={`py-2 px-1 text-[11px] rounded-lg font-bold border transition-all cursor-pointer text-center ${
                          newVilla.acType === 'ac'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        ❄️ A/C Only
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewVilla({ ...newVilla, acType: 'non-ac' })}
                        className={`py-2 px-1 text-[11px] rounded-lg font-bold border transition-all cursor-pointer text-center ${
                          newVilla.acType === 'non-ac'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        🍃 Non-A/C
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewVilla({ ...newVilla, acType: 'both' })}
                        className={`py-2 px-1 text-[11px] rounded-lg font-bold border transition-all cursor-pointer text-center ${
                          newVilla.acType === 'both'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        ❄️🍃 Both (A/C & Non-A/C)
                      </button>
                    </div>
                  </div>

                  {/* Kitchen Selection */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5 text-amber-600" />
                      <span>Kitchen Facility *</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNewVilla({ ...newVilla, hasKitchen: true })}
                        className={`py-2 px-2 text-[11px] rounded-lg font-bold border transition-all cursor-pointer text-center ${
                          newVilla.hasKitchen
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        🍳 Kitchen Available
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewVilla({ ...newVilla, hasKitchen: false })}
                        className={`py-2 px-2 text-[11px] rounded-lg font-bold border transition-all cursor-pointer text-center ${
                          !newVilla.hasKitchen
                            ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        ✕ No Kitchen
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Upload Zone */}
              <div className="space-y-3 pt-1">
                <ImageUploadDropzone
                  value={newVilla.imageUrl}
                  onChange={url => {
                    setNewVilla({ ...newVilla, imageUrl: url });
                  }}
                  label="Primary Cover Photo (Drag & Drop or Select File) *"
                  hint="Main display image for the villa card"
                />

                <MultiImageUpload
                  images={newVilla.galleryImages}
                  onChange={imgs => setNewVilla({ ...newVilla, galleryImages: imgs })}
                  coverImage={newVilla.imageUrl}
                  onSetCover={url => setNewVilla({ ...newVilla, imageUrl: url })}
                  label="Additional Gallery Photos (Upload Multiple Photos from Device)"
                  hint="You can select or drop multiple image files at once from your computer"
                />
              </div>

              {/* Features & Food */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Features (comma separated)</label>
                  <input
                    type="text"
                    value={newVilla.featuresText}
                    onChange={e => setNewVilla({ ...newVilla, featuresText: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the nature views, atmosphere, and stream pool..."
                    value={newVilla.description}
                    onChange={e => setNewVilla({ ...newVilla, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddVillaModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-sm"
                >
                  Publish Villa to Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
         MODAL 3: ADD CAMPING GEAR (with drag and drop image upload)
         ============================================================ */}
      {isAddCampingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Camping Gear / Tent</h3>
                <p className="text-xs text-slate-500">List new waterproof tents or cooking equipment.</p>
              </div>
              <button onClick={() => setIsAddCampingModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCamping} className="space-y-4">
              <ImageUploadDropzone
                value={newCamping.imageUrl}
                onChange={url => setNewCamping({ ...newCamping, imageUrl: url })}
                label="Gear Photo (Drag & Drop or Select from Computer) *"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gear Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4-Person Rainforest Camp Set"
                    value={newCamping.name}
                    onChange={e => setNewCamping({ ...newCamping, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sinhala Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Complete Expedition Camping Set"
                    value={newCamping.sinhalaName}
                    onChange={e => setNewCamping({ ...newCamping, sinhalaName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Daily Rate (LKR) *</label>
                  <input
                    type="number"
                    required
                    min="500"
                    value={newCamping.pricePerDayLKR}
                    onChange={e => setNewCamping({ ...newCamping, pricePerDayLKR: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={newCamping.category}
                    onChange={e => setNewCamping({ ...newCamping, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="package">Full Package Set</option>
                    <option value="tent">Tent Only</option>
                    <option value="cooking">Cooking / Stove</option>
                    <option value="accessory">Accessory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Included Items (comma separated)</label>
                <input
                  type="text"
                  value={newCamping.includesText}
                  onChange={e => setNewCamping({ ...newCamping, includesText: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Waterproof rating, insulation, ease of setup..."
                  value={newCamping.description}
                  onChange={e => setNewCamping({ ...newCamping, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddCampingModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-sm"
                >
                  Save Gear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
         MODAL 4: ADD ATTRACTION (with drag and drop image upload)
         ============================================================ */}
      {isAddAttractionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Waterfall / Natural Sanctuary</h3>
              <button onClick={() => setIsAddAttractionModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAttraction} className="space-y-4">
              <ImageUploadDropzone
                value={newAttraction.imageUrl}
                onChange={url => setNewAttraction({ ...newAttraction, imageUrl: url })}
                label="Attraction Photo (Drag & Drop or Select Image)"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Attraction Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Uruma Ella Falls"
                    value={newAttraction.name}
                    onChange={e => setNewAttraction({ ...newAttraction, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Badge / Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. 25m Waterfall"
                    value={newAttraction.badge}
                    onChange={e => setNewAttraction({ ...newAttraction, badge: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Atmosphere, walking distance, rock pool conditions..."
                  value={newAttraction.description}
                  onChange={e => setNewAttraction({ ...newAttraction, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Safety Caution Note</label>
                <input
                  type="text"
                  placeholder="e.g. Check river currents during rain..."
                  value={newAttraction.caution}
                  onChange={e => setNewAttraction({ ...newAttraction, caution: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddAttractionModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-sm"
                >
                  Save Attraction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
         MODAL 5: ADD KITHUL PRODUCT / TODDY TOUR
         ============================================================ */}
      {isAddKithulModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Kithul Product / Toddy Experience</h3>
                <p className="text-xs text-slate-500">Add pure treacle, jaggery, fresh toddy, or live tapping session.</p>
              </div>
              <button onClick={() => setIsAddKithulModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateKithul} className="space-y-4">
              <ImageUploadDropzone
                value={newKithul.imageUrl}
                onChange={url => setNewKithul({ ...newKithul, imageUrl: url })}
                label="Product / Tour Photo (Drag & Drop or Select File) *"
                hint="High-resolution image of the jar, clay pot, jaggery, or palm tapping"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 100% Pure Sinharaja Kithul Treacle"
                    value={newKithul.name}
                    onChange={e => setNewKithul({ ...newKithul, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sinhala Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sinharaja Pure Kithul Treacle"
                    value={newKithul.sinhalaName}
                    onChange={e => setNewKithul({ ...newKithul, sinhalaName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={newKithul.category}
                    onChange={e => setNewKithul({ ...newKithul, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="treacle">Treacle (Pure)</option>
                    <option value="jaggery">Jaggery (Hearth Smoked)</option>
                    <option value="toddy">Fresh Toddy (Chilled Bottle)</option>
                    <option value="experience">Live Tapping Tour (Guided)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={newKithul.priceLKR}
                    onChange={e => setNewKithul({ ...newKithul, priceLKR: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unit Label</label>
                  <input
                    type="text"
                    placeholder="bottle / pack / tour"
                    value={newKithul.unit}
                    onChange={e => setNewKithul({ ...newKithul, unit: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Weight / Volume</label>
                  <input
                    type="text"
                    placeholder="e.g. 750ml Bottle / 500g Halves / 1.5L Chilled"
                    value={newKithul.weightOrVolume}
                    onChange={e => setNewKithul({ ...newKithul, weightOrVolume: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Purity Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Pure Forest Grade"
                    value={newKithul.purityBadge}
                    onChange={e => setNewKithul({ ...newKithul, purityBadge: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Harvest Origin</label>
                <input
                  type="text"
                  placeholder="e.g. Upper Gin Ganga Valley Palms, Lankagama"
                  value={newKithul.harvestOrigin}
                  onChange={e => setNewKithul({ ...newKithul, harvestOrigin: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe extraction, taste profile, and zero sugar promise..."
                  value={newKithul.description}
                  onChange={e => setNewKithul({ ...newKithul, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddKithulModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-sm"
                >
                  Save Product to Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
         EDIT MODAL 1: BOOKING
         ============================================================ */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Booking Details</h3>
                <p className="text-xs text-slate-500 font-mono">Ref: #{editingBooking.id}</p>
              </div>
              <button onClick={() => setEditingBooking(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={editingBooking.customerName}
                    onChange={e => setEditingBooking({ ...editingBooking, customerName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Phone *</label>
                  <input
                    type="text"
                    required
                    value={editingBooking.customerPhone}
                    onChange={e => setEditingBooking({ ...editingBooking, customerPhone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Check-In Date *</label>
                  <input
                    type="text"
                    required
                    value={editingBooking.checkInDate}
                    onChange={e => setEditingBooking({ ...editingBooking, checkInDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Check-Out Date</label>
                  <input
                    type="text"
                    value={editingBooking.checkOutDate || ''}
                    onChange={e => setEditingBooking({ ...editingBooking, checkOutDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Guests Count</label>
                  <input
                    type="number"
                    min={1}
                    value={editingBooking.guestsCount}
                    onChange={e => setEditingBooking({ ...editingBooking, guestsCount: Number(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Total (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={editingBooking.totalLKR}
                    onChange={e => setEditingBooking({ ...editingBooking, totalLKR: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Booking Status</label>
                  <select
                    value={editingBooking.status}
                    onChange={e => setEditingBooking({ ...editingBooking, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="pending">🟡 Pending Host Check</option>
                    <option value="approved">🟢 Confirmed & Reserved</option>
                    <option value="rejected">⚪ Cancelled / Unavailable</option>
                    <option value="delivered">📦 Delivered (Food/Kithul)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Room A/C Preference</label>
                  <select
                    value={editingBooking.acPreference || ''}
                    onChange={e => setEditingBooking({ ...editingBooking, acPreference: (e.target.value as any) || undefined })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="">Not Applicable / None</option>
                    <option value="ac">❄️ A/C Room</option>
                    <option value="non-ac">🍃 Non-A/C Room</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Village Meals Ordered</label>
                  <select
                    value={editingBooking.orderMeals === true ? 'yes' : editingBooking.orderMeals === false ? 'no' : ''}
                    onChange={e => setEditingBooking({ 
                      ...editingBooking, 
                      orderMeals: e.target.value === 'yes' ? true : e.target.value === 'no' ? false : undefined 
                    })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="">Not Specified</option>
                    <option value="yes">🍲 YES (Woodfire Food Ordered)</option>
                    <option value="no">✕ NO (No Food Needed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Delivery Destination / Villa Name</label>
                <input
                  type="text"
                  placeholder="e.g. Gin Ganga River Villa, Room #2"
                  value={editingBooking.deliveryLocation || ''}
                  onChange={e => setEditingBooking({ ...editingBooking, deliveryLocation: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Items / Packages Summary</label>
                <input
                  type="text"
                  placeholder="e.g. 2x 750ml Pure Kithul Treacle + 1x Camping Tent"
                  value={editingBooking.itemsSummary || ''}
                  onChange={e => setEditingBooking({ ...editingBooking, itemsSummary: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Special Notes</label>
                <textarea
                  rows={2}
                  value={editingBooking.specialNotes || ''}
                  onChange={e => setEditingBooking({ ...editingBooking, specialNotes: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Agency Internal Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Called host, deposit collected..."
                  value={editingBooking.adminNotes || ''}
                  onChange={e => setEditingBooking({ ...editingBooking, adminNotes: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-sm"
                >
                  Save Booking Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
         EDIT MODAL 2: HERO SLIDE
         ============================================================ */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Hero Slide</h3>
              <button onClick={() => setEditingSlide(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSlideSubmit} className="space-y-4">
              <ImageUploadDropzone
                value={editingSlide.url}
                onChange={url => setEditingSlide({ ...editingSlide, url })}
                label="Slide Photo (Drag & Drop or Select File) *"
                hint="High-resolution landscape photo for main banner"
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title (English) *</label>
                <input
                  type="text"
                  required
                  value={editingSlide.title}
                  onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slide Subtitle</label>
                <input
                  type="text"
                  value={editingSlide.sinhala}
                  onChange={e => setEditingSlide({ ...editingSlide, sinhala: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-sm"
                >
                  Save Slide Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
         EDIT MODAL 3: VILLA & HOMESTAY
         ============================================================ */}
      {editingVilla && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Villa: {editingVilla.name}</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {editingVilla.id}</p>
              </div>
              <button onClick={() => setEditingVilla(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateVillaSubmit} className="space-y-4">
              <ImageUploadDropzone
                value={editingVilla.imageUrl}
                onChange={url => setEditingVilla({ ...editingVilla, imageUrl: url })}
                label="Primary Villa Cover Photo (Drag & Drop or Select File) *"
                hint="Main landscape image displayed on villa cards"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Villa Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={editingVilla.name}
                    onChange={e => setEditingVilla({ ...editingVilla, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Local / Sinhala Name (Optional)</label>
                  <input
                    type="text"
                    value={editingVilla.sinhalaName || ''}
                    onChange={e => setEditingVilla({ ...editingVilla, sinhalaName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tagline</label>
                  <input
                    type="text"
                    value={editingVilla.tagline}
                    onChange={e => setEditingVilla({ ...editingVilla, tagline: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price Per Night (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={editingVilla.pricePerNightLKR}
                    onChange={e => setEditingVilla({ ...editingVilla, pricePerNightLKR: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min={1}
                    value={editingVilla.bedrooms}
                    onChange={e => setEditingVilla({ ...editingVilla, bedrooms: Number(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min={1}
                    value={editingVilla.bathrooms}
                    onChange={e => setEditingVilla({ ...editingVilla, bathrooms: Number(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Max Guests</label>
                  <input
                    type="number"
                    min={1}
                    value={editingVilla.maxGuests}
                    onChange={e => setEditingVilla({ ...editingVilla, maxGuests: Number(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bed Configuration</label>
                  <input
                    type="text"
                    value={editingVilla.bedConfig}
                    onChange={e => setEditingVilla({ ...editingVilla, bedConfig: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Host Contact Phone</label>
                  <input
                    type="text"
                    value={editingVilla.ownerContact || ''}
                    onChange={e => setEditingVilla({ ...editingVilla, ownerContact: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Check-in Time</label>
                  <input
                    type="text"
                    value={editingVilla.checkInTime || '02:00 PM'}
                    onChange={e => setEditingVilla({ ...editingVilla, checkInTime: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Check-out Time</label>
                  <input
                    type="text"
                    value={editingVilla.checkOutTime || '11:00 AM'}
                    onChange={e => setEditingVilla({ ...editingVilla, checkOutTime: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location Details</label>
                <input
                  type="text"
                  value={editingVilla.locationDetails || ''}
                  onChange={e => setEditingVilla({ ...editingVilla, locationDetails: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* A/C Selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Snowflake className="w-3.5 h-3.5 text-blue-600" />
                    <span>A/C Availability *</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingVilla({ ...editingVilla, acType: 'ac' })}
                      className={`py-2 px-1 text-[11px] rounded-lg font-bold border transition-all cursor-pointer text-center ${
                        editingVilla.acType === 'ac'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      ❄️ A/C Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingVilla({ ...editingVilla, acType: 'non-ac' })}
                      className={`py-2 px-1 text-[11px] rounded-lg font-bold border transition-all cursor-pointer text-center ${
                        editingVilla.acType === 'non-ac'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      🍃 Non-A/C
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingVilla({ ...editingVilla, acType: 'both' })}
                      className={`py-2 px-1 text-[11px] rounded-lg font-bold border transition-all cursor-pointer text-center ${
                        editingVilla.acType === 'both'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      ❄️🍃 Both (A/C & Non-A/C)
                    </button>
                  </div>
                </div>

                {/* Kitchen Selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kitchen Facility *</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingVilla({ ...editingVilla, hasKitchen: true })}
                      className={`py-2 px-2 text-[11px] rounded-lg font-bold border transition-all cursor-pointer text-center ${
                        editingVilla.hasKitchen
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      🍳 Kitchen Available
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingVilla({ ...editingVilla, hasKitchen: false })}
                      className={`py-2 px-2 text-[11px] rounded-lg font-bold border transition-all cursor-pointer text-center ${
                        !editingVilla.hasKitchen
                          ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      ✕ No Kitchen
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <MultiImageUpload
                  images={editingVillaGallery}
                  onChange={imgs => setEditingVillaGallery(imgs)}
                  coverImage={editingVilla.imageUrl}
                  onSetCover={url => setEditingVilla({ ...editingVilla, imageUrl: url })}
                  label="Gallery Photos (Upload Multiple Photos from Device)"
                  hint="You can select or drop multiple image files at once from your computer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Features & Amenities (Comma-separated)</label>
                <input
                  type="text"
                  value={editingVillaFeatures}
                  onChange={e => setEditingVillaFeatures(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Traditional Food Options (Comma-separated)</label>
                <input
                  type="text"
                  value={editingVillaFood}
                  onChange={e => setEditingVillaFood(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">House Rules (Comma-separated)</label>
                <input
                  type="text"
                  value={editingVillaRules}
                  onChange={e => setEditingVillaRules(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingVilla.description}
                  onChange={e => setEditingVilla({ ...editingVilla, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingVilla(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingVilla}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  {isSavingVilla ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Villa Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
         EDIT MODAL 4: CAMPING GEAR
         ============================================================ */}
      {editingCamping && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Camping Gear</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {editingCamping.id}</p>
              </div>
              <button onClick={() => setEditingCamping(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCampingSubmit} className="space-y-4">
              <ImageUploadDropzone
                value={editingCamping.imageUrl}
                onChange={url => setEditingCamping({ ...editingCamping, imageUrl: url })}
                label="Gear Photo (Drag & Drop or Select File) *"
                hint="Image of tent, stove, or camping kit"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    required
                    value={editingCamping.name}
                    onChange={e => setEditingCamping({ ...editingCamping, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sinhala Name</label>
                  <input
                    type="text"
                    value={editingCamping.sinhalaName || ''}
                    onChange={e => setEditingCamping({ ...editingCamping, sinhalaName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={editingCamping.category}
                    onChange={e => setEditingCamping({ ...editingCamping, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="package">Package Deal</option>
                    <option value="tent">Tent Only</option>
                    <option value="cooking">Cooking & Gas</option>
                    <option value="accessory">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price / Day (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={editingCamping.pricePerDayLKR}
                    onChange={e => setEditingCamping({ ...editingCamping, pricePerDayLKR: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Capacity</label>
                  <input
                    type="text"
                    value={editingCamping.capacity}
                    onChange={e => setEditingCamping({ ...editingCamping, capacity: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Included Items (Comma-separated)</label>
                <input
                  type="text"
                  value={editingCampingIncludes}
                  onChange={e => setEditingCampingIncludes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingCamping.description}
                  onChange={e => setEditingCamping({ ...editingCamping, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCamping(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-sm"
                >
                  Save Gear Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
         EDIT MODAL 5: ATTRACTION / WATERFALL
         ============================================================ */}
      {editingAttraction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Attraction / Waterfall</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {editingAttraction.id}</p>
              </div>
              <button onClick={() => setEditingAttraction(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAttractionSubmit} className="space-y-4">
              <ImageUploadDropzone
                value={editingAttraction.imageUrl || ''}
                onChange={url => setEditingAttraction({ ...editingAttraction, imageUrl: url })}
                label="Attraction Photo (Drag & Drop or Select File)"
                hint="Landscape photo of waterfall or natural pool"
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Attraction Name *</label>
                <input
                  type="text"
                  required
                  value={editingAttraction.name}
                  onChange={e => setEditingAttraction({ ...editingAttraction, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category / Badge</label>
                <input
                  type="text"
                  value={editingAttraction.badge}
                  onChange={e => setEditingAttraction({ ...editingAttraction, badge: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={editingAttraction.description}
                  onChange={e => setEditingAttraction({ ...editingAttraction, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Safety Caution Note</label>
                <input
                  type="text"
                  value={editingAttraction.caution}
                  onChange={e => setEditingAttraction({ ...editingAttraction, caution: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingAttraction(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-sm"
                >
                  Save Attraction Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
         EDIT MODAL 6: KITHUL PRODUCT / TODDY EXPERIENCE
         ============================================================ */}
      {editingKithul && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Kithul Product / Experience</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {editingKithul.id}</p>
              </div>
              <button onClick={() => setEditingKithul(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateKithulSubmit} className="space-y-4">
              <ImageUploadDropzone
                value={editingKithul.imageUrl}
                onChange={url => setEditingKithul({ ...editingKithul, imageUrl: url })}
                label="Product / Tour Photo (Drag & Drop or Select File) *"
                hint="Image of treacle bottle, jaggery halves, or fresh toddy"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={editingKithul.name}
                    onChange={e => setEditingKithul({ ...editingKithul, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sinhala Name</label>
                  <input
                    type="text"
                    value={editingKithul.sinhalaName}
                    onChange={e => setEditingKithul({ ...editingKithul, sinhalaName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={editingKithul.category}
                    onChange={e => setEditingKithul({ ...editingKithul, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="treacle">Treacle (Pure)</option>
                    <option value="jaggery">Jaggery (Hearth Smoked)</option>
                    <option value="toddy">Fresh Toddy (Chilled Bottle)</option>
                    <option value="experience">Live Tapping Tour (Guided)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={editingKithul.priceLKR}
                    onChange={e => setEditingKithul({ ...editingKithul, priceLKR: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unit Label</label>
                  <input
                    type="text"
                    value={editingKithul.unit}
                    onChange={e => setEditingKithul({ ...editingKithul, unit: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Weight / Volume</label>
                  <input
                    type="text"
                    value={editingKithul.weightOrVolume}
                    onChange={e => setEditingKithul({ ...editingKithul, weightOrVolume: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Purity Badge</label>
                  <input
                    type="text"
                    value={editingKithul.purityBadge}
                    onChange={e => setEditingKithul({ ...editingKithul, purityBadge: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Harvest Origin</label>
                  <input
                    type="text"
                    value={editingKithul.harvestOrigin}
                    onChange={e => setEditingKithul({ ...editingKithul, harvestOrigin: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stock Availability</label>
                  <select
                    value={editingKithul.inStock ? 'true' : 'false'}
                    onChange={e => setEditingKithul({ ...editingKithul, inStock: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="true">In Stock (Available)</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Delivery Destination Note</label>
                <input
                  type="text"
                  value={editingKithul.deliveryNote}
                  onChange={e => setEditingKithul({ ...editingKithul, deliveryNote: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingKithul.description}
                  onChange={e => setEditingKithul({ ...editingKithul, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingKithul(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-sm"
                >
                  Save Product Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
         EDIT MODAL 7: CUSTOMER REVIEW / TESTIMONIAL
         ============================================================ */}
      {editingComment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Customer Review</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {editingComment.id}</p>
              </div>
              <button onClick={() => setEditingComment(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCommentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={editingComment.author}
                    onChange={e => setEditingComment({ ...editingComment, author: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City / Country</label>
                  <input
                    type="text"
                    value={editingComment.cityOrCountry}
                    onChange={e => setEditingComment({ ...editingComment, cityOrCountry: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rating (Stars 1-5)</label>
                  <select
                    value={editingComment.rating}
                    onChange={e => setEditingComment({ ...editingComment, rating: Number(e.target.value) || 5 })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    <option value={2}>⭐⭐ (2 Stars)</option>
                    <option value={1}>⭐ (1 Star)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={editingComment.category}
                    onChange={e => setEditingComment({ ...editingComment, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="villa">Villa Experience</option>
                    <option value="kithul">Kithul & Toddy</option>
                    <option value="camping">Camping Gear</option>
                    <option value="tour">Waterfall / Guide Tour</option>
                    <option value="general">General Experience</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stayed At / Ordered Item</label>
                <input
                  type="text"
                  placeholder="e.g. Gin Ganga River Villa, 100% Pure Kithul Treacle"
                  value={editingComment.stayedAtOrOrdered || ''}
                  onChange={e => setEditingComment({ ...editingComment, stayedAtOrOrdered: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Review Comment *</label>
                <textarea
                  rows={4}
                  required
                  value={editingComment.comment}
                  onChange={e => setEditingComment({ ...editingComment, comment: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingComment(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-sm"
                >
                  Save Review Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
