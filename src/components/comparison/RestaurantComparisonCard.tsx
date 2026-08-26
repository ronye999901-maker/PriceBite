import React from 'react';
import { RestaurantComparison, LanguageCode } from '../../types';
import { Star, Clock, ShieldCheck, ArrowRight, Award } from 'lucide-react';
import { getTranslation } from '../../i18n';

interface RestaurantComparisonCardProps {
  restaurant: RestaurantComparison;
  currentLang: LanguageCode;
}

export const RestaurantComparisonCard: React.FC<RestaurantComparisonCardProps> = ({
  restaurant,
  currentLang,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-4">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-800"
          />
          <div>
            <h3 className="text-xl font-extrabold text-slate-100">{restaurant.name}</h3>
            <p className="text-xs text-slate-400">{restaurant.cuisine} • {restaurant.area}</p>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 mt-1">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{restaurant.rating} Rating</span>
            </div>
          </div>
        </div>

        <div className="bg-emerald-950/80 border border-emerald-500/40 p-3 rounded-2xl text-left sm:text-right">
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">
            🏆 Lowest Cost Platform
          </span>
          <span className="text-sm font-black text-slate-100 capitalize">
            {restaurant.cheapestPlatformId} Official
          </span>
        </div>
      </div>

      {/* Platform Comparison Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {restaurant.availablePlatforms.map((p) => {
          const isCheapest = p.platformId === restaurant.cheapestPlatformId;

          return (
            <div
              key={p.platformId}
              className={`p-4 rounded-2xl border transition-all ${
                isCheapest
                  ? 'bg-gradient-to-br from-emerald-950/60 to-slate-950 border-emerald-500/60 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{p.platformLogo}</span>
                  <span className="font-bold text-slate-100 text-sm">{p.platformName}</span>
                </div>
                {isCheapest && (
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded">
                    Cheapest
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Cost for Two:</span>
                  <span className="font-mono font-bold text-amber-400">₹{p.avgCostForTwo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Fee:</span>
                  <span className="font-mono">{p.hasFreeDelivery ? <strong className="text-emerald-400">FREE</strong> : `₹${p.deliveryFee}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Time:</span>
                  <span>{p.deliveryTimeMinutes} mins</span>
                </div>
              </div>

              {p.activeOffers.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-orange-400 font-medium space-y-1">
                  {p.activeOffers.map((offer) => (
                    <div key={offer} className="truncate">🏷️ {offer}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
