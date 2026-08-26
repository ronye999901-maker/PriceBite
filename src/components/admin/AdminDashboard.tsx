import React, { useState } from 'react';
import { Activity, ShieldCheck, Database, Layers, Search, Globe, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'adapters' | 'analytics' | 'pincodes' | 'i18n'>('adapters');

  const adapters = [
    { name: 'SwiggyAdapter', platform: 'Swiggy Food', status: 'Healthy', latency: '42ms', endpoint: 'Authorized Partner API v2' },
    { name: 'ZomatoAdapter', platform: 'Zomato Gold', status: 'Healthy', latency: '38ms', endpoint: 'Partner Data Feed v3' },
    { name: 'BlinkitAdapter', platform: 'Blinkit Quick', status: 'Healthy', latency: '29ms', endpoint: 'Affiliate Catalog API' },
    { name: 'ZeptoAdapter', platform: 'Zepto Grocery', status: 'Healthy', latency: '24ms', endpoint: 'Direct Merchant Feed' },
    { name: 'DominosAdapter', platform: 'Domino\'s Official', status: 'Healthy', latency: '45ms', endpoint: 'Brand API' },
    { name: 'KFCAdapter', platform: 'KFC Store', status: 'Healthy', latency: '51ms', endpoint: 'Licensed Merchant API' },
    { name: 'InstamartAdapter', platform: 'Swiggy Instamart', status: 'Healthy', latency: '33ms', endpoint: 'Catalog Sync API' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xl text-slate-950 shadow-lg">
            ⚙️
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100">PriceBite Admin Control Center</h1>
            <p className="text-xs text-slate-400">Platform Integrations, Matching Engine Analytics & i18n System Health</p>
          </div>
        </div>
        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>All Adapters 100% Operational</span>
        </span>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">Total Price Comparisons</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">1,428,920</span>
        </div>
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">Total User Savings</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">₹48.2 Lakhs</span>
        </div>
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">Active Adapters</span>
          <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">8 Live</span>
        </div>
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">Supported Languages</span>
          <span className="text-2xl sm:text-3xl font-black text-violet-400 font-mono">13 Indian</span>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 text-xs font-bold">
        {[
          { id: 'adapters', label: 'Platform Adapters ⚡' },
          { id: 'pincodes', label: 'PIN Code Region Mapper 📍' },
          { id: 'i18n', label: 'i18n Translation Health 🌐' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-slate-800 text-orange-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Adapters Tab Content */}
      {activeTab === 'adapters' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100">Live Platform Adapter Pipeline</h3>
            <button className="text-xs text-orange-400 font-bold hover:underline flex items-center space-x-1">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Test All Endpoints</span>
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {adapters.map((ad) => (
              <div key={ad.name} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                <div>
                  <span className="font-bold text-slate-200 block text-sm">{ad.platform} ({ad.name})</span>
                  <span className="text-slate-500">{ad.endpoint}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-slate-400 font-mono">Latency: {ad.latency}</span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                    {ad.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* i18n Tab Content */}
      {activeTab === 'i18n' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-slate-100">13 Indian Languages i18n Coverage</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div key={lang.code} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">100% Translated</span>
                </div>
                <span className="font-bold text-slate-100 text-xs block">{lang.nativeName}</span>
                <span className="text-[10px] text-slate-400">{lang.region}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
