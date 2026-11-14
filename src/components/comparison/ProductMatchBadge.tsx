import React, { useState } from 'react';
import { MatchType } from '../../types';
import { ShieldCheck, Info, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Cpu, Sparkles } from 'lucide-react';

interface ProductMatchBadgeProps {
  matchType: MatchType;
  matchScore: number;
  matchNotes: string;
  semanticSimilarity?: number;
  lexicalSimilarity?: number;
  portionCongruence?: number;
  detectedSynonyms?: string[];
}

export const ProductMatchBadge: React.FC<ProductMatchBadgeProps> = ({
  matchType,
  matchScore,
  matchNotes,
  semanticSimilarity,
  lexicalSimilarity,
  portionCongruence,
  detectedSynonyms,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
  const hasDetailedMetrics =
    semanticSimilarity !== undefined || lexicalSimilarity !== undefined || (detectedSynonyms && detectedSynonyms.length > 0);

  return (
    <div className={`p-3 rounded-2xl border ${style.bg} space-y-1.5 shadow-sm transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 font-black text-xs sm:text-sm">
          {style.icon}
          <span>{style.label}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="text-slate-400 text-[10px] uppercase">Confidence</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-200 font-mono">
            {matchScore}%
          </span>
          {hasDetailedMetrics && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Toggle AI Mathematical Breakdown"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-300 font-medium leading-relaxed">
        {matchNotes}
      </p>

      {/* Expandable Mathematical Model Decomposition */}
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-2 animate-fade-in text-[11px]">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
            <Cpu className="w-3.5 h-3.5" />
            <span>Hybrid Match Formulation Metrics</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[9px] uppercase">Semantic Cosine</span>
              <span className="font-bold text-cyan-300 font-mono">{semanticSimilarity ?? matchScore}%</span>
            </div>
            <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[9px] uppercase">Lexical Levenshtein</span>
              <span className="font-bold text-emerald-300 font-mono">{lexicalSimilarity ?? matchScore}%</span>
            </div>
            <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[9px] uppercase">Portion Factor</span>
              <span className="font-bold text-amber-300 font-mono">{portionCongruence ?? 100}%</span>
            </div>
          </div>

          {detectedSynonyms && detectedSynonyms.length > 0 && (
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex items-start space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-300">
                <span className="font-semibold text-amber-400">Ontology Mapping: </span>
                <span>{detectedSynonyms.join(', ')}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
