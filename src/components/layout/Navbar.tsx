import React from 'react';
import { MapPin, Globe, Bot, User, Sun, Moon, ShoppingCart, LogIn, Store, Shield, ChevronDown } from 'lucide-react';
import { LanguageCode, ThemeMode, UserProfile } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';
import { getTranslation } from '../../i18n';
import { LiveSavingsBadge } from '../common/LiveSavingsBadge';

interface NavbarProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentPinCode: string;
  pinArea: string;
  onOpenPinModal: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenDealBot: () => void;
  onOpenVoiceSearch: () => void;
  totalSavings: number;
  cartItemCount: number;
  onOpenCart: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  userProfile: UserProfile;
  onOpenAuthModal: () => void;
  onOpenDealsModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  currentPinCode,
  pinArea,
  onOpenPinModal,
  activeTab,
  onSelectTab,
  onOpenDealBot,
  onOpenVoiceSearch,
  totalSavings,
  cartItemCount,
  onOpenCart,
  themeMode,
  onToggleTheme,
  userProfile,
  onOpenAuthModal,
  onOpenDealsModal,
}) => {
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const hasPin = Boolean(currentPinCode);
  const isDark = themeMode === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-xl border-b text-slate-100 transition-colors ${
        isDark ? 'bg-slate-900/85 border-slate-800/90' : 'bg-white/90 border-slate-200 text-slate-900 shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* FIRST (TOP) ROW — Responsive Layout */}
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer flex-shrink-0" onClick={() => onSelectTab('home')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center font-extrabold text-xl shadow-lg shadow-orange-500/30 ring-2 ring-orange-400/40">
              ⚡
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span
                  className={`text-xl sm:text-2xl font-black tracking-tight ${
                    isDark
                      ? 'bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 bg-clip-text text-transparent'
                  }`}
                >
                  PriceBite
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 tracking-wider">
                  India
                </span>
              </div>
              <p className={`text-[10px] font-medium hidden lg:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {getTranslation('tagline', currentLang)}
              </p>
            </div>
          </div>

          {/* Center Location & Live Savings Ticker */}
          <div className="flex items-center space-x-2">
            {/* User Location / PIN Code Pill */}
            <button
              onClick={onOpenPinModal}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all text-xs flex-shrink-0 whitespace-nowrap group ${
                hasPin
                  ? isDark
                    ? 'bg-slate-800/90 hover:bg-slate-800 text-slate-200 border-slate-700/80'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500/60 text-orange-400 animate-pulse'
              }`}
            >
              <MapPin className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform flex-shrink-0" />
              <div className="text-left">
                <span
                  className={`text-[10px] block font-semibold leading-none uppercase ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {getTranslation('location', currentLang)}
                </span>
                <span className="font-bold text-orange-500 truncate max-w-[100px] sm:max-w-[140px] block leading-tight">
                  {hasPin ? `📍 ${currentPinCode} (${pinArea})` : '📍 Enter PIN'}
                </span>
              </div>
            </button>

            {/* Live Community Savings Ticker */}
            <div className="hidden sm:block">
              <LiveSavingsBadge themeMode={themeMode} onOpenDealsModal={onOpenDealsModal} />
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 overflow-x-auto scrollbar-none py-1 flex-shrink-0">
            {/* ☀️/🌙 Theme Switcher Toggle */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-full border transition-all hover:scale-105 flex-shrink-0 whitespace-nowrap ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 shadow-sm'
              }`}
              title={isDark ? 'Switch to Classy Light Theme' : 'Switch to Dark Theme'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-800" />}
            </button>

            {/* 🛒 Live Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-slate-950 px-3 py-1.5 rounded-full text-xs font-black shadow-md shadow-orange-500/20 transition-all hover:scale-105 flex-shrink-0 whitespace-nowrap"
            >
              <ShoppingCart className="w-4 h-4 flex-shrink-0" />
              <span>{getTranslation('cart', currentLang)}</span>
              {cartItemCount > 0 && (
                <span className="bg-slate-950 text-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-orange-400 ml-0.5">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* 🛍️ Quick Mart (10-20m) Button */}
            <button
              onClick={() => onSelectTab('quickmart')}
              className={`flex items-center space-x-1.5 border px-3 py-1.5 rounded-full text-xs font-black transition-all hover:scale-105 flex-shrink-0 whitespace-nowrap ${
                activeTab === 'quickmart'
                  ? 'bg-purple-900/60 border-purple-500 text-pink-300 shadow-md shadow-purple-500/30'
                  : 'bg-purple-950/40 border-purple-800/80 hover:border-pink-500 text-pink-300'
              }`}
            >
              <Store className="w-4 h-4 text-pink-400 flex-shrink-0" />
              <span>{getTranslation('quickMart', currentLang)}</span>
            </button>

            {/* DealBot Button */}
            <button
              onClick={onOpenDealBot}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105 flex-shrink-0 whitespace-nowrap"
            >
              <Bot className="w-4 h-4 text-cyan-300 animate-pulse flex-shrink-0" />
              <span className="hidden md:inline">DealBot AI</span>
            </button>

            {/* Language Selector */}
            <div className="relative flex-shrink-0 flex items-center">
              <div
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all relative ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="pointer-events-none">
                  {currentLangObj.flag} {currentLangObj.nativeName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none ml-1" />

                <select
                  value={currentLang}
                  onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer bg-transparent text-slate-900"
                  title="Select Language / भाषा चुनें"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-100 py-1">
                      {lang.flag} {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* User Account / Auth Button */}
            {userProfile.isLoggedIn ? (
              <button
                onClick={() => onSelectTab('profile')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border font-bold text-xs transition-colors flex-shrink-0 whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <User className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span className="hidden md:inline font-extrabold">{userProfile.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="bg-slate-800 border border-slate-700 hover:border-orange-500 text-orange-400 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1 flex-shrink-0 whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{getTranslation('logIn', currentLang)}</span>
              </button>
            )}
          </div>
        </div>

        {/* SECOND (BOTTOM) ROW: Secondary Navigation Tabs */}
        <div
          className={`flex items-center space-x-1 sm:space-x-4 overflow-x-auto py-2 border-t text-xs scrollbar-none ${
            isDark ? 'border-slate-800/80' : 'border-slate-200'
          }`}
        >
          {[
            { id: 'home', key: 'navHome', fallback: 'Home Search 🔍' },
            { id: 'direct', key: 'navDirect', fallback: 'PriceBite Direct (Order Food In-App) ⚡' },
            { id: 'local', key: 'navLocal', fallback: 'Local Gems Hub 🏪' },
            { id: 'search', key: 'navCompare', fallback: 'Compare Platforms 📊' },
            { id: 'restaurants', key: 'navRestaurants', fallback: 'Restaurant Matrix 🍔' },
            { id: 'rewards', key: 'navRewards', fallback: 'Smart Rewards 🎁' },
            { id: 'profile', key: 'navProfile', fallback: 'My Orders & Account 👤' },
            { id: 'admin', key: 'navAdmin', fallback: 'Admin Portal ⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20'
                  : tab.id === 'admin'
                  ? 'text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {getTranslation(tab.key, currentLang) !== tab.key ? getTranslation(tab.key, currentLang) : tab.fallback}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
