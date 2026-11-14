import React, { useState } from 'react';
import { ProductComparisonItem, PlatformResult, LanguageCode } from '../../types';
import { ProductMatchBadge } from './ProductMatchBadge';
import { SmartRecommendationTabs } from './SmartRecommendationTabs';
import { PlatformPriceTable } from './PlatformPriceTable';
import { computeRecommendations, runTOPSISAnalysis, DecisionPersona } from '../../engine/recommendationEngine';
import { TOPSISProofModal } from './TOPSISProofModal';
import { getTranslation } from '../../i18n';
import { ExternalLink, ShoppingBag, ShieldCheck, Zap, Sparkles, TrendingDown, Clock, ChevronRight, Award } from 'lucide-react';

interface ProductCardProps {
  product: ProductComparisonItem;
  currentLang: LanguageCode;
  onOpenBreakdown: (platform: PlatformResult) => void;
  onRedirectOrder: (platform: PlatformResult) => void;
  onOpenPriceHistory: (product: ProductComparisonItem) => void;
  onOpenPriceAlert: (product: ProductComparisonItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currentLang,
  onOpenBreakdown,
  onRedirectOrder,
  onOpenPriceHistory,
  onOpenPriceAlert,
}) => {
  const [activeRecommendationTab, setActiveRecommendationTab] = useState('smartPick');
  const [activePersona, setActivePersona] = useState<DecisionPersona>('balanced');
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);

  // Compute multi-criteria TOPSIS analysis
  const topsisResult = runTOPSISAnalysis(product.platformResults, activePersona);
  const recommendations = computeRecommendations(product.platformResults, activePersona);
  const smartPickResult =
    product.platformResults.find((p) => p.platformId === topsisResult.smartPickId) ||
    product.platformResults[0];

  // Find cheapest, fastest, and PriceBite direct results
  const cheapestResult =
    product.platformResults.find((p) => p.platformId === product.cheapestPlatformId) ||
    product.platformResults[0];
  const pricebiteResult = product.platformResults.find((p) => p.platformId === 'pricebite');
  const swiggyResult = product.platformResults.find((p) => p.platformId === 'swiggy');
  const zomatoResult = product.platformResults.find((p) => p.platformId === 'zomato');

  const swiggyPrice = swiggyResult ? swiggyResult.priceBreakdown.finalPayablePrice : 227;
  const zomatoPrice = zomatoResult ? zomatoResult.priceBreakdown.finalPayablePrice : 259;
  const pbPrice = pricebiteResult ? pricebiteResult.priceBreakdown.finalPayablePrice : 197;

  const savingsVsSwiggy = Math.max(0, swiggyPrice - pbPrice);
  const savingsVsZomato = Math.max(0, zomatoPrice - pbPrice);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-slate-700/80">
      {/* Top Banner & Match Badge */}
      <div className="bg-slate-950/80 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <ProductMatchBadge
            matchType={product.matchType}
            matchScore={product.matchScore}
            matchNotes={product.matchNotes}
            semanticSimilarity={product.semanticSimilarity}
            lexicalSimilarity={product.lexicalSimilarity}
            portionCongruence={product.portionCongruence}
            detectedSynonyms={product.detectedSynonyms}
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenPriceHistory(product)}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full transition-all flex items-center space-x-1"
          >
            <span>📈 Price History</span>
          </button>
          <button
            onClick={() => onOpenPriceAlert(product)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full transition-all flex items-center space-x-1"
          >
            <span>🔔 Price Alert</span>
          </button>
          <button
            onClick={() => setIsProofModalOpen(true)}
            className="text-xs text-violet-400 hover:text-violet-300 font-bold bg-violet-500/10 border border-violet-500/30 px-3 py-1 rounded-full transition-all flex items-center space-x-1"
            title="View Multi-Criteria TOPSIS Mathematical Proof"
          >
            <span>📐 TOPSIS ({topsisResult.rankedEvaluations[0]?.topsisScorePercent || 90}%)</span>
          </button>
        </div>
      </div>

      {/* Main Product Overview */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Image & Details */}
          <div className="flex items-start space-x-4 sm:space-x-6">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-800 shadow-xl">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              {product.isVeg !== undefined && (
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black border ${product.isVeg ? 'bg-emerald-950 text-emerald-400 border-emerald-500' : 'bg-red-950 text-red-400 border-red-500'}`}>
                  {product.isVeg ? '🟢 VEG' : '🔴 NON-VEG'}
                </span>
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                  {product.category}
                </span>
                <span className="text-xs text-slate-400 font-semibold">• {product.restaurantOrBrand}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight leading-snug">
                {product.name}
              </h2>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {product.description}
              </p>

              <div className="flex items-center space-x-3 text-xs text-slate-300 font-bold pt-1">
                <span>Portion: {product.quantity}</span>
              </div>

              {/* Persona Selector Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 text-[10px]">
                <span className="text-slate-400 font-bold mr-0.5">MCDM Persona:</span>
                {[
                  { id: 'balanced', label: '🏆 Balanced' },
                  { id: 'budget', label: '🎓 Budget First' },
                  { id: 'speed', label: '⚡ Fast ETA' },
                  { id: 'quality', label: '⭐ Top Quality' },
                  { id: 'rewards', label: '🎁 Max Cashback' },
                ].map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => setActivePersona(persona.id as DecisionPersona)}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                      activePersona === persona.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {persona.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Best Recommendation Box */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 min-w-[270px] shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-amber-400 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Pick ({activePersona.toUpperCase()})</span>
              </span>
              <button
                onClick={() => setIsProofModalOpen(true)}
                className="bg-amber-500/20 text-amber-400 font-black text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 hover:bg-amber-500/30 font-mono"
                title="Open mathematical TOPSIS Euclidean proof"
              >
                TOPSIS {topsisResult.rankedEvaluations[0]?.topsisScorePercent || 92}%
              </button>
            </div>

            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-100">
                  ₹{smartPickResult.priceBreakdown.finalPayablePrice}
                </span>
                <span className="text-xs text-slate-400 font-bold">Payable</span>
              </div>
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                Effective Cost: ₹{smartPickResult.priceBreakdown.effectiveCost} (incl. Cashback)
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                <span>{smartPickResult.platformLogo}</span>
                <span>{smartPickResult.platformName}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-semibold flex items-center space-x-1">
                <Clock className="w-3 h-3 text-orange-400" />
                <span>{smartPickResult.deliveryTimeMinutes}m</span>
              </span>
            </div>
          </div>
        </div>

        {/* 🌟 DIRECT ORDER & APP COMPARISON HUB (PriceBite Direct vs Swiggy vs Zomato Side-by-Side) */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-100 flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-orange-400" />
                <span>Direct Order & Price Comparison Hub</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Compare Swiggy vs Zomato vs PriceBite Direct Store side-by-side for exact pricing:
              </p>
            </div>

            {savingsVsSwiggy > 0 && (
              <span className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-black px-3 py-1 rounded-full animate-pulse shadow-md">
                🔥 Save ₹{savingsVsSwiggy} vs Swiggy & ₹{savingsVsZomato} vs Zomato on PriceBite Direct!
              </span>
            )}
          </div>

          {/* 3 SIDE-BY-SIDE PLATFORM CARDS (PriceBite Direct, Swiggy, Zomato) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Card 1: PriceBite Direct Store (CHEAPEST IN-APP ORDER) */}
            {pricebiteResult && (
              <div
                onClick={() => onRedirectOrder(pricebiteResult)}
                className="bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-slate-900 border-2 border-orange-500/80 hover:border-amber-400 rounded-xl p-3.5 cursor-pointer transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/10 flex flex-col justify-between space-y-2 relative"
              >
                <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-md">
                  ★ Lowest Price
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xl">⚡</span>
                  <div>
                    <span className="text-xs font-black text-amber-300 block">PriceBite Direct</span>
                    <span className="text-[10px] text-slate-400 block">Order In-App (No Redirect)</span>
                  </div>
                </div>

                <div>
                  <span className="text-xl font-black text-amber-400 block">₹{pbPrice}</span>
                  <span className="text-[10px] text-emerald-400 font-bold block">₹0 Platform Fee • Express 15m</span>
                </div>

                <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black py-1.5 rounded-lg text-xs shadow-md">
                  Order In-App ⚡
                </button>
              </div>
            )}

            {/* Card 2: Swiggy */}
            {swiggyResult && (
              <div
                onClick={() => onRedirectOrder(swiggyResult)}
                className="bg-slate-900 border border-slate-800 hover:border-orange-500/60 rounded-xl p-3.5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🧡</span>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Swiggy</span>
                    <span className="text-[10px] text-slate-400 block">Swiggy App Redirect</span>
                  </div>
                </div>

                <div>
                  <span className="text-lg font-black text-slate-200 block">₹{swiggyPrice}</span>
                  <span className="text-[10px] text-slate-400 block">+₹6 Platform Fee • {swiggyResult.deliveryTimeMinutes}m</span>
                </div>

                <button className="w-full bg-slate-800 hover:bg-slate-700 text-orange-400 font-bold py-1.5 rounded-lg text-xs border border-slate-700">
                  Order on Swiggy App ↗
                </button>
              </div>
            )}

            {/* Card 3: Zomato */}
            {zomatoResult && (
              <div
                onClick={() => onRedirectOrder(zomatoResult)}
                className="bg-slate-900 border border-slate-800 hover:border-red-500/60 rounded-xl p-3.5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🔴</span>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Zomato</span>
                    <span className="text-[10px] text-slate-400 block">Zomato App Redirect</span>
                  </div>
                </div>

                <div>
                  <span className="text-lg font-black text-slate-200 block">₹{zomatoPrice}</span>
                  <span className="text-[10px] text-slate-400 block">+₹6 Platform Fee • {zomatoResult.deliveryTimeMinutes}m</span>
                </div>

                <button className="w-full bg-slate-800 hover:bg-slate-700 text-red-400 font-bold py-1.5 rounded-lg text-xs border border-slate-700">
                  Order on Zomato App ↗
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Smart Recommendation Filter Tabs */}
        <SmartRecommendationTabs
          activeTab={activeRecommendationTab}
          onSelectTab={setActiveRecommendationTab}
          recommendations={recommendations}
          currentLang={currentLang}
        />

        {/* Complete Multi-Platform Matrix Table */}
        <PlatformPriceTable
          product={product}
          currentLang={currentLang}
          onOpenBreakdown={onOpenBreakdown}
          onRedirectOrder={onRedirectOrder}
        />

        {/* Multi-Criteria TOPSIS Mathematical Proof Modal */}
        <TOPSISProofModal
          isOpen={isProofModalOpen}
          onClose={() => setIsProofModalOpen(false)}
          productName={product.name}
          topsisResult={topsisResult}
          onSelectPersona={(p) => setActivePersona(p)}
        />
      </div>
    </div>
  );
};
