import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order } from '../../types';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  Smartphone,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface UpiPaymentModalProps {
  order: Order;
  isOpen: boolean;
  onSuccess: (updatedOrder: Order) => void;
  onClose: () => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  order,
  isOpen,
  onSuccess,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upiId = 'canteenflow.apex@icici';
  const merchantName = 'Green Leaf Central Canteen';
  const upiPayload = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${order.total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${order.orderNumber}`)}`;

  // 5-minute countdown timer
  useEffect(() => {
    if (!isOpen || isSuccess) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isSuccess]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (simulatedTxId?: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      const txId = simulatedTxId || `UPI-${Date.now().toString().slice(-8)}`;
      const res = await api.verifyPayment(order.id, txId);

      setIsSuccess(true);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch (e) {
        // ignore
      }

      // Small delay to let user enjoy the success state before navigating
      setTimeout(() => {
        onSuccess(res.order);
      }, 1400);
    } catch (err: any) {
      setError(err.message || 'Payment verification could not be confirmed. Please check your transaction.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 my-8"
        >
          {/* Close Button */}
          {!isSuccess && (
            <button
              onClick={onClose}
              disabled={isVerifying}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-ink-primary hover:bg-slate-100 transition-colors"
              title="Close payment"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Success Overlay View */}
          {isSuccess ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-10 text-center space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-ink-primary">Payment Confirmed!</h3>
              <p className="text-xs text-ink-secondary max-w-xs mx-auto">
                ₹{order.total.toFixed(2)} received via UPI. Your kitchen order <span className="font-bold text-ink-primary">{order.orderNumber}</span> has been dispatched!
              </p>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified by Campus Payment Gateway</span>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center space-y-1 pr-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-bold tracking-wide uppercase">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>UPI Instant Payment</span>
                </div>
                <h2 className="text-xl font-black text-ink-primary tracking-tight">
                  Scan QR with any UPI App
                </h2>
                <p className="text-xs text-ink-secondary">
                  GPay • PhonePe • Paytm • BHIM • Cred
                </p>
              </div>

              {/* Amount & Order Pill */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider block">
                    Order {order.orderNumber}
                  </span>
                  <span className="text-xs text-ink-secondary font-medium">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'} in kitchen order
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-brand-blue tracking-tight">
                    ₹{order.total.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Zero Conv. Fee</span>
                </div>
              </div>

              {/* Error Message if any */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-sm relative group">
                <div className="p-3 bg-white rounded-xl shadow-md border border-slate-100 relative">
                  <QRCodeSVG
                    value={upiPayload}
                    size={180}
                    level="Q"
                    includeMargin={false}
                    className="mx-auto"
                  />
                  {/* Center Brand Badge */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-white shadow-md border border-purple-200 flex items-center justify-center text-[10px] font-extrabold text-purple-700">
                      UPI
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-secondary font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>QR expires in: </span>
                  <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-rose-600 animate-pulse' : 'text-ink-primary'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              {/* UPI ID Row with 1-Click Copy */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="truncate mr-2">
                  <span className="text-[10px] text-ink-secondary block font-semibold">Canteen UPI VPA:</span>
                  <span className="font-mono font-bold text-ink-primary select-all">{upiId}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpiId}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-ink-primary font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                {/* 1. Real Verification Button */}
                <button
                  type="button"
                  onClick={() => handleVerify()}
                  disabled={isVerifying || timeLeft === 0}
                  className="w-full py-3.5 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs sm:text-sm font-bold shadow-brand-glow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying with Bank...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>I Have Made the Payment • Confirm</span>
                    </>
                  )}
                </button>

                {/* 2. Instant Simulator Quick-Pass for Testing */}
                <button
                  type="button"
                  onClick={() => handleVerify(`SIM_UPI_${Date.now()}`)}
                  disabled={isVerifying || timeLeft === 0}
                  className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Instant UPI Approval (Sandbox)</span>
                </button>
              </div>

              {/* Security Footnote */}
              <p className="text-[10px] text-center text-ink-secondary flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit encrypted campus payment gateway</span>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
