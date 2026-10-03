import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { realtime } from '../../services/realtime';
import { Order, OrderStatus } from '../../types';
import { OrderStatusBadge } from '../../components/common/StatusBadge';
import {
  ClipboardList,
  ChefHat,
  PackageCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  XCircle,
  Play,
  Check,
  ScanLine,
} from 'lucide-react';

export const StaffOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getOrders();
      setOrders(res.orders);
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const unsubUpdated = realtime.on('ORDER_UPDATED', (updated: Order) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      );
    });

    const unsubCreated = realtime.on('ORDER_CREATED', (created: Order) => {
      setOrders((prev) => [created, ...prev]);
    });

    return () => {
      unsubUpdated();
      unsubCreated();
    };
  }, []);

  const handleTransition = async (orderId: string, newStatus: OrderStatus, reason?: string) => {
    try {
      setUpdatingId(orderId);
      const res = await api.updateOrderStatus(orderId, newStatus, reason);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
    } catch (err: any) {
      alert(err.message || 'Status transition failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: {
    status: OrderStatus;
    title: string;
    bg: string;
    icon: React.ReactNode;
    orders: Order[];
  }[] = [
    {
      status: 'PLACED',
      title: 'Incoming',
      bg: 'border-blue-200 bg-blue-50/40',
      icon: <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />,
      orders: orders.filter((o) => o.status === 'PLACED'),
    },
    {
      status: 'ACCEPTED',
      title: 'Accepted',
      bg: 'border-indigo-200 bg-indigo-50/40',
      icon: <CheckCircle2 className="w-4 h-4 text-indigo-600" />,
      orders: orders.filter((o) => o.status === 'ACCEPTED'),
    },
    {
      status: 'PREPARING',
      title: 'Cooking',
      bg: 'border-amber-200 bg-amber-50/40',
      icon: <ChefHat className="w-4 h-4 text-amber-600 animate-bounce" />,
      orders: orders.filter((o) => o.status === 'PREPARING'),
    },
    {
      status: 'READY',
      title: 'Ready for Pickup',
      bg: 'border-emerald-200 bg-emerald-50/40',
      icon: <PackageCheck className="w-4 h-4 text-emerald-600" />,
      orders: orders.filter((o) => o.status === 'READY'),
    },
    {
      status: 'COLLECTED',
      title: 'Collected',
      bg: 'border-slate-200 bg-slate-50/40',
      icon: <Check className="w-4 h-4 text-slate-500" />,
      orders: orders.filter((o) => o.status === 'COLLECTED').slice(0, 10),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-brand-blue uppercase tracking-wider">
              Live Kitchen Flow
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-ink-secondary">Realtime SSE Connected</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
            Active Order Board
          </h1>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-ink-primary text-xs font-semibold hover:bg-slate-50 shadow-glass-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* 5-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
        {columns.map((col) => (
          <div
            key={col.status}
            className={`rounded-3xl border ${col.bg} p-3 sm:p-4 flex flex-col gap-3 min-w-[240px]`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 py-1">
              <div className="flex items-center gap-2">
                {col.icon}
                <h3 className="font-extrabold text-xs text-ink-primary uppercase tracking-wider">
                  {col.title}
                </h3>
              </div>
              <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-ink-primary flex items-center justify-center shadow-xs">
                {col.orders.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-3">
              {col.orders.length === 0 ? (
                <div className="p-6 text-center text-[11px] text-slate-400 bg-white/60 rounded-2xl border border-dashed border-slate-200">
                  No orders
                </div>
              ) : (
                col.orders.map((order) => {
                  const isBusy = updatingId === order.id;
                  const timeAgo = Math.floor(
                    (Date.now() - new Date(order.createdAt).getTime()) / 60000
                  );

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-glass-sm p-4 space-y-3 hover:shadow-glass-md transition-all"
                    >
                      {/* Card Header: Token & Elapsed */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-base font-black text-brand-blue">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] text-ink-secondary flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {timeAgo}m ago
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div>
                        <span className="font-bold text-xs text-ink-primary block truncate">
                          {order.userName || 'Student'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-ink-secondary font-medium">
                            {order.orderType}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              order.paymentStatus === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {order.paymentStatus === 'PAID' ? '✓ Paid' : '• Cash Due'}
                          </span>
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="space-y-1 pt-2 border-t border-slate-100">
                        {order.items.map((i) => (
                          <div
                            key={i.id}
                            className="text-xs font-medium text-ink-primary flex justify-between"
                          >
                            <span>
                              {i.quantity}x {i.itemNameSnapshot}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons based on state */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                        {order.status === 'PLACED' && (
                          <>
                            <button
                              onClick={() => handleTransition(order.id, 'ACCEPTED')}
                              disabled={isBusy}
                              className="flex-1 py-1.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleTransition(order.id, 'REJECTED', 'Kitchen at capacity')}
                              disabled={isBusy}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Decline order"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {order.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleTransition(order.id, 'PREPARING')}
                            disabled={isBusy}
                            className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1"
                          >
                            <ChefHat className="w-3.5 h-3.5" />
                            <span>Start Cooking</span>
                          </button>
                        )}

                        {order.status === 'PREPARING' && (
                          <button
                            onClick={() => handleTransition(order.id, 'READY')}
                            disabled={isBusy}
                            className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Mark Ready</span>
                          </button>
                        )}

                        {order.status === 'READY' && (
                          <button
                            onClick={() => handleTransition(order.id, 'COLLECTED')}
                            disabled={isBusy}
                            className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Handed to Student</span>
                          </button>
                        )}

                        {order.status === 'COLLECTED' && (
                          <span className="text-[11px] text-emerald-700 font-semibold w-full text-center">
                            ✓ Complete
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
