import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-canvas-warm flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-glass-floating p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-ink-primary tracking-tight">Reset Password</h2>
          <p className="text-xs text-ink-secondary mt-1">
            Enter your campus email to receive a secure recovery link.
          </p>
        </div>

        {sent ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-ink-primary">Recovery Link Sent</h4>
            <p className="text-xs text-ink-secondary">
              If an account exists for {email}, a password reset link has been dispatched.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">Campus Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@apex.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-brand-glow transition-all"
            >
              Send Recovery Email
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1 text-xs text-ink-secondary hover:text-ink-primary">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const LegalPage: React.FC<{ type: 'privacy' | 'terms' }> = ({ type }) => {
  return (
    <div className="min-h-screen bg-canvas-warm py-12 px-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-md p-8 sm:p-12">
        <h1 className="text-3xl font-black text-ink-primary mb-4">
          {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
        </h1>
        <p className="text-xs text-ink-secondary mb-8">
          Last updated: October 2026 • CanteenFlow Multi-Tenant Dining Architecture
        </p>

        <div className="space-y-6 text-xs sm:text-sm text-ink-secondary leading-relaxed">
          <section>
            <h3 className="font-bold text-ink-primary text-base mb-2">1. Campus Tenant Scope</h3>
            <p>
              CanteenFlow operates as a food ordering and inventory queue management system for educational institutions. Personal data, including student name, order history, and payment token references, are maintained within the designated tenant boundary.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-ink-primary text-base mb-2">2. Payment Security</h3>
            <p>
              Online payments are processed through verified payment gateway integrations (Razorpay, UPI). Raw card details and sensitive banking credentials are never captured or stored on CanteenFlow servers.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-ink-primary text-base mb-2">3. Pickup Slots & Order Collection</h3>
            <p>
              Scheduled pickup slots are guaranteed through concurrency-safe slot capacity limits. Orders not collected within 45 minutes of being marked ready are subject to dining hall policy.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to CanteenFlow Home
          </Link>
        </div>
      </div>
    </div>
  );
};
