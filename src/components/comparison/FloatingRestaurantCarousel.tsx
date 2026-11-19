import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RestaurantComparison, LanguageCode, ThemeMode, PINCodeDetails } from '../../types';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Search,
  Clock,
  ArrowRight,
  ShieldCheck,
  Percent,
  Utensils,
  CheckCircle2,
} from 'lucide-react';
import { getTranslation } from '../../i18n';

interface FloatingRestaurantCarouselProps {
  restaurants: RestaurantComparison[];
  currentLang: LanguageCode;
  themeMode?: ThemeMode;
  currentPinDetails?: PINCodeDetails | null;
  onOpenPinModal?: () => void;
  onSelectRestaurant?: (restaurant: RestaurantComparison) => void;
}

export const FloatingRestaurantCarousel: React.FC<FloatingRestaurantCarouselProps> = ({
  restaurants,
  currentLang,
  themeMode = 'dark',
  currentPinDetails,
  onOpenPinModal,
  onSelectRestaurant,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'fastest' | 'rating' | 'cost_low'>('recommended');

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isLight = themeMode === 'light';

  // Extract unique categories from actual restaurants
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    restaurants.forEach((r) => {
      if (r.category) cats.add(r.category);
    });
    return ['All', ...Array.from(cats)];
  }, [restaurants]);

  // Filtered & sorted list of ALL restaurants available in this PIN code
  const filteredRestaurants = useMemo(() => {
    let list = [...restaurants];

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          (r.category && r.category.toLowerCase().includes(q)) ||
          (r.featuredDishes && r.featuredDishes.some((d) => d.toLowerCase().includes(q)))
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Pure Veg & Thalis') {
        list = list.filter((r) => r.isPureVeg || (r.category && r.category.includes('Veg')));
      } else {
        list = list.filter((r) => r.category === selectedCategory);
      }
    }

    // 3. Sorting
    if (sortBy === 'fastest') {
      list.sort((a, b) => {
        const timeA = a.availablePlatforms[0]?.deliveryTimeMinutes || 99;
        const timeB = b.availablePlatforms[0]?.deliveryTimeMinutes || 99;
        return timeA - timeB;
      });
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'cost_low') {
      list.sort((a, b) => {
        const costA = a.availablePlatforms[0]?.avgCostForTwo || 999;
        const costB = b.availablePlatforms[0]?.avgCostForTwo || 999;
        return costA - costB;
      });
    }

    return list;
  }, [restaurants, searchQuery, selectedCategory, sortBy]);

  // Top 10 for featured accordion carousel
  const topFeatured = useMemo(() => restaurants.slice(0, 10), [restaurants]);

  // Auto-rotate accordion carousel
  useEffect(() => {
    if (isPaused || topFeatured.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % topFeatured.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, topFeatured.length]);

  // Smooth scroll active card in accordion into view internally
  useEffect(() => {
    const activeEl = cardRefs.current[activeIndex];
    const container = containerRef.current;
    if (activeEl && container) {
      const cardLeft = activeEl.offsetLeft;
      const cardWidth = activeEl.offsetWidth;
      const containerWidth = container.offsetWidth;
      container.scrollTo({
        left: cardLeft - containerWidth / 2 + cardWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % topFeatured.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + topFeatured.length) % topFeatured.length);
  };

  const areaLabel = currentPinDetails
    ? `${currentPinDetails.area}, ${currentPinDetails.district}`
    : 'All-India Metro Hub';
  const pinCode = currentPinDetails?.pinCode || '';
  const zoneTag = restaurants[0]?.zoneTag || 'Hyperlocal Delivery Zone';

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ========================================================================= */}
      {/* 1. HYPERLOCAL ACTIVE DELIVERY ZONE BANNER                                 */}
      {/* ========================================================================= */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
          isLight
            ? 'bg-gradient-to-r from-orange-50 via-amber-50/50 to-white border-orange-200'
            : 'bg-gradient-to-r from-slate-900 via-orange-950/20 to-slate-900 border-orange-500/30'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide uppercase bg-orange-500 text-white shadow-sm">
                📍 {zoneTag}
              </span>
              <span className={`text-xs font-semibold flex items-center space-x-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Hyperlocal Geo-Mapped</span>
              </span>
            </div>

            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              Restaurants Delivering to {areaLabel} {pinCode && <span className="text-orange-500">({pinCode})</span>}
            </h1>

            <p className={`text-xs sm:text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Showing <span className="font-bold text-orange-500">{filteredRestaurants.length}</span> authentic local restaurants & national QSRs currently serving this PIN code.
            </p>
          </div>

          {/* Quick PIN Code Switcher Button */}
          {onOpenPinModal && (
            <button
              onClick={onOpenPinModal}
              className="flex-shrink-0 flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <MapPin className="w-4 h-4 fill-slate-950" />
              <span>Change PIN Code / City</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & FILTER CONTROLS                                               */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${areaLabel.split(',')[0]} (e.g. Biryani, KFC, Dosa, Arsalan)...`}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                  : 'bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500'
              }`}
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2">
            <label className={`text-xs font-bold whitespace-nowrap ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`px-3 py-3 rounded-2xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-slate-900 border-slate-800 text-slate-100'
              }`}
            >
              <option value="recommended">⭐ Recommended (Top Picks)</option>
              <option value="fastest">⚡ Fastest Delivery (Under 20m)</option>
              <option value="rating">🏆 Top Rated (4.8+)</option>
              <option value="cost_low">💰 Budget-Friendly (Cost for 2)</option>
            </select>
          </div>
        </div>

        {/* Cuisine Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
          {availableCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20 scale-105'
                    : isLight
                    ? 'bg-white border border-slate-200 text-slate-700 hover:border-orange-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TRENDING SPOTLIGHT ACCORDION CAROUSEL (Top Picks in Area)             */}
      {/* ========================================================================= */}
      {topFeatured.length > 0 && selectedCategory === 'All' && !searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black">
                ✨
              </div>
              <h2 className={`text-lg sm:text-xl font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                {getTranslation('trendingRestaurants', currentLang)} Spotlight
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrev}
                className={`p-2 rounded-xl border transition-all hover:scale-105 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:text-orange-500'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-orange-400'
                }`}
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className={`p-2 rounded-xl border transition-all hover:scale-105 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:text-orange-500'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-orange-400'
                }`}
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={containerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="overflow-x-auto scrollbar-none py-2 px-1 flex space-x-4 scroll-smooth"
          >
            {topFeatured.map((rest, index) => {
              const isExpanded = index === activeIndex;

              return (
                <div
                  key={rest.id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  className={`accordion-card-item flex-shrink-0 border-2 rounded-3xl p-5 shadow-2xl cursor-pointer relative transition-all duration-500 ${
                    isLight
                      ? isExpanded
                        ? 'w-[350px] sm:w-[460px] bg-white border-orange-500 shadow-orange-500/10'
                        : 'w-[150px] sm:w-[180px] bg-white border-slate-200 hover:border-slate-300 opacity-90'
                      : isExpanded
                      ? 'w-[350px] sm:w-[460px] bg-slate-900 border-orange-500 shadow-orange-500/20'
                      : 'w-[150px] sm:w-[180px] bg-slate-900 border-slate-800/90 hover:border-slate-700 opacity-80'
                  }`}
                >
                  {isExpanded ? (
                    <div className="space-y-4 animate-fade-in">
                      <div className={`flex items-start justify-between space-x-3 border-b pb-3 ${
                        isLight ? 'border-slate-100' : 'border-slate-800'
                      }`}>
                        <div className="flex items-center space-x-3 truncate">
                          <img
                            src={rest.imageUrl}
                            alt={rest.name}
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border shadow-md flex-shrink-0 ${
                              isLight ? 'border-slate-200' : 'border-slate-800'
                            }`}
                          />
                          <div className="truncate">
                            <div className="flex items-center space-x-1.5 truncate">
                              <h3 className={`text-base sm:text-lg font-black truncate ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                                {rest.name}
                              </h3>
                              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            </div>
                            <p className={`text-xs font-medium truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              {rest.cuisine}
                            </p>
                            <div className="flex items-center space-x-2 text-xs font-bold text-amber-500 mt-0.5">
                              <div className="flex items-center space-x-1">
                                <Star className="w-3.5 h-3.5 fill-amber-500" />
                                <span>{rest.rating}</span>
                              </div>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400 flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-orange-400" />
                                <span>{rest.availablePlatforms[0]?.deliveryTimeMinutes || 15} mins</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-emerald-950/90 border border-emerald-500/50 p-2.5 rounded-2xl flex items-center justify-between shadow-inner">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                          🏆 Best Price Platform
                        </span>
                        <span className="text-xs font-black text-slate-100 capitalize">
                          {rest.cheapestPlatformId === 'pricebite' ? '⚡ PriceBite Direct' : `${rest.cheapestPlatformId} Official`}
                        </span>
                      </div>

                      {/* Side-by-side Platform Price Matrix */}
                      <div className="space-y-2 pt-1">
                        {rest.availablePlatforms.map((p) => {
                          const isCheapest = p.platformId === rest.cheapestPlatformId;
                          const isPriceBite = p.platformId === 'pricebite';

                          return (
                            <div
                              key={p.platformId}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                isPriceBite
                                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-orange-500/80 font-bold'
                                  : isCheapest
                                  ? 'bg-emerald-950/40 border-emerald-500/50'
                                  : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-base">{p.platformLogo}</span>
                                <span className={`font-extrabold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                                  {p.platformName}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-black text-amber-500 block">₹{p.avgCostForTwo}</span>
                                <span className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                  {p.hasFreeDelivery ? 'FREE Delivery' : `₹${p.deliveryFee} Del`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {onSelectRestaurant && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRestaurant(rest);
                          }}
                          className="w-full mt-2 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md"
                        >
                          <span>Compare All Dishes From {rest.name.split(' ')[0]}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-between space-y-3 py-1 text-center items-center">
                      <img
                        src={rest.imageUrl}
                        alt={rest.name}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border shadow-md mx-auto ${
                          isLight ? 'border-slate-200' : 'border-slate-800'
                        }`}
                      />
                      <div className="space-y-1">
                        <h4 className={`text-xs font-black line-clamp-2 leading-tight ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                          {rest.name}
                        </h4>
                        <div className="flex items-center justify-center space-x-1 text-[11px] font-bold text-amber-500">
                          <Star className="w-3 h-3 fill-amber-500" />
                          <span>{rest.rating}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. COMPLETE HYPERLOCAL RESTAURANT DIRECTORY (Every Restaurant in PIN)    */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-orange-500" />
            <h2 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              All Restaurants Delivering to {pinCode || areaLabel.split(',')[0]}
            </h2>
          </div>
          <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {filteredRestaurants.length} Available Outlets
          </span>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <Utensils className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-40" />
            <h3 className={`text-lg font-black mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              No restaurants match "{searchQuery}"
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try searching for common dishes like Biryani, Pizza, Momos, or select "All" cuisines above.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-xl bg-orange-500 text-slate-950 font-black text-xs hover:bg-orange-600 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((rest) => {
              const directPlatform = rest.availablePlatforms.find((p) => p.platformId === 'pricebite');
              const swiggyPlatform = rest.availablePlatforms.find((p) => p.platformId === 'swiggy');
              const zomatoPlatform = rest.availablePlatforms.find((p) => p.platformId === 'zomato');

              const savings = (swiggyPlatform?.avgCostForTwo || 400) - (directPlatform?.avgCostForTwo || 320);

              return (
                <div
                  key={rest.id}
                  className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    isLight
                      ? 'bg-white border-slate-200 hover:border-orange-400'
                      : 'bg-slate-900/95 border-slate-800 hover:border-orange-500/60'
                  }`}
                >
                  {/* Top Image + Badges */}
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={rest.imageUrl}
                      alt={rest.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      {rest.isDirectPartner ? (
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md">
                          ⚡ PriceBite Direct Partner
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-900/80 text-slate-200 backdrop-blur-sm">
                          📍 {rest.area}
                        </span>
                      )}

                      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-950/90 text-amber-400 font-black text-xs backdrop-blur-md border border-amber-500/30">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rest.rating}</span>
                      </div>
                    </div>

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                      <span className="flex items-center space-x-1 bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                        <span>{directPlatform?.deliveryTimeMinutes || 15} mins delivery</span>
                      </span>
                      {rest.distanceKm && (
                        <span className="text-[11px] text-slate-300 bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                          {rest.distanceKm} km away
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`text-base font-black leading-snug line-clamp-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                          {rest.name}
                        </h3>
                        {rest.isPureVeg && (
                          <span className="text-[10px] font-black text-emerald-500 border border-emerald-500/40 px-1.5 py-0.5 rounded flex-shrink-0">
                            🌱 PURE VEG
                          </span>
                        )}
                      </div>

                      <p className={`text-xs mt-1 line-clamp-1 font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {rest.cuisine}
                      </p>

                      {/* Featured Signature Dishes */}
                      {rest.featuredDishes && rest.featuredDishes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {rest.featuredDishes.slice(0, 3).map((dish, i) => (
                            <span
                              key={i}
                              className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${
                                isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800/80 text-slate-300'
                              }`}
                            >
                              • {dish}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Live 3-Platform Comparison Bar */}
                    <div className={`p-3 rounded-2xl border space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pb-1 border-b border-slate-800/40">
                        <span>Platform Price (For 2)</span>
                        <span className="text-emerald-400">Save ₹{savings > 0 ? savings : 60}+</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        {/* Direct */}
                        <div className="p-1.5 rounded-xl bg-orange-500/10 border border-orange-500/40">
                          <span className="text-[10px] block font-extrabold text-orange-400">⚡ Direct</span>
                          <span className="font-black text-slate-100">₹{directPlatform?.avgCostForTwo || 280}</span>
                          <span className="text-[9px] block text-emerald-400">0% Fee</span>
                        </div>

                        {/* Swiggy */}
                        <div className={`p-1.5 rounded-xl border ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                          <span className="text-[10px] block font-bold text-slate-400">🧡 Swiggy</span>
                          <span className="font-bold text-slate-300">₹{swiggyPlatform?.avgCostForTwo || 340}</span>
                          <span className="text-[9px] block text-slate-500">+Fee</span>
                        </div>

                        {/* Zomato */}
                        <div className={`p-1.5 rounded-xl border ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                          <span className="text-[10px] block font-bold text-slate-400">🔴 Zomato</span>
                          <span className="font-bold text-slate-300">₹{zomatoPlatform?.avgCostForTwo || 360}</span>
                          <span className="text-[9px] block text-slate-500">+Fee</span>
                        </div>
                      </div>
                    </div>

                    {/* Active Offer Strip */}
                    <div className="flex items-center space-x-1.5 text-[11px] text-amber-500 font-bold truncate">
                      <Percent className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{directPlatform?.activeOffers[0] || 'Flat 15% Cashback on Direct Pay'}</span>
                    </div>

                    {/* Action Button */}
                    {onSelectRestaurant ? (
                      <button
                        onClick={() => onSelectRestaurant(rest)}
                        className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-98"
                      >
                        <span>Compare Dishes & Prices</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="text-[11px] text-center text-slate-500 font-medium">
                        Delivering directly to {pinCode || areaLabel.split(',')[0]}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
