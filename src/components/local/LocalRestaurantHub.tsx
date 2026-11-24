import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Plus,
  ShoppingCart,
  Store,
  Star,
  Clock,
  Search,
  Sparkles,
  CheckCircle2,
  X,
  Utensils,
  Trash2,
  Flame,
} from 'lucide-react';
import {
  PINCodeDetails,
  ThemeMode,
  ProductComparisonItem,
  PlatformResult,
} from '../../types';

export interface LocalDish {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
  portion: string;
}

export interface LocalRestaurant {
  id: string;
  name: string;
  area: string;
  pinCode: string;
  cuisine: string;
  rating: number;
  deliveryMinutes: number;
  imageUrl: string;
  isPureVeg: boolean;
  isUserAdded?: boolean;
  dishes: LocalDish[];
}

interface LocalRestaurantHubProps {
  currentPinDetails: PINCodeDetails | null;
  onOpenPinModal: () => void;
  onAddToCart: (product: ProductComparisonItem, platform: PlatformResult) => void;
  themeMode?: ThemeMode;
}

const STORAGE_KEY = 'pricebite_local_restaurants_v1';

const DEFAULT_LOCAL_RESTAURANTS: LocalRestaurant[] = [
  {
    id: 'local-1',
    name: 'Maa Tara Tiffin & Dosa Corner',
    area: 'New Town / Salt Lake',
    pinCode: '700156',
    cuisine: 'South Indian & Tiffin',
    rating: 4.6,
    deliveryMinutes: 20,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    isPureVeg: true,
    dishes: [
      { id: 'ld-101', name: 'Steamed Rice Idli (3 Pcs) with Sambar', price: 65, isVeg: true, portion: '3 Pcs + Chutney' },
      { id: 'ld-102', name: 'Butter Masala Dosa', price: 95, isVeg: true, portion: '1 Full Dosa' },
      { id: 'ld-103', name: 'Crispy Medu Vada (2 Pcs)', price: 55, isVeg: true, portion: '2 Pcs' },
    ],
  },
  {
    id: 'local-2',
    name: 'Dada Bhai Roll & Chowmein Stall',
    area: 'Park Circus / Ballygunge',
    pinCode: '700019',
    cuisine: 'Street Food & Rolls',
    rating: 4.7,
    deliveryMinutes: 18,
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&auto=format&fit=crop&q=80',
    isPureVeg: false,
    dishes: [
      { id: 'ld-201', name: 'Double Egg Chicken Kati Roll', price: 90, isVeg: false, portion: '1 Jumbo Roll' },
      { id: 'ld-202', name: 'Kolkata Street Chilli Chicken', price: 140, isVeg: false, portion: '6 Pcs' },
      { id: 'ld-203', name: 'Veg Hakka Chowmein', price: 85, isVeg: true, portion: 'Full Plate' },
    ],
  },
  {
    id: 'local-3',
    name: 'Annapurna Home Kitchen (Pice Hotel)',
    area: 'Medinipur Town / Keranitola',
    pinCode: '721101',
    cuisine: 'Bengali Homestyle Meals',
    rating: 4.8,
    deliveryMinutes: 25,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    isPureVeg: false,
    dishes: [
      { id: 'ld-301', name: 'Katla Macher Jhol & Steamed Rice Thali', price: 145, isVeg: false, portion: 'Full Thali' },
      { id: 'ld-302', name: 'Aloo Posto & Dal Bhat', price: 95, isVeg: true, portion: 'Full Veg Meal' },
      { id: 'ld-303', name: 'Desi Chicken Kasha (4 Pcs)', price: 165, isVeg: false, portion: '4 Pcs Bowl' },
    ],
  },
  {
    id: 'local-4',
    name: 'Shree Ganesh Pure Veg Nashta House',
    area: 'Howrah / Liluah',
    pinCode: '711101',
    cuisine: 'North Indian & Snacks',
    rating: 4.5,
    deliveryMinutes: 22,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
    isPureVeg: true,
    dishes: [
      { id: 'ld-401', name: 'Kachori Sabzi & Jalebi Combo', price: 70, isVeg: true, portion: '4 Pcs + Jalebi' },
      { id: 'ld-402', name: 'Paneer Paratha with Curd', price: 85, isVeg: true, portion: '2 Parathas' },
      { id: 'ld-403', name: 'Special Masala Chai (2 Cups)', price: 40, isVeg: true, portion: '250ml Flask' },
    ],
  },
  {
    id: 'local-5',
    name: 'Noorani Mohalla Biryani House',
    area: 'Rajarhat / Baguiati',
    pinCode: '700059',
    cuisine: 'Biryani & Mughlai',
    rating: 4.7,
    deliveryMinutes: 24,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    isPureVeg: false,
    dishes: [
      { id: 'ld-501', name: 'Kolkata Chicken Dum Biryani (Aloo + Egg)', price: 160, isVeg: false, portion: 'Full Handi' },
      { id: 'ld-502', name: 'Mutton Dum Biryani Special', price: 240, isVeg: false, portion: 'Full Handi' },
      { id: 'ld-503', name: 'Chicken Chaap', price: 130, isVeg: false, portion: '1 Leg Piece' },
    ],
  },
];

export const LocalRestaurantHub: React.FC<LocalRestaurantHubProps> = ({
  currentPinDetails,
  onOpenPinModal,
  onAddToCart,
  themeMode = 'dark',
}) => {
  const isDark = themeMode === 'dark';

  const [restaurants, setRestaurants] = useState<LocalRestaurant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_LOCAL_RESTAURANTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
    } catch {
      // ignore storage errors
    }
  }, [restaurants]);

  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [pinFilterOnly, setPinFilterOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Add Restaurant Form State
  const [newName, setNewName] = useState('');
  const [newArea, setNewArea] = useState(currentPinDetails?.area || '');
  const [newPinCode, setNewPinCode] = useState(currentPinDetails?.pinCode || '');
  const [newCuisine, setNewCuisine] = useState('Local / Homestyle');
  const [newPureVeg, setNewPureVeg] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('120');
  const [newDishPortion, setNewDishPortion] = useState('1 Full Plate');

  useEffect(() => {
    if (currentPinDetails) {
      if (!newArea) setNewArea(currentPinDetails.area);
      if (!newPinCode) setNewPinCode(currentPinDetails.pinCode);
    }
  }, [currentPinDetails]);

  const filteredRestaurants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return restaurants.filter((rest) => {
      if (vegOnly && !rest.isPureVeg) return false;
      if (pinFilterOnly && currentPinDetails && rest.pinCode !== currentPinDetails.pinCode) {
        return false;
      }
      if (!q) return true;
      const matchesRest =
        rest.name.toLowerCase().includes(q) ||
        rest.area.toLowerCase().includes(q) ||
        rest.cuisine.toLowerCase().includes(q) ||
        rest.pinCode.includes(q);
      const matchesDish = rest.dishes.some((d) => d.name.toLowerCase().includes(q));
      return matchesRest || matchesDish;
    });
  }, [restaurants, searchQuery, vegOnly, pinFilterOnly, currentPinDetails]);

  const handleAddDishToCart = (rest: LocalRestaurant, dish: LocalDish) => {
    const product: ProductComparisonItem = {
      id: `${rest.id}-${dish.id}`,
      name: dish.name,
      category: 'food',
      restaurantOrBrand: rest.name,
      quantity: dish.portion,
      imageUrl: rest.imageUrl,
      description: `${rest.cuisine} • ${rest.area} (PIN ${rest.pinCode})`,
      isVeg: dish.isVeg,
      matchType: 'EXACT',
      matchScore: 100,
      matchNotes: 'Local Unfamous Gem • PriceBite Direct Cart',
      platformResults: [],
      cheapestPlatformId: 'pricebite',
      fastestPlatformId: 'pricebite',
      bestValuePlatformId: 'pricebite',
      bestRewardsPlatformId: 'pricebite',
      smartPickPlatformId: 'pricebite',
    };

    const platform: PlatformResult = {
      platformId: 'pricebite',
      platformName: 'PriceBite Local Direct',
      platformLogo: '🏪',
      rating: rest.rating,
      ratingCount: 120,
      deliveryTimeMinutes: rest.deliveryMinutes,
      inStock: true,
      orderUrl: '#local-direct',
      isDirectAppOrder: true,
      priceBreakdown: {
        basePrice: dish.price,
        discount: 0,
        couponDiscount: 0,
        bankDiscount: 0,
        deliveryFee: 0,
        platformFee: 0,
        packagingFee: 0,
        taxes: 0,
        finalPayablePrice: dish.price,
        cashback: Math.round(dish.price * 0.05),
        effectiveCost: Math.round(dish.price * 0.95),
      },
    };

    onAddToCart(product, platform);
    setAddedToast(`Added "${dish.name}" from ${rest.name} to Cart!`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleCreateRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newName.trim();
    const cleanDish = newDishName.trim();
    const priceNum = Math.max(10, Number(newDishPrice) || 100);
    if (!cleanName || !cleanDish) return;

    const newRest: LocalRestaurant = {
      id: `local-custom-${Date.now()}`,
      name: cleanName,
      area: newArea.trim() || currentPinDetails?.area || 'Local Neighborhood',
      pinCode: newPinCode.trim() || currentPinDetails?.pinCode || '700001',
      cuisine: newCuisine.trim() || 'Local Specialty',
      rating: 4.8,
      deliveryMinutes: 20,
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      isPureVeg: newPureVeg,
      isUserAdded: true,
      dishes: [
        {
          id: `ld-custom-${Date.now()}`,
          name: cleanDish,
          price: priceNum,
          isVeg: newPureVeg,
          portion: newDishPortion.trim() || '1 Portion',
        },
      ],
    };

    setRestaurants((prev) => [newRest, ...prev]);
    setNewName('');
    setNewDishName('');
    setNewDishPrice('120');
    setIsAddModalOpen(false);
    setAddedToast(`Added "${cleanName}" to Local Gems Hub!`);
    setTimeout(() => setAddedToast(null), 3500);
  };

  const handleDeleteCustomRestaurant = (id: string) => {
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400/50 text-sm font-bold">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/40 border-orange-500/30'
            : 'bg-gradient-to-br from-orange-50 via-amber-50 to-white border-orange-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-extrabold uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>Local Gems Hub • Not on Swiggy / Zomato</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Neighborhood &amp; Unfamous Local Restaurants
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Discover hidden neighborhood kitchens, tiffin stalls, and local eateries that aren&apos;t listed on big delivery apps. Add dishes straight to your PriceBite Cart with ₹0 platform fee!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenPinModal}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-orange-500'
                  : 'bg-white border-slate-300 text-slate-800 hover:border-orange-500'
              }`}
            >
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>
                {currentPinDetails
                  ? `PIN: ${currentPinDetails.pinCode} (${currentPinDetails.area})`
                  : 'Set Your PIN Code'}
              </span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Local Restaurant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search local restaurant, dish (idli, roll, thali), area, or PIN..."
            className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm outline-none transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-100 focus:border-orange-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-orange-500'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setVegOnly((v) => !v)}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
              vegOnly
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
            }`}
          >
            🟢 Pure Veg Only
          </button>

          {currentPinDetails && (
            <button
              onClick={() => setPinFilterOnly((p) => !p)}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                pinFilterOnly
                  ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                  : isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
              }`}
            >
              📍 Only PIN {currentPinDetails.pinCode}
            </button>
          )}
        </div>
      </div>

      {/* Restaurant Cards Grid */}
      {filteredRestaurants.length === 0 ? (
        <div
          className={`rounded-3xl p-10 text-center border ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <Flame className="w-10 h-10 text-orange-400 mx-auto mb-3" />
          <h3 className="text-lg font-black mb-1">No local restaurants matched</h3>
          <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Know a great unfamous local spot in your area? Add it yourself in 10 seconds!
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-orange-500 text-slate-950 font-black text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Local Restaurant Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((rest) => (
            <div
              key={rest.id}
              className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all hover:border-orange-500/50 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div>
                <div className="relative h-40 overflow-hidden">
                  <img src={rest.imageUrl} alt={rest.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-orange-500 text-slate-950 text-[10px] font-black uppercase">
                      Local Direct
                    </span>
                    {rest.isPureVeg && (
                      <span className="px-2 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-black">
                        PURE VEG
                      </span>
                    )}
                    {rest.isUserAdded && (
                      <span className="px-2 py-1 rounded-full bg-cyan-500/90 text-slate-950 text-[10px] font-black">
                        USER ADDED
                      </span>
                    )}
                  </div>
                  {rest.isUserAdded && (
                    <button
                      onClick={() => handleDeleteCustomRestaurant(rest.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-950/70 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                      title="Remove custom restaurant"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-black text-base leading-tight truncate">{rest.name}</h3>
                    <div className="flex items-center justify-between text-xs text-slate-300 mt-1">
                      <span className="truncate">
                        📍 {rest.area} ({rest.pinCode})
                      </span>
                      <span className="flex items-center space-x-1 font-bold text-amber-400 flex-shrink-0 ml-2">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rest.rating}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <Utensils className="w-3.5 h-3.5 text-orange-400" />
                      {rest.cuisine}
                    </span>
                    <span className={`font-bold flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      <Clock className="w-3.5 h-3.5" />
                      {rest.deliveryMinutes} mins
                    </span>
                  </div>

                  {/* Dishes List */}
                  <div className="space-y-2 pt-1">
                    {rest.dishes.map((dish) => (
                      <div
                        key={dish.id}
                        className={`flex items-center justify-between gap-2 p-2.5 rounded-2xl border ${
                          isDark
                            ? 'bg-slate-950/60 border-slate-800/80'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2.5 h-2.5 rounded-sm border flex-shrink-0 ${
                                dish.isVeg ? 'border-emerald-500 bg-emerald-500/30' : 'border-rose-500 bg-rose-500/30'
                              }`}
                            />
                            <p className="text-xs font-bold truncate">{dish.name}</p>
                          </div>
                          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {dish.portion} • <span className="font-black text-orange-400">₹{dish.price}</span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleAddDishToCart(rest, dish)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs flex-shrink-0 transition-transform active:scale-95"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className={`px-4 py-2.5 text-[11px] font-semibold flex items-center justify-between border-t ${
                  isDark ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  ₹0 Platform Fee • 5% Cashback
                </span>
                <span className="text-emerald-400 font-bold">Direct Cart</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Local Restaurant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black flex items-center gap-2">
                <Store className="w-5 h-5 text-orange-400" />
                <span>Add Local / Unfamous Restaurant</span>
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Restaurant / Stall Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Raju Da Idli Corner"
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Area / Locality</label>
                  <input
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder="e.g., Salt Lake"
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newPinCode}
                    onChange={(e) => setNewPinCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="700091"
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Cuisine Type</label>
                <input
                  type="text"
                  value={newCuisine}
                  onChange={(e) => setNewCuisine(e.target.value)}
                  placeholder="e.g., South Indian, Rolls, Bengali"
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-bold mb-1">Signature Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    placeholder="e.g., Special Masala Dosa"
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    min={10}
                    required
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Portion Size</label>
                <input
                  type="text"
                  value={newDishPortion}
                  onChange={(e) => setNewDishPortion(e.target.value)}
                  placeholder="e.g., 1 Full Plate / 2 Pcs"
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <label className="flex items-center space-x-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newPureVeg}
                  onChange={(e) => setNewPureVeg(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span className="font-bold">Pure Veg Restaurant</span>
              </label>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-orange-500/20 hover:scale-[1.01] transition-transform"
              >
                Save &amp; Add to Local Gems Hub
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
