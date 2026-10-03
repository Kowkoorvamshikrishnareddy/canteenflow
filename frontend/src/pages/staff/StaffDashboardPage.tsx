import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { realtime } from '../../services/realtime';
import { Order, InventoryItem } from '../../types';
import {
  ClipboardList,
  ChefHat,
  PackageCheck,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  ScanLine,
  Boxes,
  UtensilsCrossed,
  Sparkles,
} from 'lucide-react';

export const StaffDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, invRes] = await Promise.all([
        api.getOrders(),
        api.getInventory(),
      ]);
      setOrders(ordersRes.orders);
      setInventory(invRes.inventory);
    } catch (e) {
      console.error('Failed to load staff dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsubUpdated = realtime.on('ORDER_UPDATED', () => loadData());
    const unsubCreated = realtime.on('ORDER_CREATED', () => loadData());

    return () => {
      unsubUpdated();
      unsubCreated();
    };
  }, []);

  const incomingOrders = orders.filter((o) => o.status === 'PLACED');
  const preparingOrders = orders.filter((o) => ['ACCEPTED', 'PREPARING'].includes(o.status));
  const readyOrders = orders.filter((o) => o.status === 'READY');
  const completedOrders = orders.filter((o) => o.status === 'COLLECTED');

  const todayRevenue = orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED')
    .reduce((acc, o) => acc + o.total, 0);

  const lowStockItems = inventory.filter((i) => i.isLowStock);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-glass-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Kitchen Live Stream Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Kitchen Operations Board
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Green Leaf Central Canteen • Live queue management & counter token fulfillment
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/staff/orders"
            className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-brand-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Open Live Kanban</span>
          </Link>

          <Link
            to="/staff/pickup"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-2"
          >
            <ScanLine className="w-4 h-4 text-emerald-400" />
            <span>Pickup Station</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Incoming */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-glass-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-ink-secondary">Incoming</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {incomingOrders.length}
          </div>
          <span className="text-[11px] text-brand-blue font-semibold">Requires kitchen action</span>
        </div>

        {/* In Prep */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-glass-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-ink-secondary">In Kitchen</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {preparingOrders.length}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold">Being cooked right now</span>
        </div>

        {/* Ready */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-glass-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-ink-secondary">Ready for Pickup</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {readyOrders.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">At counter 1</span>
        </div>

        {/* Completed */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-glass-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-ink-secondary">Collected Today</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-ink-primary">
            {completedOrders.length}
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">Trays served</span>
        </div>

        {/* Sales */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-glass-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-ink-secondary">Sales Recorded</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              ₹
            </div>
          </div>
          <div className="text-2xl font-black text-brand-blue">
            ₹{todayRevenue.toFixed(0)}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">Settled orders</span>
        </div>
      </div>

      {/* Two Column Section: Live Urgent Orders & Low-Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incoming / Needs Attention */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-brand-blue" />
              <h3 className="text-base font-black text-ink-primary">
                Awaiting Kitchen Action ({incomingOrders.length})
              </h3>
            </div>
            <Link
              to="/staff/orders"
              className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
            >
              <span>View Full Kanban</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {incomingOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-ink-secondary bg-slate-50 rounded-2xl border border-slate-200">
              ✓ All orders acknowledged and in preparation!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {incomingOrders.map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-black text-brand-blue">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs font-semibold text-ink-primary">
                        {order.userName || 'Student'}
                      </span>
                      <span className="text-[11px] text-ink-secondary">
                        ({order.orderType})
                      </span>
                    </div>
                    <p className="text-xs text-ink-secondary">
                      {order.items.map((i) => `${i.quantity}x ${i.itemNameSnapshot}`).join(', ')}
                    </p>
                  </div>

                  <Link
                    to="/staff/orders"
                    className="px-3.5 py-1.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-sm transition-all"
                  >
                    Accept & Cook
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Low Stock Alerts */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-black text-ink-primary">
                Low Stock Alerts ({lowStockItems.length})
              </h3>
            </div>
            <Link
              to="/staff/inventory"
              className="text-xs font-bold text-brand-blue hover:underline"
            >
              Manage
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink-secondary bg-slate-50 rounded-2xl border border-slate-200">
              All menu inventory is above threshold levels.
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockItems.map((item) => (
                <div
                  key={item.menuItemId}
                  className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-ink-primary block">{item.name}</span>
                    <span className="text-[11px] text-amber-800">
                      Remaining: {item.availableQuantity} (Threshold: {item.lowStockThreshold})
                    </span>
                  </div>
                  <Link
                    to="/staff/inventory"
                    className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-semibold text-[11px] hover:bg-amber-100"
                  >
                    Restock
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
