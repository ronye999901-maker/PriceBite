import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Check, X, Edit3, ArrowLeft, Loader2 } from 'lucide-react';
import { PINCodeDetails, LanguageCode } from '../../types';
import { lookupPINCode, fetchExactPINCode } from '../../engine/pinCodeEngine';
import { getTranslation } from '../../i18n';

interface RegionLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPinCode: string;
  onSaveLocation: (pinDetails: PINCodeDetails) => void;
  currentLang: LanguageCode;
  onSwitchLanguage: (lang: LanguageCode) => void;
}

export const RegionLanguageModal: React.FC<RegionLanguageModalProps> = ({
  isOpen,
  onClose,
  currentPinCode,
  onSaveLocation,
  currentLang,
  onSwitchLanguage,
}) => {
  const [pinInput, setPinInput] = useState(currentPinCode);
  const [isLoadingPin, setIsLoadingPin] = useState(false);
  const [pinDetails, setPinDetails] = useState<PINCodeDetails | null>(
    currentPinCode ? lookupPINCode(currentPinCode) : null
  );
  const [showLanguagePrompt, setShowLanguagePrompt] = useState(false);

  useEffect(() => {
    if (pinInput.length === 6) {
      setIsLoadingPin(true);
      fetchExactPINCode(pinInput).then((details) => {
        setIsLoadingPin(false);
        if (details) {
          setPinDetails(details);
        }
      });
    } else {
      setPinDetails(null);
    }
  }, [pinInput]);

  if (!isOpen) return null;

  const handleApplyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length === 6) {
      setIsLoadingPin(true);
      const details = await fetchExactPINCode(pinInput);
      setIsLoadingPin(false);

      if (details) {
        setPinDetails(details);
        onSaveLocation(details);
        if (details.recommendedLanguage !== currentLang) {
          setShowLanguagePrompt(true);
        } else {
          onClose();
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        {!showLanguagePrompt ? (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xl border border-orange-500/30">
                📍
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-100">Set / Change Delivery Location</h3>
                <p className="text-xs text-slate-400">Exact India Post PIN Code lookup for accurate local pricing</p>
              </div>
            </div>

            <form onSubmit={handleApplyPin} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-2">
                  Enter 6-Digit PIN Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 721101, 700156, 400001"
                    className="w-full bg-slate-950 border-2 border-orange-500/80 rounded-xl px-4 py-3.5 text-slate-100 text-xl font-mono tracking-widest focus:outline-none focus:border-amber-400 shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={isLoadingPin || pinInput.length !== 6}
                    className="absolute right-2 top-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 px-5 py-2 rounded-lg font-black text-xs shadow-md hover:scale-105 transition-all disabled:opacity-50 flex items-center space-x-1"
                  >
                    {isLoadingPin ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Finding...</span>
                      </>
                    ) : (
                      <span>Set PIN</span>
                    )}
                  </button>
                </div>
              </div>

              {isLoadingPin && (
                <div className="flex items-center space-x-2 text-xs text-amber-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Fetching exact location from India Post Database for {pinInput}...</span>
                </div>
              )}

              {pinDetails && !isLoadingPin && (
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2 shadow-inner">
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400 font-medium">Exact PIN Code:</span>
                    <span className="font-black text-amber-300 text-sm">📍 {pinDetails.pinCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Area / Post Office:</span>
                    <span className="font-extrabold text-slate-100">{pinDetails.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">District / State:</span>
                    <span className="font-bold text-orange-400">{pinDetails.district}, {pinDetails.state}</span>
                  </div>
                </div>
              )}
            </form>
          </div>
        ) : (
          pinDetails && (
            <div className="text-center space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <button
                  onClick={() => setShowLanguagePrompt(false)}
                  className="text-xs text-orange-400 font-bold flex items-center space-x-1 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit / Change PIN Code ({pinDetails.pinCode})</span>
                </button>
              </div>

              <div className="w-14 h-14 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center text-2xl border border-cyan-500/40">
                🌐
              </div>

              <h3 className="text-xl font-black text-slate-100">
                {getTranslation('langRecTitle', currentLang)}
              </h3>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
                <p className="text-slate-300">
                  📍 Verified PIN Code <strong className="text-orange-400">{pinDetails.pinCode}</strong>: <strong className="text-amber-300">{pinDetails.area}, {pinDetails.district} ({pinDetails.state})</strong>.
                </p>
                <p className="text-slate-300">
                  Would you like to switch language to <strong className="text-cyan-400 text-sm">{pinDetails.languageNativeName}</strong>?
                </p>
              </div>

              <div className="flex flex-col space-y-2 pt-1">
                <button
                  onClick={() => {
                    onSwitchLanguage(pinDetails.recommendedLanguage);
                    onClose();
                  }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3 rounded-xl shadow-lg text-sm transition-all"
                >
                  Switch to {pinDetails.languageNativeName}
                </button>

                <button
                  onClick={() => {
                    onSwitchLanguage('en');
                    onClose();
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Continue in English 🇬🇧
                </button>

                <button
                  onClick={() => setShowLanguagePrompt(false)}
                  className="w-full text-xs text-orange-400 font-bold hover:underline py-1 flex items-center justify-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Re-enter Different PIN Code</span>
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
