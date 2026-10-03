import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, GraduationCap, ChefHat, ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, switchRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('student@apex.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email);
      navigate('/student/home');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleQuickPersona = async (role: UserRole, targetRoute: string) => {
    setError(null);
    try {
      await switchRole(role);
      navigate(targetRoute);
    } catch (err: any) {
      setError(err.message || 'Failed to switch demo persona.');
    }
  };

  return (
    <div className="min-h-screen bg-canvas-warm flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-glass-floating p-8 relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-blue to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-brand-glow">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-ink-primary tracking-tight">
            Welcome to CanteenFlow
          </h2>
          <p className="text-xs text-ink-secondary mt-1">
            Apex Institute of Technology • Campus Smart Dining
          </p>
        </div>

        {/* 1-Click Demo Personas Box */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
          <span className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider block mb-2 text-center">
            One-Click Demo Personas
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickPersona('student', '/student/home')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-brand-blue hover:shadow-sm text-center transition-all group"
            >
              <GraduationCap className="w-5 h-5 text-brand-blue mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-ink-primary">Student</span>
              <span className="text-[10px] text-ink-secondary">Aarav</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPersona('staff', '/staff/orders')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-sm text-center transition-all group"
            >
              <ChefHat className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-ink-primary">Staff</span>
              <span className="text-[10px] text-ink-secondary">Vikram</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPersona('admin', '/admin/dashboard')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-600 hover:shadow-sm text-center transition-all group"
            >
              <ShieldCheck className="w-5 h-5 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-ink-primary">Admin</span>
              <span className="text-[10px] text-ink-secondary">Priya</span>
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-slate-400 text-xs uppercase font-medium">Or Sign In with Email</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleStandardSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Campus Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@apex.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-ink-primary">
                Password
              </label>
              <Link to="/forgot-password" className="text-[11px] text-brand-blue hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-brand-glow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-slate-100 text-xs text-ink-secondary">
          <span>Need a campus account? </span>
          <Link to="/signup" className="font-bold text-brand-blue hover:underline">
            Register Student
          </Link>
        </div>
      </div>
    </div>
  );
};
