import React from 'react';
import { PlatformResult, LanguageCode } from '../../types';
import { CheckCircle2, ShieldCheck, X, Zap, Smartphone } from 'lucide-react';
import { getTranslation } from '../../i18n';

interface PriceBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  platformResult: PlatformResult | null;
  productName: string;
  currentLang: LanguageCode;
  onRedirectOrder: (platform: PlatformResult) => void;
}

export const PriceBreakdownModal: React.FC<PriceBreakdownModalProps> = ({
  isOpen,
  onClose,
  platformResult,
  productName,
  currentLang,
  onRedirectOrder,
}) => {
  if (!isOpen || !platformResult) return null;

  const pb = platformResult.priceBreakdown;
  const isPriceBite = platformResult.platformId === 'pricebite';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-2xl border border-orange-500/30">
            {platformResult.platformLogo}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-100">{platformResult.platformName}</h3>
            <p className="text-xs text-slate-400">Itemized Fee & Price Breakdown for "{productName}"</p>
          </div>
        </div>

        {/* Itemized Price Breakdown Stack */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-3">
          <div className="flex justify-between items-center text-slate-300">
            <span>Advertised Item Price:</span>
            <span className="font-bold text-slate-100">₹{pb.basePrice}</span>
          </div>

          <div className="flex justify-between items-center text-emerald-400">
            <span>Platform Discount:</span>
            <span className="font-bold">-₹{pb.discount}</span>
          </div>

          {pb.couponDiscount > 0 && (
            <div className="flex justify-between items-center text-emerald-400">
              <span>Coupon Discount:</span>
              <span className="font-bold">-₹{pb.couponDiscount}</span>
            </div>
          )}

          {pb.bankDiscount > 0 && (
            <div className="flex justify-between items-center text-emerald-400">
              <span>Bank Offer Discount:</span>
              <span className="font-bold">-₹{pb.bankDiscount}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-400">
            <span>Packaging & Container Charge:</span>
            <span>+₹{pb.packagingFee}</span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>Delivery Charge:</span>
            <span>+₹{pb.deliveryFee}</span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>Platform Fee:</span>
            <span>+₹{pb.platformFee}</span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>Taxes & GST (5%):</span>
            <span>+₹{pb.taxes}</span>
          </div>

          <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm font-black text-slate-100">
            <span>Final Payable Price:</span>
            <span className="text-amber-400 text-base">₹{pb.finalPayablePrice}</span>
          </div>

          {pb.cashback > 0 && (
            <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/30 flex justify-between items-center text-emerald-300 font-bold">
              <span>Wallet Cashback / Rewards:</span>
              <span>-₹{pb.cashback}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs font-black text-emerald-400 pt-1">
            <span>True Effective Cost:</span>
            <span>₹{pb.effectiveCost}</span>
          </div>
        </div>

        {/* Applied Offers list */}
        {((platformResult.appliedCoupons?.length ?? 0) > 0 || (platformResult.appliedBankOffers?.length ?? 0) > 0) && (
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Applied Promotions</span>
            {platformResult.appliedCoupons?.map((c) => (
              <span key={c} className="inline-block bg-orange-500/20 text-orange-300 font-bold text-[10px] px-2 py-0.5 rounded border border-orange-500/30 mr-1.5">
                🏷️ {c}
              </span>
            ))}
            {platformResult.appliedBankOffers?.map((b) => (
              <span key={b} className="inline-block bg-cyan-500/20 text-cyan-300 font-bold text-[10px] px-2 py-0.5 rounded border border-cyan-500/30 mr-1.5">
                💳 {b}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => {
              onRedirectOrder(platformResult);
              onClose();
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black py-3 rounded-xl shadow-lg text-sm transition-all flex items-center justify-center space-x-2"
          >
            {isPriceBite ? (
              <>
                <Zap className="w-4 h-4" />
                <span>Order In-App on PriceBite Direct (₹{pb.finalPayablePrice})</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4" />
                <span>Order on {platformResult.platformName} App (₹{pb.finalPayablePrice})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
