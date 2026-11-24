import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin, Plus, ShoppingCart, Store, Star, Clock, Search,
  Sparkles, CheckCircle2, X, Utensils, Flame, ChevronRight,
  Trash2, AlertCircle, Loader2,
} from 'lucide-react';
import {
  PINCodeDetails, ThemeMode, ProductComparisonItem, PlatformResult,
} from '../../types';
import {
  submitLocalRestaurant,
  fetchApprovedLocalRestaurants,
  LocalRestaurantDB,
  isSupabaseConfigured,
} from '../../lib/supabase';

// ─── Fallback static data shown when Supabase is not yet configured ───────────
const STATIC_FALLBACK: LocalRestaurantDB[] = [
  {
    id: 'static-1',
    name: 'Maa Tara Tiffin & Dosa Corner',
    area: 'New Town / Salt Lake',
    pin_code: '700156',
    cuisine: 'South Indian & Tiffin',
    owner_name: 'Tapas Das',
    owner_phone: '9800000001',
    is_pure_veg: true,
    delivery_minutes: 20,
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    status: 'approved',
    created_at: '',
    dishes: [
      { id: 'd1', restaurant_id: 'static-1', name: 'Steamed Rice Idli (3 Pcs) with Sambar', price: 65, is_veg: true, portion: '3 Pcs + Chutney', is_available: true },
      { id: 'd2', restaurant_id: 'static-1', name: 'Butter Masala Dosa', price: 95, is_veg: true, portion: '1 Full Dosa', is_available: true },
    ],
  },
  {
    id: 'static-2',
    name: 'Dada Bhai Roll & Chowmein Stall',
    area: 'Park Circus / Ballygunge',
    pin_code: '700019',
    cuisine: 'Street Food & Rolls',
    owner_name: 'Ratan Ghosh',
    owner_phone: '9800000002',
    is_pure_veg: false,
    delivery_minutes: 18,
    image_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&auto=format&fit=crop&q=80',
    status: 'approved',
    created_at: '',
    dishes: [
      { id: 'd3', restaurant_id: 'static-2', name: 'Double Egg Chicken Kati Roll', price: 90, is_veg: false, portion: '1 Jumbo Roll', is_available: true },
      { id: 'd4', restaurant_id: 'static-2', name: 'Veg Hakka Chowmein', price: 85, is_veg: true, portion: 'Full Plate', is_available: true },
    ],
  },
  {
    id: 'static-3',
    name: 'Annapurna Home Kitchen',
    area: 'Medinipur Town / Keranitola',
    pin_code: '721101',
    cuisine: 'Bengali Homestyle Meals',
    owner_name: 'Sumitra Dey',
    owner_phone: '9800000003',
    is_pure_veg: false,
    delivery_minutes: 25,
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    status: 'approved',
    created_at: '',
    dishes: [
      { id: 'd5', restaurant_id: 'static-3', name: 'Katla Macher Jhol & Rice Thali', price: 145, is_veg: false, portion: 'Full Thali', is_available: true },
      { id: 'd6', restaurant_id: 'static-3', name: 'Desi Chicken Kasha (4 Pcs)', price: 165, is_veg: false, portion: '4 Pcs Bowl', is_available: true },
    ],
  },
  {
    id: 'static-4',
    name: 'Noorani Mohalla Biryani House',
    area: 'Rajarhat / Baguiati',
    pin_code: '700059',
    cuisine: 'Biryani & Mughlai',
    owner_name: 'Firoz Khan',
    owner_phone: '9800000004',
    is_pure_veg: false,
    delivery_minutes: 24,
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    status: 'approved',
    created_at: '',
    dishes: [
      { id: 'd7', restaurant_id: 'static-4', name: 'Kolkata Chicken Dum Biryani (Aloo + Egg)', price: 160, is_veg: false, portion: 'Full Handi', is_available: true },
      { id: 'd8', restaurant_id: 'static-4', name: 'Mutton Dum Biryani Special', price: 240, is_veg: false, portion: 'Full Handi', is_available: true },
    ],
  },
];

// ─── Empty dish row for the add-dishes form ───────────────────────────────────
const emptyDish = () => ({ name: '', price: '100', is_veg: true, portion: '1 Plate' });

interface LocalRestaurantHubProps {
  currentPinDetails: PINCodeDetails | null;
  onOpenPinModal: () => void;
  onAddToCart: (product: ProductComparisonItem, platform: PlatformResult) => void;
  themeMode?: ThemeMode;
}

export const LocalRestaurantHub: React.FC<LocalRestaurantHubProps> = ({
  currentPinDetails, onOpenPinModal, onAddToCart, themeMode = 'dark',
}) => {
  const isDark = themeMode === 'dark';

  // ─── State ────────────────────────────────────────────────────────────────
  const [restaurants, setRestaurants] = useState<LocalRestaurantDB[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [pinFilterOnly, setPinFilterOnly] = useState(false);

  const [view, setView] = useState<'buyer' | 'owner'>('buyer');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Owner form state
  const [ownerForm, setOwnerForm] = useState({
    name: '', area: currentPinDetails?.area || '', pin_code: currentPinDetails?.pinCode || '',
    cuisine: 'Local / Homestyle', owner_name: '', owner_phone: '', owner_email: '',
    is_pure_veg: false, delivery_minutes: '25',
  });
  const [dishes, setDishes] = useState([emptyDish()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Load restaurants ─────────────────────────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    fetchApprovedLocalRestaurants()
      .then((data) => {
        if (data.length > 0) setRestaurants(data);
        else setRestaurants(STATIC_FALLBACK); // fallback when Supabase table is empty / not set up
      })
      .catch(() => setRestaurants(STATIC_FALLBACK))
      .finally(() => setIsLoading(false));
  }, []);

  // Auto-fill area/pin in owner form when PIN changes
  useEffect(() => {
    if (currentPinDetails) {
      setOwnerForm((f) => ({
        ...f,
        area: f.area || currentPinDetails.area,
        pin_code: f.pin_code || currentPinDetails.pinCode,
      }));
    }
  }, [currentPinDetails]);

  // ─── Filtered list ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return restaurants.filter((r) => {
      if (vegOnly && !r.is_pure_veg) return false;
      if (pinFilterOnly && currentPinDetails && r.pin_code !== currentPinDetails.pinCode) return false;
      if (!q) return true;
      const inRest = r.name.toLowerCase().includes(q) || r.area.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) || r.pin_code.includes(q);
      const inDish = (r.dishes || []).some((d) => d.name.toLowerCase().includes(q));
      return inRest || inDish;
    });
  }, [restaurants, searchQuery, vegOnly, pinFilterOnly, currentPinDetails]);

  // ─── Add to cart ──────────────────────────────────────────────────────────
  const handleAddDish = (rest: LocalRestaurantDB, dish: { id: string; name: string; price: number; is_veg: boolean; portion: string }) => {
    const product: ProductComparisonItem = {
      id: `local-${rest.id}-${dish.id}`,
      name: dish.name,
      category: 'food',
      restaurantOrBrand: rest.name,
      quantity: dish.portion,
      imageUrl: rest.image_url,
      description: `${rest.cuisine} • ${rest.area} (PIN ${rest.pin_code})`,
      isVeg: dish.is_veg,
      matchType: 'EXACT', matchScore: 100,
      matchNotes: 'Local Gem • PriceBite Direct Cart • ₹0 Platform Fee',
      platformResults: [],
      cheapestPlatformId: 'pricebite', fastestPlatformId: 'pricebite',
      bestValuePlatformId: 'pricebite', bestRewardsPlatformId: 'pricebite',
      smartPickPlatformId: 'pricebite',
    };
    const platform: PlatformResult = {
      platformId: 'pricebite', platformName: 'PriceBite Local Direct', platformLogo: '🏪',
      rating: 4.8, ratingCount: 50, deliveryTimeMinutes: rest.delivery_minutes,
      inStock: true, orderUrl: '#local', isDirectAppOrder: true,
      priceBreakdown: {
        basePrice: dish.price, discount: 0, couponDiscount: 0, bankDiscount: 0,
        deliveryFee: 0, platformFee: 0, packagingFee: 0, taxes: 0,
        finalPayablePrice: dish.price,
        cashback: Math.round(dish.price * 0.05),
        effectiveCost: Math.round(dish.price * 0.95),
      },
    };
    onAddToCart(product, platform);
    showToast(`Added "${dish.name}" from ${rest.name} to Cart!`, 'success');
  };

  // ─── Owner form handlers ──────────────────────────────────────────────────
  const handleDishChange = (idx: number, key: string, val: string | boolean) => {
    setDishes((prev) => prev.map((d, i) => i === idx ? { ...d, [key]: val } : d));
  };
  const addDishRow = () => setDishes((prev) => [...prev, emptyDish()]);
  const removeDishRow = (idx: number) => setDishes((prev) => prev.filter((_, i) => i !== idx));

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await submitLocalRestaurant({
      ...ownerForm,
      delivery_minutes: Number(ownerForm.delivery_minutes) || 25,
      dishes: dishes.map((d) => ({
        name: d.name.trim(),
        price: parseFloat(d.price) || 100,
        is_veg: d.is_veg,
        portion: d.portion.trim() || '1 Plate',
      })).filter((d) => d.name),
    });
    setIsSubmitting(false);

    if (result.success) {
      showToast('✅ Restaurant submitted! Admin will review within 24 hours.', 'success');
      setOwnerForm({ name: '', area: currentPinDetails?.area || '', pin_code: currentPinDetails?.pinCode || '', cuisine: 'Local / Homestyle', owner_name: '', owner_phone: '', owner_email: '', is_pure_veg: false, delivery_minutes: '25' });
      setDishes([emptyDish()]);
      setView('buyer');
    } else {
      showToast(result.error || 'Submission failed. Try again.', 'error');
    }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Shared styles ────────────────────────────────────────────────────────
  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border outline-none text-xs transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-orange-500' : 'bg-white border-slate-300 text-slate-900 focus:border-orange-500'}`;
  const labelCls = 'block text-xs font-bold mb-1';

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-bold text-white ${toast.type === 'success' ? 'bg-emerald-600 border-emerald-400/50' : 'bg-rose-600 border-rose-400/50'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Header Banner ── */}
      <div className={`rounded-3xl p-6 sm:p-8 border relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/40 border-orange-500/30' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-white border-orange-200 shadow-sm'}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-extrabold uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>Local Gems Hub • Not on Swiggy / Zomato</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Neighborhood & Unfamous Local Restaurants</h1>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Order from hidden neighborhood kitchens and local stalls at ₹0 platform fee. Restaurant owners can register their shop below.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={onOpenPinModal} className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-orange-500' : 'bg-white border-slate-300 text-slate-800 hover:border-orange-500'}`}>
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>{currentPinDetails ? `📍 ${currentPinDetails.pinCode} (${currentPinDetails.area})` : 'Set PIN Code'}</span>
            </button>
            <button
              onClick={() => setView(view === 'buyer' ? 'owner' : 'buyer')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm shadow-lg transition-all hover:scale-105 ${view === 'owner' ? 'bg-slate-700 text-slate-200 shadow-slate-700/20' : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-orange-500/25'}`}
            >
              {view === 'buyer' ? <><Plus className="w-4 h-4" /><span>Register My Restaurant</span></> : <><ChevronRight className="w-4 h-4" /><span>Back to Buyer View</span></>}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          OWNER REGISTRATION FORM
         ═══════════════════════════════════════════════════════════════════════ */}
      {view === 'owner' && (
        <div className={`rounded-3xl border p-6 sm:p-8 space-y-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div>
            <h2 className="text-xl font-black flex items-center gap-2"><Store className="w-5 h-5 text-orange-400" /> Register Your Local Restaurant</h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Fill in your shop details. After submission, the PriceBite admin will review and approve within 24 hours. Once approved, your restaurant appears live for all buyers.</p>
          </div>

          {!isSupabaseConfigured && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Supabase is not yet connected — submissions will not be saved until the admin configures <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in Vercel environment settings and runs the SQL migration.</span>
            </div>
          )}

          <form onSubmit={handleOwnerSubmit} className="space-y-5">
            {/* Restaurant basics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Restaurant / Stall Name *</label>
                <input required value={ownerForm.name} onChange={(e) => setOwnerForm({ ...ownerForm, name: e.target.value })} placeholder="e.g., Raju Da Idli Corner" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Cuisine Type *</label>
                <input required value={ownerForm.cuisine} onChange={(e) => setOwnerForm({ ...ownerForm, cuisine: e.target.value })} placeholder="e.g., South Indian, Rolls, Bengali" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Area / Locality *</label>
                <input required value={ownerForm.area} onChange={(e) => setOwnerForm({ ...ownerForm, area: e.target.value })} placeholder="e.g., Salt Lake, Sector V" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>6-digit PIN Code *</label>
                <input required maxLength={6} value={ownerForm.pin_code} onChange={(e) => setOwnerForm({ ...ownerForm, pin_code: e.target.value.replace(/\D/g, '') })} placeholder="700091" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Approx. Delivery Time (minutes)</label>
                <input type="number" min={5} max={120} value={ownerForm.delivery_minutes} onChange={(e) => setOwnerForm({ ...ownerForm, delivery_minutes: e.target.value })} className={inputCls} />
              </div>
              <div className="flex items-center space-x-3 pt-5">
                <input type="checkbox" id="pure_veg" checked={ownerForm.is_pure_veg} onChange={(e) => setOwnerForm({ ...ownerForm, is_pure_veg: e.target.checked })} className="accent-emerald-500 w-4 h-4" />
                <label htmlFor="pure_veg" className="text-xs font-bold cursor-pointer">Pure Veg Restaurant 🟢</label>
              </div>
            </div>

            {/* Owner contact */}
            <div className={`p-4 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <p className="text-xs font-black text-orange-400 uppercase tracking-wider">Your Contact Details (not shown to buyers)</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Your Name *</label>
                  <input required value={ownerForm.owner_name} onChange={(e) => setOwnerForm({ ...ownerForm, owner_name: e.target.value })} placeholder="Owner's full name" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone Number *</label>
                  <input required type="tel" maxLength={10} value={ownerForm.owner_phone} onChange={(e) => setOwnerForm({ ...ownerForm, owner_phone: e.target.value.replace(/\D/g, '') })} placeholder="10-digit mobile" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email (optional)</label>
                  <input type="email" value={ownerForm.owner_email} onChange={(e) => setOwnerForm({ ...ownerForm, owner_email: e.target.value })} placeholder="owner@email.com" className={inputCls} />
                </div>
              </div>
            </div>

            {/* Dishes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wider text-orange-400">Your Menu Dishes *</p>
                <button type="button" onClick={addDishRow} className="flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Dish
                </button>
              </div>
              {dishes.map((dish, idx) => (
                <div key={idx} className={`grid grid-cols-12 gap-2 items-center p-3 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="col-span-5">
                    <input required={idx === 0} value={dish.name} onChange={(e) => handleDishChange(idx, 'name', e.target.value)} placeholder="Dish name (e.g., Masala Dosa)" className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <input type="number" min={5} required={idx === 0} value={dish.price} onChange={(e) => handleDishChange(idx, 'price', e.target.value)} placeholder="₹" className={inputCls} />
                  </div>
                  <div className="col-span-3">
                    <input value={dish.portion} onChange={(e) => handleDishChange(idx, 'portion', e.target.value)} placeholder="Portion (e.g., 1 Plate)" className={inputCls} />
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <button type="button" onClick={() => handleDishChange(idx, 'is_veg', !dish.is_veg)} title={dish.is_veg ? 'Veg — click to toggle Non-Veg' : 'Non-Veg — click to toggle Veg'} className="text-lg leading-none">
                      {dish.is_veg ? '🟢' : '🔴'}
                    </button>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    {dishes.length > 1 && (
                      <button type="button" onClick={() => removeDishRow(idx)} className="text-rose-400 hover:text-rose-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>🟢 = Veg &nbsp;|&nbsp; 🔴 = Non-Veg — click the circle to toggle</p>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-orange-500/20 hover:scale-[1.01] transition-transform disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : '🚀 Submit for Admin Approval'}
            </button>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          BUYER VIEW
         ═══════════════════════════════════════════════════════════════════════ */}
      {view === 'buyer' && (
        <>
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search restaurant, dish, area, or PIN code..." className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm outline-none transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100 focus:border-orange-500' : 'bg-white border-slate-300 text-slate-900 focus:border-orange-500'}`} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setVegOnly((v) => !v)} className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${vegOnly ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700' : 'bg-white border-slate-300 text-slate-700'}`}>
                🟢 Pure Veg Only
              </button>
              {currentPinDetails && (
                <button onClick={() => setPinFilterOnly((p) => !p)} className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${pinFilterOnly ? 'bg-orange-500/20 border-orange-500 text-orange-400' : isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700' : 'bg-white border-slate-300 text-slate-700'}`}>
                  📍 Only PIN {currentPinDetails.pinCode}
                </button>
              )}
            </div>
          </div>

          {/* Loading / Error / Cards */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className={`rounded-3xl p-10 text-center border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Flame className="w-10 h-10 text-orange-400 mx-auto mb-3" />
              <h3 className="text-lg font-black mb-1">No local restaurants found here yet</h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Know a great local spot? Ask the shop owner to register on PriceBite for free!
              </p>
              <button onClick={() => setView('owner')} className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-orange-500 text-slate-950 font-black text-xs">
                <Plus className="w-4 h-4" /> <span>Register a Restaurant</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((rest) => (
                <div key={rest.id} className={`rounded-3xl border overflow-hidden flex flex-col transition-all hover:border-orange-500/50 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  {/* Card image */}
                  <div className="relative h-40 overflow-hidden">
                    <img src={rest.image_url} alt={rest.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-orange-500 text-slate-950 text-[10px] font-black uppercase">Local Direct</span>
                      {rest.is_pure_veg && <span className="px-2 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-black">PURE VEG</span>}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-black text-base leading-tight truncate">{rest.name}</h3>
                      <div className="flex items-center justify-between text-xs text-slate-300 mt-1">
                        <span className="truncate">📍 {rest.area} ({rest.pin_code})</span>
                        <span className="flex items-center space-x-1 font-bold text-amber-400 flex-shrink-0 ml-2">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>4.8</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info row */}
                  <div className={`px-4 py-2.5 flex items-center justify-between text-xs border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <span className={`flex items-center gap-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <Utensils className="w-3.5 h-3.5 text-orange-400" />{rest.cuisine}
                    </span>
                    <span className={`flex items-center gap-1 font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      <Clock className="w-3.5 h-3.5" />{rest.delivery_minutes} mins
                    </span>
                  </div>

                  {/* Dishes */}
                  <div className="p-4 space-y-2 flex-1">
                    {(rest.dishes || []).filter((d) => d.is_available).map((dish) => (
                      <div key={dish.id} className={`flex items-center justify-between gap-2 p-2.5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-sm border flex-shrink-0 ${dish.is_veg ? 'border-emerald-500 bg-emerald-500/30' : 'border-rose-500 bg-rose-500/30'}`} />
                            <p className="text-xs font-bold truncate">{dish.name}</p>
                          </div>
                          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {dish.portion} • <span className="font-black text-orange-400">₹{dish.price}</span>
                          </p>
                        </div>
                        <button onClick={() => handleAddDish(rest, dish)} className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs flex-shrink-0 transition-transform active:scale-95">
                          <ShoppingCart className="w-3.5 h-3.5" /><span>Add</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className={`px-4 py-2.5 text-[11px] font-semibold flex items-center justify-between border-t ${isDark ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-400" />₹0 Platform Fee • 5% Cashback</span>
                    <span className="text-emerald-400 font-bold">Direct Cart</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
