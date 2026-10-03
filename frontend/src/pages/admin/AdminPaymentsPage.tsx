import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PaymentTransaction, PaymentLedgerSummary } from '../../types';
import {
  CreditCard,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  Banknote,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const [ledger, setLedger] = useState<PaymentLedgerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'REFUNDED'>('ALL');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'UPI' | 'CARD' | 'CASH'>('ALL');

  // Refund modal state
  const [refundTarget, setRefundTarget] = useState<PaymentTransaction | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.getPaymentsLedger();
      setLedger(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load transaction ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTarget) return;

    try {
      setProcessingRefund(true);
      await api.refundPayment(refundTarget.id, refundReason || 'Refund requested by administrator');
      setSuccessToast(`Successfully issued refund of ₹${refundTarget.amount.toFixed(2)} for ${refundTarget.orderNumber || refundTarget.id}`);
      setRefundTarget(null);
      setRefundReason('');
      await fetchLedger();
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Refund failed');
    } finally {
      setProcessingRefund(false);
    }
  };

  const transactions = ledger?.transactions || [];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      (tx.orderNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (tx.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.providerTransactionId?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    const matchesMethod = methodFilter === 'ALL' || tx.method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const exportCSV = () => {
    if (!transactions.length) return;
    const headers = ['Transaction ID', 'Order Number', 'Customer', 'Method', 'Provider', 'Amount (INR)', 'Status', 'Date'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.orderNumber || 'N/A',
      tx.customerName || 'N/A',
      tx.method,
      tx.provider,
      tx.amount.toFixed(2),
      tx.status,
      new Date(tx.createdAt).toLocaleString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `canteenflow_payment_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSuccessful = transactions.filter((t) => t.status === 'SUCCESS').reduce((acc, t) => acc + t.amount, 0);
  const totalCash = transactions.filter((t) => t.method === 'CASH').reduce((acc, t) => acc + t.amount, 0);
  const totalOnline = transactions.filter((t) => t.method !== 'CASH' && t.status === 'SUCCESS').reduce((acc, t) => acc + t.amount, 0);
  const refundedCount = transactions.filter((t) => t.status === 'REFUNDED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Finance & Audit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-primary tracking-tight">
            Payments Ledger & Reconciliation
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Monitor real-time digital transactions, cash desk receipts, Razorpay sync, and process refunds.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchLedger}
            className="p-2.5 rounded-xl border border-slate-200 bg-white/80 hover:bg-white text-ink-secondary hover:text-ink-primary transition-all shadow-sm"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-ink-primary text-xs font-semibold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-ink-secondary" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="p-1 hover:bg-emerald-100 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-glass-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-secondary">Total Settled Volume</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-ink-primary tracking-tight">
              ₹{totalSuccessful.toFixed(2)}
            </span>
            <span className="text-[11px] text-ink-secondary block mt-1">Across all verified orders</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-glass-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-secondary">Digital / Online Payments</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-indigo-600 tracking-tight">
              ₹{totalOnline.toFixed(2)}
            </span>
            <span className="text-[11px] text-ink-secondary block mt-1">UPI & Card Gateways</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-glass-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-secondary">Cash at Counter</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-emerald-600 tracking-tight">
              ₹{totalCash.toFixed(2)}
            </span>
            <span className="text-[11px] text-ink-secondary block mt-1">On-premise cash drawer</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-glass-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-secondary">Refunded Volume</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-amber-600 tracking-tight">
              ₹{(ledger?.totalRefundedVolume || 0).toFixed(2)}
            </span>
            <span className="text-[11px] text-ink-secondary block mt-1">{refundedCount} returned payments</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-glass-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order #, customer, or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-ink-primary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {(['ALL', 'SUCCESS', 'PENDING', 'REFUNDED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === st
                    ? 'bg-white text-ink-primary shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>

          {/* Method selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {(['ALL', 'UPI', 'CARD', 'CASH'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  methodFilter === m
                    ? 'bg-white text-ink-primary shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {m === 'ALL' ? 'All Methods' : m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-ink-secondary animate-pulse">
            Loading transaction ledger...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-ink-secondary">No transactions match your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-ink-secondary">
                <tr>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Method & Gateway</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-ink-secondary">
                      {tx.id.slice(0, 18)}...
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-blue">
                      {tx.orderNumber || '—'}
                    </td>
                    <td className="py-3 px-4 font-medium text-ink-primary">
                      {tx.customerName || 'Anonymous Student'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            tx.method === 'UPI'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              : tx.method === 'CARD'
                              ? 'bg-violet-50 text-violet-700 border border-violet-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}
                        >
                          {tx.method}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">({tx.provider.toLowerCase()})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-ink-primary">
                      ₹{tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tx.status === 'REFUNDED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {tx.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {tx.status === 'REFUNDED' && <RotateCcw className="w-3 h-3 text-amber-600" />}
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-ink-secondary text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {tx.status === 'SUCCESS' ? (
                        <button
                          onClick={() => setRefundTarget(tx)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Refund</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-glass-lg max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-ink-primary">Process Payment Refund</h3>
              </div>
              <button
                onClick={() => setRefundTarget(null)}
                className="p-1 text-slate-400 hover:text-ink-primary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold">Order:</span>
                <span className="font-bold">{refundTarget.orderNumber || refundTarget.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Customer:</span>
                <span>{refundTarget.customerName || 'Aarav Sharma'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Refund Amount:</span>
                <span className="font-bold text-amber-800 text-sm">₹{refundTarget.amount.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-primary mb-1">
                  Reason for Refund
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Item unavailable / Order delayed / Customer request"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-ink-secondary hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingRefund}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {processingRefund ? 'Processing...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
