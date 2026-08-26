import React, { useState } from 'react';
import { Search, Mic, Sparkles, MapPin, Edit3, Zap, ShieldCheck, ChevronDown, Compass } from 'lucide-react';
import { getTranslation } from '../../i18n';
import { LanguageCode } from '../../types';

interface HeroSearchProps {
  currentLang: LanguageCode;
  onSearch: (query: string) => void;
  onOpenVoiceSearch: () => void;
  onSelectCategory: (category: string) => void;
  currentPinCode: string;
  pinArea: string;
  onOpenPinModal: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  currentLang,
  onSearch,
  onOpenVoiceSearch,
  onSelectCategory,
  currentPinCode,
  pinArea,
  onOpenPinModal,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const cravingChips = [
    { label: '🍗 Biryani', query: 'Chicken Biryani' },
    { label: '🍕 Pizza', query: 'Pizza Margherita' },
    { label: '🍔 Burger', query: 'Burger' },
    { label: '🥟 Momos', query: 'Momos' },
    { label: '🍗 KFC Bucket', query: 'KFC Chicken Bucket' },
    { label: '🍟 French Fries', query: 'French Fries' },
    { label: '🥛 Amul Milk', query: 'Amul Milk 1L' },
    { label: '☕ Coffee', query: 'Cold Coffee' },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
      {/* Background ambient lighting glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-orange-500/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-7">
        {/* Value Proposition Badge */}
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-yellow-500/15 border border-orange-500/30 px-4 py-1.5 rounded-full text-xs font-extrabold text-orange-300 shadow-xl shadow-orange-500/10 backdrop-blur-md">
          <Zap className="w-4 h-4 text-orange-400 animate-pulse" />
          <span>Don't check 10 apps. Search once & get the best deal!</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-100 tracking-tight leading-[1.15]">
            {getTranslation('heroTitle', currentLang)}
          </h1>
          <p className="text-sm sm:text-lg text-slate-400 font-medium max-w-2xl mx-auto">
            {getTranslation('heroSubtitle', currentLang)}
          </p>
        </div>

        {/* 🌟 UNIFIED HERO COMMAND BAR (Integrated Location + Search Input) */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="bg-slate-900/90 border-2 border-slate-700/80 hover:border-orange-500/80 focus-within:border-orange-500 rounded-3xl p-2.5 shadow-2xl shadow-orange-500/10 transition-all duration-300 flex flex-col md:flex-row items-center gap-2 backdrop-blur-md">

            {/* Left: Location Selector Pill */}
            <button
              type="button"
              onClick={onOpenPinModal}
              className="w-full md:w-auto bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 px-4 py-2.5 rounded-2xl flex items-center justify-between space-x-3 transition-all text-left group flex-shrink-0"
            >
              <div className="flex items-center space-x-2.5 truncate">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
                  📍
                </div>
                <div className="truncate max-w-[150px] sm:max-w-[180px]">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block leading-none">
                    Delivery Location
                  </span>
                  <span className="text-xs font-black text-amber-300 truncate block leading-tight mt-0.5">
                    {currentPinCode ? `📍 ${currentPinCode} (${pinArea})` : 'Set PIN Code'}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-orange-400 transition-colors" />
            </button>

            {/* Divider Line (Visible on MD screens) */}
            <div className="hidden md:block w-px h-8 bg-slate-800 flex-shrink-0" />

            {/* Middle: Search Input Field */}
            <div className="relative flex-1 flex items-center w-full">
              <Search className="w-5 h-5 text-slate-400 ml-2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={getTranslation('searchPlaceholder', currentLang)}
                className="w-full bg-transparent border-none text-slate-100 text-sm sm:text-base placeholder-slate-500 px-3 py-2 focus:outline-none font-medium"
              />

              {/* Voice Search Button */}
              <button
                type="button"
                onClick={onOpenVoiceSearch}
                title="Regional Voice Search"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition-colors mr-2 flex-shrink-0"
              >
                <Mic className="w-4 h-4 animate-pulse" />
              </button>
            </div>

            {/* Right: Search Action Button */}
            <button
              type="submit"
              className="w-full md:w-auto bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-slate-950 font-black px-7 py-3 rounded-2xl shadow-lg shadow-orange-500/30 transition-all transform hover:scale-105 active:scale-95 text-sm sm:text-base whitespace-nowrap flex-shrink-0"
            >
              Search Deals ⚡
            </button>
          </div>
        </form>

        {/* Popular Craving Chips in Sleek Container */}
        <div className="pt-2">
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-4 max-w-3xl mx-auto backdrop-blur-sm space-y-2.5">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center justify-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Popular Cravings</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {cravingChips.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => {
                    setQuery(chip.query);
                    onSearch(chip.query);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-orange-300 border border-slate-800 hover:border-orange-500/50 px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all transform hover:scale-105 shadow-sm"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Verified Platforms Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-400 pt-1">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Real-time Tax & Fee Engine</span>
          </span>
          <span>•</span>
          <span>⚡ PriceBite Direct</span>
          <span>•</span>
          <span>🧡 Swiggy</span>
          <span>•</span>
          <span>🔴 Zomato</span>
          <span>•</span>
          <span>🟡 Blinkit</span>
          <span>•</span>
          <span>💜 Zepto</span>
          <span>•</span>
          <span>🍕 Domino's</span>
          <span>•</span>
          <span>🍗 KFC</span>
        </div>
      </div>
    </div>
  );
};
