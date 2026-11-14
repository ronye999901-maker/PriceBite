import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { TOPSISResult, DecisionPersona } from '../../engine/recommendationEngine';

interface TOPSISProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  topsisResult: TOPSISResult | null;
  onSelectPersona?: (persona: DecisionPersona) => void;
}

export const TOPSISProofModal: React.FC<TOPSISProofModalProps> = ({
  isOpen,
  onClose,
  productName,
  topsisResult,
  onSelectPersona,
}) => {
  if (!isOpen || !topsisResult) return null;

  const personas: { id: DecisionPersona; label: string; desc: string }[] = [
    { id: 'balanced', label: '🏆 Balanced TOPSIS', desc: 'Equal consideration of cost, speed & quality' },
    { id: 'budget', label: '🎓 Student Budget', desc: 'Heavy weight on price minimization (w=0.60)' },
    { id: 'speed', label: '⚡ Urgent 15-Min', desc: 'Heavy weight on delivery speed (w=0.60)' },
    { id: 'quality', label: '⭐ Top Rated', desc: 'Heavy weight on ratings & service (w=0.60)' },
    { id: 'rewards', label: '🎁 Deal Hunter', desc: 'Maximum cashback & credit card rewards (w=0.50)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-100 flex items-center space-x-2">
              <span className="text-amber-400">📐</span>
              <span>TOPSIS Multi-Criteria Mathematical Proof</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Item: <span className="text-slate-200 font-bold">{productName}</span> • Dimensionless Euclidean Ranking
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Selector Tabs */}
        {onSelectPersona && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Evaluate With User Persona:</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {personas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectPersona(p.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    topsisResult.personaUsed === p.id
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold text-xs block">{p.label}</span>
                  <span className="text-[10px] text-slate-500 line-clamp-1">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Weights Vector Banner */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
            Normalized Criteria Weights Vector (∑ w_j = 1.0):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Price (Cost ↓)</span>
              <span className="text-sm font-black text-rose-400">w₁ = {topsisResult.weightsUsed.price.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">ETA (Cost ↓)</span>
              <span className="text-sm font-black text-amber-400">w₂ = {topsisResult.weightsUsed.speed.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Rating (Benefit ↑)</span>
              <span className="text-sm font-black text-emerald-400">w₃ = {topsisResult.weightsUsed.rating.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Cashback (Benefit ↑)</span>
              <span className="text-sm font-black text-violet-400">w₄ = {topsisResult.weightsUsed.cashback.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Normalized Matrix & Euclidean Distance Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Weighted Matrix, Separation Distances & Closeness Ranking (C_i*):
          </h4>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3 font-sans">Platform</th>
                  <th className="py-3 px-3 text-right">Price / v_price</th>
                  <th className="py-3 px-3 text-right">ETA / v_speed</th>
                  <th className="py-3 px-3 text-right">Rating / v_rating</th>
                  <th className="py-3 px-3 text-right">Dist S_i+</th>
                  <th className="py-3 px-3 text-right">Dist S_i-</th>
                  <th className="py-3 px-3 text-center">Closeness C_i*</th>
                  <th className="py-3 px-3 text-center font-sans">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {topsisResult.rankedEvaluations.map((row) => {
                  const isTop = row.rank === 1;
                  return (
                    <tr
                      key={row.platformId}
                      className={isTop ? 'bg-amber-950/30 font-bold border-l-4 border-l-amber-400' : 'text-slate-300'}
                    >
                      <td className="py-3 px-3 text-slate-400">#{row.rank}</td>
                      <td className="py-3 px-3 font-sans font-bold text-slate-100 flex items-center space-x-1.5">
                        {isTop && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{row.platformName}</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        ₹{row.finalPayablePrice} <span className="text-[10px] text-slate-500">({row.normalizedPrice})</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {row.deliveryTimeMinutes}m <span className="text-[10px] text-slate-500">({row.normalizedSpeed})</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        ★{row.rating} <span className="text-[10px] text-slate-500">({row.normalizedRating})</span>
                      </td>
                      <td className="py-3 px-3 text-right text-rose-400">{row.distanceToIdealPositive}</td>
                      <td className="py-3 px-3 text-right text-emerald-400">{row.distanceToIdealNegative}</td>
                      <td className="py-3 px-3 text-center text-sm font-black text-amber-400">
                        {(row.closenessCoefficient * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        {isTop ? (
                          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                            Smart Pick Winner
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Alternative #{row.rank}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Academic Proof Formula Box */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
          <span className="text-amber-400 font-bold block uppercase text-[10px] tracking-wider">
            Academic Formulation Notes for Thesis Defense:
          </span>
          <p className="leading-relaxed">
            The relative closeness coefficient is mathematically defined as:
            <code className="text-amber-300 font-mono ml-1">C_i* = S_i- / (S_i+ + S_i-)</code>, where
            <code className="text-emerald-300 font-mono ml-1">S_i-</code> represents the Euclidean distance from the negative-ideal (worst) solution, and
            <code className="text-rose-300 font-mono ml-1">S_i+</code> represents the distance from the positive-ideal (best) solution.
            The winning platform maximizes proximity to the ideal point while simultaneously maximizing separation from inferior alternatives.
          </p>
        </div>
      </div>
    </div>
  );
};
