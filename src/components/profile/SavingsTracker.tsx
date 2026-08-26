import React from 'react';
import { TrendingDown, Award, Sparkles, ShieldCheck } from 'lucide-react';
import { getTranslation } from '../../i18n';
import { LanguageCode } from '../../types';

interface SavingsTrackerProps {
  totalSavings: number;
  searchesCount: number;
  currentLang: LanguageCode;
}

export const SavingsTracker: React.FC<SavingsTrackerProps> = ({
  totalSavings,
  searchesCount,
  currentLang,
}) => {
  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 my-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg">
          💰
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100">
            {getTranslation('savings', currentLang)}
          </h2>
          <p className="text-xs text-emerald-300 font-semibold">
            {getTranslation('totalSavingsText', currentLang, { amount: totalSavings.toLocaleString('en-IN') })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Lifetime Money Saved</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">₹{totalSavings.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Compared Searches</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{searchesCount}</span>
        </div>
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Average Savings / Order</span>
          <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">₹{Math.round(totalSavings / Math.max(1, searchesCount))}</span>
        </div>
      </div>
    </div>
  );
};
