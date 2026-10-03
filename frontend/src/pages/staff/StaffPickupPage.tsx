import React, { useState } from 'react';
import { api } from '../../services/api';
import { Order } from '../../types';
import { OrderStatusBadge } from '../../components/common/StatusBadge';
import {
  ScanLine,
  Search,
  CheckCircle2,
  PackageCheck,
  AlertTriangle,
  Banknote,
  QrCode,
  Sparkles,
} from 'lucide-react';

export const StaffPickupPage: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tokenInput.trim()) return;

    setLoading(true);
    setError(null);
    setMessage(null);
    setFoundOrder(null);

    try {
      const res = await api.verifyPickupToken(tokenInput.trim());
      setFoundOrder(res.order);
    } catch (err: any) {
      setError(err.message || 'No order found with that token');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCollection = async () => {
    if (!foundOrder) return;
    setCollecting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.markOrderCollected(foundOrder.id);
      setFoundOrder(res.order);
      setMessage(`Order ${res.order.orderNumber} successfully marked as collected!`);
    } catch (err: any) {
      setError(err.message || 'Failed to complete collection');
    } finally {
      setCollecting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Counter 1 Collection Station
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
          Verify Pickup Token
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
          Type or scan student pickup token (e.g. CF-101) to verify food collection
        </p>
      </div>

      {/* Token Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 sm:p-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <ScanLine className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enter Token (e.g. CF-101, CF-100)"
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-mono uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !tokenInput.trim()}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-emerald-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Lookup Token'}</span>
          </button>
        </form>

        {/* Quick Test Token Shortcuts */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-ink-secondary">
          <span>Quick test tokens:</span>
          {['CF-100', 'CF-101', 'CF-102'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTokenInput(t);
              }}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 font-mono text-[11px] font-bold text-ink-primary"
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Found Order Card */}
      {foundOrder && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-md p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                Matching Order
              </span>
              <h2 className="text-3xl font-black text-brand-blue font-mono mt-0.5">
                {foundOrder.orderNumber}
              </h2>
              <p className="text-xs text-ink-secondary mt-1">
                Student: <strong className="text-ink-primary">{foundOrder.userName || 'Student'}</strong>
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1.5">
              <OrderStatusBadge status={foundOrder.status} />
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  foundOrder.paymentStatus === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {foundOrder.paymentStatus === 'PAID' ? '✓ Paid Online' : '⚠️ Cash Due: ₹' + foundOrder.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2">
            <h4 className="text-xs font-bold text-ink-primary uppercase tracking-wider">
              Prepared Items
            </h4>
            <div className="divide-y divide-slate-200/60">
              {foundOrder.items.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-primary">
                    {item.quantity}x {item.itemNameSnapshot}
                  </span>
                  <span className="font-bold text-ink-primary">
                    ₹{item.lineTotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-ink-primary">
              <span>Order Total</span>
              <span className="text-brand-blue">₹{foundOrder.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Confirmation Action */}
          {foundOrder.status === 'COLLECTED' ? (
            <div className="p-4 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold text-center">
              ✓ This order has already been verified and collected.
            </div>
          ) : (
            <button
              onClick={handleConfirmCollection}
              disabled={collecting}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold shadow-emerald-glow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {collecting
                  ? 'Verifying...'
                  : foundOrder.paymentStatus === 'CASH_DUE'
                  ? `Confirm Cash Received (₹${foundOrder.total.toFixed(2)}) & Hand Over`
                  : 'Verify & Mark as Collected'}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
