import React, { useState, useEffect } from 'react';
import { X, QrCode, ShieldCheck, CheckCircle2, Lock, ArrowRight, Smartphone, RefreshCw, AlertCircle } from 'lucide-react';
import { CartItem, PINCodeDetails, ThemeMode } from '../../types';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  items: CartItem[];
  currentPinDetails: PINCodeDetails | null;
  onPaymentSuccess: (paymentDetails: {
    transactionId: string;
    paymentMethod: string;
    amount: number;
    items: CartItem[];
    deliveryPinCode: string;
  }) => void;
  themeMode: ThemeMode;
}

type PaymentOption = 'gpay' | 'phonepe' | 'paytm' | 'cred' | 'qr' | 'upi_id';

export const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  items,
  currentPinDetails,
  onPaymentSuccess,
  themeMode,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentOption>('gpay');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [enteredPin, setEnteredPin] = useState('');
  const [paymentStep, setPaymentStep] = useState<'select' | 'enter_pin' | 'processing' | 'success'>('select');
  const [qrTimer, setQrTimer] = useState(180);
  const [txnId, setTxnId] = useState('');

  const isDark = themeMode === 'dark';

  useEffect(() => {
    if (isOpen) {
      setPaymentStep('select');
      setEnteredPin('');
      setQrTimer(180);
      setTxnId(`UPI-PB-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [isOpen]);

  // QR Code countdown
  useEffect(() => {
    if (!isOpen || selectedMethod !== 'qr' || qrTimer <= 0) return;
    const interval = setInterval(() => {
      setQrTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, selectedMethod, qrTimer]);

  if (!isOpen) return null;

  const upiApps = [
    { id: 'gpay' as PaymentOption, name: 'Google Pay', icon: '🟢', desc: 'Fast UPI auto-redirect' },
    { id: 'phonepe' as PaymentOption, name: 'PhonePe', icon: '🟣', desc: 'Direct bank debit via PhonePe' },
    { id: 'paytm' as PaymentOption, name: 'Paytm UPI', icon: '🔵', desc: 'Pay with Paytm Wallet / Bank' },
    { id: 'cred' as PaymentOption, name: 'CRED UPI', icon: '⚫', desc: 'Earn cashback & reward coins' },
    { id: 'qr' as PaymentOption, name: 'Scan Dynamic QR Code', icon: '📱', desc: 'Scan with any UPI application' },
    { id: 'upi_id' as PaymentOption, name: 'Enter Custom VPA / UPI ID', icon: '🆔', desc: 'e.g. yourname@oksbi' },
  ];

  const handleStartPayment = () => {
    if (selectedMethod === 'qr') {
      setPaymentStep('processing');
      setTimeout(() => {
        completePayment();
      }, 2500);
    } else {
      setPaymentStep('enter_pin');
    }
  };

  const handlePinSubmit = () => {
    if (enteredPin.length < 4) return;
    setPaymentStep('processing');
    setTimeout(() => {
      completePayment();
    }, 2000);
  };

  const completePayment = () => {
    setPaymentStep('success');
    const selectedAppName = upiApps.find((a) => a.id === selectedMethod)?.name || 'UPI App';
    setTimeout(() => {
      onPaymentSuccess({
        transactionId: txnId,
        paymentMethod: `UPI (${selectedAppName})`,
        amount: totalAmount,
        items,
        deliveryPinCode: currentPinDetails?.pinCode || '110001',
      });
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all ${
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl border border-emerald-500/30">
              ⚡
            </div>
            <div>
              <h3 className="font-black text-base">Secure UPI Payment</h3>
              <p className="text-xs text-slate-400">NPCI Certified 256-Bit Encrypted Gateway</p>
            </div>
          </div>

          {paymentStep !== 'processing' && paymentStep !== 'success' && (
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isDark ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-500 hover:text-slate-900 bg-slate-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Amount & Destination Banner */}
        <div
          className={`px-6 py-3 border-b flex items-center justify-between ${
            isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-orange-50/60 border-orange-100'
          }`}
        >
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase">Total Payable</span>
            <div className="text-2xl font-black text-emerald-400">₹{totalAmount}</div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Delivering to</span>
            <div className="text-xs font-bold text-orange-400 truncate max-w-[200px]">
              {currentPinDetails ? `${currentPinDetails.area} (${currentPinDetails.pinCode})` : 'Selected Address'}
            </div>
          </div>
        </div>

        {/* Step 1: Select Method */}
        {paymentStep === 'select' && (
          <div className="p-6 space-y-5">
            <div className="space-y-2.5">
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Select UPI App / Method
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {upiApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedMethod(app.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                      selectedMethod === app.id
                        ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10'
                        : isDark
                        ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl">{app.icon}</span>
                    <div className="flex-1 truncate">
                      <div className="font-black text-xs text-slate-200 flex items-center justify-between">
                        <span>{app.name}</span>
                        {selectedMethod === app.id && <span className="text-orange-400 text-xs">●</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{app.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom UPI ID Field if selected */}
            {selectedMethod === 'upi_id' && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-xs font-bold text-slate-300">Enter Virtual Payment Address (VPA)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiIdInput}
                    onChange={(e) => setUpiIdInput(e.target.value)}
                    placeholder="e.g. mobileNumber@upi or user@okhdfcbank"
                    className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <span className="absolute right-3 top-3 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              </div>
            )}

            {/* Dynamic QR Code display if selected */}
            {selectedMethod === 'qr' && (
              <div className="p-4 rounded-2xl border border-dashed border-orange-500/40 bg-orange-500/5 text-center space-y-3 animate-fade-in">
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl shadow-md flex flex-col items-center justify-center border">
                  {/* Stylized QR Code SVG */}
                  <svg viewBox="0 0 100 100" className="w-32 h-32 text-slate-900 fill-current">
                    <rect x="0" y="0" width="30" height="30" rx="4" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="10" y="10" width="10" height="10" />

                    <rect x="70" y="0" width="30" height="30" rx="4" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="80" y="10" width="10" height="10" />

                    <rect x="0" y="70" width="30" height="30" rx="4" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="10" y="80" width="10" height="10" />

                    <rect x="40" y="10" width="20" height="8" />
                    <rect x="40" y="25" width="10" height="10" />
                    <rect x="55" y="25" width="10" height="25" />
                    <rect x="10" y="40" width="20" height="10" />
                    <rect x="35" y="45" width="15" height="15" />
                    <rect x="40" y="70" width="25" height="10" />
                    <rect x="70" y="45" width="25" height="15" />
                    <rect x="75" y="70" width="20" height="20" />
                  </svg>
                </div>
                <div className="text-xs">
                  <p className="font-extrabold text-slate-200">Scan & Pay ₹{totalAmount}</p>
                  <p className="text-[11px] text-amber-400 font-bold mt-0.5">
                    QR expires in: {Math.floor(qrTimer / 60)}:{(qrTimer % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleStartPayment}
              className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-slate-950 font-black py-3.5 rounded-xl text-sm shadow-xl shadow-orange-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>{selectedMethod === 'qr' ? 'I Have Paid via QR ⚡' : `Pay ₹${totalAmount} via ${upiApps.find(a => a.id === selectedMethod)?.name}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: UPI PIN Keypad */}
        {paymentStep === 'enter_pin' && (
          <div className="p-6 space-y-6 animate-slide-up">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl border border-amber-500/30">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-black text-base">Enter 4 or 6-Digit UPI PIN</h4>
              <p className="text-xs text-slate-400">
                Authenticating payment of <strong>₹{totalAmount}</strong> to PriceBite
              </p>
            </div>

            {/* PIN Dots */}
            <div className="flex justify-center space-x-3 py-2">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    enteredPin.length > idx
                      ? 'bg-orange-400 border-orange-400 scale-110 shadow-md shadow-orange-500/50'
                      : 'border-slate-600 bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => enteredPin.length < 6 && setEnteredPin((p) => p + num)}
                  className={`py-3 rounded-2xl font-black text-lg transition-all ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setEnteredPin('')}
                className="py-3 rounded-2xl font-bold text-xs text-red-400 hover:bg-red-500/10"
              >
                Clear
              </button>
              <button
                onClick={() => enteredPin.length < 6 && setEnteredPin((p) => p + '0')}
                className={`py-3 rounded-2xl font-black text-lg transition-all ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
              >
                0
              </button>
              <button
                onClick={() => setEnteredPin((p) => p.slice(0, -1))}
                className="py-3 rounded-2xl font-bold text-xs text-amber-400 hover:bg-amber-500/10"
              >
                ⌫
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setPaymentStep('select')}
                className="flex-1 bg-slate-800 text-slate-300 font-bold py-3 rounded-xl text-xs hover:bg-slate-700"
              >
                Back
              </button>
              <button
                onClick={handlePinSubmit}
                disabled={enteredPin.length < 4}
                className="flex-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 rounded-xl text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-40"
              >
                Authorize Payment (₹{totalAmount})
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Processing Animation */}
        {paymentStep === 'processing' && (
          <div className="p-12 text-center space-y-4 animate-fade-in">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-orange-400">
                ₹
              </div>
            </div>
            <h4 className="font-black text-lg">Contacting Bank Gateway...</h4>
            <p className="text-xs text-slate-400">
              Please do not press back or refresh the window. Confirming transaction with UPI server.
            </p>
          </div>
        )}

        {/* Step 4: Payment Success Confirmation */}
        {paymentStep === 'success' && (
          <div className="p-10 text-center space-y-4 animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-4xl border border-emerald-500/40 shadow-xl shadow-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="font-black text-2xl text-emerald-400">Payment Successful!</h3>
            <p className="text-xs text-slate-300 font-semibold">
              Transaction ID: <strong className="text-amber-400">{txnId}</strong>
            </p>
            <p className="text-[11px] text-slate-400">
              Paid ₹{totalAmount} • Launching Live Delivery Tracking...
            </p>
          </div>
        )}

        {/* Security Footer */}
        <div
          className={`px-6 py-2.5 border-t flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-medium ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured by NPCI • Instant Refund Protection Guaranteed</span>
        </div>
      </div>
    </div>
  );
};
