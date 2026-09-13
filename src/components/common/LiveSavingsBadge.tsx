import React, { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, Zap, ChevronDown, Award, ShoppingBag } from 'lucide-react';
import { ThemeMode } from '../../types';

interface LiveSavingsBadgeProps {
  themeMode: ThemeMode;
  onOpenDealsModal?: () => void;
}

export const LiveSavingsBadge: React.FC<LiveSavingsBadgeProps> = ({ themeMode, onOpenDealsModal }) => {
  const [savingsTotal, setSavingsTotal] = useState(1482450);
  const [recentSavingsToast, setRecentSavingsToast] = useState<{ city: string; amount: number; platform: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const isDark = themeMode === 'dark';

  // Real-time savings ticker simulation
  useEffect(() => {
    const cities = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Kolkata', 'Hyderabad', 'Pune', 'Chennai', 'Ahmedabad'];
    const platforms = ['Swiggy', 'Zomato', 'Blinkit', 'Zepto', 'Instamart'];

    const interval = setInterval(() => {
      const added = Math.floor(Math.random() * 85) + 35;
      setSavingsTotal((prev) => prev + added);

      if (Math.random() > 0.4) {
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
        setRecentSavingsToast({
          city: randomCity,
          amount: added,
          platform: randomPlatform,
        });

        setTimeout(() => {
          setRecentSavingsToast(null);
        }, 3500);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`group flex items-center space-x-2.5 px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all duration-300 shadow-md ${
          isDark
            ? 'glass-card border-orange-500/30 hover:border-orange-500/60 text-slate-200'
            : 'glass-card-light border-orange-300 hover:border-orange-400 text-slate-800'
        }`}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>

        <span className="flex items-center space-x-1">
          <span className="text-orange-400">⚡ Live Savings:</span>
          <span className="text-emerald-400 font-black tracking-wide">
            ₹{savingsTotal.toLocaleString('en-IN')}
          </span>
        </span>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Mini Notification Toast */}
      {recentSavingsToast && (
        <div className="absolute top-10 left-0 sm:left-auto sm:right-0 z-40 animate-slide-up pointer-events-none">
          <div className="bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 text-slate-100 text-[11px] px-3 py-1.5 rounded-xl shadow-xl flex items-center space-x-2 whitespace-nowrap">
            <span className="text-xs">🎉</span>
            <span>
              Saved <strong className="text-emerald-400">₹{recentSavingsToast.amount}</strong> via{' '}
              <strong className="text-orange-400">{recentSavingsToast.platform}</strong> in {recentSavingsToast.city}
            </span>
          </div>
        </div>
      )}

      {/* Expanded Savings Stats Dropdown */}
      {isExpanded && (
        <div
          className={`absolute top-12 left-0 sm:left-auto sm:right-0 w-72 rounded-2xl p-4 border shadow-2xl z-50 animate-fade-in ${
            isDark ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-xl' : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-xl'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
            <div className="flex items-center space-x-1.5 text-xs font-black text-orange-400">
              <Sparkles className="w-4 h-4" />
              <span>India Community Savings</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Live
            </span>
          </div>

          <div className="py-3 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Average Savings / Order:</span>
              <span className="font-extrabold text-emerald-400">₹72.50</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Best Platform Today:</span>
              <span className="font-extrabold text-orange-400">PriceBite Direct (0% Comm.)</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Active Compared Deals:</span>
              <span className="font-extrabold text-amber-400">12,450+ Dishes & Groceries</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Updated every 4 sec</span>
            <button
              onClick={() => {
                setIsExpanded(false);
                if (onOpenDealsModal) onOpenDealsModal();
              }}
              className="text-orange-400 font-black hover:underline"
            >
              Explore Best Deals →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
