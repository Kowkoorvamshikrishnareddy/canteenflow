import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { OrderStatusBadge } from '../common/StatusBadge';
import { UpiPaymentModal } from '../payment/UpiPaymentModal';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  QrCode,
  AlertTriangle,
  Receipt,
  XCircle,
  Star,
  Send,
} from 'lucide-react';
import { api } from '../../services/api';

interface OrderTrackerProps {
  order: Order;
  onCancel?: (orderId: string) => void;
  isCancelling?: boolean;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ order, onCancel, isCancelling }) => {
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [showUpiModal, setShowUpiModal] = useState(false);

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const steps: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
    { status: 'PLACED', label: 'Order Received', icon: <Receipt className="w-4 h-4" /> },
    { status: 'ACCEPTED', label: 'Accepted by Kitchen', icon: <CheckCircle2 className="w-4 h-4" /> },
    { status: 'PREPARING', label: 'Being Cooked', icon: <ChefHat className="w-4 h-4" /> },
    { status: 'READY', label: 'Ready for Pickup', icon: <PackageCheck className="w-4 h-4" /> },
    { status: 'COLLECTED', label: 'Collected', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED':
        return 0;
      case 'ACCEPTED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY':
        return 3;
      case 'COLLECTED':
        return 4;
      default:
        return 0;
    }
  };

  const isCancelled = order.status === 'CANCELLED' || order.status === 'REJECTED';
  const currentStepIdx = getStepIndex(order.status);
  const canCancel = ['PLACED', 'ACCEPTED'].includes(order.status);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-md p-6 sm:p-8 flex flex-col gap-6">
      {/* Top Header & Pickup Token Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Digital Token
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-blue tracking-tight">
            {order.orderNumber}
          </h2>
          <p className="text-xs text-ink-secondary mt-1">
            Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.orderType} Order
          </p>
        </div>

        {/* Digital QR Token Card */}
        <div className="flex items-center gap-3 bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/80 p-3 rounded-2xl shadow-sm self-start sm:self-auto">
          <div className="w-16 h-16 bg-white rounded-xl border border-slate-200/80 p-1 flex items-center justify-center shadow-inner relative group">
            <QrCode className="w-12 h-12 text-slate-800" />
            <div className="absolute inset-0 bg-brand-blue/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[9px] font-bold text-brand-blue">Scan</span>
            </div>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-ink-secondary block font-medium">Show at Counter</span>
            <span className="text-sm font-extrabold text-ink-primary font-mono">{currentOrder.orderNumber}</span>
            <span className="text-[11px] block font-semibold mt-0.5">
              {currentOrder.paymentStatus === 'PAID' ? (
                <span className="text-emerald-600">✓ Paid Online</span>
              ) : currentOrder.paymentStatus === 'PENDING' ? (
                <span className="text-amber-600">⏳ Payment Pending</span>
              ) : (
                <span className="text-slate-600">• Cash at Counter</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Online Payment Pending Call-To-Action Banner */}
      {currentOrder.paymentStatus === 'PENDING' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-purple-50/70 border border-amber-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-inner">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wide">
                  Action Required
                </span>
                <span className="text-xs font-bold text-ink-primary">
                  UPI Payment of ₹{currentOrder.total.toFixed(2)} Pending
                </span>
              </div>
              <p className="text-[11px] text-ink-secondary mt-0.5">
                Scan the canteen's official UPI QR code to complete your transaction and dispatch kitchen prep.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowUpiModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all shrink-0"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan UPI QR Code</span>
          </button>
        </div>
      )}

      {/* Progress Timeline Stepper */}
      {!isCancelled ? (
        <div className="py-2">
          <div className="relative flex justify-between">
            {/* Background connecting bar */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
            {/* Active connecting bar */}
            <div
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-brand-blue to-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step.status} className="relative z-10 flex flex-col items-center group">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isPast
                        ? 'bg-emerald-500 text-white shadow-emerald-glow'
                        : isCurrent
                        ? 'bg-brand-blue text-white shadow-brand-glow ring-4 ring-brand-blue/20 scale-110 animate-pulse'
                        : 'bg-white text-slate-300 border-2 border-slate-200'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs mt-2 text-center max-w-[70px] sm:max-w-[90px] font-medium transition-colors ${
                      isCurrent
                        ? 'text-brand-blue font-bold'
                        : isPast
                        ? 'text-emerald-700 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {order.status === 'READY' && (
            <div className="mt-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between animate-bounce">
              <div className="flex items-center gap-3">
                <PackageCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-bold">Your Food is Ready for Pickup!</h4>
                  <p className="text-xs text-emerald-700">
                    Please proceed to Counter 1 at Green Leaf Canteen and present token {order.orderNumber}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold">Order Cancelled or Declined</h4>
            <p className="text-xs text-rose-700">
              Reason: {order.cancellationReason || 'Order was cancelled'}
            </p>
          </div>
        </div>
      )}

      {/* Items Breakdown */}
      <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80">
        <h4 className="text-xs font-bold text-ink-primary uppercase tracking-wider mb-3">
          Order Summary ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
        </h4>
        <div className="divide-y divide-slate-200/60">
          {order.items.map((item) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-ink-primary text-[10px]">
                  {item.quantity}x
                </span>
                <span className="font-semibold text-ink-primary">{item.itemNameSnapshot}</span>
              </div>
              <span className="font-bold text-ink-primary">₹{item.lineTotal.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm font-extrabold text-ink-primary">
          <span>Total Paid</span>
          <span className="text-brand-blue font-black">₹{order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Student Meal Feedback for Collected Orders */}
      {order.status === 'COLLECTED' && (
        <div className="bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 rounded-2xl p-5 border border-amber-200/80 shadow-glass-sm space-y-4">
          {feedbackSubmitted ? (
            <div className="flex items-center gap-3 text-emerald-800 bg-emerald-50/80 p-4 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold">Feedback Submitted</h4>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Thank you! Your feedback directly helps our canteen chefs maintain great food quality.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4 className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>How was your meal & pickup experience?</span>
                  </h4>
                  <p className="text-[11px] text-ink-secondary mt-0.5">
                    Rate this order to help improve campus kitchen service.
                  </p>
                </div>

                {/* Interactive Star Rating */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-slate-300 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          s <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-ink-primary ml-1.5 w-4">
                    {rating}★
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Delicious dosa, hot & crispy! Fast pickup at counter."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
                <button
                  type="button"
                  disabled={isSubmittingFeedback}
                  onClick={async () => {
                    try {
                      setIsSubmittingFeedback(true);
                      await api.submitFeedback({
                        orderId: order.id,
                        rating,
                        comments: comments || 'Great meal and fast service!',
                      });
                      setFeedbackSubmitted(true);
                    } catch (err: any) {
                      alert(err.message || 'Could not submit feedback');
                    } finally {
                      setIsSubmittingFeedback(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-brand-blue-hover shadow-brand-glow transition-all disabled:opacity-50 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingFeedback ? 'Submitting...' : 'Submit'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Order Action */}
      {canCancel && onCancel && (
        <div className="flex justify-end pt-2">
          <button
            onClick={() => onCancel(order.id)}
            disabled={isCancelling}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>{isCancelling ? 'Cancelling...' : 'Cancel Order'}</span>
          </button>
        </div>
      )}

      {/* Interactive UPI Payment Modal */}
      <UpiPaymentModal
        order={currentOrder}
        isOpen={showUpiModal}
        onSuccess={(updated) => {
          setCurrentOrder(updated);
          setShowUpiModal(false);
        }}
        onClose={() => setShowUpiModal(false)}
      />
    </div>
  );
};
