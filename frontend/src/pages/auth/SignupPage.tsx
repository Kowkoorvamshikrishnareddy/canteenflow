import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, ArrowRight, User, Mail, Phone, Lock } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { switchRole } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In demo environment, activate student session
    await switchRole('student');
    navigate('/student/home');
  };

  return (
    <div className="min-h-screen bg-canvas-warm flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-glass-floating p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-blue to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-brand-glow">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-ink-primary tracking-tight">
            Create Student Account
          </h2>
          <p className="text-xs text-ink-secondary mt-1">
            Sign up for instant food ordering at Apex Institute
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rohan Varma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Campus Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@apex.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-brand-glow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>Create Account & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-slate-100 text-xs text-ink-secondary">
          <span>Already registered? </span>
          <Link to="/login" className="font-bold text-brand-blue hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
