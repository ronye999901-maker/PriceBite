import React, { useState } from 'react';
import { ShoppingBag, Zap, ShieldCheck, CheckCircle2, Clock, MapPin, Tag, Smartphone, ArrowRight, CreditCard, Sparkles, Store, ShoppingCart, Star, UtensilsCrossed } from 'lucide-react';
import { PINCodeDetails, LanguageCode, ThemeMode } from '../../types';
import { getTranslation } from '../../i18n';
import { createDirectOrderInCloud, syncUserProfileToCloud } from '../../lib/supabase';

interface DirectFoodItem {
  id: string;
  name: string;
  restaurant: string;
  category: 'biryani' | 'pizza' | 'chinese' | 'chicken' | 'kebabs' | 'thali' | 'dessert';
  price: number;
  originalPrice: number;
  discountPercent: number;
  imageUrl: string;
  description: string;
  deliveryMinutes: number;
  rating: number;
  portionSize: string;
  isVeg: boolean;
}

import { UserProfile } from '../../types';

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
  const [selectedItem, setSelectedItem] = useState<DirectFoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [activeFoodCategory, setActiveFoodCategory] = useState<'all' | 'biryani' | 'pizza' | 'chinese' | 'chicken' | 'kebabs' | 'thali' | 'dessert'>('all');

  const isDark = themeMode === 'dark';

  const locText = currentPinDetails
    ? `${currentPinDetails.area}, ${currentPinDetails.district} (${currentPinDetails.pinCode})`
    : 'Select Delivery Location';

  // 🌟 100% EXCLUSIVELY FOODING & RESTAURANT DISHES CATALOG (ZERO GROCERIES)
  const directFoodCatalog: DirectFoodItem[] = [
    {
      id: 'dfood-1',
      name: 'PriceBite Special Hyderabadi Chicken Dum Biryani',
      restaurant: 'Arsalan / Royal Biryani Kitchen',
      category: 'biryani',
      price: 199,
      originalPrice: 280,
      discountPercent: 29,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      description: 'Authentic rich dum biryani prepared with pure ghee, 2 juicy chicken pieces, egg, potato & fragrant basmati. PriceBite Direct Exclusive.',
      deliveryMinutes: 20,
      rating: 4.9,
      portionSize: '1 Box (Full Meal)',
      isVeg: false,
    },
    {
      id: 'dfood-2',
      name: 'Medium Cheese Burst Margherita Pizza',
      restaurant: "Domino's / Ovenstory Oven",
      category: 'pizza',
      price: 249,
      originalPrice: 349,
      discountPercent: 28,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
      description: 'Loaded with 100% real mozzarella cheese burst crust, fresh herbs & rich tomato reduction sauce.',
      deliveryMinutes: 22,
      rating: 4.8,
      portionSize: 'Medium (6 Slices)',
      isVeg: true,
    },
    {
      id: 'dfood-3',
      name: 'Indo-Chinese Hakka Noodles & Chilli Chicken Combo',
      restaurant: 'Chowman / Dragon Wok Partner',
      category: 'chinese',
      price: 219,
      originalPrice: 299,
      discountPercent: 27,
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
      description: 'Street-style wok tossed Hakka noodles served with 6 pieces succulent chilli chicken in thick dark soy gravy.',
      deliveryMinutes: 18,
      rating: 4.7,
      portionSize: 'Combo Box (Serves 1-2)',
      isVeg: false,
    },
    {
      id: 'dfood-4',
      name: 'Hot & Crispy Fried Chicken Bucket (6 Pcs)',
      restaurant: 'KFC / PriceBite Crispy House',
      category: 'chicken',
      price: 320,
      originalPrice: 450,
      discountPercent: 28,
      imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80',
      description: 'Freshly fried 11-secret-spice crispy chicken leg & thigh pieces served with creamy garlic dip & spicy mayo.',
      deliveryMinutes: 20,
      rating: 4.9,
      portionSize: '6 Pcs Bucket',
      isVeg: false,
    },
    {
      id: 'dfood-5',
      name: 'Royal Chelo Kebab Platter with Butter Rice',
      restaurant: 'Peter Cat / Mocambo Kitchen',
      category: 'kebabs',
      price: 380,
      originalPrice: 490,
      discountPercent: 22,
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
      description: 'Iconic mutton seekh kebab & chicken reshmi kebab served over buttered rice with poached egg yolk & grilled tomato.',
      deliveryMinutes: 25,
      rating: 4.9,
      portionSize: 'Royal Platter',
      isVeg: false,
    },
    {
      id: 'dfood-6',
      name: 'Steamed Chicken Darjeeling Momos (8 Pcs)',
      restaurant: 'WOW! Momo / Tibetan Express',
      category: 'chinese',
      price: 139,
      originalPrice: 180,
      discountPercent: 23,
      imageUrl: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&auto=format&fit=crop&q=80',
      description: 'Handcrafted thin-wrapper Darjeeling momos packed with minced chicken, coriander & served with spicy red chutney.',
      deliveryMinutes: 15,
      rating: 4.8,
      portionSize: '8 Pieces Plate',
      isVeg: false,
    },
    {
      id: 'dfood-7',
      name: 'North Indian Royal Butter Chicken & Garlic Naan Thali',
      restaurant: 'Punjab Grill / Desi Kitchen',
      category: 'thali',
      price: 269,
      originalPrice: 350,
      discountPercent: 23,
      imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80',
      description: 'Rich creamy Murgh Makhani served with 2 butter garlic naans, jeera rice, dal makhani, salad & gulab jamun.',
      deliveryMinutes: 22,
      rating: 4.8,
      portionSize: 'Full Meal Thali',
      isVeg: false,
    },
    {
      id: 'dfood-8',
      name: 'Baked Hot Rasogolla (6 Pcs Matka Box)',
      restaurant: 'Balaram Mullick / Sweet Bengal',
      category: 'dessert',
      price: 160,
      originalPrice: 210,
      discountPercent: 24,
      imageUrl: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=800&auto=format&fit=crop&q=80',
      description: 'Authentic sponge rasogollas baked in condensed milk & kheer in clay matka bowl. Served warm.',
      deliveryMinutes: 18,
      rating: 4.9,
      portionSize: '6 Pcs Matka Bowl',
      isVeg: true,
    },
  ];

  const filteredFoodItems = directFoodCatalog.filter(
    (item) => activeFoodCategory === 'all' || item.category === activeFoodCategory
  );

  const handlePlaceOrder = () => {
    if (selectedItem) {
      const activeUserId = userProfile?.email || 'user-1';
      const newOrderId = `#PB-FOOD-${(Math.random() * 90000 + 10000).toFixed(0)}`;

      // 1. Ensure user profile exists in profiles table
      syncUserProfileToCloud({
        id: activeUserId,
        name: userProfile?.name || 'PriceBite Customer',
        email: activeUserId,
        phone: userProfile?.phone || '',
        currentPinCode: currentPinDetails?.pinCode || '',
      });

      // 2. Create order with matching user_id == profiles.id
      createDirectOrderInCloud({
        orderId: newOrderId,
        userId: activeUserId,
        items: [{
          id: selectedItem.id,
          name: selectedItem.name,
          restaurant: selectedItem.restaurant,
          quantity,
          price: selectedItem.price,
        }],
        totalAmount: selectedItem.price * quantity,
        deliveryPinCode: currentPinDetails?.pinCode || '700156',
        deliveryAddress: locText,
        paymentMethod: paymentMethod === 'upi' ? 'UPI Direct Pay' : paymentMethod === 'card' ? 'Debit/Credit Card' : 'Cash on Delivery',
      });
    }

    setIsOrderPlaced(true);
    setActiveStep(1);

    setTimeout(() => setActiveStep(2), 2000);
    setTimeout(() => setActiveStep(3), 4500);
    setTimeout(() => setActiveStep(4), 7000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 🌟 PRICEBITE DIRECT FOOD STORE HERO BANNER */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
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
              className="bg-slate-950 text-amber-400 hover:bg-slate-900 px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-2 shadow-lg transition-all border border-slate-800"
            >
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>Delivering To: {locText}</span>
            </button>

            <span className="text-xs font-black text-white bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              ⏱️ {getTranslation('directExpressDelivery', currentLang)}
            </span>
          </div>
        </div>
      </div>

      {/* 🌟 FOOD CATEGORY FILTERS */}
      <div className="space-y-4">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div>
            <h2 className={`text-2xl font-black flex items-center space-x-2 ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}>
              <ShoppingBag className="w-6 h-6 text-orange-500" />
              <span>{getTranslation('directMenuTitle', currentLang)}</span>
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {getTranslation('directMenuSubtitle', currentLang)}
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
            isDark 
              ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40' 
              : 'text-emerald-700 bg-emerald-50 border-emerald-300'
          }`}>
            {getTranslation('directGuaranteedPrices', currentLang)}
          </span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-2">
          {[
            { id: 'all', key: 'directCategoryAll', fallbackLabel: 'All Dishes 🍲' },
            { id: 'biryani', key: 'directCategoryBiryani', fallbackLabel: 'Biryani & Rice 🍗' },
            { id: 'pizza', key: 'directCategoryPizza', fallbackLabel: 'Pizzas & Cheesy 🍕' },
            { id: 'chinese', key: 'directCategoryChinese', fallbackLabel: 'Chinese & Momos 🥟' },
            { id: 'chicken', key: 'directCategoryChicken', fallbackLabel: 'Fried Chicken 🍗' },
            { id: 'kebabs', key: 'directCategoryKebabs', fallbackLabel: 'Kebabs & Tandoor 🍢' },
            { id: 'thali', key: 'directCategoryThali', fallbackLabel: 'Thalis & Combos 🍱' },
            { id: 'dessert', key: 'directCategoryDessert', fallbackLabel: 'Desserts & Sweets 🍰' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFoodCategory(cat.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex-shrink-0 border ${
                activeFoodCategory === cat.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-orange-400 text-slate-950 shadow-lg shadow-orange-500/20 scale-105'
                  : isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900 shadow-sm'
              }`}
            >
              {getTranslation(cat.key, currentLang) !== cat.key ? getTranslation(cat.key, currentLang) : cat.fallbackLabel}
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 100% FOOD DISHES CATALOG GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredFoodItems.map((item) => (
          <div
            key={item.id}
            className={`${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            } border rounded-3xl overflow-hidden shadow-xl hover:border-orange-500/60 transition-all flex flex-col justify-between group`}
          >
            <div>
              <div className="relative h-48 overflow-hidden bg-slate-950">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow-md">
                  ⚡ Direct Order
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-950/90 text-amber-300 font-bold text-xs px-2.5 py-1 rounded-full border border-slate-700">
                  ⏱️ {item.deliveryMinutes} mins
                </div>
                <div className={`absolute top-3 right-3 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shadow-md ${
                  item.isVeg ? 'bg-emerald-950 text-emerald-400 border-emerald-500' : 'bg-red-950 text-red-400 border-red-500'
                }`}>
                  {item.isVeg ? '🟢 VEG' : '🔴 NON-VEG'}
                </div>
              </div>

              <div className="p-5 space-y-2">
                <span className={`text-[10px] font-bold uppercase ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>{item.restaurant} • {item.portionSize}</span>
                <h3 className={`font-extrabold text-base line-clamp-2 leading-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}>{item.name}</h3>
                <p className={`text-xs line-clamp-2 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>{item.description}</p>
                <div className="flex items-center space-x-1 text-xs font-bold text-amber-500 dark:text-amber-400 pt-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{item.rating} Rating</span>
                </div>
              </div>
            </div>

            <div className={`p-5 pt-0 border-t mt-2 flex items-center justify-between ${
              isDark ? 'border-slate-800/80' : 'border-slate-100'
            }`}>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400">₹{item.price}</span>
                  <span className={`text-xs line-through ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}>₹{item.originalPrice}</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{item.discountPercent}% Off In-App</span>
              </div>

              <button
                onClick={() => {
                  setSelectedItem(item);
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

      {/* 🌟 DIRECT FOOD CHECKOUT MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className={`${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          } border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto`}>
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
                      <h3 className={`text-lg font-black ${
                        isDark ? 'text-slate-100' : 'text-slate-900'
                      }`}>PriceBite Direct Food Checkout</h3>
                      <p className={`text-xs ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>In-App Direct Restaurant Order (Zero Redirection)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
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
                  <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 truncate">
                    <h4 className={`font-extrabold text-sm truncate ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}>{selectedItem.name}</h4>
                    <p className={`text-xs ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>{selectedItem.restaurant}</p>
                    <span className="text-sm font-black text-amber-600 dark:text-amber-400">₹{selectedItem.price} / dish</span>
                  </div>

                  {/* Quantity selector */}
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                  }`}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-orange-500 font-black text-base"
                    >
                      -
                    </button>
                    <span className={`text-xs font-bold ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-orange-500 font-black text-base"
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
                    <span className={`text-xs font-bold uppercase ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>Food Delivery Destination</span>
                    <button onClick={onOpenPinModal} className="text-xs text-orange-500 font-bold hover:underline">
                      Change PIN ✏️
                    </button>
                  </div>
                  <div className={`flex items-center space-x-2 text-xs font-bold ${
                    isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}>
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span>{locText}</span>
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">⏱️ Express Kitchen Delivery in {selectedItem.deliveryMinutes} minutes</span>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <label className={`block text-xs font-extrabold uppercase ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>Select Payment Method</label>
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

                {/* Total Calculation */}
                <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div className="flex justify-between">
                    <span>Food Item Total ({quantity}x):</span>
                    <span>₹{selectedItem.price * quantity}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>PriceBite Direct Partner Discount:</span>
                    <span>-₹{(selectedItem.originalPrice - selectedItem.price) * quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PriceBite Wallet Cashback:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">+₹15</span>
                  </div>
                  <div className={`flex justify-between border-t pt-2 text-base font-black ${
                    isDark ? 'border-slate-800 text-slate-100' : 'border-slate-200 text-slate-900'
                  }`}>
                    <span>Final Payable Amount:</span>
                    <span className="text-amber-600 dark:text-amber-400">₹{selectedItem.price * quantity}</span>
                  </div>
                </div>

                {/* Confirm Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-slate-950 font-black py-4 rounded-2xl text-base shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Place Direct Food Order (₹{selectedItem.price * quantity})</span>
                </button>
              </div>
            ) : (
              /* Live In-App Order Tracker */
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full mx-auto flex items-center justify-center text-3xl border border-emerald-500/40 shadow-lg shadow-emerald-500/20 animate-bounce">
                  ✓
                </div>

                <div>
                  <h3 className={`text-2xl font-black ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}>Food Order Confirmed on PriceBite Direct!</h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">
                    Order ID: #PB-FOOD-{(Math.random() * 90000 + 10000).toFixed(0)} • Delivery to {locText}
                  </p>
                </div>

                {/* Progress Steps */}
                <div className={`p-5 rounded-2xl border text-left space-y-4 text-xs ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`font-extrabold uppercase tracking-wider text-[11px] border-b pb-2 ${
                    isDark ? 'text-slate-200 border-slate-800' : 'text-slate-700 border-slate-200'
                  }`}>
                    🚴 Live Kitchen & Order Tracker
                  </h4>

                  {[
                    { step: 1, label: 'Order Confirmed by Partner Kitchen', desc: 'Chef preparing your fresh dish' },
                    { step: 2, label: 'Cooking & Hygienic Thermal Packaging', desc: 'Hot & fresh packaging in progress' },
                    { step: 3, label: 'PriceBite Delivery Rider Assigned', desc: 'Rider picked up hot package' },
                    { step: 4, label: 'Out for Express Food Delivery', desc: 'Arriving at your location in 15-20 mins' },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors mt-0.5 ${
                          activeStep >= s.step
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                            : isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-500'
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
                        <span className={`text-[10px] block ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>{s.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className={`w-full font-extrabold py-3 rounded-xl text-xs transition-colors ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  }`}
                >
                  Done & Back to App
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
