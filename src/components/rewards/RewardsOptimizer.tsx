import React, { useState } from 'react';
import { CreditCard, Sparkles, ShieldCheck, Gift, Check } from 'lucide-react';
import { MOCK_BANK_OFFERS } from '../../mock/foodData';

interface RewardsOptimizerProps {
  selectedBankCard: string;
  onSelectBankCard: (cardId: string) => void;
}

export const RewardsOptimizer: React.FC<RewardsOptimizerProps> = ({
  selectedBankCard,
  onSelectBankCard,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl max-w-7xl mx-auto my-8">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl border border-indigo-500/30">
          🎁
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-slate-100">Smart Rewards & Bank Offer Optimizer</h3>
          <p className="text-xs text-slate-400">Select your active bank cards to automatically unlock instant payment discounts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_BANK_OFFERS.map((offer) => {
          const isSelected = selectedBankCard === offer.id;

          return (
            <div
              key={offer.id}
              onClick={() => onSelectBankCard(isSelected ? '' : offer.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">{offer.bankName}</span>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${isSelected ? 'bg-indigo-500 border-indigo-400 text-slate-950 font-bold' : 'border-slate-700 text-transparent'}`}>
                  ✓
                </div>
              </div>
              <h4 className="font-bold text-slate-100 text-sm mb-1">{offer.title}</h4>
              <p className="text-xs text-emerald-400 font-semibold">
                Save ₹{offer.discountAmount} on orders above ₹{offer.minOrderValue}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
