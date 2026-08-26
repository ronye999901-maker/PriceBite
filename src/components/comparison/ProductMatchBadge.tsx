import React from 'react';
import { MatchType } from '../../types';
import { ShieldCheck, Info, AlertTriangle, RefreshCw } from 'lucide-react';

interface ProductMatchBadgeProps {
  matchType: MatchType;
  matchScore: number;
  matchNotes: string;
}

export const ProductMatchBadge: React.FC<ProductMatchBadgeProps> = ({
  matchType,
  matchScore,
  matchNotes,
}) => {
  const getBadgeStyle = () => {
    switch (matchType) {
      case 'EXACT':
        return {
          bg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
          label: '✅ Exact Match',
        };
      case 'VARIANT':
        return {
          bg: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
          icon: <RefreshCw className="w-4 h-4 text-amber-400" />,
          label: '⚡ Variant Match',
        };
      case 'SIMILAR':
        return {
          bg: 'bg-orange-950/80 border-orange-500/50 text-orange-300',
          icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
          label: '⚠️ Similar Product',
        };
      default:
        return {
          bg: 'bg-slate-900 border-slate-700 text-slate-400',
          icon: <Info className="w-4 h-4 text-slate-400" />,
          label: 'Product Match',
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <div className={`p-3 rounded-2xl border ${style.bg} space-y-1.5 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 font-black text-xs sm:text-sm">
          {style.icon}
          <span>{style.label}</span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs font-bold">
          <span className="text-slate-400 text-[10px] uppercase">Confidence</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-200">
            {matchScore}%
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-300 font-medium leading-relaxed">
        {matchNotes}
      </p>
    </div>
  );
};
