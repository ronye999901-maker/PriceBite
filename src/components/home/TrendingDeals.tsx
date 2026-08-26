import React from 'react';
import { Flame, Clock, ArrowRight, Tag, Percent, Star } from 'lucide-react';
import { ProductComparisonItem, LanguageCode, ThemeMode } from '../../types';
import { getTranslation } from '../../i18n';

interface TrendingDealsProps {
  products: ProductComparisonItem[];
  currentLang: LanguageCode;
  onSelectProduct: (product: ProductComparisonItem) => void;
  themeMode?: ThemeMode;
}

export const TrendingDeals: React.FC<TrendingDealsProps> = ({
  products,
  currentLang,
  onSelectProduct,
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';

  // Top 10 Restaurants of the Week dataset
  const top10Restaurants = [
    { rank: 1, name: 'Arsalan & Royal Dum Biryani', cuisine: 'Mughlai & Biryani', rating: 4.9, orders: '28.4k+ orders this week', signatureDish: 'Special Chicken Dum Biryani', cheapPlatform: 'PriceBite Direct (⚡ ₹194)', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
    { rank: 2, name: 'KFC - Kentucky Fried Chicken', cuisine: 'American Crispy Chicken', rating: 4.8, orders: '24.1k+ orders this week', signatureDish: 'Hot & Crispy Chicken Bucket', cheapPlatform: 'PriceBite Direct (⚡ ₹410)', img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80' },
    { rank: 3, name: 'Chowman Chinese Wok', cuisine: 'Chinese & Pan-Asian', rating: 4.8, orders: '19.8k+ orders this week', signatureDish: 'Hakka Noodles & Chilli Chicken', cheapPlatform: 'PriceBite Direct (⚡ ₹260)', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80' },
    { rank: 4, name: "Domino's Pizza", cuisine: 'Italian Cheese Burst Pizza', rating: 4.7, orders: '18.2k+ orders this week', signatureDish: 'Pan Margherita Cheese Burst', cheapPlatform: 'Domino\'s Direct (🍕 ₹256)', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80' },
    { rank: 5, name: 'WOW! Momo & Chinese Wok', cuisine: 'Momos & Tibetan Wok', rating: 4.6, orders: '16.5k+ orders this week', signatureDish: 'Pan Fried Chicken Momos', cheapPlatform: 'PriceBite Direct (⚡ ₹140)', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80' },
    { rank: 6, name: 'Aminia Awadhi Biryani', cuisine: 'Awadhi & Kolkata Mughlai', rating: 4.7, orders: '14.9k+ orders this week', signatureDish: 'Awadhi Special Biryani', cheapPlatform: 'PriceBite Direct (⚡ ₹210)', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
    { rank: 7, name: 'Burger King Lounge', cuisine: 'Burgers & Whoppers', rating: 4.5, orders: '13.4k+ orders this week', signatureDish: 'Chicken Whopper Meal', cheapPlatform: 'PriceBite Direct (⚡ ₹199)', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80' },
    { rank: 8, name: 'Mainland China Gourmet', cuisine: 'Fine Dining Chinese', rating: 4.9, orders: '11.8k+ orders this week', signatureDish: 'Dimsum Platter & Fried Rice', cheapPlatform: 'PriceBite Direct (⚡ ₹450)', img: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80' },
    { rank: 9, name: 'Oudh 1590 Royal Dining', cuisine: 'Period Awadhi Biryani', rating: 4.9, orders: '10.6k+ orders this week', signatureDish: 'Raan Biryani & Kebabs', cheapPlatform: 'PriceBite Direct (⚡ ₹390)', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
    { rank: 10, name: 'Peter Cat Chelo Kebab', cuisine: 'Continental & Kebabs', rating: 4.9, orders: '9.8k+ orders this week', signatureDish: 'Original Chelo Kebab Sizzler', cheapPlatform: 'PriceBite Direct (⚡ ₹480)', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80' },
  ];

  // 50% and More Discount deals dataset
  const mega50DiscountDeals = [
    { id: 'deal-50-1', name: 'Chicken Dum Biryani + Soft Drink Combo', brand: 'Arsalan Biryani Hub', originalPrice: 420, dealPrice: 194, discountPct: '54% OFF', platform: 'PriceBite Direct ⚡', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
    { id: 'deal-50-2', name: 'Zinger Burger + Fries Mega Meal', brand: 'KFC Outlet', originalPrice: 390, dealPrice: 189, discountPct: '51% OFF', platform: 'PriceBite Direct ⚡', img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80' },
    { id: 'deal-50-3', name: 'Pan Fried Schezwan Momos (10 Pcs)', brand: 'WOW! Momo', originalPrice: 280, dealPrice: 135, discountPct: '52% OFF', platform: 'PriceBite Direct ⚡', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80' },
    { id: 'deal-50-4', name: 'Veg Hakka Noodles + Chilli Paneer Combo', brand: 'Chowman Wok', originalPrice: 440, dealPrice: 215, discountPct: '51% OFF', platform: 'PriceBite Direct ⚡', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80' },
  ];

  // ₹200 Rupee Off Super Deals dataset
  const rupee200OffDeals = [
    { id: 'deal-200-1', name: 'Hot & Crispy Bucket (8 Pcs)', brand: 'KFC Official', originalPrice: 750, dealPrice: 530, rupeeOff: 'Save Flat ₹220', platform: 'PriceBite Direct ⚡', img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80' },
    { id: 'deal-200-2', name: 'Mutton Pasanda & Special Dum Biryani', brand: 'Royal Indian Hotel', originalPrice: 680, dealPrice: 470, rupeeOff: 'Save Flat ₹210', platform: 'PriceBite Direct ⚡', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
    { id: 'deal-200-3', name: 'Cheese Burst Gourmet Party Pizza', brand: "Domino's Pizza", originalPrice: 650, dealPrice: 440, rupeeOff: 'Save Flat ₹210', platform: "Domino's Direct 🍕", img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80' },
    { id: 'deal-200-4', name: 'Family Chinese Feast (Noodles + Chicken)', brand: 'Chowman Gourmet', originalPrice: 850, dealPrice: 630, rupeeOff: 'Save Flat ₹220', platform: 'PriceBite Direct ⚡', img: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">

      {/* 1. 🔥 TODAY'S BEST DEALS & TOP SELLING FOODS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h2 className={`text-xl sm:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              {getTranslation('todaysDeals', currentLang)} & Top Selling Foods
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Most ordered dishes & effective price savings live right now
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((item) => {
            const cheapestPlatform = item.platformResults.find(
              (p) => p.platformId === item.cheapestPlatformId
            ) || item.platformResults[0];

            const highestPrice = Math.max(...item.platformResults.map((p) => p.priceBreakdown.finalPayablePrice));
            const savings = highestPrice - cheapestPlatform.priceBreakdown.finalPayablePrice;

            return (
              <div
                key={item.id}
                onClick={() => onSelectProduct(item)}
                className={`border rounded-2xl p-4 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 shadow-lg flex flex-col justify-between group ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-orange-500 hover:shadow-orange-500/10'
                    : 'bg-slate-900 border-slate-800/80 hover:border-orange-500/60 hover:shadow-orange-500/10'
                }`}
              >
                <div className="space-y-3">
                  {/* Image & Match Badge */}
                  <div className="relative h-40 rounded-xl overflow-hidden bg-slate-950">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 bg-emerald-950/90 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/40 backdrop-blur-md flex items-center space-x-1">
                      <span>🔥 Top Selling Dish</span>
                    </div>
                    {savings > 0 && (
                      <div className="absolute bottom-2 right-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-lg">
                        Save ₹{savings}
                      </div>
                    )}
                  </div>

                  {/* Title & Brand */}
                  <div>
                    <h3 className={`font-bold text-sm line-clamp-1 group-hover:text-orange-500 transition-colors ${
                      isLight ? 'text-slate-900' : 'text-slate-100'
                    }`}>
                      {item.name}
                    </h3>
                    <p className={`text-xs truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {item.restaurantOrBrand} • {item.quantity}
                    </p>
                  </div>
                </div>

                {/* Price & Platform Info */}
                <div className={`pt-3 border-t mt-3 space-y-2 ${isLight ? 'border-slate-100' : 'border-slate-800/80'}`}>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center space-x-1 text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                      <span className="text-base">{cheapestPlatform.platformLogo}</span>
                      <span>{cheapestPlatform.platformName}</span>
                    </div>
                    <span className={`text-xs flex items-center ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      <Clock className="w-3 h-3 mr-1 text-amber-500" />
                      {cheapestPlatform.deliveryTimeMinutes} min
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className={`text-xs line-through mr-1.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        ₹{highestPrice}
                      </span>
                      <span className="text-xl font-black text-amber-500">
                        ₹{cheapestPlatform.priceBreakdown.finalPayablePrice}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-orange-500 flex items-center group-hover:translate-x-1 transition-transform">
                      Compare <ArrowRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 🏆 TOP 10 RESTAURANTS OF THE WEEK SECTION */}
      <div className={`space-y-5 border rounded-3xl p-6 sm:p-8 backdrop-blur-sm ${
        isLight ? 'bg-white border-slate-200 shadow-lg' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className={`flex items-center space-x-3 border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xl border border-amber-500/30">
            🏆
          </div>
          <div>
            <h2 className={`text-xl sm:text-2xl font-black flex items-center space-x-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              <span>Top 10 Restaurants of the Week</span>
              <span className="bg-amber-500/20 text-amber-600 border border-amber-500/40 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                Weekly Leaderboard
              </span>
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Ranked by verified order volume & overall diner ratings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {top10Restaurants.map((rest) => (
            <div
              key={rest.rank}
              className={`border p-4 rounded-2xl flex items-center justify-between space-x-4 transition-all duration-300 hover:-translate-y-0.5 shadow-md group ${
                isLight ? 'bg-slate-50 border-slate-200 hover:border-amber-500' : 'bg-slate-950 border-slate-800 hover:border-amber-500/60'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                  rest.rank === 1
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : rest.rank === 2
                    ? 'bg-slate-300 text-slate-950'
                    : rest.rank === 3
                    ? 'bg-amber-700 text-slate-100'
                    : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                }`}>
                  #{rest.rank}
                </div>

                <img src={rest.img} alt={rest.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0" />

                <div className="truncate">
                  <h3 className={`font-extrabold text-sm group-hover:text-amber-500 transition-colors truncate ${
                    isLight ? 'text-slate-900' : 'text-slate-100'
                  }`}>
                    {rest.name}
                  </h3>
                  <p className={`text-[11px] truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {rest.signatureDish} • {rest.cuisine}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold block">{rest.orders}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="flex items-center justify-end space-x-1 text-xs font-black text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{rest.rating}</span>
                </div>
                <span className={`text-[10px] block mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {rest.cheapPlatform}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 💥 50% AND MORE DISCOUNT SECTION */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-xl sm:text-2xl font-black flex items-center space-x-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              <span>50% and More Mega Discounts</span>
              <span className="bg-orange-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                HALF PRICE
              </span>
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Unbeatable 50%+ price drop deals across food & restaurant outlets
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mega50DiscountDeals.map((deal) => (
            <div
              key={deal.id}
              className={`border rounded-2xl p-4 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 shadow-lg group space-y-3 ${
                isLight ? 'bg-white border-slate-200 hover:border-orange-500' : 'bg-slate-900 border-slate-800 hover:border-orange-500/60'
              }`}
            >
              <div className="relative h-36 rounded-xl overflow-hidden bg-slate-950">
                <img src={deal.img} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-lg">
                  💥 {deal.discountPct}
                </div>
              </div>

              <div>
                <h3 className={`font-extrabold text-sm line-clamp-1 group-hover:text-orange-500 transition-colors ${
                  isLight ? 'text-slate-900' : 'text-slate-100'
                }`}>
                  {deal.name}
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{deal.brand}</p>
              </div>

              <div className={`pt-2 border-t flex items-baseline justify-between ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                <div>
                  <span className={`text-xs line-through mr-1.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>₹{deal.originalPrice}</span>
                  <span className="text-lg font-black text-amber-500">₹{deal.dealPrice}</span>
                </div>
                <span className="text-[10px] font-extrabold text-orange-500">{deal.platform}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 💸 FLAT ₹200 RUPEE OFF SUPER DEALS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-xl sm:text-2xl font-black flex items-center space-x-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              <span>Flat ₹200 Rupee Off Super Deals</span>
              <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                BIG SAVINGS
              </span>
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              High-value family meal buckets & festive combos with ₹200+ price drop
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rupee200OffDeals.map((deal) => (
            <div
              key={deal.id}
              className={`border rounded-2xl p-4 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 shadow-lg group space-y-3 ${
                isLight ? 'bg-white border-slate-200 hover:border-emerald-500' : 'bg-slate-900 border-slate-800 hover:border-emerald-500/60'
              }`}
            >
              <div className="relative h-36 rounded-xl overflow-hidden bg-slate-950">
                <img src={deal.img} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute top-2 left-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-lg">
                  💸 {deal.rupeeOff}
                </div>
              </div>

              <div>
                <h3 className={`font-extrabold text-sm line-clamp-1 group-hover:text-emerald-500 transition-colors ${
                  isLight ? 'text-slate-900' : 'text-slate-100'
                }`}>
                  {deal.name}
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{deal.brand}</p>
              </div>

              <div className={`pt-2 border-t flex items-baseline justify-between ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                <div>
                  <span className={`text-xs line-through mr-1.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>₹{deal.originalPrice}</span>
                  <span className="text-lg font-black text-amber-500">₹{deal.dealPrice}</span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-500">{deal.platform}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
