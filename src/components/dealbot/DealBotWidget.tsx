import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Percent,
  Clock,
  ArrowRight,
  Check,
  Copy,
  Star,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { DealBotMessage, ProductComparisonItem, LanguageCode, PINCodeDetails } from '../../types';
import { getTranslation } from '../../i18n';
import { analyzeDealBotQuery } from '../../engine/dealBotEngine';

interface DealBotWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
  onSelectProduct: (product: ProductComparisonItem) => void;
  currentPinDetails?: PINCodeDetails | null;
  onOpenDirectHub?: () => void;
}

export const DealBotWidget: React.FC<DealBotWidgetProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSelectProduct,
  currentPinDetails,
  onOpenDirectHub,
}) => {
  const [messages, setMessages] = useState<DealBotMessage[]>([
    {
      id: 'm-initial',
      sender: 'bot',
      text:
        getTranslation('dealBotInitial', currentLang) ||
        "Hello! I am DealBot AI 2.0 🤖 — powered by Hybrid Semantic NLP & TOPSIS Multi-Criteria Decision Optimization. Ask me anything like: 'Best Biryani under ₹250', 'Where is KFC cheapest today?', or 'Show active coupons'!",
      timestamp: 'Just now',
      quickActions: [
        '🍗 Biryani under ₹250',
        '⚡ Fastest delivery < 20m',
        '🏷️ Active Promo Coupons',
        '🍕 Domino vs Pizza deals',
        '🌱 Pure Veg Meals',
      ],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Voice Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang =
          currentLang === 'bn' ? 'bn-BD' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText(transcript);
            handleSend(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [currentLang]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // Text to Speech playback
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang =
        currentLang === 'bn' ? 'bn-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

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
    setIsTyping(true);

    // Run query through the Intelligent DealBot Reasoning Engine
    setTimeout(() => {
      const result = analyzeDealBotQuery(q, currentLang, currentPinDetails);

      const botMsg: DealBotMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: result.text,
        timestamp: 'Just now',
        recommendedProduct: result.recommendedProduct,
        comparisonBreakdown: result.comparisonBreakdown,
        couponInfo: result.couponInfo,
        restaurantInfo: result.restaurantInfo,
        quickActions: result.followUpActions,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      if (speechEnabled) {
        speakText(result.text);
      }
    }, 600);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `m-reset-${Date.now()}`,
        sender: 'bot',
        text: 'Conversation refreshed! What delicious meal or savings deal can I find for you now?',
        timestamp: 'Just now',
        quickActions: [
          '🍗 Biryani under ₹250',
          '⚡ Fastest delivery < 20m',
          '🏷️ Active Promo Coupons',
          '🌱 Pure Veg Meals',
        ],
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[580px] animate-slide-up">
      {/* 🌟 HEADER */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 p-4 text-white flex items-center justify-between shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center space-x-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center font-bold text-xl backdrop-blur-md shadow-md">
            🤖
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-sm leading-tight text-white">DealBot AI 2.0</h3>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                <span>ONLINE</span>
              </span>
            </div>
            <p className="text-[10px] text-cyan-200 font-medium">
              Hybrid Semantic NLP • TOPSIS Multi-Criteria Optimizer
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-1 relative z-10">
          {/* Audio toggle button */}
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            title={speechEnabled ? 'Mute AI voice' : 'Enable AI voice speech'}
            className={`p-2 rounded-xl transition-all ${
              speechEnabled ? 'bg-cyan-400 text-slate-950 font-black' : 'hover:bg-white/10 text-white/80'
            }`}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset button */}
          <button
            onClick={handleClearHistory}
            title="Clear Chat History"
            className="p-2 rounded-xl hover:bg-white/10 text-white/80 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white transition-all ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 🌟 MESSAGES STREAM */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/70 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[90%] p-3.5 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold rounded-br-none shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-lg'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-line text-xs">{msg.text}</p>

              {/* 1. INTERACTIVE PLATFORM COMPARISON TABLE BREAKDOWN */}
              {msg.comparisonBreakdown && msg.comparisonBreakdown.length > 0 && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800/60">
                    <span>Platform</span>
                    <span>Price</span>
                    <span>ETA</span>
                    <span>TOPSIS Rank</span>
                  </div>

                  {msg.comparisonBreakdown.map((row) => (
                    <div
                      key={row.platformId}
                      className={`flex items-center justify-between p-1.5 rounded-lg text-[11px] ${
                        row.isBest
                          ? 'bg-orange-500/15 border border-orange-500/40 text-orange-300 font-black'
                          : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 truncate max-w-[120px]">
                        <span>{row.logo}</span>
                        <span className="truncate">{row.platformName}</span>
                      </div>
                      <span className="font-black text-amber-400">₹{row.price}</span>
                      <span className="text-slate-400 text-[10px]">⏱️ {row.etaMinutes}m</span>
                      {row.isBest ? (
                        <span className="text-[9px] font-black bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded">
                          #1 BEST VALUE
                        </span>
                      ) : row.topsisScore ? (
                        <span className="text-[10px] text-slate-400">{row.topsisScore}%</span>
                      ) : (
                        <span className="text-[10px] text-slate-500">-</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 2. VERIFIED COUPON CARD */}
              {msg.couponInfo && (
                <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-transparent border border-orange-500/40 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <Percent className="w-3.5 h-3.5 text-orange-400" />
                      <span className="font-mono font-black text-xs text-orange-400 tracking-wider">
                        {msg.couponInfo.code}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      {msg.couponInfo.title} • {msg.couponInfo.discountSummary}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyCode(msg.couponInfo!.code)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-orange-500 text-slate-950 font-black text-[10px] hover:bg-orange-400 transition-all"
                  >
                    {copiedCode === msg.couponInfo.code ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY CODE</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* 3. RESTAURANT HIGHLIGHT CARD */}
              {msg.restaurantInfo && (
                <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-100">{msg.restaurantInfo.name}</span>
                    <span className="text-[10px] font-bold text-amber-400 flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{msg.restaurantInfo.rating}</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{msg.restaurantInfo.branchName}</p>
                  <div className="p-1.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-[10px] font-bold text-orange-400 flex items-center space-x-1">
                    <Zap className="w-3 h-3 flex-shrink-0" />
                    <span>{msg.restaurantInfo.heroOffer}</span>
                  </div>
                </div>
              )}

              {/* 4. RECOMMENDED PRODUCT CARD */}
              {msg.recommendedProduct && (
                <div
                  onClick={() => {
                    onSelectProduct(msg.recommendedProduct!);
                    onClose();
                  }}
                  className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/80 cursor-pointer transition-all flex items-center space-x-3 group"
                >
                  <img
                    src={msg.recommendedProduct.imageUrl}
                    alt={msg.recommendedProduct.name}
                    className="w-12 h-12 rounded-lg object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 truncate">
                    <span className="font-black text-slate-100 block truncate text-xs">
                      {msg.recommendedProduct.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {msg.recommendedProduct.restaurantOrBrand}
                    </span>
                    <span className="text-[10px] text-amber-400 font-extrabold flex items-center space-x-1 mt-0.5">
                      <span>Compare on 3-Platform Matrix</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Suggestions */}
            {msg.quickActions && msg.quickActions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                {msg.quickActions.map((qa) => (
                  <button
                    key={qa}
                    onClick={() => handleSend(qa)}
                    className="bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shadow-sm active:scale-95"
                  >
                    ⚡ {qa}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs p-2 bg-slate-900 rounded-xl max-w-[120px] animate-pulse">
            <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="font-bold text-[10px]">Analyzing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 🌟 INPUT FOOTER */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
        {/* Voice Input Mic */}
        <button
          onClick={toggleVoiceInput}
          title={isListening ? 'Stop Listening' : 'Speak to DealBot'}
          className={`p-2.5 rounded-xl transition-all ${
            isListening
              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isListening ? 'Listening to your voice...' : 'Ask DealBot (Biryani under ₹250, coupons, speed)...'}
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none placeholder:text-slate-500 transition-colors"
        />

        {/* Send Button */}
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          className={`p-2.5 rounded-xl transition-all ${
            inputText.trim()
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
