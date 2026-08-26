import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User, CheckCircle2, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';
import { UserProfile, ThemeMode } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (name: string, email: string, phone: string) => void;
  themeMode: ThemeMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  themeMode,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = email.trim();
    const finalName = name.trim() || (finalEmail.includes('@') ? finalEmail.split('@')[0] : 'User Account');
    const finalPhone = phone.trim() || '';

    setIsSuccessMessage(true);
    setTimeout(() => {
      onLoginSuccess(finalName, finalEmail, finalPhone);
      setIsSuccessMessage(false);
      onClose();
    }, 1000);
  };

  const isDark = themeMode === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className={`rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6 border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
      }`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isDark ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-500 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccessMessage ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full mx-auto flex items-center justify-center text-3xl border border-emerald-500/40 animate-bounce">
              ✓
            </div>
            <h3 className="text-2xl font-black">Login Successful!</h3>
            <p className="text-xs text-slate-500">Welcome to PriceBite Smart Savings Network.</p>
          </div>
        ) : (
          <div>
            {/* Header Brand */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-500/20">
                ⚡
              </div>
              <div>
                <h3 className="text-xl font-black">PriceBite Account</h3>
                <p className="text-xs text-slate-500">Log in to track orders, save items & earn wallet rewards</p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className={`flex rounded-2xl p-1 mb-6 border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  authMode === 'signup'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider mb-1 text-orange-500">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:border-orange-500 ${
                        isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider mb-1 text-orange-500">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address or mobile number"
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:border-orange-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider mb-1 text-orange-500">
                  Password / PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:border-orange-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-slate-950 font-black py-3.5 rounded-xl text-sm shadow-lg shadow-orange-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                <span>{authMode === 'login' ? 'Sign In to PriceBite ⚡' : 'Register New Account 🚀'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
