import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Order } from '../../types';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  CreditCard,
  Banknote,
  Calendar,
  Download,
  FileSpreadsheet,
} from 'lucide-react';

export const StaffReportsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.getOrders();
        setOrders(res.orders);
      } catch (e) {
        console.error('Failed to load orders for reports:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const validOrders = orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED');
  const totalRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
  const onlineRevenue = validOrders
    .filter((o) => o.paymentMethod !== 'CASH')
    .reduce((acc, o) => acc + o.total, 0);
  const cashRevenue = validOrders
    .filter((o) => o.paymentMethod === 'CASH')
    .reduce((acc, o) => acc + o.total, 0);

  // Group items sold
  const itemCounts: Record<string, { qty: number; revenue: number }> = {};
  for (const o of validOrders) {
    for (const item of o.items) {
      if (!itemCounts[item.itemNameSnapshot]) {
        itemCounts[item.itemNameSnapshot] = { qty: 0, revenue: 0 };
      }
      itemCounts[item.itemNameSnapshot].qty += item.quantity;
      itemCounts[item.itemNameSnapshot].revenue += item.lineTotal;
    }
  }

  const topItems = Object.entries(itemCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
            Daily Sales & Kitchen Reports
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Green Leaf Central Canteen • Today's operational reconciliation
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-ink-primary text-xs font-semibold hover:bg-slate-50 shadow-glass-sm"
        >
          <Download className="w-4 h-4 text-brand-blue" />
          <span>Export Summary</span>
        </button>
      </div>

      {/* Revenue Split Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-glass-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-ink-secondary">
            <span>Total Recorded Sales</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-ink-primary">
            ₹{totalRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-ink-secondary block">
            Across {validOrders.length} meal transactions
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-glass-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-ink-secondary">
            <span>UPI & Online Collections</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-700">
            ₹{onlineRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-ink-secondary block">
            Auto-reconciled digital transactions
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-glass-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-ink-secondary">
            <span>Counter Cash Settled</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700">
            ₹{cashRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-ink-secondary block">
            Collected at pickup counter 1
          </span>
        </div>
      </div>

      {/* Item Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider">
          Items Sold Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-ink-secondary font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Menu Item</th>
                <th className="px-4 py-3">Units Sold</th>
                <th className="px-4 py-3">Total Revenue</th>
                <th className="px-4 py-3">% Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topItems.map((item) => {
                const percent = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
                return (
                  <tr key={item.name} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-ink-primary">{item.name}</td>
                    <td className="px-4 py-3 font-semibold text-ink-primary">{item.qty} portions</td>
                    <td className="px-4 py-3 font-bold text-brand-blue">₹{item.revenue.toFixed(2)}</td>
                    <td className="px-4 py-3 text-ink-secondary">{percent.toFixed(1)}%</td>
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
