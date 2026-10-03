import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { realtime } from '../../services/realtime';
import { Order } from '../../types';
import { OrderTracker } from '../../components/order/OrderTracker';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export const StudentOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOrderById(id);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Could not load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();

    const unsub = realtime.on('ORDER_UPDATED', (updated: Order) => {
      if (updated.id === id) {
        setOrder(updated);
      }
    });

    return () => {
      unsub();
    };
  }, [id]);

  const handleCancel = async (orderId: string) => {
    if (!window.confirm('Are you sure you wish to cancel this order?')) return;
    try {
      setCancelling(true);
      const res = await api.cancelOrder(orderId, 'Cancelled by student');
      setOrder(res.order);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        <button
          onClick={loadOrder}
          className="p-1.5 text-slate-400 hover:text-ink-primary rounded-lg hover:bg-slate-100 transition-colors"
          title="Refresh status"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="h-96 rounded-3xl bg-slate-100 animate-pulse" />
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-ink-primary">{error}</h3>
          <Link
            to="/student/orders"
            className="inline-block mt-4 text-xs font-semibold text-brand-blue hover:underline"
          >
            Return to Orders
          </Link>
        </div>
      ) : order ? (
        <OrderTracker
          order={order}
          onCancel={handleCancel}
          isCancelling={cancelling}
        />
      ) : null}
    </div>
  );
};
