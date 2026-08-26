import React, { useState } from 'react';
import { Bell, X, CheckCircle, Sparkles } from 'lucide-react';
import { ProductComparisonItem } from '../../types';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductComparisonItem | null;
  onSaveAlert: (productId: string, targetPrice: number) => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  product,
  onSaveAlert,
}) => {
  const [targetPrice, setTargetPrice] = useState('180');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !product) return null;

  const currentLowest = Math.min(...product.platformResults.map((p) => p.priceBreakdown.finalPayablePrice));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetPrice) {
      onSaveAlert(product.id, Number(targetPrice));
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xl border border-amber-500/30">
            🔔
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Create Price Drop Alert</h3>
            <p className="text-xs text-slate-400 font-medium truncate max-w-xs">{product.name}</p>
          </div>
        </div>

        {isSaved ? (
          <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-bold text-slate-100 text-base">Price Alert Set!</h4>
            <p className="text-xs text-emerald-300">
              We'll notify you the moment this price drops below ₹{targetPrice}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs flex justify-between">
              <span className="text-slate-400">Current Lowest Price:</span>
              <span className="font-mono font-bold text-amber-400">₹{currentLowest}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Notify me when price drops below (₹)
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Target Price"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 font-mono text-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3.5 rounded-xl shadow-lg text-sm transition-all transform hover:scale-105"
            >
              Create Price Alert
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
