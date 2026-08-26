import React, { useState, useEffect, useRef } from 'react';
import { RestaurantComparison, LanguageCode, ThemeMode } from '../../types';
import { Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { getTranslation } from '../../i18n';

interface FloatingRestaurantCarouselProps {
  restaurants: RestaurantComparison[];
  currentLang: LanguageCode;
  themeMode?: ThemeMode;
}

export const FloatingRestaurantCarousel: React.FC<FloatingRestaurantCarouselProps> = ({
  restaurants,
  currentLang,
  themeMode = 'dark',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isLight = themeMode === 'light';
  const activeRestaurants = restaurants.slice(0, 16);

  // Slow auto-rotate step-by-step every 4.5s for comfortable reading
  useEffect(() => {
    if (isPaused || activeRestaurants.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % activeRestaurants.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, activeRestaurants.length]);

  // Scroll container internally WITHOUT pulling the main page window down
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

  if (!restaurants || restaurants.length === 0) return null;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % activeRestaurants.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + activeRestaurants.length) % activeRestaurants.length);
  };

  return (
    <div className="space-y-4">
      {/* Clean Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-lg shadow-orange-500/20">
            🍔
          </div>
          <div>
            <h2 className={`text-xl sm:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              {getTranslation('trendingRestaurants', currentLang)}
            </h2>
          </div>
        </div>

        {/* Step Navigation Controls (1 Card Step per Click) */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrev}
            className={`p-2.5 rounded-2xl border transition-all hover:scale-110 shadow-lg active:scale-95 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:border-orange-500 hover:text-orange-500'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-orange-500/80 hover:text-orange-400'
            }`}
            title="Previous Restaurant"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className={`p-2.5 rounded-2xl border transition-all hover:scale-110 shadow-lg active:scale-95 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:border-orange-500 hover:text-orange-500'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-orange-500/80 hover:text-orange-400'
            }`}
            title="Next Restaurant"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 🌟 ACCORDION SLIDER CAROUSEL */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="overflow-x-auto scrollbar-none py-6 px-2 flex space-x-4 scroll-smooth"
      >
        {activeRestaurants.map((rest, index) => {
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
                /* 🌟 EXPANDED CARD VIEW (Full Menu Details & Price Matrix) */
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
                        <div className="flex items-center space-x-1 text-xs font-bold text-amber-500 mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{rest.rating} Rating</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-950/90 border border-emerald-500/50 p-2.5 rounded-2xl flex items-center justify-between shadow-inner">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                      🏆 Cheapest Deal
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
                              {p.hasFreeDelivery ? 'FREE Del' : `₹${p.deliveryFee} Del`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* 🌟 COLLAPSED CARD VIEW */
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
  );
};
