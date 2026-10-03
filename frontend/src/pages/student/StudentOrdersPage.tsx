import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { realtime } from '../../services/realtime';
import { useCart } from '../../context/CartContext';
import { Order } from '../../types';
import { OrderStatusBadge } from '../../components/common/StatusBadge';
import {
  Clock,
  ArrowRight,
  RotateCcw,
  ShoppingBag,
  PackageCheck,
  ChevronRight,
} from 'lucide-react';

export const StudentOrdersPage: React.FC = () => {
  const { addItem } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getOrders();
      setOrders(res.orders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const unsubUpdated = realtime.on('ORDER_UPDATED', () => {
      loadOrders();
    });
    const unsubCreated = realtime.on('ORDER_CREATED', () => {
      loadOrders();
    });

    return () => {
      unsubUpdated();
      unsubCreated();
    };
  }, []);

  const activeOrders = orders.filter((o) =>
    ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)
  );
  const pastOrders = orders.filter((o) =>
    ['COLLECTED', 'CANCELLED', 'REJECTED'].includes(o.status)
  );

  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  const handleReorder = async (order: Order) => {
    // Re-fetch current menu to add available items
    try {
      const menuRes = await api.getMenu();
      for (const orderItem of order.items) {
        const menuItem = menuRes.items.find((m) => m.id === orderItem.menuItemId);
        if (menuItem && menuItem.isAvailable) {
          addItem(menuItem, orderItem.quantity);
        }
      }
    } catch (e) {
      console.error('Reorder error:', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
            My Orders & Tokens
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Track active food preparation and review your past dining history
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-white rounded-full border border-slate-200 shadow-glass-sm self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'active'
                ? 'bg-brand-blue text-white shadow-brand-glow'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Active Orders ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'past'
                ? 'bg-brand-blue text-white shadow-brand-glow'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            History ({pastOrders.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-ink-primary mb-1">
            No {activeTab} orders
          </h3>
          <p className="text-xs text-ink-secondary max-w-sm mx-auto mb-6">
            {activeTab === 'active'
              ? 'You do not have any orders currently being prepared in the kitchen.'
              : 'You have not completed any past orders yet.'}
          </p>
          <Link
            to="/student/menu"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-blue text-white text-xs font-semibold shadow-brand-glow hover:bg-brand-blue-hover transition-all"
          >
            <span>Explore Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm hover:shadow-glass-md transition-all p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-brand-blue">
                    {order.orderNumber}
                  </span>
                  <OrderStatusBadge status={order.status} />
                  <span className="text-[11px] text-ink-secondary">
                    • {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Items summary */}
                <p className="text-xs font-semibold text-ink-primary">
                  {order.items.map((i) => `${i.quantity}x ${i.itemNameSnapshot}`).join(', ')}
                </p>

                <div className="flex items-center gap-3 text-xs text-ink-secondary pt-0.5">
                  <span>Type: <strong className="text-ink-primary">{order.orderType}</strong></span>
                  <span>Total: <strong className="text-ink-primary">₹{order.total.toFixed(2)}</strong></span>
                  <span>Payment: <strong className="text-emerald-700">{order.paymentMethod}</strong></span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                {activeTab === 'active' ? (
                  <Link
                    to={`/student/orders/${order.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-brand-glow transition-all"
                  >
                    <span>Track Live</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to={`/student/orders/${order.id}`}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-ink-primary text-xs font-semibold transition-all"
                    >
                      Receipt
                    </Link>
                    <button
                      onClick={() => handleReorder(order)}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-brand-blue-light hover:bg-brand-blue/20 text-brand-blue text-xs font-bold transition-all"
                      title="Add items to tray"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reorder</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
