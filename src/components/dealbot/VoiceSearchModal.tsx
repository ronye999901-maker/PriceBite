import React, { useState } from 'react';
import { Mic, X, Volume2, Sparkles } from 'lucide-react';
import { LanguageCode } from '../../types';
import { getTranslation } from '../../i18n';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
  onVoiceQueryResult: (query: string) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onVoiceQueryResult,
}) => {
  const [isListening, setIsListening] = useState(true);

  if (!isOpen) return null;

  const sampleQueries: Record<string, string[]> = {
    bn: ['"আমাকে ৩০০ টাকার মধ্যে বিরিয়ানি দেখাও"', '"আজ কেএফসি কোথায় সবচেয়ে সস্তা?"', '"আমুল দুধের আজকের দাম কত?"'],
    hi: ['"आज सबसे सस्ता चिकन बिरयानी कहाँ मिलेगा?"', '"₹200 के अंदर पिज़्ज़ा दिखाओ"', '"ब्लिंकिट और ज़ेप्टो की तुलना करो"'],
    en: ['"Show me Chicken Biryani under ₹250"', '"Where is KFC cheapest today?"', '"Compare Domino\'s Margherita pizza"'],
    ta: ['"₹250 க்கும் குறைவான பிரியாணியைக் காட்டு"', '"இன்று கேஎஃப்சி எங்கே மலிவானது?"'],
  };

  const activeSamples = sampleQueries[currentLang] || sampleQueries['en'];

  const handleSimulateVoice = (transcript: string) => {
    const cleanQuery = transcript.replace(/"/g, '').replace(/আমাকে|দেখাও|আজ|कहाँ मिलेगा|मंगवाओ|Show me|under ₹250|under ₹300/gi, '').trim();
    onVoiceQueryResult(cleanQuery || 'Chicken Biryani');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-xl font-black text-slate-100">{getTranslation('voiceSearchTitle', currentLang)}</h3>
          <p className="text-xs text-slate-400 font-medium">Speak in your preferred regional Indian language</p>
        </div>

        {/* Animated Mic Indicator */}
        <div className="relative py-6 flex items-center justify-center">
          <div className="absolute w-28 h-28 bg-cyan-500/20 rounded-full animate-ping pointer-events-none" />
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-xl shadow-cyan-500/30 relative z-10">
            <Mic className="w-10 h-10 animate-pulse text-slate-950" />
          </div>
        </div>

        <p className="text-xs text-cyan-300 font-semibold animate-pulse">
          {getTranslation('voiceSearchPlaceholder', currentLang)}
        </p>

        {/* Sample Voice Commands Clickable Chips */}
        <div className="space-y-2 text-left pt-2 border-t border-slate-800">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Try Saying:</span>
          <div className="space-y-1.5">
            {activeSamples.map((sample) => (
              <button
                key={sample}
                onClick={() => handleSimulateVoice(sample)}
                className="w-full text-left bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 p-2.5 rounded-xl text-xs text-slate-200 font-medium transition-all"
              >
                🗣️ {sample}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
