import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ChefHat, ShieldCheck, Sparkles, Database } from 'lucide-react';
import { UserRole } from '../../types';

export const DemoModeBanner: React.FC = () => {
  const { user, switchRole, demoMode } = useAuth();
  const navigate = useNavigate();

  const personas: { role: UserRole; name: string; title: string; icon: React.ReactNode; path: string }[] = [
    {
      role: 'student',
      name: 'Aarav (Student)',
      title: 'Order Food',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
      path: '/student/home',
    },
    {
      role: 'staff',
      name: 'Chef Vikram (Staff)',
      title: 'Kitchen & Orders',
      icon: <ChefHat className="w-3.5 h-3.5" />,
      path: '/staff/orders',
    },
    {
      role: 'admin',
      name: 'Dean Priya (Admin)',
      title: 'Campus Analytics',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      path: '/admin/dashboard',
    },
  ];

  const handleSwitch = async (p: typeof personas[0]) => {
    await switchRole(p.role);
    navigate(p.path);
  };

  return (
    <aside aria-label="Demo Persona Switcher" className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-sm border-b border-indigo-800/40 relative z-50">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 font-semibold text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          CANTEENFLOW
        </span>
        <span className="hidden sm:inline-block text-slate-400">|</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-[11px]">
          <Database className="w-3 h-3 text-emerald-400" />
          {demoMode ? 'Sandbox Environment' : 'Live Supabase'}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-slate-400 hidden md:inline text-[11px]">Quick Switch Role:</span>
        <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/15">
          {personas.map((p) => {
            const isActive = user?.role === p.role;
            return (
              <button
                key={p.role}
                onClick={() => handleSwitch(p)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
                title={`Switch to ${p.name}`}
              >
                {p.icon}
                <span>{p.name.split(' ')[0]}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
