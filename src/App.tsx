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
import { UPIPaymentModal } from './components/checkout/UPIPaymentModal';
import { OrderTrackingModal } from './components/tracking/OrderTrackingModal';
import { OrderReceiptModal } from './components/receipt/OrderReceiptModal';

import { getProductsForLocation, getRestaurantsForLocation } from './mock/foodData';
import {
  LanguageCode,
  PINCodeDetails,
  PlatformResult,
  ProductComparisonItem,
  UserProfile as UserProfileType,
  CartItem,
  OrderRecord,
  ThemeMode,
} from './types';
import { evaluateProductMatch } from './engine/matchingEngine';
import { enrichPlatformResultsWithSavings } from './engine/priceEngine';
import {
  syncUserProfileToCloud,
  createDirectOrderInCloud,
  fetchUserOrdersFromCloud,
  syncPriceAlertToCloud,
} from './lib/supabase';
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

  const [activeTab, setActiveTab] = useState<
    'home' | 'direct' | 'quickmart' | 'search' | 'restaurants' | 'rewards' | 'profile' | 'admin'
  >('home');
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

  // New UPI Payment, Tracking & Receipt Modals state
  const [isUPIModalOpen, setIsUPIModalOpen] = useState(false);
  const [pendingCheckoutItems, setPendingCheckoutItems] = useState<CartItem[]>([]);
  const [pendingCheckoutTotal, setPendingCheckoutTotal] = useState(0);

  const [activeTrackingOrder, setActiveTrackingOrder] = useState<OrderRecord | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const [activeReceiptOrder, setActiveReceiptOrder] = useState<OrderRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const [breakdownPlatform, setBreakdownPlatform] = useState<PlatformResult | null>(null);
  const [breakdownProductName, setBreakdownProductName] = useState('');

  const [historyProduct, setHistoryProduct] = useState<ProductComparisonItem | null>(null);
  const [alertProduct, setAlertProduct] = useState<ProductComparisonItem | null>(null);

  const [isDealBotOpen, setIsDealBotOpen] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);

  const [redirectingPlatform, setRedirectingPlatform] = useState<{
    platform: PlatformResult;
    productName: string;
  } | null>(null);

  // Persistent User Profile with Cart & Order History Database
  const [userProfile, setUserProfile] = useState<UserProfileType>(() => {
    const saved = localStorage.getItem('pricebite_user_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
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

  // Filter products based on active PIN code and optional category query
  const handleSearchWithDataset = (query: string, sourceDataset: ProductComparisonItem[]) => {
    setSearchQuery(query);
    if (!query || query.trim() === '') {
      setSearchResults(sourceDataset);
      return;
    }

    const q = query.trim();

    // Evaluate every candidate product through the Hybrid Semantic-Lexical Engine
    const evaluated = sourceDataset
      .map((item) => {
        const matchEval = evaluateProductMatch(
          q,
          item.name,
          item.restaurantOrBrand,
          item.quantity,
          item.category,
          item.description
        );

        const enrichedPlatforms = enrichPlatformResultsWithSavings(item.platformResults);

        return {
          ...item,
          matchType: matchEval.matchType,
          matchScore: matchEval.matchScore,
          matchNotes: matchEval.matchNotes,
          semanticSimilarity: matchEval.semanticSimilarity,
          lexicalSimilarity: matchEval.lexicalSimilarity,
          portionCongruence: matchEval.portionCongruence,
          detectedSynonyms: matchEval.detectedSynonyms,
          platformResults: enrichedPlatforms,
        };
      })
      .filter((item) => item.matchType !== 'DIFFERENT' || item.matchScore >= 40)
      .sort((a, b) => b.matchScore - a.matchScore);

    setSearchResults(evaluated);
  };

  // Re-calculate datasets whenever PIN code changes
  useEffect(() => {
    const freshProducts = getProductsForLocation(currentPinDetails);
    const freshRestaurants = getRestaurantsForLocation(currentPinDetails);

    setProductsForLocation(freshProducts);
    setRestaurantsForLocation(freshRestaurants);

    // Re-evaluate active search with new location PIN context
    handleSearchWithDataset(searchQuery, freshProducts);
  }, [currentPinDetails, searchQuery]);

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

  // Initiate Payment Gateway Flow from Cart
  const handleInitiatePayment = (items: CartItem[], totalAmount: number) => {
    setPendingCheckoutItems(items);
    setPendingCheckoutTotal(totalAmount);
    setIsCartOpen(false);
    setIsUPIModalOpen(true);
  };

  // Handle successful UPI payment completion & launch live tracker
  const handlePaymentSuccess = (details: {
    transactionId: string;
    paymentMethod: string;
    amount: number;
    items: CartItem[];
    deliveryPinCode: string;
  }) => {
    const newOrder: OrderRecord = {
      id: details.transactionId.replace('UPI-PB-', ''),
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: details.items,
      totalAmount: details.amount,
      status: 'In Transit',
      deliveryPinCode: currentPinDetails?.pinCode || details.deliveryPinCode || '110001',
      deliveryAddress: currentPinDetails
        ? `${currentPinDetails.area}, ${currentPinDetails.district}`
        : 'Selected Delivery Location',
      paymentMethod: details.paymentMethod,
    };

    setUserProfile((prev) => ({
      ...prev,
      cart: [],
      pastOrders: [newOrder, ...prev.pastOrders],
      totalSavingsAmount: prev.totalSavingsAmount + 55,
    }));

    // Sync order live to Supabase Cloud Database!
    createDirectOrderInCloud({
      orderId: newOrder.id,
      userId: userProfile.email || 'guest-user',
      items: newOrder.items,
      totalAmount: newOrder.totalAmount,
      deliveryPinCode: newOrder.deliveryPinCode,
      deliveryAddress: newOrder.deliveryAddress,
      paymentMethod: newOrder.paymentMethod,
    });

    setActiveTrackingOrder(newOrder);
    setIsTrackingModalOpen(true);
  };

  const handleTrackOrder = (order: OrderRecord) => {
    setActiveTrackingOrder(order);
    setIsTrackingModalOpen(true);
  };

  const handleViewReceipt = (order: OrderRecord) => {
    setActiveReceiptOrder(order);
    setIsReceiptModalOpen(true);
  };

  // Auth Operations
  const handleLoginSuccess = async (name: string, email: string, phone: string) => {
    const cloudOrders = await fetchUserOrdersFromCloud(email);

    setUserProfile((prev) => {
      const mergedOrders: OrderRecord[] = [...prev.pastOrders];
      cloudOrders.forEach((co) => {
        if (!mergedOrders.some((mo) => mo.id === co.id)) {
          mergedOrders.push(co as OrderRecord);
        }
      });

      const updated = {
        ...prev,
        id: email,
        name,
        email,
        phone,
        isLoggedIn: true,
        pastOrders: mergedOrders,
      };

      syncUserProfileToCloud({
        id: email,
        name,
        email,
        phone,
        currentPinCode: prev.currentPinCode || currentPinDetails?.pinCode || '',
        totalSavings: prev.totalSavingsAmount,
      });

      return updated;
    });
  };

  const handleLogout = () => {
    setUserProfile({
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
    });
    localStorage.removeItem('pricebite_user_db');
  };

  const handleSaveAlert = (targetPrice: number) => {
    if (!alertProduct) return;
    const newAlert = {
      id: `alert-${Date.now()}`,
      productId: alertProduct.id,
      productName: alertProduct.name,
      targetPrice,
      currentLowestPrice: alertProduct.platformResults[0].priceBreakdown.finalPayablePrice,
      pinCode: currentPinDetails?.pinCode || 'Pan-India',
      createdAt: new Date().toISOString(),
      active: true,
    };

    setUserProfile((prev) => ({
      ...prev,
      alerts: [...prev.alerts, newAlert],
    }));

    if (userProfile.email) {
      syncPriceAlertToCloud({
        userId: userProfile.email,
        productId: newAlert.productId,
        productName: newAlert.productName,
        targetPrice: newAlert.targetPrice,
        currentLowestPrice: newAlert.currentLowestPrice,
        pinCode: newAlert.pinCode,
      });
    }

    setAlertProduct(null);
  };

  const handleRemoveAlert = (alertId: string) => {
    setUserProfile((prev) => ({
      ...prev,
      alerts: prev.alerts.filter((a) => a.id !== alertId),
    }));
  };

  const handleOrderRedirect = (platform: PlatformResult, productName: string) => {
    if (platform.isDirectAppOrder) {
      const found = productsForLocation.find((p) => p.name === productName);
      if (found) {
        handleAddToCart(found, platform);
        return;
      }
    }
    setRedirectingPlatform({ platform, productName });
  };

  const handleExecutePlatformRedirect = (orderUrl: string) => {
    window.open(orderUrl, '_blank', 'noopener,noreferrer');
    setRedirectingPlatform(null);
  };

  const cartTotalItems = userProfile.cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        themeMode === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Universal Top Navigation */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        currentPinCode={currentPinDetails?.pinCode || ''}
        pinArea={currentPinDetails ? `${currentPinDetails.area}, ${currentPinDetails.district}` : ''}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab as any)}
        onOpenDealBot={() => setIsDealBotOpen(true)}
        onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
        totalSavings={userProfile.totalSavingsAmount}
        cartItemCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        userProfile={userProfile}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenDealsModal={() => setActiveTab('search')}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="space-y-12">
            <HeroSearch
              currentLang={currentLang}
              currentPinCode={currentPinDetails?.pinCode || ''}
              pinArea={currentPinDetails ? `${currentPinDetails.area}, ${currentPinDetails.district}` : ''}
              onOpenPinModal={() => setIsPinModalOpen(true)}
              onSearch={handleSearch}
              onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
              onSelectCategory={(cat) => handleSearch(cat)}
            />

            <TrendingDeals
              products={productsForLocation}
              currentLang={currentLang}
              onSelectProduct={(product: ProductComparisonItem) => {
                setSearchResults([product]);
                setActiveTab('search');
              }}
              themeMode={themeMode}
            />
          </div>
        )}

        {activeTab === 'direct' && (
          <PriceBiteDirectHub
            currentPinDetails={currentPinDetails}
            currentLang={currentLang}
            onOpenPinModal={() => setIsPinModalOpen(true)}
            themeMode={themeMode}
            userProfile={userProfile}
          />
        )}

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  {searchQuery ? `Comparison Results for "${searchQuery}"` : 'Pan-India Platform Price Comparison'}
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
                  <p className="text-xs text-slate-400">
                    Try searching for "Biryani", "Pizza", "Amul Milk", "KFC", "Burger", or "Momos"
                  </p>
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
              currentPinDetails={currentPinDetails}
              onOpenPinModal={() => setIsPinModalOpen(true)}
              onSelectRestaurant={(restaurant) => {
                const cleanQuery = restaurant.name.split('(')[0].split('-')[0].trim();
                handleSearch(cleanQuery);
                setActiveTab('search');
              }}
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
            onReorderItem={() => {
              const mockProd = productsForLocation[0];
              const plat = mockProd.platformResults[0];
              handleAddToCart(mockProd, plat);
            }}
            onTrackOrder={handleTrackOrder}
            onViewReceipt={handleViewReceipt}
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
        onInitiatePayment={handleInitiatePayment}
        currentPinDetails={currentPinDetails}
        themeMode={themeMode}
      />

      {/* UPI Payment Gateway Modal */}
      <UPIPaymentModal
        isOpen={isUPIModalOpen}
        onClose={() => setIsUPIModalOpen(false)}
        totalAmount={pendingCheckoutTotal}
        items={pendingCheckoutItems}
        currentPinDetails={currentPinDetails}
        onPaymentSuccess={handlePaymentSuccess}
        themeMode={themeMode}
      />

      {/* Real-time Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        order={activeTrackingOrder}
        currentPinDetails={currentPinDetails}
        onViewReceipt={(order) => {
          setIsTrackingModalOpen(false);
          handleViewReceipt(order);
        }}
        themeMode={themeMode}
      />

      {/* Official Digital Tax Invoice / Receipt Modal */}
      <OrderReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        order={activeReceiptOrder}
        currentPinDetails={currentPinDetails}
        onReorder={(items) => {
          if (items.length > 0) {
            const mockProd = productsForLocation[0];
            const plat = mockProd.platformResults[0];
            handleAddToCart(mockProd, plat);
          }
        }}
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
        onSaveAlert={(_prodId, targetPrice) => handleSaveAlert(targetPrice)}
      />

      <DealBotWidget
        isOpen={isDealBotOpen}
        onClose={() => setIsDealBotOpen(false)}
        currentLang={currentLang}
        currentPinDetails={currentPinDetails}
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
          <div
            className={`border rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative ${
              themeMode === 'light'
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}
          >
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

            <div
              className={`p-4 rounded-2xl border text-left text-xs space-y-2 ${
                themeMode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2 text-emerald-500 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Verified Direct Deep Link Active</span>
              </div>
              <p className="text-slate-400">
                PriceBite is opening the official dish page on {redirectingPlatform.platform.platformName}
                {currentPinDetails
                  ? ` for delivery to 📍 ${currentPinDetails.area}, ${currentPinDetails.district} (${currentPinDetails.pinCode})`
                  : ''}
                .
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
