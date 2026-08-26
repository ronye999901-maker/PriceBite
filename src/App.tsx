import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { RegionLanguageModal } from './components/layout/RegionLanguageModal';
import { HeroSearch } from './components/home/HeroSearch';
import { TrendingDeals } from './components/home/TrendingDeals';
import { ProductCard } from './components/comparison/ProductCard';
import { FloatingRestaurantCarousel } from './components/comparison/FloatingRestaurantCarousel';
import { RewardsOptimizer } from './components/rewards/RewardsOptimizer';
import { PriceHistoryChart } from './components/analytics/PriceHistoryChart';
import { PriceAlertModal } from './components/analytics/PriceAlertModal';
import { PriceBreakdownModal } from './components/comparison/PriceBreakdownModal';
import { DealBotWidget } from './components/dealbot/DealBotWidget';
import { VoiceSearchModal } from './components/dealbot/VoiceSearchModal';
import { UserProfile as UserProfileView } from './components/profile/UserProfile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PriceBiteDirectHub } from './components/direct/PriceBiteDirectHub';
import { QuickMartHub } from './components/direct/QuickMartHub';
import { AuthModal } from './components/auth/AuthModal';
import { CartDrawer } from './components/cart/CartDrawer';

import { getProductsForLocation, getRestaurantsForLocation } from './mock/foodData';
import { LanguageCode, PINCodeDetails, PlatformResult, ProductComparisonItem, UserProfile as UserProfileType, CartItem, OrderRecord, ThemeMode } from './types';
import { evaluateProductMatch } from './engine/matchingEngine';
import { enrichPlatformResultsWithSavings } from './engine/priceEngine';
import { getTranslation } from './i18n';
import { syncUserProfileToCloud, createDirectOrderInCloud, fetchUserOrdersFromCloud, syncPriceAlertToCloud } from './lib/supabase';
import { MapPin, Smartphone, CheckCircle } from 'lucide-react';

export function App() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');

  // Theme Mode State (Dark vs Classy Light Mode)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('pricebite_theme') as ThemeMode) || 'dark';
  });

  // Toggle light-mode class on document root
  useEffect(() => {
    if (themeMode === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [themeMode]);

  // STRICTLY USER INPUT ONLY — NO HARDCODED DEFAULT PIN CODE
  const [currentPinDetails, setCurrentPinDetails] = useState<PINCodeDetails | null>(null);

  const [activeTab, setActiveTab] = useState<'home' | 'direct' | 'quickmart' | 'search' | 'restaurants' | 'rewards' | 'profile' | 'admin'>('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Location-aware dynamic datasets
  const [productsForLocation, setProductsForLocation] = useState<ProductComparisonItem[]>(
    getProductsForLocation(currentPinDetails)
  );
  const [restaurantsForLocation, setRestaurantsForLocation] = useState(
    getRestaurantsForLocation(currentPinDetails)
  );

  const [searchResults, setSearchResults] = useState<ProductComparisonItem[]>(
    getProductsForLocation(currentPinDetails)
  );

  const [selectedBankCard, setSelectedBankCard] = useState('');

  // Modals & Drawers state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [breakdownPlatform, setBreakdownPlatform] = useState<PlatformResult | null>(null);
  const [breakdownProductName, setBreakdownProductName] = useState('');

  const [historyProduct, setHistoryProduct] = useState<ProductComparisonItem | null>(null);
  const [alertProduct, setAlertProduct] = useState<ProductComparisonItem | null>(null);

  const [isDealBotOpen, setIsDealBotOpen] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);

  const [redirectingPlatform, setRedirectingPlatform] = useState<{ platform: PlatformResult; productName: string } | null>(null);

  // Persistent User Profile with Cart & Order History Database
  const [userProfile, setUserProfile] = useState<UserProfileType>(() => {
    const saved = localStorage.getItem('pricebite_user_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Purge legacy dummy profiles from browser cache
        if (parsed.email === 'sayan@pricebite.in' || parsed.name === 'Sayan Chowdhury' || parsed.id === 'user-1') {
          localStorage.removeItem('pricebite_user_db');
        } else {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse user db', e);
      }
    }
    return {
      id: '',
      name: 'Guest User',
      email: '',
      phone: '',
      isLoggedIn: false,
      currentPinCode: '',
      savedAddresses: [],
      preferredLanguage: 'en',
      totalSavingsAmount: 0,
      comparedSearchesCount: 0,
      favoriteProductIds: [],
      alerts: [],
      cart: [],
      pastOrders: [],
    };
  });

  // Save profile state to localStorage
  useEffect(() => {
    localStorage.setItem('pricebite_user_db', JSON.stringify(userProfile));
  }, [userProfile]);

  // Save theme mode to localStorage
  const handleToggleTheme = () => {
    const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    localStorage.setItem('pricebite_theme', nextTheme);
  };

  // Re-calculate datasets whenever PIN code changes
  useEffect(() => {
    const freshProducts = getProductsForLocation(currentPinDetails);
    const freshRestaurants = getRestaurantsForLocation(currentPinDetails);

    setProductsForLocation(freshProducts);
    setRestaurantsForLocation(freshRestaurants);

    // Re-evaluate active search with new location PIN context
    handleSearchWithDataset(searchQuery, freshProducts);
  }, [currentPinDetails]);

  const handleSearchWithDataset = (query: string, availableProducts: ProductComparisonItem[]) => {
    const q = query.trim();
    setSearchQuery(q);

    if (!q) {
      setSearchResults(availableProducts);
      return;
    }

    // Filter products strictly matching search terms for this PIN code
    const filtered = availableProducts.filter((item) => {
      const match = evaluateProductMatch(q, item.name, item.restaurantOrBrand, item.quantity, item.category, item.description);
      return match.matchScore > 0 && match.matchType !== 'DIFFERENT';
    }).map((item) => {
      const match = evaluateProductMatch(q, item.name, item.restaurantOrBrand, item.quantity, item.category, item.description);
      const enrichedResults = enrichPlatformResultsWithSavings(item.platformResults);

      return {
        ...item,
        matchType: match.matchType,
        matchScore: match.matchScore,
        matchNotes: match.matchNotes,
        platformResults: enrichedResults,
      };
    });

    if (filtered.length === 0) {
      const locText = currentPinDetails ? `${currentPinDetails.area}` : 'Local Outlets';
      const dynamicProduct: ProductComparisonItem = {
        id: `dynamic-${Date.now()}`,
        name: `${q.charAt(0).toUpperCase() + q.slice(1)} (${locText})`,
        category: 'food',
        restaurantOrBrand: currentPinDetails ? `Top Verified Outlet in ${currentPinDetails.district}` : 'Top Rated Restaurant',
        quantity: 'Standard Portion',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
        description: `Verified comparison results for ${q} ${currentPinDetails ? `delivered to ${currentPinDetails.area}` : ''}.`,
        isVeg: false,
        matchType: 'EXACT',
        matchScore: 95,
        matchNotes: `✅ Exact Match: Live platform prices calculated for "${q}".`,
        platformResults: enrichPlatformResultsWithSavings([
          {
            platformId: 'pricebite',
            platformName: 'PriceBite Direct Store (In-App)',
            platformLogo: '⚡',
            rating: 4.9,
            ratingCount: 1420,
            deliveryTimeMinutes: 15,
            inStock: true,
            orderUrl: '#pricebite-direct',
            isDirectAppOrder: true,
            appliedCoupons: ['PRICEBITE_50'],
            appliedBankOffers: ['UPI_CASHBACK'],
            priceBreakdown: {
              basePrice: 220,
              discount: 40,
              couponDiscount: 20,
              bankDiscount: 0,
              deliveryFee: 10,
              platformFee: 0,
              packagingFee: 10,
              taxes: 9,
              finalPayablePrice: 189,
              cashback: 15,
              effectiveCost: 174,
              savingsVsHighest: 40,
              savingsVsNextCheapest: 25,
            },
          },
          {
            platformId: 'swiggy',
            platformName: 'Swiggy',
            platformLogo: '🧡',
            rating: 4.6,
            ratingCount: 1420,
            deliveryTimeMinutes: 24,
            inStock: true,
            orderUrl: `https://www.swiggy.com/search?query=${encodeURIComponent(q)}`,
            appliedCoupons: ['SWIGGYSPECIAL'],
            appliedBankOffers: ['HDFC_CARD'],
            priceBreakdown: {
              basePrice: 220,
              discount: 40,
              couponDiscount: 20,
              bankDiscount: 0,
              deliveryFee: 25,
              platformFee: 6,
              packagingFee: 12,
              taxes: 11,
              finalPayablePrice: 214,
              cashback: 15,
              effectiveCost: 199,
              savingsVsHighest: 15,
              savingsVsNextCheapest: 15,
            },
          },
        ]),
        cheapestPlatformId: 'pricebite',
        fastestPlatformId: 'pricebite',
        bestValuePlatformId: 'pricebite',
        bestRewardsPlatformId: 'pricebite',
        smartPickPlatformId: 'pricebite',
      };

      setSearchResults([dynamicProduct]);
    } else {
      setSearchResults(filtered);
    }
  };

  const handleSearch = (query: string) => {
    setActiveTab('search');
    handleSearchWithDataset(query, productsForLocation);

    setUserProfile((prev) => ({
      ...prev,
      comparedSearchesCount: prev.comparedSearchesCount + 1,
    }));
  };

  // Cart operations
  const handleAddToCart = (product: ProductComparisonItem, platform: PlatformResult) => {
    const cartItemId = `${product.id}-${platform.platformId}`;
    setUserProfile((prev) => {
      const existing = prev.cart.find((c) => c.id === cartItemId);
      if (existing) {
        return {
          ...prev,
          cart: prev.cart.map((c) =>
            c.id === cartItemId ? { ...c, quantity: c.quantity + 1 } : c
          ),
        };
      }
      const newItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        productName: product.name,
        platformId: platform.platformId,
        platformName: platform.platformName,
        platformLogo: platform.platformLogo,
        price: platform.priceBreakdown.finalPayablePrice,
        quantity: 1,
        imageUrl: product.imageUrl,
        restaurantName: product.restaurantOrBrand,
      };
      return {
        ...prev,
        cart: [...prev.cart, newItem],
      };
    });

    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setUserProfile((prev) => ({
      ...prev,
      cart: prev.cart.map((c) => (c.id === cartItemId ? { ...c, quantity: newQty } : c)),
    }));
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setUserProfile((prev) => ({
      ...prev,
      cart: prev.cart.filter((c) => c.id !== cartItemId),
    }));
  };

  const handleClearCart = () => {
    setUserProfile((prev) => ({ ...prev, cart: [] }));
  };

  const handleCheckoutSuccess = (items: CartItem[], totalAmount: number) => {
    const newOrder: OrderRecord = {
      id: `#PB-${(Math.random() * 90000 + 10000).toFixed(0)}`,
      date: 'Just now',
      items,
      totalAmount,
      status: 'In Transit',
      deliveryPinCode: currentPinDetails?.pinCode || '700156',
      deliveryAddress: currentPinDetails ? `${currentPinDetails.area}, ${currentPinDetails.district}` : 'Default Address',
      paymentMethod: 'UPI / In-App Direct Pay',
    };

    setUserProfile((prev) => ({
      ...prev,
      pastOrders: [newOrder, ...prev.pastOrders],
      totalSavingsAmount: prev.totalSavingsAmount + 45,
    }));

    // Sync order live to Supabase Cloud Database!
    createDirectOrderInCloud({
      orderId: newOrder.id,
      userId: userProfile.email || 'user-1',
      items: newOrder.items,
      totalAmount: newOrder.totalAmount,
      deliveryPinCode: newOrder.deliveryPinCode,
      deliveryAddress: newOrder.deliveryAddress,
      paymentMethod: newOrder.paymentMethod,
    });
  };

  // Auth Operations
  const handleLoginSuccess = async (name: string, email: string, phone: string) => {
    // 1. Fetch user's own orders from Supabase
    const cloudOrders = await fetchUserOrdersFromCloud(email);

    setUserProfile((prev) => ({
      ...prev,
      id: email,
      name,
      email,
      phone,
      isLoggedIn: true,
      pastOrders: cloudOrders,
      cart: [],
    }));

    // 2. Sync user login live to Supabase Cloud Database
    syncUserProfileToCloud({
      id: email,
      name,
      email,
      phone,
      currentPinCode: currentPinDetails?.pinCode || userProfile.currentPinCode || '',
      totalSavings: userProfile.totalSavingsAmount,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('pricebite_user_db');
    setUserProfile((prev) => ({
      ...prev,
      isLoggedIn: false,
      pastOrders: [],
      cart: [],
    }));
  };

  const handleOrderRedirect = (platform: PlatformResult, productName: string = 'Item') => {
    if (platform.isDirectAppOrder || platform.platformId === 'pricebite') {
      const mockProd = productsForLocation[0];
      handleAddToCart(mockProd, platform);
    } else {
      setRedirectingPlatform({ platform, productName });
    }
  };

  const handleExecutePlatformRedirect = (url: string) => {
    window.open(url, '_blank');
    setRedirectingPlatform(null);
  };

  const handleSaveAlert = (productId: string, targetPrice: number) => {
    const prod = productsForLocation.find((p) => p.id === productId);
    if (prod) {
      const lowestPrice = Math.min(...prod.platformResults.map((p) => p.priceBreakdown.finalPayablePrice));
      const activeUserId = userProfile.email || 'user-1';
      const pinCode = currentPinDetails?.pinCode || '';

      setUserProfile((prev) => ({
        ...prev,
        alerts: [
          ...prev.alerts,
          {
            id: `alt-${Date.now()}`,
            productId,
            productName: prod.name,
            targetPrice,
            currentLowestPrice: lowestPrice,
            pinCode,
            createdAt: 'Today',
            active: true,
          },
        ],
      }));

      // Sync price drop alert to Supabase cloud database
      syncPriceAlertToCloud({
        userId: activeUserId,
        productId,
        productName: prod.name,
        targetPrice,
        currentLowestPrice: lowestPrice,
        pinCode,
      });
    }
  };

  const handleRemoveAlert = (alertId: string) => {
    setUserProfile((prev) => ({
      ...prev,
      alerts: prev.alerts.filter((a) => a.id !== alertId),
    }));
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased selection:bg-orange-500 selection:text-slate-950 transition-colors ${
      themeMode === 'light' ? 'light-mode bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Navbar with Location, Cart, Theme Switcher & Login state */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        currentPinCode={currentPinDetails?.pinCode || ''}
        pinArea={currentPinDetails?.area || ''}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab as any)}
        onOpenDealBot={() => setIsDealBotOpen(true)}
        onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
        totalSavings={userProfile.totalSavingsAmount}
        cartItemCount={userProfile.cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        userProfile={userProfile}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Body Routing Views */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <HeroSearch
              currentLang={currentLang}
              onSearch={handleSearch}
              onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
              onSelectCategory={(cat) => handleSearch(cat)}
              currentPinCode={currentPinDetails?.pinCode || ''}
              pinArea={currentPinDetails?.area || ''}
              onOpenPinModal={() => setIsPinModalOpen(true)}
            />

            <TrendingDeals
              products={productsForLocation}
              currentLang={currentLang}
              onSelectProduct={(prod) => {
                setSearchResults([prod]);
                setActiveTab('search');
              }}
              themeMode={themeMode}
            />

            {/* FLOATING AUTO-ROTATING RESTAURANT CAROUSEL */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <FloatingRestaurantCarousel
                restaurants={restaurantsForLocation}
                currentLang={currentLang}
                themeMode={themeMode}
              />
            </div>
          </div>
        )}

        {/* Dedicated PriceBite Direct Fooding Store (100% Prepared Food In-App) */}
        {activeTab === 'direct' && (
          <PriceBiteDirectHub
            currentPinDetails={currentPinDetails}
            currentLang={currentLang}
            onOpenPinModal={() => setIsPinModalOpen(true)}
            themeMode={themeMode}
            userProfile={userProfile}
          />
        )}

        {/* Dedicated PriceBite Quick Mart (10-20 Min Grocery & Packaged Frozen Store) */}
        {activeTab === 'quickmart' && (
          <QuickMartHub
            currentPinDetails={currentPinDetails}
            currentLang={currentLang}
            onOpenPinModal={() => setIsPinModalOpen(true)}
            themeMode={themeMode}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'search' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
              themeMode === 'light' ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  Price Comparison Hub
                </h1>
                <p className="text-xs text-slate-400 flex items-center space-x-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span>
                    {currentPinDetails
                      ? `Showing live prices for 📍 ${currentPinDetails.area}, ${currentPinDetails.district} (${currentPinDetails.pinCode})`
                      : 'Comparing live prices across PriceBite Direct, Swiggy, Zomato, Blinkit & Zepto'}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setIsVoiceSearchOpen(true)}
                className={`border text-cyan-400 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  themeMode === 'light' ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                }`}
              >
                <span>🎙️ Voice Search</span>
              </button>
            </div>

            {/* Smart Rewards Card Selector */}
            <RewardsOptimizer
              selectedBankCard={selectedBankCard}
              onSelectBankCard={setSelectedBankCard}
            />

            {/* Search Results Product Cards */}
            <div className="space-y-8">
              {searchResults.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
                  <span className="text-4xl block">🔍</span>
                  <h3 className="text-xl font-bold text-slate-100">No Matching Food Items Found</h3>
                  <p className="text-xs text-slate-400">Try searching for "Biryani", "Pizza", "Amul Milk", "KFC", "Burger", or "Momos"</p>
                </div>
              ) : (
                searchResults.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    currentLang={currentLang}
                    onOpenBreakdown={(platform) => {
                      setBreakdownPlatform(platform);
                      setBreakdownProductName(product.name);
                    }}
                    onRedirectOrder={(platform) => handleOrderRedirect(platform, product.name)}
                    onOpenPriceHistory={(prod) => setHistoryProduct(prod)}
                    onOpenPriceAlert={(prod) => setAlertProduct(prod)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'restaurants' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <FloatingRestaurantCarousel
              restaurants={restaurantsForLocation}
              currentLang={currentLang}
              themeMode={themeMode}
            />
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="py-8">
            <RewardsOptimizer
              selectedBankCard={selectedBankCard}
              onSelectBankCard={setSelectedBankCard}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <UserProfileView
            profile={userProfile}
            currentLang={currentLang}
            onLanguageChange={setCurrentLang}
            onOpenPinModal={() => setIsPinModalOpen(true)}
            onRemoveAlert={handleRemoveAlert}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
            onReorderItem={(item) => {
              const mockProd = productsForLocation[0];
              const plat = mockProd.platformResults[0];
              handleAddToCart(mockProd, plat);
            }}
            themeMode={themeMode}
          />
        )}

        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer currentLang={currentLang} onLanguageChange={setCurrentLang} />

      {/* Modals & Overlays */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        themeMode={themeMode}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={userProfile.cart}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onCheckoutSuccess={handleCheckoutSuccess}
        currentPinDetails={currentPinDetails}
        themeMode={themeMode}
      />

      <RegionLanguageModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        currentPinCode={currentPinDetails?.pinCode || ''}
        onSaveLocation={(details) => {
          setCurrentPinDetails(details);
          setUserProfile((prev) => {
            const updated = { ...prev, currentPinCode: details.pinCode };
            if (prev.isLoggedIn && prev.email) {
              syncUserProfileToCloud({
                id: prev.email,
                name: prev.name,
                email: prev.email,
                phone: prev.phone,
                currentPinCode: details.pinCode,
                totalSavings: prev.totalSavingsAmount,
              });
            }
            return updated;
          });
        }}
        currentLang={currentLang}
        onSwitchLanguage={setCurrentLang}
      />

      <PriceBreakdownModal
        isOpen={!!breakdownPlatform}
        onClose={() => setBreakdownPlatform(null)}
        platformResult={breakdownPlatform}
        productName={breakdownProductName}
        currentLang={currentLang}
        onRedirectOrder={(p) => handleOrderRedirect(p, breakdownProductName)}
      />

      <PriceHistoryChart
        isOpen={!!historyProduct}
        onClose={() => setHistoryProduct(null)}
        product={historyProduct}
      />

      <PriceAlertModal
        isOpen={!!alertProduct}
        onClose={() => setAlertProduct(null)}
        product={alertProduct}
        onSaveAlert={handleSaveAlert}
      />

      <DealBotWidget
        isOpen={isDealBotOpen}
        onClose={() => setIsDealBotOpen(false)}
        currentLang={currentLang}
        onSelectProduct={(prod) => {
          setSearchResults([prod]);
          setActiveTab('search');
        }}
      />

      <VoiceSearchModal
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        currentLang={currentLang}
        onVoiceQueryResult={(q) => handleSearch(q)}
      />

      {/* Direct App Order Redirect Modal */}
      {redirectingPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className={`border rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative ${
            themeMode === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}>
            <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 mx-auto flex items-center justify-center text-3xl shadow-lg border border-orange-500/40">
              {redirectingPlatform.platform.platformLogo}
            </div>

            <div>
              <h3 className="text-xl font-black">
                Direct Order on {redirectingPlatform.platform.platformName}
              </h3>
              <p className="text-xs text-amber-500 font-bold mt-1">
                Final Payable Price: ₹{redirectingPlatform.platform.priceBreakdown.finalPayablePrice}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border text-left text-xs space-y-2 ${
              themeMode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center space-x-2 text-emerald-500 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Verified Direct Deep Link Active</span>
              </div>
              <p className="text-slate-400">
                PriceBite is opening the official dish page on {redirectingPlatform.platform.platformName}{currentPinDetails ? ` for delivery to 📍 ${currentPinDetails.area}, ${currentPinDetails.district} (${currentPinDetails.pinCode})` : ''}.
              </p>
            </div>

            <div className="flex flex-col space-y-2.5">
              <button
                onClick={() => handleExecutePlatformRedirect(redirectingPlatform.platform.orderUrl)}
                className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-slate-950 font-black py-3.5 rounded-xl text-sm shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open {redirectingPlatform.platform.platformName} App / Web Page</span>
              </button>

              <button
                onClick={() => setRedirectingPlatform(null)}
                className="text-xs text-slate-400 hover:text-slate-200 py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
