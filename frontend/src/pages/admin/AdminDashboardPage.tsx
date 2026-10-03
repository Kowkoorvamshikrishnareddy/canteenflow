import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { AnalyticsData, Order } from '../../types';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Users,
  UtensilsCrossed,
  BarChart3,
  ShieldAlert,
  ArrowRight,
  Clock,
  CreditCard,
  Banknote,
  CheckCircle2,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [anRes, ordRes] = await Promise.all([
          api.getAnalytics(),
          api.getOrders(),
        ]);
        setAnalytics(anRes.analytics);
        setRecentOrders(ordRes.orders.slice(0, 6));
      } catch (e) {
        console.error('Failed to load admin dashboard:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-900/60 shadow-glass-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Campus Administrative Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Apex Institute Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Overseeing Green Leaf Central Canteen dining throughput, payment reconciliation, and user access
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/analytics"
            className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-brand-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Detailed Analytics</span>
          </Link>

          <Link
            to="/admin/users"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-indigo-300" />
            <span>Manage Roles</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-glass-sm space-y-1">
          <span className="text-xs font-bold text-ink-secondary">Gross Campus Revenue</span>
          <div className="text-2xl sm:text-3xl font-black text-brand-blue">
            ₹{analytics?.grossRevenue.toFixed(2) || '0.00'}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            Across recorded transactions
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-glass-sm space-y-1">
          <span className="text-xs font-bold text-ink-secondary">Total Orders Placed</span>
          <div className="text-2xl sm:text-3xl font-black text-ink-primary">
            {analytics?.totalOrders || 0}
          </div>
          <span className="text-[11px] text-ink-secondary block">
            {analytics?.completedOrders || 0} completed • {analytics?.cancelledOrders || 0} cancelled
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-glass-sm space-y-1">
          <span className="text-xs font-bold text-ink-secondary">Online / UPI Settled</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-700">
            ₹{analytics?.onlineCollected.toFixed(2) || '0.00'}
          </div>
          <span className="text-[11px] text-purple-600 font-semibold block">
            Digital payments
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-glass-sm space-y-1">
          <span className="text-xs font-bold text-ink-secondary">Average Order Value</span>
          <div className="text-2xl sm:text-3xl font-black text-ink-primary">
            ₹{analytics?.averageOrderValue.toFixed(2) || '0.00'}
          </div>
          <span className="text-[11px] text-ink-secondary block">
            Per campus student ticket
          </span>
        </div>
      </div>

      {/* Two Column Section: Peak Break Heatmap & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Hourly Peak Activity */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-ink-primary">
                Peak Meal Break Throughput (Hourly Activity)
              </h3>
              <p className="text-xs text-ink-secondary">
                Orders distributed across campus dining operating hours
              </p>
            </div>
            <Link
              to="/admin/analytics"
              className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
            >
              <span>View Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="pt-4">
            <div className="grid grid-cols-6 sm:grid-cols-13 gap-1.5 items-end h-36">
              {analytics?.ordersByHour.map((item) => {
                const maxCount = Math.max(...(analytics?.ordersByHour.map((h) => h.count) || [1]));
                const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 5;
                const isPeak = item.count > 0 && item.count === maxCount;

                return (
                  <div key={item.hour} className="flex flex-col items-center gap-1 h-full justify-end group">
                    <div
                      className={`w-full rounded-md transition-all ${
                        isPeak
                          ? 'bg-brand-blue shadow-brand-glow'
                          : item.count > 0
                          ? 'bg-indigo-300 group-hover:bg-indigo-400'
                          : 'bg-slate-100'
                      }`}
                      style={{ height: `${Math.max(8, heightPercent)}%` }}
                      title={`${item.hour}: ${item.count} orders`}
                    />
                    <span className="text-[9px] text-ink-secondary font-mono">
                      {item.hour.split(':')[0]}h
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-ink-secondary pt-4 border-t border-slate-100 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
                Peak Rush Hours: 12:00 - 14:00 (Lunch) & 16:00 - 17:00 (Tea Break)
              </span>
              <span>Capacity scheduling smoothly distributes load</span>
            </div>
          </div>
        </div>

        {/* Right Col: Top Items */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 space-y-4">
          <h3 className="text-base font-black text-ink-primary">
            Highest Demand Items
          </h3>

          <div className="space-y-3">
            {analytics?.topItems.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200/70"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-white border border-slate-200 font-bold flex items-center justify-center text-[10px] text-brand-blue">
                    #{index + 1}
                  </span>
                  <div>
                    <span className="font-bold text-ink-primary block">{item.name}</span>
                    <span className="text-[10px] text-ink-secondary">{item.quantity} sold</span>
                  </div>
                </div>
                <span className="font-extrabold text-ink-primary">
                  ₹{item.revenue.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
