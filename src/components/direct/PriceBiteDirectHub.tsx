import React, { useState } from 'react';
import {
  ShoppingBag,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Tag,
  Smartphone,
  ArrowRight,
  CreditCard,
  Sparkles,
  Store,
  ShoppingCart,
  Star,
  UtensilsCrossed,
  Percent,
  X,
  ChevronRight,
  Flame,
  Gift,
  Copy,
  Check,
} from 'lucide-react';
import { PINCodeDetails, LanguageCode, ThemeMode, UserProfile } from '../../types';
import { getTranslation } from '../../i18n';
import { createDirectOrderInCloud, syncUserProfileToCloud } from '../../lib/supabase';
import {
  DIRECT_PROMO_COUPONS,
  DIRECT_PARTNER_RESTAURANTS,
  DirectCouponOffer,
  DirectPartnerRestaurant,
  DirectMenuItem,
} from '../../mock/directRestaurantData';

interface PriceBiteDirectHubProps {
  currentPinDetails: PINCodeDetails | null;
  currentLang: LanguageCode;
  onOpenPinModal: () => void;
  themeMode?: ThemeMode;
  userProfile?: UserProfile;
}

export const PriceBiteDirectHub: React.FC<PriceBiteDirectHubProps> = ({
  currentPinDetails,
  currentLang,
  onOpenPinModal,
  themeMode = 'light',
  userProfile,
}) => {
  // Navigation View: 'restaurants' (Swiggy/Zomato style) vs 'dishes' (curated list)
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>('restaurants');

  // Selected Restaurant for Full Menu Modal
  const [selectedRestaurant, setSelectedRestaurant] = useState<DirectPartnerRestaurant | null>(null);
  const [menuFilterCategory, setMenuFilterCategory] = useState<string>('All');
  const [menuVegOnly, setMenuVegOnly] = useState<boolean>(false);

  // Selected Dish for In-App Checkout
  const [checkoutItem, setCheckoutItem] = useState<{
    id: string;
    name: string;
    restaurant: string;
    price: number;
    originalPrice: number;
    imageUrl: string;
    deliveryMinutes: number;
    portionSize?: string;
  } | null>(null);

  // Cart & Checkout state
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [appliedCoupon, setAppliedCoupon] = useState<DirectCouponOffer | null>(DIRECT_PROMO_COUPONS[0]); // Default PBDIRECT200 applied
  const [couponInput, setCouponInput] = useState<string>('');
  const [couponToast, setCouponToast] = useState<string | null>(null);
  const [isOrderPlaced, setIsOrderPlaced] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  // Category filter for dishes/restaurants
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');

  const isDark = themeMode === 'dark';

  const locText = currentPinDetails
    ? `${currentPinDetails.area}, ${currentPinDetails.district} (${currentPinDetails.pinCode})`
    : 'Select Delivery Location';

  // Apply a promotional coupon
  const handleApplyCoupon = (coupon: DirectCouponOffer) => {
    setAppliedCoupon(coupon);
    setCouponToast(`🎉 Coupon "${coupon.code}" applied! You save ₹${coupon.discountAmount} on this order.`);
    setTimeout(() => setCouponToast(null), 4000);
  };

  const handleManualApplyCoupon = () => {
    const clean = couponInput.trim().toUpperCase();
    const found = DIRECT_PROMO_COUPONS.find((c) => c.code === clean);
    if (found) {
      handleApplyCoupon(found);
      setCouponInput('');
    } else {
      setCouponToast(`❌ Invalid coupon code "${clean}". Try PBDIRECT200 or DIRECT50.`);
      setTimeout(() => setCouponToast(null), 3500);
    }
  };

  // Calculate discount for checkout
  const rawSubtotal = checkoutItem ? checkoutItem.price * quantity : 0;
  let couponDiscount = 0;
  if (appliedCoupon && checkoutItem) {
    if (rawSubtotal >= appliedCoupon.minOrder) {
      if (appliedCoupon.type === 'percent' && appliedCoupon.discountPercent) {
        couponDiscount = Math.min(appliedCoupon.discountAmount, Math.round((rawSubtotal * appliedCoupon.discountPercent) / 100));
      } else {
        couponDiscount = appliedCoupon.discountAmount;
      }
    } else {
      // Partial discount if subtotal is lower than minOrder
      couponDiscount = Math.min(rawSubtotal > 200 ? 50 : 25, appliedCoupon.discountAmount);
    }
  }

  const deliveryFee = appliedCoupon?.type === 'free_delivery' || rawSubtotal > 299 ? 0 : 25;
  const finalPayable = Math.max(49, rawSubtotal - couponDiscount + deliveryFee);

  // Handle Order Placement
  const handlePlaceOrder = () => {
    if (checkoutItem) {
      const activeUserId = userProfile?.email || 'user-1';
      const newOrderId = `#PB-FOOD-${(Math.random() * 90000 + 10000).toFixed(0)}`;

      syncUserProfileToCloud({
        id: activeUserId,
        name: userProfile?.name || 'PriceBite Customer',
        email: activeUserId,
        phone: userProfile?.phone || '',
        currentPinCode: currentPinDetails?.pinCode || '',
      });

      createDirectOrderInCloud({
        orderId: newOrderId,
        userId: activeUserId,
        items: [
          {
            id: checkoutItem.id,
            name: checkoutItem.name,
            restaurant: checkoutItem.restaurant,
            quantity,
            price: checkoutItem.price,
          },
        ],
        totalAmount: finalPayable,
        deliveryPinCode: currentPinDetails?.pinCode || '700156',
        deliveryAddress: locText,
        paymentMethod:
          paymentMethod === 'upi' ? 'UPI Direct Pay' : paymentMethod === 'card' ? 'Debit/Credit Card' : 'Cash on Delivery',
      });
    }

    setIsOrderPlaced(true);
    setActiveStep(1);

    setTimeout(() => setActiveStep(2), 2000);
    setTimeout(() => setActiveStep(3), 4500);
    setTimeout(() => setActiveStep(4), 7000);
  };

  // Filter restaurants by cuisine
  const filteredRestaurants = DIRECT_PARTNER_RESTAURANTS.filter((rest) => {
    if (selectedCuisine === 'All') return true;
    if (selectedCuisine === 'Pure Veg') return rest.isPureVeg;
    return rest.cuisines.some((c) => c.toLowerCase().includes(selectedCuisine.toLowerCase()));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* 🌟 HERO BANNER */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-slate-950/30 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white border border-white/20">
            <UtensilsCrossed className="w-4 h-4 text-amber-300" />
            <span>{getTranslation('directOfficialStore', currentLang)}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            {getTranslation('directHeroTitle', currentLang)}
          </h1>

          <p className="text-sm sm:text-base font-bold text-amber-100">
            {getTranslation('directHeroSubtitle', currentLang)}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenPinModal}
              className="bg-slate-950 text-amber-400 hover:bg-slate-900 px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-2 shadow-lg transition-all border border-slate-800 hover:scale-105"
            >
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>Delivering To: {locText}</span>
            </button>

            <span className="text-xs font-black text-white bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              ⏱️ 15-25 Mins Express Kitchen Delivery
            </span>

            <span className="text-xs font-black text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/40">
              ⚡ 0% Extra Markups &amp; No Surge Fee
            </span>
          </div>
        </div>
      </div>

      {/* 🌟 SWIGGY / ZOMATO / MAGICPIN TOP PROMO OFFERS & COUPONS STRIP */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className={`text-lg font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Direct Partner Coupons &amp; Mega Offers
            </h2>
          </div>
          <span className="text-xs font-bold text-orange-500">
            {appliedCoupon ? `Applied: ${appliedCoupon.code}` : 'Click any coupon to apply'}
          </span>
        </div>

        {/* Horizontal scrolling offer cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {DIRECT_PROMO_COUPONS.map((coupon) => {
            const isApplied = appliedCoupon?.code === coupon.code;
            return (
              <div
                key={coupon.code}
                onClick={() => handleApplyCoupon(coupon)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
                  isApplied
                    ? 'border-orange-500 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-transparent shadow-lg shadow-orange-500/10 scale-[1.02]'
                    : isDark
                    ? 'bg-slate-900/90 border-slate-800 hover:border-orange-500/50 hover:bg-slate-850'
                    : 'bg-white border-slate-200 hover:border-orange-400 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-500 px-2 py-0.5 rounded-md bg-orange-500/10">
                      {coupon.badge}
                    </span>
                    {isApplied && (
                      <span className="flex items-center space-x-0.5 text-[10px] font-black text-emerald-500">
                        <Check className="w-3 h-3" />
                        <span>APPLIED</span>
                      </span>
                    )}
                  </div>

                  <h3 className={`text-base font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {coupon.title}
                  </h3>
                  <p className={`text-xs mt-1 leading-snug line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {coupon.discountSummary}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/30 flex items-center justify-between">
                  <span className="font-mono text-xs font-black tracking-wider text-amber-500">
                    {coupon.code}
                  </span>
                  <button
                    type="button"
                    className={`text-[11px] font-black px-2.5 py-1 rounded-lg transition-all ${
                      isApplied
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-orange-500 hover:bg-orange-600 text-slate-950'
                    }`}
                  >
                    {isApplied ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Toast alert when coupon is applied */}
        {couponToast && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in">
            <span>{couponToast}</span>
            <button onClick={() => setCouponToast(null)} className="text-emerald-400 font-bold ml-2">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 🌟 VIEW SWITCHER: RESTAURANTS & FULL MENUS VS POPULAR DISHES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-800/50">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center space-x-2 ${
              activeTab === 'restaurants'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/20 scale-105'
                : isDark
                ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Partner Restaurants &amp; Menus ({DIRECT_PARTNER_RESTAURANTS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dishes')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center space-x-2 ${
              activeTab === 'dishes'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/20 scale-105'
                : isDark
                ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Popular Direct Dishes</span>
          </button>
        </div>

        {/* Cuisine Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
          {['All', 'Mughlai', 'Pizzas', 'Chinese', 'Fried Chicken', 'Momos', 'Pure Veg'].map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                selectedCuisine === cuisine
                  ? 'bg-orange-500 text-slate-950 font-black'
                  : isDark
                  ? 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 TAB 1: SWIGGY / ZOMATO RESTAURANT DIRECTORY & MENU SELECTOR */}
      {activeTab === 'restaurants' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((rest) => (
              <div
                key={rest.id}
                className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group ${
                  isDark
                    ? 'bg-slate-900/95 border-slate-800 hover:border-orange-500/60'
                    : 'bg-white border-slate-200 hover:border-orange-400 shadow-sm'
                }`}
              >
                {/* Image Header with Offer Badge */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={rest.imageUrl}
                    alt={rest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md">
                      ⚡ 0% Extra Fee Partner
                    </span>
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-950/90 text-amber-400 font-black text-xs backdrop-blur-md border border-amber-500/30">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{rest.rating} ({rest.ratingCount})</span>
                    </div>
                  </div>

                  {/* Bottom Image Overlay: Swiggy/Zomato style Deal Banner */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                    <span className="flex items-center space-x-1 bg-orange-600/90 px-2.5 py-1 rounded-xl backdrop-blur-sm shadow-md">
                      <Percent className="w-3.5 h-3.5" />
                      <span className="font-black">{rest.heroOffer}</span>
                    </span>
                    <span className="bg-slate-950/80 px-2 py-0.5 rounded-lg text-[11px] text-slate-300">
                      ⏱️ {rest.deliveryMinutes} mins
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`text-lg font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {rest.name}
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {rest.branchName}
                        </p>
                      </div>
                      {rest.isPureVeg && (
                        <span className="text-[10px] font-black text-emerald-500 border border-emerald-500/40 px-2 py-0.5 rounded-full flex-shrink-0">
                          🌱 PURE VEG
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {rest.cuisines.map((c, i) => (
                        <span
                          key={i}
                          className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold ${
                            isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c}
                        </span>
                      ))}
                    </div>

                    {/* Featured Dish */}
                    <div className={`mt-3 p-2.5 rounded-xl border text-xs ${
                      isDark ? 'bg-slate-950/70 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <span className="text-[10px] uppercase font-bold text-orange-500 block">⭐ Must Try Signature</span>
                      <span className="font-extrabold">{rest.featuredDish}</span>
                    </div>
                  </div>

                  {/* Action Button: View Full Menu */}
                  <button
                    onClick={() => {
                      setSelectedRestaurant(rest);
                      setMenuFilterCategory('All');
                      setMenuVegOnly(false);
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98"
                  >
                    <span>📋 View Full Menu &amp; Offers ({rest.menu.length} Dishes)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🌟 TAB 2: POPULAR DIRECT EXPRESS DISHES */}
      {activeTab === 'dishes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DIRECT_PARTNER_RESTAURANTS.flatMap((r) => r.menu).map((item) => (
            <div
              key={item.id}
              className={`${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              } border rounded-3xl overflow-hidden shadow-xl hover:border-orange-500/60 transition-all flex flex-col justify-between group`}
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-slate-950">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow-md">
                    ⚡ Direct Order
                  </div>
                  <div className={`absolute top-3 right-3 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shadow-md ${
                    item.isVeg ? 'bg-emerald-950 text-emerald-400 border-emerald-500' : 'bg-red-950 text-red-400 border-red-500'
                  }`}>
                    {item.isVeg ? '🟢 VEG' : '🔴 NON-VEG'}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className={`font-extrabold text-base line-clamp-1 leading-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {item.name}
                  </h3>
                  <p className={`text-xs line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {item.description}
                  </p>
                  <div className="flex items-center space-x-1 text-xs font-bold text-amber-500 pt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.rating} Rating</span>
                    {item.offerTag && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md ml-auto">
                        {item.offerTag}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={`p-5 pt-0 border-t mt-2 flex items-center justify-between ${
                isDark ? 'border-slate-800/80' : 'border-slate-100'
              }`}>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-black text-amber-600 dark:text-amber-400">₹{item.price}</span>
                    <span className={`text-xs line-through ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      ₹{item.originalPrice}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {item.discountPercent}% Off In-App
                  </span>
                </div>

                <button
                  onClick={() => {
                    setCheckoutItem({
                      id: item.id,
                      name: item.name,
                      restaurant: 'PriceBite Partner Kitchen',
                      price: item.price,
                      originalPrice: item.originalPrice,
                      imageUrl: item.imageUrl,
                      deliveryMinutes: 20,
                      portionSize: item.portionSize,
                    });
                    setQuantity(1);
                    setIsOrderPlaced(false);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
                >
                  Order In-App ⚡
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🌟 FULL RESTAURANT MENU MODAL (SWIGGY / ZOMATO / MAGICPIN STYLE) */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className={`${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          } border rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col`}>
            
            {/* Modal Header */}
            <div className={`sticky top-0 z-20 p-5 sm:p-6 border-b backdrop-blur-md ${
              isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-orange-500 text-slate-950">
                      ⚡ Official Direct Menu
                    </span>
                    <span className="text-xs text-amber-500 font-black flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{selectedRestaurant.rating}</span>
                    </span>
                  </div>
                  <h2 className={`text-2xl sm:text-3xl font-black mt-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {selectedRestaurant.name}
                  </h2>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {selectedRestaurant.branchName} • {selectedRestaurant.cuisines.join(', ')} • ⏱️ {selectedRestaurant.deliveryMinutes} mins
                  </p>
                </div>

                <button
                  onClick={() => setSelectedRestaurant(null)}
                  className={`p-2 rounded-xl text-xs font-bold transition-all ${
                    isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Restaurant Offer Badges strip */}
              <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pt-3 pb-1">
                {selectedRestaurant.restaurantCoupons.map((couponTag, idx) => (
                  <span
                    key={idx}
                    className="flex-shrink-0 text-xs font-extrabold px-3 py-1 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-500 flex items-center space-x-1"
                  >
                    <Percent className="w-3 h-3" />
                    <span>{couponTag}</span>
                  </span>
                ))}
              </div>

              {/* Menu Category Filter Pills inside Modal */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t mt-3 border-slate-800/40">
                <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
                  {['All', 'Starters', 'Main Course', 'Breads & Rice', 'Desserts & Beverages'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setMenuFilterCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex-shrink-0 ${
                        menuFilterCategory === cat
                          ? 'bg-orange-500 text-slate-950 shadow-md'
                          : isDark
                          ? 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Pure Veg Toggle */}
                <button
                  onClick={() => setMenuVegOnly(!menuVegOnly)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all flex-shrink-0 border ${
                    menuVegOnly
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                      : isDark
                      ? 'border-slate-800 text-slate-400'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <span>🟢 Veg Only</span>
                </button>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="p-5 sm:p-6 space-y-4">
              {selectedRestaurant.menu
                .filter((item) => {
                  if (menuVegOnly && !item.isVeg) return false;
                  if (menuFilterCategory === 'All') return true;
                  return item.category === menuFilterCategory;
                })
                .map((dish) => (
                  <div
                    key={dish.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-orange-500/50 ${
                      isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0">
                        <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                        <span className={`absolute bottom-1 left-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                          dish.isVeg ? 'bg-emerald-950 text-emerald-400 border border-emerald-500' : 'bg-red-950 text-red-400 border border-red-500'
                        }`}>
                          {dish.isVeg ? '🟢 VEG' : '🔴 NON-VEG'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-base font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            {dish.name}
                          </h4>
                          {dish.offerTag && (
                            <span className="text-[10px] font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md">
                              {dish.offerTag}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {dish.description}
                        </p>
                        <span className={`text-[11px] font-bold block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {dish.portionSize}
                        </span>
                      </div>
                    </div>

                    {/* Price and Add button */}
                    <div className="flex items-center justify-between sm:justify-end space-x-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/40">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-black text-amber-500">₹{dish.price}</span>
                          <span className={`text-xs line-through ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            ₹{dish.originalPrice}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-500 font-bold block">
                          Save ₹{dish.originalPrice - dish.price} ({dish.discountPercent}% OFF)
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setCheckoutItem({
                            id: dish.id,
                            name: dish.name,
                            restaurant: selectedRestaurant.name,
                            price: dish.price,
                            originalPrice: dish.originalPrice,
                            imageUrl: dish.imageUrl,
                            deliveryMinutes: selectedRestaurant.deliveryMinutes,
                            portionSize: dish.portionSize,
                          });
                          setQuantity(1);
                          setIsOrderPlaced(false);
                        }}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                      >
                        + ADD TO ORDER
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 🌟 DIRECT FOOD CHECKOUT MODAL & LIVE TRACKER */}
      {checkoutItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className={`${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          } border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6 max-h-[92vh] overflow-y-auto`}>
            {!isOrderPlaced ? (
              <div className="space-y-6">
                <div className={`flex items-center justify-between border-b pb-4 ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xl border border-orange-500/30">
                      ⚡
                    </div>
                    <div>
                      <h3 className={`text-lg font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        PriceBite Direct Checkout
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Direct Kitchen Order (0% Extra Commissions)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCheckoutItem(null)}
                    className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      isDark ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                    }`}
                  >
                    Close ✕
                  </button>
                </div>

                {/* Item Details */}
                <div className={`flex items-center space-x-4 p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <img src={checkoutItem.imageUrl} alt={checkoutItem.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 truncate">
                    <h4 className={`font-extrabold text-sm truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {checkoutItem.name}
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {checkoutItem.restaurant}
                    </p>
                    <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                      ₹{checkoutItem.price} / item
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                  }`}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-orange-500 font-black text-base px-1"
                    >
                      -
                    </button>
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-orange-500 font-black text-base px-1"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Delivery Address & PIN Code */}
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Delivery Destination
                    </span>
                    <button onClick={onOpenPinModal} className="text-xs text-orange-500 font-bold hover:underline">
                      Change PIN ✏️
                    </button>
                  </div>
                  <div className={`flex items-center space-x-2 text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span className="truncate">{locText}</span>
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                    ⏱️ Express Kitchen Delivery in {checkoutItem.deliveryMinutes} minutes
                  </span>
                </div>

                {/* Applied Coupon / Promo Section */}
                <div className={`p-4 rounded-2xl border space-y-2.5 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase flex items-center space-x-1 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      <Tag className="w-3.5 h-3.5 text-orange-500" />
                      <span>Applied Promo Code</span>
                    </span>
                    {appliedCoupon && (
                      <button
                        onClick={() => setAppliedCoupon(null)}
                        className="text-[10px] font-bold text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-500/15 border border-orange-500/40">
                      <div>
                        <span className="text-xs font-black text-orange-500 font-mono block">
                          🏷️ {appliedCoupon.code}
                        </span>
                        <span className="text-[11px] text-slate-300">
                          {appliedCoupon.title} ({appliedCoupon.discountSummary})
                        </span>
                      </div>
                      <span className="text-xs font-black text-emerald-400">
                        -₹{couponDiscount}
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Enter coupon (e.g. PBDIRECT200)"
                        className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-mono border ${
                          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300'
                        }`}
                      />
                      <button
                        onClick={handleManualApplyCoupon}
                        className="px-4 py-1.5 rounded-xl bg-orange-500 text-slate-950 font-black text-xs"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <label className={`block text-xs font-extrabold uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'upi', label: 'UPI (GPay / PhonePe)', logo: '📲' },
                      { id: 'card', label: 'Credit / Debit Card', logo: '💳' },
                      { id: 'cod', label: 'Cash on Delivery', logo: '💵' },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                          paymentMethod === pm.id
                            ? 'bg-orange-500/20 border-orange-500 text-orange-600 dark:text-orange-300 font-bold'
                            : isDark
                            ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xl">{pm.logo}</span>
                        <span className="text-[11px] leading-tight">{pm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Itemized Bill Breakdown */}
                <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div className="flex justify-between">
                    <span>Item Total ({quantity}x):</span>
                    <span>₹{rawSubtotal}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-500 font-bold">
                      <span>Coupon Discount ({appliedCoupon?.code}):</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Partner Fee:</span>
                    <span className={deliveryFee === 0 ? 'text-emerald-500 font-bold' : ''}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-amber-500 font-bold">
                    <span>PriceBite Wallet Cashback:</span>
                    <span>+₹15</span>
                  </div>
                  <div className={`flex justify-between border-t pt-2 text-base font-black ${
                    isDark ? 'border-slate-800 text-slate-100' : 'border-slate-200 text-slate-900'
                  }`}>
                    <span>Final Payable Amount:</span>
                    <span className="text-amber-500">₹{finalPayable}</span>
                  </div>
                </div>

                {/* Confirm Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-slate-950 font-black py-4 rounded-2xl text-base shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center space-x-2 active:scale-98"
                >
                  <Zap className="w-5 h-5 fill-slate-950" />
                  <span>Place Direct Order (₹{finalPayable})</span>
                </button>
              </div>
            ) : (
              /* Live Order Tracker */
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full mx-auto flex items-center justify-center text-3xl border border-emerald-500/40 shadow-lg shadow-emerald-500/20 animate-bounce">
                  ✓
                </div>

                <div>
                  <h3 className={`text-2xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    Food Order Confirmed on PriceBite Direct!
                  </h3>
                  <p className="text-xs text-amber-500 font-bold mt-1">
                    Order ID: #PB-DIRECT-{(Math.random() * 90000 + 10000).toFixed(0)} • Delivery to {locText}
                  </p>
                </div>

                <div className={`p-5 rounded-2xl border text-left space-y-4 text-xs ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`font-extrabold uppercase tracking-wider text-[11px] border-b pb-2 ${
                    isDark ? 'text-slate-200 border-slate-800' : 'text-slate-700 border-slate-200'
                  }`}>
                    🚴 Live Kitchen &amp; Rider Tracker
                  </h4>

                  {[
                    { step: 1, label: 'Order Confirmed by Partner Kitchen', desc: 'Chef preparing your fresh meal' },
                    { step: 2, label: 'Thermal Hygienic Packaging', desc: 'Sealed for temperature preservation' },
                    { step: 3, label: 'PriceBite Express Rider Assigned', desc: 'Rider on the way to kitchen' },
                    { step: 4, label: 'Out for Express Food Delivery', desc: 'Arriving at your location in 15-20 mins' },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors mt-0.5 ${
                          activeStep >= s.step
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                            : isDark
                            ? 'bg-slate-800 text-slate-500'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {activeStep >= s.step ? '✓' : s.step}
                      </div>
                      <div>
                        <span className={`font-bold block ${
                          activeStep >= s.step
                            ? isDark ? 'text-slate-100' : 'text-slate-900'
                            : 'text-slate-400'
                        }`}>
                          {s.label}
                        </span>
                        <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {s.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setCheckoutItem(null);
                    setIsOrderPlaced(false);
                  }}
                  className={`w-full font-extrabold py-3 rounded-xl text-xs transition-colors ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  }`}
                >
                  Done &amp; Back to PriceBite Direct
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
