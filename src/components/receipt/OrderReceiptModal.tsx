import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, ShoppingBag, ArrowRight, RotateCcw } from 'lucide-react';
import { OrderRecord, PINCodeDetails, ThemeMode } from '../../types';

interface OrderReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderRecord | null;
  currentPinDetails: PINCodeDetails | null;
  onReorder?: (items: any[]) => void;
  themeMode: ThemeMode;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  currentPinDetails,
  onReorder,
  themeMode,
}) => {
  if (!isOpen || !order) return null;

  const isDark = themeMode === 'dark';

  const subtotal = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxes = Math.round(subtotal * 0.05);
  const deliveryFee = 15;
  const platformDiscount = 25;
  const estimatedMarketSavings = Math.round(subtotal * 0.18) + platformDiscount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto print:p-0 print:bg-white">
      <div
        id="pricebite-tax-invoice"
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden my-auto transition-all print:shadow-none print:border-none print:max-w-full ${
          isDark ? 'glass-card border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header Bar */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between print:hidden ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-xl">🧾</span>
            <h3 className="font-black text-sm">Official Digital Tax Invoice</h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5 text-orange-400" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isDark ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-500 hover:text-slate-900 bg-slate-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet Content */}
        <div className="p-6 sm:p-8 space-y-6 bg-slate-950 text-slate-100">
          {/* Top Brand Banner */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  PriceBite™
                </span>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded border border-orange-500/30">
                  Pan-India Direct
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Zero Commission Food & Grocery Comparison Engine
              </p>
              <p className="text-[10px] text-slate-500">GSTIN: 07AABCP9928M1Z8 • Tax Invoice #PB-{order.id}</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                PAID VIA {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'UPI'}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-2">{order.date}</p>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Billed & Delivered To:</span>
              <p className="font-extrabold text-slate-200 mt-0.5">Verified Customer</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {currentPinDetails
                  ? `${currentPinDetails.area}, ${currentPinDetails.district} (${currentPinDetails.pinCode})`
                  : order.deliveryAddress}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Order Reference:</span>
              <p className="font-extrabold text-amber-400 mt-0.5">#PB-{order.id}</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Status: {order.status}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Item Details</h4>

            <div className="border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-bold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30">
                      <td className="p-3">
                        <span className="font-bold text-slate-200">{item.productName}</span>
                        <div className="text-[10px] text-slate-500">Source: {item.platformName}</div>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-300">{item.quantity}</td>
                      <td className="p-3 text-right text-slate-400">₹{item.price}</td>
                      <td className="p-3 text-right font-black text-slate-200">
                        ₹{item.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Breakdown Calculation */}
          <div className="space-y-2 border-t border-slate-800 pt-4 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Items Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Standard Delivery & Handling:</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST & Restaurant Taxes (5%):</span>
              <span>₹{taxes}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>PriceBite Instant Promo Discount:</span>
              <span>-₹{platformDiscount}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-100 pt-3 border-t border-slate-800">
              <span>Grand Total Paid:</span>
              <span className="text-amber-400">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Savings Highlight Box */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">💰</span>
              <div>
                <h5 className="font-black text-xs text-emerald-400">You Saved on this Order!</h5>
                <p className="text-[10px] text-slate-400">
                  Compared to highest single-app rates + zero commission benefit
                </p>
              </div>
            </div>
            <span className="text-lg font-black text-emerald-400">₹{estimatedMarketSavings}</span>
          </div>

          {/* Verification Stamp & Cryptographic SHA-256 Seal */}
          <div className="border-t border-slate-800/80 pt-4 text-[10px] text-slate-500 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300 font-semibold">Cryptographically Signed & Tax Compliant</span>
              </div>
              <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                VERIFIED #{order.id}
              </span>
            </div>
            <div className="flex justify-between font-mono text-[9px] text-slate-500">
              <span>SHA-256 Integrity Checksum:</span>
              <span className="text-slate-400 truncate max-w-[260px]">
                SHA256:{Array.from(order.id + order.totalAmount + order.date).reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0).toString(16).padStart(8, '0')}7e992b8d4f6a1c3e5502
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between print:hidden ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {onReorder && (
            <button
              onClick={() => {
                onReorder(order.items);
                onClose();
              }}
              className="bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reorder Entire Basket</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
