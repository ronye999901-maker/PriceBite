import React from 'react';
import { PlatformResult, ProductComparisonItem, LanguageCode } from '../../types';
import { ExternalLink, Info, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { getTranslation } from '../../i18n';

interface PlatformPriceTableProps {
  product: ProductComparisonItem;
  currentLang: LanguageCode;
  onOpenBreakdown: (platform: PlatformResult) => void;
  onRedirectOrder: (platform: PlatformResult) => void;
}

export const PlatformPriceTable: React.FC<PlatformPriceTableProps> = ({
  product,
  currentLang,
  onOpenBreakdown,
  onRedirectOrder,
}) => {
  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
      <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <span>{getTranslation('fullBreakdownTable', currentLang)}</span>
        </h4>
        <span className="text-[10px] text-slate-500 font-semibold">
          Final prices include product cost, packaging, delivery, fees & taxes
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Platform</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">ETA</th>
              <th className="py-3 px-4">Item Price</th>
              <th className="py-3 px-4">Discounts & Coupons</th>
              <th className="py-3 px-4">Fees & Taxes</th>
              <th className="py-3 px-4 text-right">Final Payable</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {product.platformResults.map((result) => {
              const isCheapest = result.platformId === product.cheapestPlatformId;
              const isPriceBite = result.platformId === 'pricebite';
              const pb = result.priceBreakdown;

              return (
                <tr
                  key={result.platformId}
                  className={`hover:bg-slate-900/60 transition-colors ${
                    isPriceBite
                      ? 'bg-orange-500/10 font-semibold'
                      : isCheapest
                      ? 'bg-emerald-950/20'
                      : ''
                  }`}
                >
                  {/* Platform Name & Logo */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xl">{result.platformLogo}</span>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-extrabold text-slate-100">{result.platformName}</span>
                          {isPriceBite && (
                            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.2 rounded">
                              Direct Store
                            </span>
                          )}
                          {isCheapest && !isPriceBite && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border border-emerald-500/30">
                              Cheapest
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          {isPriceBite ? 'In-App 1-Click Order' : 'App Redirection'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1 text-slate-200">
                      <span className="text-amber-400 font-bold">★ {result.rating}</span>
                      <span className="text-[10px] text-slate-500">({(result.ratingCount / 1000).toFixed(1)}k)</span>
                    </div>
                  </td>

                  {/* ETA */}
                  <td className="py-3.5 px-4 text-slate-300 font-semibold">
                    {result.deliveryTimeMinutes} mins
                  </td>

                  {/* Base Price */}
                  <td className="py-3.5 px-4 text-slate-300">
                    ₹{pb.basePrice}
                  </td>

                  {/* Discounts & Coupons */}
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                    -₹{pb.discount + pb.couponDiscount + pb.bankDiscount}
                    {result.appliedCoupons && result.appliedCoupons.length > 0 && (
                      <span className="text-[9px] text-slate-400 block font-normal">
                        ({result.appliedCoupons.join(', ')})
                      </span>
                    )}
                  </td>

                  {/* Fees & Taxes */}
                  <td className="py-3.5 px-4 text-slate-400">
                    +₹{pb.deliveryFee + pb.platformFee + pb.packagingFee + pb.taxes}
                    <span className="text-[9px] text-slate-500 block">
                      Del: ₹{pb.deliveryFee} | Fee: ₹{pb.platformFee}
                    </span>
                  </td>

                  {/* Final Payable Price */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="text-base font-black text-amber-400">
                      ₹{pb.finalPayablePrice}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      Effective: ₹{pb.effectiveCost}
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onOpenBreakdown(result)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="View Detailed Itemized Breakdown"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      {isPriceBite ? (
                        <button
                          onClick={() => onRedirectOrder(result)}
                          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-black shadow-md transition-all hover:scale-105 flex items-center space-x-1"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Order In-App</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onRedirectOrder(result)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-orange-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                        >
                          <span>{result.platformName.includes('Swiggy') ? 'Swiggy' : result.platformName.includes('Zomato') ? 'Zomato' : 'App'} ↗</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
