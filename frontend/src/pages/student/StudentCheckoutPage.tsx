import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PickupSlot, OrderType, PaymentMethod, Order } from '../../types';
import { UpiPaymentModal } from '../../components/payment/UpiPaymentModal';
import confetti from 'canvas-confetti';
import {
  Clock,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Users,
} from 'lucide-react';

export const StudentCheckoutPage: React.FC = () => {
  const { items, subtotal, taxes, total, clearCart } = useCart();
  const { user, college } = useAuth();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState<OrderType>('IMMEDIATE');
  const [pickupSlots, setPickupSlots] = useState<PickupSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UPI Payment Modal State
  const [createdOrderForPayment, setCreatedOrderForPayment] = useState<Order | null>(null);
  const [showUpiModal, setShowUpiModal] = useState(false);

  useEffect(() => {
    // Load available slots
    const loadSlots = async () => {
      try {
        const res = await api.getPickupSlots();
        setPickupSlots(res.slots);
        if (res.slots.length > 0 && !selectedSlotId) {
          // Select first non-full slot
          const available = res.slots.find((s) => !s.isFull);
          if (available) setSelectedSlotId(available.id);
        }
      } catch (err) {
        console.error('Failed to fetch pickup slots:', err);
      }
    };
    loadSlots();
  }, []);

  const handlePaymentSuccess = (updatedOrder: Order) => {
    setShowUpiModal(false);
    clearCart();
    navigate(`/student/orders/${updatedOrder.id}`);
  };

  const handlePaymentClose = () => {
    setShowUpiModal(false);
    if (createdOrderForPayment) {
      clearCart();
      navigate(`/student/orders/${createdOrderForPayment.id}`);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setError('Your tray is empty. Add food items before checking out.');
      return;
    }

    if (orderType === 'SCHEDULED' && !selectedSlotId) {
      setError('Please choose a valid scheduled pickup time window.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderPayload = {
        orderType,
        items: items.map((i) => ({
          menuItemId: i.item.id,
          quantity: i.quantity,
        })),
        paymentMethod,
        paymentStatus: paymentMethod === 'CASH' ? 'CASH_DUE' : 'PENDING',
        pickupSlotId: orderType === 'SCHEDULED' ? selectedSlotId : undefined,
      };

      const res = await api.createOrder(orderPayload as any);

      if (paymentMethod === 'UPI') {
        // Open interactive UPI QR Code Modal!
        setCreatedOrderForPayment(res.order);
        setShowUpiModal(true);
        return;
      }

      if (paymentMethod === 'CARD') {
        const verified = await api.verifyPayment(res.order.id, `CARD_${Date.now()}`);
        clearCart();
        navigate(`/student/orders/${verified.order.id}`);
        return;
      }

      // Pay Cash at Counter
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore confetti errors
      }

      clearCart();
      // Navigate to order details / live tracker
      navigate(`/student/orders/${res.order.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-md p-10">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-ink-primary mb-2">Your Tray is Empty</h2>
          <p className="text-xs sm:text-sm text-ink-secondary mb-6">
            You don't have any items ready for checkout. Browse today's cafeteria specials to place an order.
          </p>
          <Link
            to="/student/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-blue text-white text-xs font-bold shadow-brand-glow hover:bg-brand-blue-hover transition-all"
          >
            <span>Browse Today's Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
          Review & Place Order
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          Apex Institute of Technology • Green Leaf Central Canteen
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Timing & Payment Mode */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Timing Mode Selector: Immediate vs Scheduled */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 space-y-5">
            <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-blue" />
              1. Choose Pickup Timing
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('IMMEDIATE')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  orderType === 'IMMEDIATE'
                    ? 'border-brand-blue bg-brand-blue-light/50 ring-2 ring-brand-blue/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-ink-primary">Immediate Order</span>
                  <Sparkles className={`w-4 h-4 ${orderType === 'IMMEDIATE' ? 'text-brand-blue' : 'text-slate-400'}`} />
                </div>
                <p className="text-[11px] text-ink-secondary">
                  Kitchen begins prep immediately. Ready in ~10-15 mins.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('SCHEDULED')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  orderType === 'SCHEDULED'
                    ? 'border-brand-blue bg-brand-blue-light/50 ring-2 ring-brand-blue/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-ink-primary">Scheduled Pickup</span>
                  <Calendar className={`w-4 h-4 ${orderType === 'SCHEDULED' ? 'text-brand-blue' : 'text-slate-400'}`} />
                </div>
                <p className="text-[11px] text-ink-secondary">
                  Reserve a guaranteed 15-minute meal break window.
                </p>
              </button>
            </div>

            {/* Scheduled Slot Selection Grid */}
            {orderType === 'SCHEDULED' && (
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-primary">Available 15-Min Windows</span>
                  <span className="text-[11px] text-ink-secondary flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Capacity protected
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {pickupSlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    const startTime = new Date(slot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endTime = new Date(slot.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={slot.isFull}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          slot.isFull
                            ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'border-brand-blue bg-white shadow-sm ring-2 ring-brand-blue/30'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-ink-primary">
                          {startTime} - {endTime}
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span
                            className={`text-[10px] font-semibold ${
                              slot.isFull
                                ? 'text-rose-600'
                                : slot.availableRemaining <= 3
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {slot.isFull ? 'Full' : `${slot.availableRemaining} slots left`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. Payment Method Selection */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              2. Select Payment Method
            </h3>

            <div className="space-y-2.5">
              {/* Option 1: UPI */}
              <label
                onClick={() => setPaymentMethod('UPI')}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-brand-blue bg-brand-blue-light/30 ring-2 ring-brand-blue/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                    UPI
                  </div>
                  <div>
                    <span className="text-xs font-bold text-ink-primary block">
                      UPI Instant Pay (GPay / PhonePe / Paytm)
                    </span>
                    <span className="text-[11px] text-ink-secondary">
                      Zero fee digital checkout with instant token generation
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="w-4 h-4 text-brand-blue border-slate-300"
                />
              </label>

              {/* Option 2: Card */}
              <label
                onClick={() => setPaymentMethod('CARD')}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-brand-blue bg-brand-blue-light/30 ring-2 ring-brand-blue/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-ink-primary block">
                      Debit / Credit Card
                    </span>
                    <span className="text-[11px] text-ink-secondary">
                      Visa, Mastercard, RuPay processed securely
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                  className="w-4 h-4 text-brand-blue border-slate-300"
                />
              </label>

              {/* Option 3: Cash at Counter */}
              <label
                onClick={() => setPaymentMethod('CASH')}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-brand-blue bg-brand-blue-light/30 ring-2 ring-brand-blue/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-ink-primary block">
                      Pay Cash at Counter
                    </span>
                    <span className="text-[11px] text-ink-secondary">
                      Order placed as Cash Due; settle balance upon meal collection
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'CASH'}
                  onChange={() => setPaymentMethod('CASH')}
                  className="w-4 h-4 text-brand-blue border-slate-300"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Action */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-md p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider">
              Order Summary
            </h3>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {items.map((cartItem) => (
                <div key={cartItem.item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-ink-primary">
                      {cartItem.quantity}x {cartItem.item.name}
                    </span>
                    {cartItem.customizationNote && (
                      <p className="text-[10px] text-amber-700 italic">
                        "{cartItem.customizationNote}"
                      </p>
                    )}
                  </div>
                  <span className="font-extrabold text-ink-primary">
                    ₹{(cartItem.item.price * cartItem.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-ink-secondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-ink-primary">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Campus Tax (5%)</span>
                <span className="font-semibold text-ink-primary">₹{taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-extrabold text-ink-primary">
                <span>Total Due</span>
                <span className="text-brand-blue font-black">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-ink-secondary leading-snug">
              <span className="font-bold text-ink-primary block mb-0.5">Cancellation Policy</span>
              Orders may be cancelled free of charge prior to kitchen preparation commencing.
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-bold shadow-brand-glow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Confirming Order...' : `Confirm & Pay ₹${total.toFixed(2)}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive UPI Payment Modal */}
      {createdOrderForPayment && (
        <UpiPaymentModal
          order={createdOrderForPayment}
          isOpen={showUpiModal}
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
        />
      )}
    </div>
  );
};
