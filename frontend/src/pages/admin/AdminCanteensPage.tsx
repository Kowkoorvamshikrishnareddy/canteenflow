import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Canteen } from '../../types';
import { UtensilsCrossed, Clock, CheckCircle2, Sliders, Edit2 } from 'lucide-react';

export const AdminCanteensPage: React.FC = () => {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.getCurrentCollege();
        setCanteens(res.canteens);
      } catch (e) {
        console.error('Failed to load canteens:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
          Canteen Configuration
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
          Manage campus dining facilities, slot durations, and capacity caps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {canteens.map((canteen) => (
          <div
            key={canteen.id}
            className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-glass-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-blue-light text-brand-blue flex items-center justify-center font-bold">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-ink-primary">{canteen.name}</h3>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Campus Facility
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-ink-secondary leading-relaxed">
              {canteen.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] text-ink-secondary uppercase font-bold block mb-0.5">
                  Operating Window
                </span>
                <span className="font-bold text-ink-primary">
                  {canteen.operatingHours.open} - {canteen.operatingHours.close}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] text-ink-secondary uppercase font-bold block mb-0.5">
                  Slot Capacity
                </span>
                <span className="font-bold text-ink-primary">
                  {canteen.settings.maxOrdersPerSlot} orders / {canteen.settings.pickupSlotDurationMinutes} mins
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
