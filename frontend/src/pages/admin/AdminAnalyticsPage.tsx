import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AnalyticsData } from '../../types';
import {
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  CreditCard,
  Banknote,
  UtensilsCrossed,
  Filter,
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.getAnalytics();
        setAnalytics(res.analytics);
      } catch (e) {
        console.error('Failed to load analytics:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
          Campus Dining Performance Analytics
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
          Data-driven operational metrics computed over live recorded database transactions
        </p>
      </div>

      {/* Peak Hour Activity Heatmap */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-blue" />
              Peak Hour Dining Heatmap (08:00 - 20:00)
            </h3>
            <p className="text-xs text-ink-secondary mt-0.5">
              Hourly volume trends showing lunch congestion (12:00 - 14:00) and evening break (16:00 - 17:00)
            </p>
          </div>
          <span className="text-[11px] font-bold text-brand-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-100 self-start sm:self-auto">
            15-Min Slots Active
          </span>
        </div>

        <div className="pt-4">
          <div className="grid grid-cols-6 sm:grid-cols-13 gap-2 items-end h-44 border-b border-slate-100 pb-2">
            {analytics?.ordersByHour.map((item) => {
              const maxCount = Math.max(...(analytics?.ordersByHour.map((h) => h.count) || [1]));
              const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 5;
              const isPeak = item.count > 0 && item.count === maxCount;

              return (
                <div key={item.hour} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div
                    className={`w-full rounded-xl transition-all flex items-end justify-center pb-1 text-white text-[10px] font-bold ${
                      isPeak
                        ? 'bg-gradient-to-t from-brand-blue to-indigo-600 shadow-brand-glow'
                        : item.count > 0
                        ? 'bg-indigo-300 group-hover:bg-indigo-400'
                        : 'bg-slate-100'
                    }`}
                    style={{ height: `${Math.max(12, heightPercent)}%` }}
                    title={`${item.hour}: ${item.count} orders`}
                  >
                    {item.count > 0 ? item.count : ''}
                  </div>
                  <span className="text-[10px] font-bold text-ink-secondary font-mono">
                    {item.hour}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-ink-secondary pt-3 mt-1 gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
                Peak Break Window: 12:00 - 14:00 (Lunch Rush)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-300" />
                Regular Operating Hours
              </span>
            </div>
            <span className="font-semibold text-emerald-600">
              Capacity-constrained slots prevent counter overflow
            </span>
          </div>
        </div>
      </div>

      {/* Grid: 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Weekday Order Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-blue" />
              Orders by Weekday
            </h3>
            <span className="text-xs text-ink-secondary">Campus Days</span>
          </div>

          <div className="pt-4 flex items-end justify-between gap-3 h-44 border-b border-slate-100 pb-2">
            {analytics?.ordersByDay.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div
                  className="w-full max-w-[40px] rounded-xl bg-gradient-to-t from-brand-blue to-indigo-500 group-hover:from-brand-blue-hover group-hover:to-indigo-600 transition-all shadow-sm flex items-end justify-center pb-1 text-white text-[10px] font-bold"
                  style={{ height: `${Math.max(15, (d.count / Math.max(1, analytics.totalOrders)) * 100 * 2)}%` }}
                >
                  {d.count > 0 ? d.count : ''}
                </div>
                <span className="text-xs font-bold text-ink-secondary">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Payment Method Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Payment Method Breakdown
            </h3>
            <span className="text-xs text-ink-secondary">Transaction Channel</span>
          </div>

          <div className="pt-2 space-y-3">
            {analytics?.paymentSplit.map((p) => {
              const totalAmount = analytics.grossRevenue || 1;
              const percent = Math.round((p.total / totalAmount) * 100);

              return (
                <div key={p.method} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-ink-primary">
                    <span className="flex items-center gap-1.5">
                      {p.method === 'UPI' ? '⚡ UPI Instant' : p.method === 'CASH' ? '💵 Cash at Counter' : '💳 Cards'}
                    </span>
                    <span>
                      ₹{p.total.toFixed(2)} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        p.method === 'UPI'
                          ? 'bg-purple-600'
                          : p.method === 'CASH'
                          ? 'bg-emerald-600'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Selling Menu Items Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-amber-500" />
          Menu Item Popularity & Revenue Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-ink-secondary font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Menu Selection</th>
                <th className="px-4 py-3">Total Portions Ordered</th>
                <th className="px-4 py-3">Cumulative Revenue</th>
                <th className="px-4 py-3">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics?.topItems.map((item) => {
                const percent =
                  analytics.grossRevenue > 0
                    ? ((item.revenue / analytics.grossRevenue) * 100).toFixed(1)
                    : '0';
                return (
                  <tr key={item.name} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-ink-primary">{item.name}</td>
                    <td className="px-4 py-3 font-semibold text-ink-primary">{item.quantity} portions</td>
                    <td className="px-4 py-3 font-bold text-brand-blue">₹{item.revenue.toFixed(2)}</td>
                    <td className="px-4 py-3 text-ink-secondary">{percent}% of revenue</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
