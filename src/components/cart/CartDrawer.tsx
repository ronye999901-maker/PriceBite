import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, CheckCircle2, ShieldCheck, MapPin, Zap, Lock, KeyRound } from 'lucide-react';
import { CartItem, PINCodeDetails, ThemeMode, CryptographicProof } from '../../types';
import { signOrderPayload } from '../../engine/crypto/securityEngine';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onInitiatePayment?: (items: CartItem[], totalAmount: number) => void;
  onCheckoutSuccess?: (items: CartItem[], totalAmount: number) => void;
  currentPinDetails: PINCodeDetails | null;
  themeMode: ThemeMode;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onInitiatePayment,
  onCheckoutSuccess,
  currentPinDetails,
  themeMode,
}) => {
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);
  const [cryptoProof, setCryptoProof] = useState<CryptographicProof | null>(null);
  const [showCryptoDetails, setShowCryptoDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsOrderCompleted(false);
    }
  }, [isOpen]);

  const isDark = themeMode === 'dark';

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = cartItems.length > 0 ? 15 : 0;
  const discount = cartItems.length > 0 ? 25 : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - discount);

  // Compute ECDSA signature in real-time
  useEffect(() => {
    if (cartItems.length > 0) {
      const summary = cartItems.map((i) => `${i.productName}x${i.quantity}@₹${i.price}`).join(',');
      signOrderPayload({
        totalAmount: grandTotal,
        itemsSummary: summary,
        pinCode: currentPinDetails?.pinCode || '700156',
      }).then((proof) => {
        setCryptoProof(proof);
      }).catch((err) => {
        console.warn('Crypto signing background notice:', err);
      });
    } else {
      setCryptoProof(null);
    }
  }, [cartItems, grandTotal, currentPinDetails]);

  const locText = currentPinDetails
    ? `${currentPinDetails.area}, ${currentPinDetails.district} (${currentPinDetails.pinCode})`
    : 'Select Delivery Location';

  const handleCheckoutClick = () => {
    if (onInitiatePayment) {
      onInitiatePayment([...cartItems], grandTotal);
      onClose();
    } else if (onCheckoutSuccess) {
      onCheckoutSuccess([...cartItems], grandTotal);
      onClearCart();
      setIsOrderCompleted(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-md shadow-2xl flex flex-col justify-between border-l transition-colors ${
            isDark ? 'glass-card border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div
            className={`p-5 border-b flex items-center justify-between ${
              isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xl border border-orange-500/30">
                🛒
              </div>
              <div>
                <h3 className="font-extrabold text-base">Your PriceBite Cart</h3>
                <p className="text-xs text-slate-400">{cartItems.length} items in cart</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isDark ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-500 hover:text-slate-900 bg-slate-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {isOrderCompleted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full mx-auto flex items-center justify-center text-3xl border border-emerald-500/40 animate-bounce">
                  ✓
                </div>
                <h3 className="text-2xl font-black">Order Placed Successfully!</h3>
                <p className="text-xs text-amber-400 font-bold">
                  Order ID: #PB-{(Math.random() * 90000 + 10000).toFixed(0)} • Delivery to {locText}
                </p>
                <button
                  onClick={() => setIsOrderCompleted(false)}
                  className="bg-slate-800 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-700"
                >
                  Continue Shopping
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <span className="text-5xl block">🛒</span>
                <h4 className="text-lg font-bold">Your Cart is Empty</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Browse dishes & quick-commerce items across Swiggy, Zomato & PriceBite Direct to add them to your cart!
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border flex items-center space-x-3 transition-all ${
                    isDark ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <img src={item.imageUrl} alt={item.productName} className="w-14 h-14 rounded-xl object-cover" />

                  <div className="flex-1 truncate space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm">{item.platformLogo}</span>
                      <span className="text-[10px] font-bold text-orange-400 uppercase">{item.platformName}</span>
                    </div>

                    <h4 className="font-extrabold text-xs truncate">{item.productName}</h4>
                    <p className="text-[11px] font-black text-amber-400">₹{item.price * item.quantity}</p>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div
                      className={`flex items-center space-x-2 px-2 py-1 rounded-xl border ${
                        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                      }`}
                    >
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="text-orange-400 font-black text-xs px-1"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="text-orange-400 font-black text-xs px-1"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && !isOrderCompleted && (
            <div
              className={`p-5 border-t space-y-4 ${
                isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 text-xs text-amber-400 font-bold">
                <MapPin className="w-4 h-4" />
                <span className="truncate">Delivery: {locText}</span>
              </div>

              {/* Cryptographic Protection Badge */}
              {cryptoProof && (
                <div
                  onClick={() => setShowCryptoDetails(!showCryptoDetails)}
                  className="cursor-pointer p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between text-[11px] transition-all hover:bg-emerald-500/15"
                >
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>ECDSA-256 Tamper-Proof Seal</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/40">
                    {cryptoProof.publicKeyFingerprint}
                  </span>
                </div>
              )}

              {showCryptoDetails && cryptoProof && (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] font-mono space-y-1 text-slate-300 animate-fade-in">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cipher:</span>
                    <span className="text-amber-400">{cryptoProof.algorithm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payload Hash:</span>
                    <span className="text-slate-200 truncate max-w-[180px]">{cryptoProof.payloadHash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Signature:</span>
                    <span className="text-emerald-400 truncate max-w-[180px]">{cryptoProof.signatureHex.slice(0, 24)}...</span>
                  </div>
                </div>
              )}

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Fee:</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>PriceBite Instant Offer Discount:</span>
                  <span>-₹{discount}</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-800">
                  <span>Payable Amount:</span>
                  <span className="text-amber-400 text-base">₹{grandTotal}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-slate-950 font-black py-3.5 rounded-xl text-sm shadow-xl shadow-orange-500/25 transition-all flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Pay ₹{grandTotal} via UPI & Track Live →</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
