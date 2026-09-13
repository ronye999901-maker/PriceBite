import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Bike,
  Store,
  ChevronRight,
  Package,
} from 'lucide-react';
import { OrderRecord, PINCodeDetails, ThemeMode } from '../../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderRecord | null;
  currentPinDetails: PINCodeDetails | null;
  onViewReceipt: (order: OrderRecord) => void;
  themeMode: ThemeMode;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  order,
  currentPinDetails,
  onViewReceipt,
  themeMode,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(2); // 0 to 4
  const [etaMinutes, setEtaMinutes] = useState(22);
  const [riderProgressPercent, setRiderProgressPercent] = useState(45);
  const [riderToast, setRiderToast] = useState<string | null>(null);

  const isDark = themeMode === 'dark';

  const steps = [
    { title: 'Order Placed', desc: 'Received by store system', time: 'Just now' },
    { title: 'Confirmed & Preparing', desc: 'Freshly being prepared & packed', time: '2 mins ago' },
    { title: 'Rider Assigned', desc: 'Rahul Sharma picked up order', time: 'Now' },
    { title: 'Out for Delivery', desc: 'Rider en route to your location', time: 'Estimated 15 mins' },
    { title: 'Delivered', desc: 'Handed over at doorstep', time: 'Completed' },
  ];

  // Auto-progress simulation
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setRiderProgressPercent((prev) => {
        if (prev >= 95) {
          setCurrentStepIndex(4);
          return 100;
        }
        if (prev >= 65) {
          setCurrentStepIndex(3);
        }
        return prev + 5;
      });

      setEtaMinutes((prev) => (prev > 2 ? prev - 1 : 2));
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const locText = currentPinDetails
    ? `${currentPinDetails.area}, ${currentPinDetails.district} (${currentPinDetails.pinCode})`
    : order.deliveryAddress || 'Current PIN Location';

  const handleCallRider = () => {
    setRiderToast('Connecting call with Delivery Partner (Rahul Sharma)...');
    setTimeout(() => setRiderToast(null), 3000);
  };

  const handleChatRider = () => {
    setRiderToast('Opening direct chat with Delivery Partner...');
    setTimeout(() => setRiderToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-auto transition-all ${
          isDark ? 'glass-card border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xl border border-orange-500/30">
              🛵
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-base">Live Order Tracking</h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                  ● Live GPS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Order #{order.id} • {order.items.length} items
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewReceipt(order)}
              className="hidden sm:flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-orange-400" />
              <span>Tax Invoice</span>
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

        {/* Floating Toast notification */}
        {riderToast && (
          <div className="bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 text-center animate-slide-up">
            {riderToast}
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Live ETA Card */}
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDark
                ? 'bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent border-orange-500/30'
                : 'bg-orange-50 border-orange-200'
            }`}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase text-orange-400 tracking-wider flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Estimated Arrival</span>
              </span>
              <div className="text-3xl font-black text-amber-400 flex items-baseline space-x-2">
                <span>{currentStepIndex === 4 ? 'Delivered!' : `${etaMinutes} Minutes`}</span>
                {currentStepIndex < 4 && <span className="text-xs text-slate-400 font-normal">({new Date(Date.now() + etaMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>}
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Delivering to: <strong className="text-white">{locText}</strong>
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700/50">
              <span className="text-xs text-slate-400">Total Order Value:</span>
              <span className="text-xl font-black text-emerald-400">₹{order.totalAmount}</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{order.paymentMethod}</span>
            </div>
          </div>

          {/* SIMULATED INTERACTIVE MAP ROUTE VISUALIZATION */}
          <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-700/70 bg-slate-950 shadow-inner flex flex-col justify-between p-4">
            {/* Dark Mode Map Grid Background */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Simulated Road Paths */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 60 130 C 180 130, 240 50, 480 50"
                fill="none"
                stroke="#334155"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 60 130 C 180 130, 240 50, 480 50"
                fill="none"
                stroke="#f97316"
                strokeWidth="4"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
            </svg>

            {/* Store Origin Node */}
            <div className="relative z-10 flex items-center space-x-2">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center font-bold text-lg shadow-lg shadow-orange-500/20">
                🏪
              </div>
              <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-200">
                Partner Store / Kitchen
              </div>
            </div>

            {/* Dynamic Rider Pin on the Route */}
            <div
              className="absolute z-20 transition-all duration-1000 ease-out"
              style={{
                left: `clamp(15%, ${riderProgressPercent}%, 85%)`,
                top: `clamp(25%, ${50 - Math.sin((riderProgressPercent / 100) * Math.PI) * 20}%, 70%)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="relative flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-slate-950 flex items-center justify-center font-bold text-base shadow-xl shadow-orange-500/50 animate-bounce">
                  🛵
                </div>
                <div className="bg-slate-900/95 border border-orange-500/50 text-[10px] font-extrabold text-orange-300 px-2 py-0.5 rounded-full mt-1 whitespace-nowrap shadow-md">
                  Rahul Sharma ({riderProgressPercent}%)
                </div>
              </div>
            </div>

            {/* Destination Node */}
            <div className="relative z-10 flex items-center justify-end space-x-2">
              <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 text-[11px] font-bold text-emerald-300">
                Your Address ({currentPinDetails?.pinCode || 'Destination'})
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-500/20">
                📍
              </div>
            </div>
          </div>

          {/* Delivery Timeline Stepper */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Live Delivery Milestones
            </h4>

            <div className="relative pl-6 space-y-5 border-l-2 border-slate-800 ml-3">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                        isPassed
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      } ${isCurrent ? 'ring-4 ring-orange-500/30 scale-110' : ''}`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className={`text-xs font-extrabold ${isPassed ? 'text-slate-100' : 'text-slate-500'}`}>
                          {step.title}
                        </h5>
                        <p className="text-[11px] text-slate-400">{step.desc}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">{step.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Partner Contact Card */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
                🛵
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h5 className="font-extrabold text-xs">Rahul Sharma</h5>
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-1.5 py-0.2 rounded border border-amber-500/30">
                    4.9 ★
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Electric Scooter • DL 3S 8492 • Covid Vaccinated</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCallRider}
                className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                title="Call Delivery Partner"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={handleChatRider}
                className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition-colors"
                title="Chat with Delivery Partner"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Ordered Items ({order.items.length})
            </h4>

            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <h6 className="font-bold">{item.productName}</h6>
                      <p className="text-[10px] text-slate-400">
                        {item.platformName} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-amber-400">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PriceBite Freshness & Punctuality Guarantee</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => onViewReceipt(order)}
              className="flex-1 sm:flex-none bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500/30 px-4 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Tax Receipt</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
