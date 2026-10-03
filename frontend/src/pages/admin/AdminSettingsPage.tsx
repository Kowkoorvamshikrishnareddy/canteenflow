import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Settings, Building, DollarSign, Check } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { college } = useAuth();

  const [collegeName, setCollegeName] = useState(college?.name || 'Apex Institute of Technology');
  const [taxRate, setTaxRate] = useState(college?.settings.taxRate || 0.05);
  const [allowCash, setAllowCash] = useState(college?.settings.allowCashOnCounter ?? true);
  const [horizonHours, setHorizonHours] = useState(college?.settings.advanceOrderHorizonHours || 24);
  const [cancellationMins, setCancellationMins] = useState(college?.settings.cancellationLeadMinutes || 15);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateCollege({
        name: collegeName,
        settings: {
          taxRate: Number(taxRate),
          allowCashOnCounter: allowCash,
          advanceOrderHorizonHours: Number(horizonHours),
          cancellationLeadMinutes: Number(cancellationMins),
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
          College Tenant Settings
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
          Campus-level configuration, tax rates, cancellation rules, and payment policies
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-blue" />
            Institutional Profile
          </h3>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Institution Name
            </label>
            <input
              type="text"
              required
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Billing & Policy Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Campus Tax / GST Rate (e.g. 0.05 for 5%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="0.3"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Advance Ordering Horizon (Hours)
              </label>
              <input
                type="number"
                value={horizonHours}
                onChange={(e) => setHorizonHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-ink-primary block">
                  Enable Cash-at-Counter Option
                </span>
                <span className="text-[11px] text-ink-secondary">
                  Permit students to place orders and pay cash when picking up at Counter 1.
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowCash}
                onChange={(e) => setAllowCash(e.target.checked)}
                className="w-4 h-4 text-brand-blue rounded border-slate-300"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-brand-glow hover:scale-105 active:scale-95 transition-all"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <span>Save College Settings</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
