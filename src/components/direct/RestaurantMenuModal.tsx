import React, { useEffect, useState } from 'react';
import { getMenuForRestaurant, MenuCategory } from '../../engine/menuEngine';
import { getRestaurantOffers, RestaurantOffer } from '../../engine/restaurantOffersEngine';
import { X, Star } from 'lucide-react';

/**
 * Full-screen modal that shows the restaurant name, promotional offer badges,
 * and the complete menu (categories → dishes), just like Swiggy / Zomato / Magicpin.
 */
export const RestaurantMenuModal: React.FC<{
  restaurantId: string;
  restaurantName: string;
  onClose: () => void;
}> = ({ restaurantId, restaurantName, onClose }) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [offers, setOffers] = useState<RestaurantOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [menu, restOffers] = await Promise.all([
        getMenuForRestaurant(restaurantId),
        getRestaurantOffers(restaurantId),
      ]);
      setCategories(menu);
      setOffers(restOffers);
      setLoading(false);
    })();
  }, [restaurantId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col">

        {/* ── Restaurant Header (name + offers) – like Swiggy/Zomato ── */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                {restaurantName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                PriceBite Direct Partner · 0% Extra Commission
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* ── Promotional Offer Badges – e.g. ₹200 off, 50% off ── */}
          {offers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {offers.map((off, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow"
                >
                  🏷️ {off.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Menu Body ── */}
        <div className="p-5 space-y-8">
          {loading ? (
            <div className="text-center py-16 text-slate-400 animate-pulse">Loading menu…</div>
          ) : (
            categories.map((cat) => (
              <section key={cat.id}>
                <h3 className="text-lg font-black text-slate-700 dark:text-slate-300 mb-3 pb-1 border-b border-slate-200 dark:border-slate-800">
                  {cat.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.dishes.map((dish) => (
                    <div
                      key={dish.id}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-4 bg-slate-50 dark:bg-slate-800/60 hover:border-orange-400 transition"
                    >
                      {dish.imageUrl && (
                        <img
                          src={dish.imageUrl}
                          alt={dish.name}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 leading-snug">
                          {dish.name}
                        </h4>
                        {dish.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {dish.description}
                          </p>
                        )}
                        {/* Price row */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-base font-black text-amber-600 dark:text-amber-400">
                            ₹{dish.price}
                          </span>
                          {dish.originalPrice && (
                            <span className="text-xs line-through text-slate-400">
                              ₹{dish.originalPrice}
                            </span>
                          )}
                        </div>
                        {/* Dish-level offer badges */}
                        {dish.offers && dish.offers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {dish.offers.map((off, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full"
                              >
                                {off.label}
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Add to cart button */}
                        <button className="mt-3 px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs hover:scale-105 transition-all shadow">
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
