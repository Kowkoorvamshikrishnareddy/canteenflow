import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { InventoryItem } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  Boxes,
  AlertTriangle,
  Plus,
  Minus,
  RefreshCw,
  History,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const StaffInventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Adjust modal
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState('Restock shipment received');

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, movRes] = await Promise.all([
        api.getInventory(),
        api.getStockMovements(),
      ]);
      setInventory(invRes.inventory);
      setMovements(movRes.movements || []);
    } catch (e) {
      console.error('Failed to load inventory:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await api.adjustStock(selectedItem.menuItemId, Number(adjustQty), adjustReason);
      await loadData();
      setSelectedItem(null);
    } catch (err: any) {
      alert(err.message || 'Stock adjustment failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
            Inventory & Stock Tracking
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Monitor real-time ingredient levels, reservations, and log stock adjustments
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-ink-primary text-xs font-semibold hover:bg-slate-50 shadow-glass-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-ink-secondary font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Menu Item</th>
                <th className="px-6 py-3.5">Available Stock</th>
                <th className="px-6 py-3.5">Reserved (In Orders)</th>
                <th className="px-6 py-3.5">Low-Stock Alert Level</th>
                <th className="px-6 py-3.5">Tracking Mode</th>
                <th className="px-6 py-3.5 text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Loading stock records...
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.menuItemId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imagePath}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-ink-primary block">{item.name}</span>
                          {item.isLowStock && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock Warning
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className={`text-base font-extrabold ${item.isLowStock ? 'text-amber-600' : 'text-ink-primary'}`}>
                        {item.availableQuantity}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-ink-secondary font-semibold">
                      {item.reservedQuantity} reserved
                    </td>

                    <td className="px-6 py-3.5 text-ink-secondary">
                      {item.lowStockThreshold} units
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                        {item.trackingMode}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setAdjustQty(10);
                          setAdjustReason('Restock shipment');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-ink-primary text-xs font-semibold transition-all"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={`Adjust Stock for ${selectedItem?.name}`}
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-ink-secondary">Current available stock: </span>
            <strong className="text-ink-primary text-sm">{selectedItem?.availableQuantity}</strong>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Quantity to Add or Deduct
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                required
                value={adjustQty}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
                placeholder="+20 or -5"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
              <span className="text-xs text-ink-secondary font-medium">units</span>
            </div>
            <p className="text-[11px] text-ink-secondary mt-1">
              Use positive numbers (e.g. 15) to restock; negative numbers (e.g. -3) for wastage.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Reason for Adjustment</label>
            <input
              type="text"
              required
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. Morning delivery, wastage, inventory audit"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-secondary hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-brand-glow"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
