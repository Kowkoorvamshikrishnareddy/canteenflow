import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Settings,
  Clock,
  Calendar,
  Sliders,
  Check,
  Shield,
  UtensilsCrossed,
} from 'lucide-react';

export const StaffSettingsPage: React.FC = () => {
  const { canteen } = useAuth();

  const [openTime, setOpenTime] = useState(canteen?.operatingHours.open || '08:00');
  const [closeTime, setCloseTime] = useState(canteen?.operatingHours.close || '20:00');
  const [slotDuration, setSlotDuration] = useState(canteen?.settings.pickupSlotDurationMinutes || 15);
  const [maxOrdersPerSlot, setMaxOrdersPerSlot] = useState(canteen?.settings.maxOrdersPerSlot || 15);
  const [isCounterOpen, setIsCounterOpen] = useState(canteen?.settings.isCounterOpen ?? true);
  const [autoAccept, setAutoAccept] = useState(canteen?.settings.autoAcceptOrders ?? false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canteen) return;

    try {
      await api.updateCanteen(canteen.id, {
        operatingHours: {
          open: openTime,
          close: closeTime,
        },
        settings: {
          pickupSlotDurationMinutes: Number(slotDuration),
          maxOrdersPerSlot: Number(maxOrdersPerSlot),
          isCounterOpen,
          autoAcceptOrders: autoAccept,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to update canteen configuration');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
          Canteen Operations Settings
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
          Configure operating hours, pickup scheduling limits, and kitchen dispatch rules
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Operating Hours Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-blue" />
            Operating Schedule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Kitchen Opening Time
              </label>
              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Kitchen Closing Time
              </label>
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
          </div>
        </div>

        {/* Capacity Scheduling Rules */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            Capacity & Slot Overbooking Protection
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Pickup Slot Window (Minutes)
              </label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes (Recommended)</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Maximum Orders Per Slot
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={maxOrdersPerSlot}
                onChange={(e) => setMaxOrdersPerSlot(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
              <span className="text-[11px] text-ink-secondary mt-1 block">
                Prevents counter overcrowding by capping simultaneous order readiness.
              </span>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider">
            Counter Status
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-ink-primary block">
                  Canteen Counter Accepting Orders
                </span>
                <span className="text-[11px] text-ink-secondary">
                  Toggle off in emergencies to pause incoming campus orders immediately.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isCounterOpen}
                onChange={(e) => setIsCounterOpen(e.target.checked)}
                className="w-4 h-4 text-brand-blue rounded border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-ink-primary block">
                  Auto-Accept Immediate Orders
                </span>
                <span className="text-[11px] text-ink-secondary">
                  Automatically move incoming paid orders directly to Accepted status.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoAccept}
                onChange={(e) => setAutoAccept(e.target.checked)}
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
              <span>Save Canteen Configuration</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
