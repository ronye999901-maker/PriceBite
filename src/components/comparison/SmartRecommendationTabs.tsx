import React from 'react';
import { RecommendationSummary } from '../../engine/recommendationEngine';
import { getTranslation } from '../../i18n';
import { LanguageCode } from '../../types';

interface SmartRecommendationTabsProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  recommendations: RecommendationSummary;
  currentLang: LanguageCode;
}

export const SmartRecommendationTabs: React.FC<SmartRecommendationTabsProps> = ({
  activeTab,
  onSelectTab,
  recommendations,
  currentLang,
}) => {
  const tabs = [
    { id: 'smartPick', icon: '🏆', title: getTranslation('smartPick', currentLang), desc: 'Overall Top Winner' },
    { id: 'cheapest', icon: '💰', title: getTranslation('cheapest', currentLang), desc: 'Lowest Final Payable Price' },
    { id: 'fastest', icon: '⚡', title: getTranslation('fastest', currentLang), desc: 'Shortest Delivery Time' },
    { id: 'bestValue', icon: '⭐', title: getTranslation('bestValue', currentLang), desc: 'Rating + Price + Delivery' },
    { id: 'bestRewards', icon: '🎁', title: getTranslation('bestRewards', currentLang), desc: 'Highest Cashback' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-4">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`p-3 rounded-2xl border text-left transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-orange-500 text-orange-300 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/50'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-1.5 text-base font-black mb-1">
              <span>{tab.icon}</span>
              <span className="text-xs sm:text-sm font-black truncate">{tab.title}</span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">{tab.desc}</p>
          </button>
        );
      })}
    </div>
  );
};
