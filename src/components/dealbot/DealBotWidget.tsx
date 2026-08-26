import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, Mic, CheckCircle } from 'lucide-react';
import { DealBotMessage, ProductComparisonItem, LanguageCode, PlatformResult } from '../../types';
import { getProductsForLocation } from '../../mock/foodData';
import { getTranslation } from '../../i18n';

interface DealBotWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
  onSelectProduct: (product: ProductComparisonItem) => void;
}

export const DealBotWidget: React.FC<DealBotWidgetProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSelectProduct,
}) => {
  const [messages, setMessages] = useState<DealBotMessage[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: getTranslation('dealBotInitial', currentLang) || "Hi! I am DealBot AI 🤖. Ask me anything like: 'Chicken Biryani under ₹250' or 'Where is KFC cheapest today?'",
      timestamp: 'Just now',
      quickActions: ['Biryani under ₹250', 'Cheapest Pizza for 2', 'KFC Deals today'],
    },
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const mockProducts = getProductsForLocation(null);

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputText;
    if (!q.trim()) return;

    const userMsg: DealBotMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // AI Intelligence Response Simulation
    setTimeout(() => {
      let matchedProd = mockProducts[0];
      if (q.toLowerCase().includes('pizza') && mockProducts.length > 1) matchedProd = mockProducts[1];

      const cheapestPlat = matchedProd.platformResults.find((p: PlatformResult) => p.platformId === matchedProd.cheapestPlatformId) || matchedProd.platformResults[0];

      let botResponseText = `I evaluated 4 live platform adapters! For "${q}", your cheapest option right now is ${matchedProd.name} on ${cheapestPlat.platformName} for ₹${cheapestPlat.priceBreakdown.finalPayablePrice}. You save ₹${cheapestPlat.priceBreakdown.savingsVsNextCheapest || 15}!`;

      if (currentLang === 'bn') {
        botResponseText = `আমি ৪টি লাইভ প্ল্যাটফর্ম চেক করেছি! "${q}"-এর জন্য আপনার সবচেয়ে সস্তা ডিল হল ${cheapestPlat.platformName}-এ ${matchedProd.name} মাত্র ₹${cheapestPlat.priceBreakdown.finalPayablePrice}-এ!`;
      } else if (currentLang === 'hi') {
        botResponseText = `मैंने सभी प्लेटफ़ॉर्म्स की तुलना की है! "${q}" के लिए आपका सबसे सस्ता विकल्प ${cheapestPlat.platformName} पर ${matchedProd.name} ₹${cheapestPlat.priceBreakdown.finalPayablePrice} में है!`;
      }

      const botMsg: DealBotMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        timestamp: 'Just now',
        recommendedProduct: matchedProd,
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 700);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px] animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg backdrop-blur-md">
            🤖
          </div>
          <div>
            <h3 className="font-extrabold text-sm leading-tight">DealBot AI Assistant</h3>
            <p className="text-[10px] text-cyan-200">Multilingual Deal & Price Optimizer</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/60 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-orange-500 text-slate-950 font-semibold rounded-br-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
              }`}
            >
              <p className="leading-relaxed">{msg.text}</p>

              {/* Recommended Product Card attachment */}
              {msg.recommendedProduct && (
                <div
                  onClick={() => {
                    onSelectProduct(msg.recommendedProduct!);
                    onClose();
                  }}
                  className="mt-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-orange-500 transition-colors flex items-center space-x-2.5"
                >
                  <img
                    src={msg.recommendedProduct.imageUrl}
                    alt={msg.recommendedProduct.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 truncate">
                    <span className="font-extrabold text-slate-100 block truncate">{msg.recommendedProduct.name}</span>
                    <span className="text-[10px] text-amber-400 font-bold block">View Comparison Matrix →</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {msg.quickActions && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {msg.quickActions.map((qa) => (
                  <button
                    key={qa}
                    onClick={() => handleSend(qa)}
                    className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all"
                  >
                    ⚡ {qa}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Footer */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask DealBot in English, Bengali, Hindi..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={() => handleSend()}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
