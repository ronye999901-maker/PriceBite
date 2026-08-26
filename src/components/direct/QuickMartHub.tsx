import React, { useState } from 'react';
import { ShoppingCart, Zap, MapPin, Star, ShoppingBag, Snowflake, PackageCheck, Flame } from 'lucide-react';
import { PINCodeDetails, LanguageCode, ThemeMode, UserProfile } from '../../types';
import { createDirectOrderInCloud, syncUserProfileToCloud } from '../../lib/supabase';

interface QuickGroceryItem {
  id: string;
  name: string;
  category: 'dairy' | 'frozen' | 'fruits' | 'bakery' | 'snacks' | 'drinks' | 'staples';
  brand: string;
  quantity: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  deliveryMinutes: number;
  rating: number;
  isFrozen?: boolean;
}

interface QuickMartHubProps {
  currentPinDetails: PINCodeDetails | null;
  currentLang: LanguageCode;
  onOpenPinModal: () => void;
  themeMode?: ThemeMode;
  userProfile?: UserProfile;
}

export const QuickMartHub: React.FC<QuickMartHubProps> = ({
  currentPinDetails,
  currentLang,
  onOpenPinModal,
  themeMode = 'dark',
  userProfile,
}) => {
  const [selectedItem, setSelectedItem] = useState<QuickGroceryItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [activeCategory, setActiveCategory] = useState<'all' | 'dairy' | 'frozen' | 'fruits' | 'bakery' | 'snacks' | 'drinks' | 'staples'>('all');

  const isDark = themeMode === 'dark';

  const locText = currentPinDetails
    ? `${currentPinDetails.area}, ${currentPinDetails.district} (${currentPinDetails.pinCode})`
    : 'Select Delivery Location';

  // 🌟 100% QUICK GROCERY & PACKAGED FROZEN FOOD CATALOG (10-20 MINS)
  const quickGroceryCatalog: QuickGroceryItem[] = [
    // 🧊 Packaged Frozen Foods & Ice Creams
    {
      id: 'qmart-fz-1',
      name: 'McCain Crispy French Fries (420g Pack)',
      category: 'frozen',
      brand: 'McCain Frozen',
      quantity: '420 g Frozen Bag',
      price: 115,
      originalPrice: 135,
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop&q=80',
      deliveryMinutes: 10,
      rating: 4.9,
      isFrozen: true,
    },
    {
      id: 'qmart-fz-2',
      name: 'Godrej Yummiez Crispy Chicken Nuggets (500g)',
      category: 'frozen',
      brand: 'Godrej Yummiez',
      quantity: '500 g Frozen Pack',
      price: 240,
      originalPrice: 280,
      imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&auto=format&fit=crop&q=80',
      deliveryMinutes: 12,
      rating: 4.8,
      isFrozen: true,
    },
    {
      id: 'qmart-fz-3',
      name: 'Kwality Walls Dark Chocolate Feast Ice Cream (4 Pcs)',
      category: 'frozen',
      brand: "Kwality Wall's",
      quantity: '4 Cones Multi-Pack',
      price: 180,
      originalPrice: 200,
      imageUrl: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&auto=format&fit=crop&q=80',
      deliveryMinutes: 10,
      rating: 4.9,
      isFrozen: true,
    },
    {
      id: 'qmart-fz-4',
      name: 'Prasuma Chicken Steamed Frozen Momos (24 Pcs Box)',
      category: 'frozen',
      brand: 'Prasuma Frozen',
      quantity: '24 Pcs Jumbo Pack',
      price: 299,
      originalPrice: 350,
      imageUrl: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&auto=format&fit=crop&q=80',
      deliveryMinutes: 12,
      rating: 4.8,
      isFrozen: true,
    },

    // 🥛 Dairy & Fresh Milk
    {
      id: 'qmart-dy-1',
      name: 'Amul Taaza T-Special Milk (500ml Pack)',
      category: 'dairy',
      brand: 'Amul Dairy',
      quantity: '500 ml Pouch',
      price: 27,
      originalPrice: 28,
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80',
      deliveryMinutes: 10,
      rating: 4.9,
    },
    {
      id: 'qmart-dy-2',
      name: 'Mother Dairy Fresh Paneer (200g)',
      category: 'dairy',
      brand: 'Mother Dairy',
      quantity: '200 g Pack',
      price: 88,
      originalPrice: 95,
      imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80',
      deliveryMinutes: 12,
      rating: 4.8,
    },

    // 🍌 Fresh Fruits & Vegetables
    {
      id: 'qmart-fr-1',
      name: 'Organic Cavendish Bananas (1 Dozen)',
      category: 'fruits',
      brand: 'PriceBite Fresh Farm',
      quantity: '12 Pieces (approx 1.2kg)',
      price: 54,
      originalPrice: 65,
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80',
      deliveryMinutes: 15,
      rating: 4.8,
    },
    {
      id: 'qmart-fr-2',
      name: 'Shimla Crisp Red Apples (4 Pcs)',
      category: 'fruits',
      brand: 'Himachal Orchards',
      quantity: '500 g Pack',
      price: 110,
      originalPrice: 140,
      imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80',
      deliveryMinutes: 15,
      rating: 4.9,
    },

    // 🍞 Bakery & Eggs
    {
      id: 'qmart-bk-1',
      name: 'Britannia 100% Whole Wheat Bread (400g)',
      category: 'bakery',
      brand: 'Britannia',
      quantity: '400 g Loaf',
      price: 45,
      originalPrice: 50,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
      deliveryMinutes: 12,
      rating: 4.8,
    },
    {
      id: 'qmart-bk-2',
      name: 'Farm Fresh Brown Protein Eggs (6 Pcs)',
      category: 'bakery',
      brand: 'Eggoz Protein',
      quantity: '6 Eggs Pack',
      price: 54,
      originalPrice: 65,
      imageUrl: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=800&auto=format&fit=crop&q=80',
      deliveryMinutes: 12,
      rating: 4.9,
    },

    // 🍿 Snacks & Munchies
    {
      id: 'qmart-sn-1',
      name: "Lay's India's Magic Masala Chips (Family Pack)",
      category: 'snacks',
      brand: "Lay's",
      quantity: '115 g Pack',
      price: 38,
      originalPrice: 40,
      imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&auto=format&fit=crop&q=80',
      deliveryMinutes: 10,
      rating: 4.9,
    },
    {
      id: 'qmart-sn-2',
      name: 'Cadbury Dairy Milk Silk Chocolate (150g)',
      category: 'snacks',
      brand: 'Cadbury',
      quantity: '150 g Bar',
      price: 165,
      originalPrice: 175,
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop&q=80',
      deliveryMinutes: 10,
      rating: 4.9,
    },

    // 🥤 Cold Drinks & Juices
    {
      id: 'qmart-dr-1',
      name: 'Coca-Cola Soft Drink (750ml Bottle)',
      category: 'drinks',
      brand: 'Coca-Cola',
      quantity: '750 ml Pet Bottle',
      price: 40,
      originalPrice: 45,
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80',
      deliveryMinutes: 10,
      rating: 4.8,
    },

    // 🍳 Staples, Atta & Oil
    {
      id: 'qmart-st-1',
      name: 'Aashirvaad Shudh Chakki Whole Wheat Atta (5kg)',
      category: 'staples',
      brand: 'Aashirvaad',
      quantity: '5 kg Bag',
      price: 245,
      originalPrice: 280,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
      deliveryMinutes: 18,
      rating: 4.9,
    },
  ];

  const filteredItems = quickGroceryCatalog.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  );

  const handlePlaceOrder = () => {
    if (selectedItem) {
      const activeUserId = userProfile?.email || 'user-1';
      const locText = currentPinDetails
        ? `${currentPinDetails.area}, ${currentPinDetails.district} (${currentPinDetails.pinCode})`
        : 'Default Address';
      const newOrderId = `#PB-QMART-${(Math.random() * 90000 + 10000).toFixed(0)}`;

      // 1. Ensure profile exists in profiles table
      syncUserProfileToCloud({
        id: activeUserId,
        name: userProfile?.name || 'PriceBite Customer',
        email: activeUserId,
        phone: userProfile?.phone || '',
        currentPinCode: currentPinDetails?.pinCode || '',
      });

      // 2. Create grocery order in orders table
      createDirectOrderInCloud({
        orderId: newOrderId,
        userId: activeUserId,
        items: [{
          id: selectedItem.id,
          name: selectedItem.name,
          brand: selectedItem.brand,
          quantity,
          price: selectedItem.price,
        }],
        totalAmount: selectedItem.price * quantity,
        deliveryPinCode: currentPinDetails?.pinCode || '700156',
        deliveryAddress: locText,
        paymentMethod: paymentMethod === 'upi' ? 'UPI Direct' : paymentMethod === 'card' ? 'Debit/Credit Card' : 'Cash on Delivery',
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
      {/* 🌟 10-20 MINUTE QUICK MART HERO BANNER */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white border border-white/20">
            <Zap className="w-4 h-4 text-amber-300" />
            <span>🛍️ PriceBite Quick Mart — 10 to 20 Min Delivery</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            10 to 20 Min Quick Grocery & Frozen Food Mart
          </h1>

          <p className="text-sm sm:text-base font-bold text-pink-100">
            Order fresh daily groceries, milk, eggs, bread, fruits, veggies & packaged frozen foods (McCain Fries, Frozen Nuggets, Ice Creams) delivered in 10-20 minutes!
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
              ⏱️ 10 to 20 Mins DarkStore ColdChain Delivery
            </span>
          </div>
        </div>
      </div>

      {/* 🌟 GROCERY & FROZEN CATEGORY FILTERS */}
      <div className="space-y-4">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div>
            <h2 className={`text-2xl font-black flex items-center space-x-2 ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}>
              <ShoppingCart className="w-6 h-6 text-pink-500" />
              <span>Quick Mart Aisles & Packaged Frozen Section</span>
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Insulated cold-chain delivery for frozen snacks, ice cream & fresh daily produce
            </p>
          </div>
          <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-full">
            ✓ ColdChain Express Active
          </span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-2">
          {[
            { id: 'all', label: 'All Essentials 🛒' },
            { id: 'frozen', label: 'Packaged Frozen & Ice Cream 🧊' },
            { id: 'dairy', label: 'Dairy, Milk & Paneer 🥛' },
            { id: 'fruits', label: 'Fruits & Veggies 🍌' },
            { id: 'bakery', label: 'Bread, Bakery & Eggs 🍞' },
            { id: 'snacks', label: 'Snacks & Munchies 🍿' },
            { id: 'drinks', label: 'Cold Drinks & Juices 🥤' },
            { id: 'staples', label: 'Atta, Rice & Oil 🍳' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex-shrink-0 border ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-500 text-white shadow-lg shadow-pink-500/25 scale-105'
                  : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 shadow-sm'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 QUICK MART ITEMS CATALOG GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const discountPct = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);

          return (
            <div
              key={item.id}
              className={`border rounded-3xl overflow-hidden shadow-xl hover:border-pink-500/60 transition-all flex flex-col justify-between group ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'
              }`}
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-950">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow-md">
                    ⚡ {item.deliveryMinutes} MIN EXPRESS
                  </div>
                  {item.isFrozen && (
                    <div className="absolute top-3 right-3 bg-cyan-950/90 text-cyan-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-cyan-500/50 shadow-md flex items-center space-x-1">
                      <Snowflake className="w-3 h-3 text-cyan-400" />
                      <span>FROZEN</span>
                    </div>
                  )}
                  {discountPct > 0 && (
                    <div className="absolute bottom-3 right-3 bg-emerald-950/90 text-emerald-400 font-extrabold text-xs px-2.5 py-1 rounded-full border border-emerald-500/40">
                      {discountPct}% OFF
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>{item.brand} • {item.quantity}</span>
                  <h3 className={`font-extrabold text-base line-clamp-2 leading-tight ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}>{item.name}</h3>
                  <div className="flex items-center space-x-1 text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{item.rating} Rating</span>
                  </div>
                </div>
              </div>

              <div className={`p-5 pt-0 border-t mt-2 flex items-center justify-between ${
                isDark ? 'border-slate-800/80' : 'border-slate-200'
              }`}>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-black text-pink-600">₹{item.price}</span>
                    <span className="text-xs text-slate-400 line-through">₹{item.originalPrice}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">10-20 Mins Delivery</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setQuantity(1);
                    setIsOrderPlaced(false);
                  }}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-pink-500/20 transition-all hover:scale-105"
                >
                  Order In-App ⚡
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🌟 QUICK MART CHECKOUT MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className={`border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {!isOrderPlaced ? (
              <div className="space-y-6">
                <div className={`flex items-center justify-between border-b pb-4 ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-500 flex items-center justify-center font-bold text-xl border border-pink-500/30">
                      🛍️
                    </div>
                    <div>
                      <h3 className="text-lg font-black">Quick Mart Direct Checkout</h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>10-20 Mins Express DarkStore Delivery</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
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
                    <h4 className="font-extrabold text-sm truncate">{selectedItem.name}</h4>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedItem.brand} • {selectedItem.quantity}</p>
                    <span className="text-sm font-black text-pink-600">₹{selectedItem.price} / item</span>
                  </div>

                  {/* Quantity selector */}
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                  }`}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-pink-600 font-black text-base"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-pink-600 font-black text-base"
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
                    <span className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Express Delivery Destination</span>
                    <button onClick={onOpenPinModal} className="text-xs text-orange-500 font-bold hover:underline">
                      Change PIN ✏️
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-bold">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span>{locText}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold block">⏱️ Cold-Chain Guaranteed Delivery in {selectedItem.deliveryMinutes} minutes</span>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <label className={`block text-xs font-extrabold uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Select Payment Method</label>
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
                            ? 'bg-pink-500/20 border-pink-500 text-pink-600 font-bold'
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
                    <span>Grocery Item Total ({quantity}x):</span>
                    <span>₹{selectedItem.price * quantity}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Quick Mart Direct Discount:</span>
                    <span>-₹{(selectedItem.originalPrice - selectedItem.price) * quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ColdChain Delivery Fee:</span>
                    <span className="text-emerald-600 font-bold">FREE ⚡</span>
                  </div>
                  <div className={`flex justify-between border-t pt-2 text-base font-black ${
                    isDark ? 'border-slate-800 text-slate-100' : 'border-slate-200 text-slate-900'
                  }`}>
                    <span>Final Payable Amount:</span>
                    <span className="text-pink-600">₹{selectedItem.price * quantity}</span>
                  </div>
                </div>

                {/* Confirm Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl text-base shadow-xl shadow-pink-500/30 transition-all flex items-center justify-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Place 10-Min Quick Mart Order (₹{selectedItem.price * quantity})</span>
                </button>
              </div>
            ) : (
              /* Live In-App Order Tracker */
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full mx-auto flex items-center justify-center text-3xl border border-emerald-500/40 shadow-lg shadow-emerald-500/20 animate-bounce">
                  ✓
                </div>

                <div>
                  <h3 className="text-2xl font-black">Quick Mart Order Confirmed!</h3>
                  <p className="text-xs text-pink-600 font-bold mt-1">
                    Order ID: #PB-MART-{(Math.random() * 90000 + 10000).toFixed(0)} • Delivery to {locText}
                  </p>
                </div>

                {/* Progress Steps */}
                <div className={`p-5 rounded-2xl border text-left space-y-4 text-xs ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`font-extrabold uppercase tracking-wider text-[11px] border-b pb-2 ${
                    isDark ? 'border-slate-800 text-slate-200' : 'border-slate-200 text-slate-800'
                  }`}>
                    🚴 Live Express Grocery & ColdChain Tracker
                  </h4>

                  {[
                    { step: 1, label: 'Order Received at ColdChain DarkStore', desc: 'Picker selecting chilled items & groceries' },
                    { step: 2, label: 'Insulated Thermal Bagging Check', desc: 'Frozen items packed in insulated thermal pouch' },
                    { step: 3, label: 'Express Rider Picked Up Package', desc: 'Rider on electric EV bike' },
                    { step: 4, label: 'Arriving at Your Doorstep', desc: 'Reaching your address in 10-15 mins' },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors mt-0.5 ${
                          activeStep >= s.step
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
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
                        <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.desc}</span>
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
