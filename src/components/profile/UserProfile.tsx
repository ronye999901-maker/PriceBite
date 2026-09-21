import React, { useState } from 'react';
import { UserProfile as UserProfileType, LanguageCode, ThemeMode, OrderRecord } from '../../types';
import { User, Mail, Phone, MapPin, Globe, TrendingDown, Bell, LogOut, CheckCircle2, ShoppingBag, Clock, RotateCcw, Navigation, FileText, ShieldCheck } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';
import { getTranslation } from '../../i18n';
import { SecurityHubModal } from './SecurityHubModal';

interface UserProfileProps {
  profile: UserProfileType;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenPinModal: () => void;
  onRemoveAlert: (alertId: string) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onReorderItem?: (item: any) => void;
  onTrackOrder?: (order: OrderRecord) => void;
  onViewReceipt?: (order: OrderRecord) => void;
  themeMode: ThemeMode;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  profile,
  currentLang,
  onLanguageChange,
  onOpenPinModal,
  onRemoveAlert,
  onOpenAuthModal,
  onLogout,
  onReorderItem,
  onTrackOrder,
  onViewReceipt,
  themeMode,
}) => {
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const isDark = themeMode === 'dark';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
          isDark ? 'glass-card border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center space-x-4 sm:space-x-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-500 text-slate-950 flex items-center justify-center font-black text-3xl shadow-lg shadow-orange-500/20">
            {profile.name ? profile.name.charAt(0).toUpperCase() : '👤'}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-black">{profile.name}</h1>
              {profile.isLoggedIn ? (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  ✓ Verified Member
                </span>
              ) : (
                <span className="bg-slate-800 text-slate-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                  Guest User
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium mt-1">
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-orange-400" />
                <span>{profile.email}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-orange-400" />
                <span>{profile.phone}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsSecurityModalOpen(true)}
            className="bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 font-black px-4 py-2 rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-sm shadow-emerald-500/10"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Security & Privacy Hub 🛡️</span>
          </button>

          {profile.isLoggedIn ? (
            <button
              onClick={onLogout}
              className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-extrabold px-4 py-2 rounded-xl text-xs transition-all flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
            >
              Log In / Sign Up ⚡
            </button>
          )}
        </div>
      </div>

      {/* Security Hub Modal */}
      <SecurityHubModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        userProfile={profile}
        themeMode={themeMode}
      />

      {/* Analytics Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div
          className={`p-6 rounded-3xl border shadow-xl flex items-center space-x-4 transition-all ${
            isDark ? 'glass-card border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-bold border border-emerald-500/30">
            💰
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Total Lifetime Savings</span>
            <h3 className="text-2xl font-black text-emerald-400">
              ₹{profile.totalSavingsAmount.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        <div
          className={`p-6 rounded-3xl border shadow-xl flex items-center space-x-4 transition-all ${
            isDark ? 'glass-card border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-2xl font-bold border border-orange-500/30">
            🔍
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Compared Searches</span>
            <h3 className="text-2xl font-black text-orange-400">{profile.comparedSearchesCount} Searches</h3>
          </div>
        </div>

        <div
          className={`p-6 rounded-3xl border shadow-xl flex items-center space-x-4 transition-all ${
            isDark ? 'glass-card border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl font-bold border border-cyan-500/30">
            📦
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Orders Completed</span>
            <h3 className="text-2xl font-black text-cyan-400">
              {profile.pastOrders ? profile.pastOrders.length : 0} Orders
            </h3>
          </div>
        </div>
      </div>

      {/* 📦 PAST ORDERS HISTORY SECTION */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 transition-all ${
          isDark ? 'glass-card border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xl border border-orange-500/30">
              📦
            </div>
            <div>
              <h2 className="text-xl font-black">Past Orders History</h2>
              <p className="text-xs text-slate-400">
                Track live delivery, view official tax receipts & reorder in 1-click
              </p>
            </div>
          </div>
        </div>

        {!profile.pastOrders || profile.pastOrders.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <span className="text-4xl block">🛍️</span>
            <h4 className="text-base font-bold">No Past Orders Found</h4>
            <p className="text-xs text-slate-400">Your completed orders and receipts will appear here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.pastOrders.map((order) => (
              <div
                key={order.id}
                className={`p-5 rounded-2xl border space-y-3 transition-all ${
                  isDark ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-orange-400">#{order.id}</span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          order.status === 'In Transit' || order.status === 'Preparing'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {order.status === 'In Transit' ? '🛵 Out for Delivery' : `✓ ${order.status}`}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {order.date} • {order.paymentMethod}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-medium block">Total Paid</span>
                      <span className="text-base font-black text-amber-400">₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span>{item.platformLogo}</span>
                        <span className="font-bold text-slate-200">
                          {item.productName} (x{item.quantity})
                        </span>
                        <span className="text-[10px] text-slate-400">[{item.platformName}]</span>
                      </div>
                      <span className="font-extrabold text-slate-300">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t border-slate-800/60">
                  <span className="text-slate-400 flex items-center space-x-1 truncate max-w-xs">
                    <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                    <span className="truncate">📍 {order.deliveryPinCode} ({order.deliveryAddress})</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    {onTrackOrder && (
                      <button
                        onClick={() => onTrackOrder(order)}
                        className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center space-x-1"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Track Live 🛵</span>
                      </button>
                    )}

                    {onViewReceipt && (
                      <button
                        onClick={() => onViewReceipt(order)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center space-x-1"
                      >
                        <FileText className="w-3 h-3 text-orange-400" />
                        <span>Receipt</span>
                      </button>
                    )}

                    {onReorderItem && (
                      <button
                        onClick={() => onReorderItem(order.items[0])}
                        className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reorder</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Price Drop Alerts */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 transition-all ${
          isDark ? 'glass-card border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl border border-cyan-500/30">
            🔔
          </div>
          <div>
            <h2 className="text-xl font-black">Active Price Drop Alerts</h2>
            <p className="text-xs text-slate-400">Get notified when food prices drop below your set target</p>
          </div>
        </div>

        {profile.alerts.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No active price alerts set yet. Click "🔔 Price Alert" on any dish to set an automated alert!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-slate-100">{alert.productName}</h4>
                  <button onClick={() => onRemoveAlert(alert.id)} className="text-red-400 text-[10px] font-bold">
                    Remove
                  </button>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>
                    Target Price: <strong className="text-emerald-400">₹{alert.targetPrice}</strong>
                  </span>
                  <span>
                    Current Lowest: <strong className="text-amber-400">₹{alert.currentLowestPrice}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
