import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    taxes,
    total,
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate('/student/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-white/95 backdrop-blur-2xl border-l border-slate-200 shadow-glass-floating flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-blue-light text-brand-blue flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-ink-primary">Your Cart</h3>
                    <p className="text-[11px] text-ink-secondary">
                      {items.length} {items.length === 1 ? 'item' : 'items'} selected
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Clear Cart"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={closeCart}
                    className="p-1.5 rounded-full text-slate-400 hover:text-ink-primary hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-bold text-ink-primary mb-1">
                      Your tray is empty
                    </h4>
                    <p className="text-xs text-ink-secondary max-w-xs mb-6">
                      Explore today's freshly prepared campus delicacies and add them to your cart.
                    </p>
                    <button
                      onClick={() => {
                        closeCart();
                        navigate('/student/menu');
                      }}
                      className="px-5 py-2 rounded-full bg-brand-blue text-white text-xs font-semibold shadow-brand-glow hover:bg-brand-blue-hover transition-all"
                    >
                      Browse Today's Menu
                    </button>
                  </div>
                ) : (
                  items.map((cartItem) => (
                    <div
                      key={cartItem.item.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-glass-sm transition-all"
                    >
                      <img
                        src={cartItem.item.imagePath}
                        alt={cartItem.item.name}
                        className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-ink-primary truncate">
                          {cartItem.item.name}
                        </h5>
                        <p className="text-xs font-extrabold text-ink-primary mt-0.5">
                          ₹{cartItem.item.price.toFixed(2)}
                        </p>
                        {cartItem.customizationNote && (
                          <p className="text-[10px] text-amber-700 italic truncate mt-0.5">
                            Note: "{cartItem.customizationNote}"
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
                        <button
                          onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-ink-primary w-4 text-center">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-brand-blue hover:bg-brand-blue-light"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(cartItem.item.id)}
                        className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Summary & Checkout */}
              {items.length > 0 && (
                <div className="p-6 bg-slate-50/90 border-t border-slate-200/80 space-y-3">
                  <div className="space-y-1.5 text-xs text-ink-secondary">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-ink-primary">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Campus GST (5%)</span>
                      <span className="font-semibold text-ink-primary">₹{taxes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-ink-primary">
                      <span>Grand Total</span>
                      <span className="text-brand-blue font-black">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant token generated upon order confirmation.</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-bold shadow-brand-glow hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
