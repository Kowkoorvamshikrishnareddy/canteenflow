import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building,
  Shield,
  LogOut,
  Bell,
  Heart,
  Check,
} from 'lucide-react';
import { DietaryTag } from '../../types';

export const StudentProfilePage: React.FC = () => {
  const { user, college, canteen, logout } = useAuth();
  const navigate = useNavigate();

  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryTag[]>(['veg']);
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const togglePref = (tag: DietaryTag) => {
    setDietaryPrefs((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
          Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
          Manage your campus credentials and dining preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop'}
            alt="Avatar"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
          />
          <div>
            <h3 className="text-lg font-bold text-ink-primary">{user?.fullName}</h3>
            <p className="text-xs text-ink-secondary">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-brand-blue text-[11px] font-semibold border border-blue-200">
              Verified Student Account
            </span>
          </div>
        </div>

        {/* Contact info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-ink-secondary flex items-center gap-1 mb-1 font-semibold uppercase tracking-wider">
              <Building className="w-3.5 h-3.5 text-brand-blue" /> Campus Institution
            </span>
            <span className="font-bold text-ink-primary block text-sm">
              {college?.name || 'Apex Institute of Technology'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-ink-secondary flex items-center gap-1 mb-1 font-semibold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> Default Canteen
            </span>
            <span className="font-bold text-ink-primary block text-sm">
              {canteen?.name || 'Green Leaf Central Canteen'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-ink-secondary flex items-center gap-1 mb-1 font-semibold uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
            </span>
            <span className="font-bold text-ink-primary block text-sm">
              {user?.email}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-ink-secondary flex items-center gap-1 mb-1 font-semibold uppercase tracking-wider">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
            </span>
            <span className="font-bold text-ink-primary block text-sm">
              {user?.phone || '+91 98765 43212'}
            </span>
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-ink-primary uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500" /> Dietary Preferences
          </h4>
          <p className="text-xs text-ink-secondary">
            Highlight suitable menu options automatically when browsing the menu.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { tag: 'veg' as DietaryTag, label: 'Vegetarian' },
              { tag: 'vegan' as DietaryTag, label: 'Vegan' },
              { tag: 'jain' as DietaryTag, label: 'Jain Friendly' },
              { tag: 'high-protein' as DietaryTag, label: 'High Protein' },
              { tag: 'gluten-free' as DietaryTag, label: 'Gluten-Free' },
            ].map((item) => {
              const active = dietaryPrefs.includes(item.tag);
              return (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => togglePref(item.tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'bg-brand-blue text-white shadow-brand-glow'
                      : 'bg-slate-100 text-ink-secondary hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              Kitchen Readiness Alerts
            </h4>
            <p className="text-[11px] text-ink-secondary">
              Receive live audio & visual chimes when food is ready at the counter.
            </p>
          </div>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="w-4 h-4 text-brand-blue rounded border-slate-300 focus:ring-brand-blue/30"
          />
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-brand-glow transition-all"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Preferences Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
