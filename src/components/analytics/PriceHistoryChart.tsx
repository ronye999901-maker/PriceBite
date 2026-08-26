import React from 'react';
import { X, TrendingDown, Info, Calendar } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ProductComparisonItem } from '../../types';
import { MOCK_PRICE_HISTORY } from '../../mock/foodData';

interface PriceHistoryChartProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductComparisonItem | null;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  if (!isOpen || !product) return null;

  const data = MOCK_PRICE_HISTORY[product.id] || [
    { date: 'Aug 1', lowestPrice: 249, averagePrice: 279, highestPrice: 310 },
    { date: 'Aug 10', lowestPrice: 239, averagePrice: 269, highestPrice: 299 },
    { date: 'Aug 15', lowestPrice: 219, averagePrice: 255, highestPrice: 289 },
    { date: 'Today', lowestPrice: 237, averagePrice: 260, highestPrice: 285 },
  ];

  const lowestRecorded = Math.min(...data.map((d) => d.lowestPrice));
  const currentLowest = data[data.length - 1].lowestPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-100">Price History Trend</h3>
            <p className="text-xs text-slate-400 font-medium">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Lowest</span>
            <span className="text-lg font-black text-amber-400 font-mono">₹{currentLowest}</span>
          </div>
          <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-500/40">
            <span className="text-emerald-400 block text-[10px] uppercase font-extrabold">Lowest Recorded</span>
            <span className="text-lg font-black text-emerald-300 font-mono">₹{lowestRecorded}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Average Price</span>
            <span className="text-lg font-black text-slate-200 font-mono">₹265</span>
          </div>
        </div>

        {/* Recharts Historical Graph */}
        <div className="h-64 w-full bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} unit="₹" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
              />
              <Line type="monotone" dataKey="lowestPrice" stroke="#f59e0b" strokeWidth={3} name="Lowest Price (₹)" />
              <Line type="monotone" dataKey="averagePrice" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" name="Average Price (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          📊 Historical price data monitored across Swiggy, Zomato, Blinkit & Zepto platform adapters.
        </p>
      </div>
    </div>
  );
};
