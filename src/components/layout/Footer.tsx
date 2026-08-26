import React from 'react';
import { getTranslation } from '../../i18n';
import { LanguageCode } from '../../types';

interface FooterProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const Footer: React.FC<FooterProps> = ({ currentLang, onLanguageChange }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-slate-950 font-black text-lg">
                ⚡
              </div>
              <span className="text-xl font-black text-slate-100">PriceBite</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {getTranslation('tagline', currentLang)}
            </p>
            <p className="text-[11px] text-slate-500">
              One India. Many Languages. One Smart Price. Compare Swiggy, Zomato, Blinkit, Zepto, Domino's, KFC & more.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Core Value Pillars</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <span>🔎</span>
                <span>Search Once, Compare Everywhere</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>💰</span>
                <span>True Price Comparison Engine</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>🎁</span>
                <span>Smart Rewards & Cashback Optimizer</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>🇮🇳</span>
                <span>Made for 13+ Indian Regional Languages</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Supported Platforms</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="bg-slate-900 border border-slate-800 p-2 rounded text-slate-300">🧡 Swiggy</span>
              <span className="bg-slate-900 border border-slate-800 p-2 rounded text-slate-300">🔴 Zomato</span>
              <span className="bg-slate-900 border border-slate-800 p-2 rounded text-slate-300">🟡 Blinkit</span>
              <span className="bg-slate-900 border border-slate-800 p-2 rounded text-slate-300">💜 Zepto</span>
              <span className="bg-slate-900 border border-slate-800 p-2 rounded text-slate-300">🍕 Domino's</span>
              <span className="bg-slate-900 border border-slate-800 p-2 rounded text-slate-300">🍗 KFC Official</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Language Architecture</h4>
            <p className="text-xs text-slate-400 mb-3">
              English is always the default fallback language. Regional recommendations trigger based on PIN code detection.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['en', 'hi', 'bn', 'mr', 'ta', 'te', 'gu', 'kn', 'ml', 'or', 'pa', 'as', 'ur'].map((code) => (
                <button
                  key={code}
                  onClick={() => onLanguageChange(code as LanguageCode)}
                  className={`text-[10px] uppercase font-bold px-2 py-1 rounded transition-colors ${
                    currentLang === code ? 'bg-orange-500 text-slate-950 font-extrabold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 text-center text-xs text-slate-500">
          <p>© 2026 PriceBite India. All rights reserved. Prices & fees are computed dynamically via platform adapters.</p>
        </div>
      </div>
    </footer>
  );
};
