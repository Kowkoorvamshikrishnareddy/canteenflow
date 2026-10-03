import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Clock,
  Smartphone,
  ShieldCheck,
  Zap,
  CalendarCheck,
  CreditCard,
  ChefHat,
  ChevronRight,
  Sparkles,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'student' | 'staff' | 'admin'>('student');

  const faqs = [
    {
      q: 'How does CanteenFlow reduce long lunchtime queues?',
      a: 'Students can browse the digital menu in advance, place immediate orders, or reserve specific 15-minute pickup slots. You only walk up to the counter when your digital token turns to "Ready for Pickup".',
    },
    {
      q: 'Can I pay online through UPI or pay cash at the counter?',
      a: 'Yes. CanteenFlow natively supports UPI, debit/credit cards, and also allows configurable Cash-at-Counter payments where tokens are marked cash-due until verified at collection.',
    },
    {
      q: 'How does scheduled ordering prevent overcrowding?',
      a: 'CanteenFlow includes a capacity-aware slot reservation engine that limits the maximum orders per 15-minute window. When a window reaches capacity, subsequent orders are gently distributed to the next slot.',
    },
    {
      q: 'What hardware do canteen staff need to operate CanteenFlow?',
      a: 'No specialized proprietary hardware is required. Any standard tablet, smartphone, or laptop browser can run the live staff order board and counter pickup verification station.',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas-warm text-ink-primary flex flex-col selection:bg-brand-blue/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Ambient subtle light glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-blue/5 to-transparent pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/90 shadow-glass-sm backdrop-blur-md mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
            <span className="text-xs font-semibold text-ink-primary tracking-wide">
              Smart Campus Dining Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-ink-primary tracking-tight max-w-4xl leading-[1.1] mb-6">
            Your campus canteen.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-indigo-600 to-brand-emerald">
              Reimagined.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg md:text-xl text-ink-secondary max-w-2xl leading-relaxed mb-8">
            Discover the menu, order in seconds, and collect your food without the usual canteen chaos.
            Designed for students, kitchen staff, and campus administrators.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-14 w-full sm:w-auto">
            <Link
              to="/student/home"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-bold shadow-brand-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-ink-primary border border-slate-200/80 shadow-glass-sm hover:shadow-glass-md text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Features</span>
              <ChevronRight className="w-4 h-4 text-ink-secondary" />
            </a>
          </div>

          {/* Hero Liquid Glass Preview Container */}
          <div className="w-full max-w-5xl rounded-3xl bg-white/70 backdrop-blur-2xl border border-slate-200/90 shadow-glass-floating p-4 sm:p-6 transition-all">
            <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-inner">
              <div className="bg-white/90 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-mono font-medium text-ink-secondary">
                  canteenflow.apex.edu
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  Live Operations
                </span>
              </div>

              {/* Showcase Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {/* Card 1: Student App Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                        Student Experience
                      </span>
                      <Smartphone className="w-4 h-4 text-brand-blue" />
                    </div>
                    <h4 className="font-bold text-sm text-ink-primary mb-1">
                      Crispy Dosa Platter #CF-101
                    </h4>
                    <p className="text-xs text-ink-secondary mb-3">
                      Status: <span className="text-amber-600 font-semibold">Being Prepared in Kitchen</span>
                    </p>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-blue h-full w-2/3 animate-pulse" />
                  </div>
                </div>

                {/* Card 2: Staff Queue Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                        Kitchen Board
                      </span>
                      <ChefHat className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h4 className="font-bold text-sm text-ink-primary mb-1">
                      12 Active Meal Tickets
                    </h4>
                    <p className="text-xs text-ink-secondary mb-3">
                      Average prep turnaround: <span className="font-semibold text-ink-primary">6.4 minutes</span>
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md self-start">
                    Zero Order Bottleneck
                  </span>
                </div>

                {/* Card 3: Admin Analytics Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        Campus Overview
                      </span>
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h4 className="font-bold text-sm text-ink-primary mb-1">
                      ₹18,450 Today's Sales
                    </h4>
                    <p className="text-xs text-ink-secondary mb-3">
                      Peak slot load: <span className="font-semibold text-ink-primary">12:30 - 13:00</span>
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md self-start">
                    99.4% Order Accuracy
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section id="features" className="py-20 border-t border-slate-200/80 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-2">
              Engineered For Modern Campus Life
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-ink-primary tracking-tight">
              Six reasons why queues are history.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-glass-sm hover:shadow-glass-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-ink-primary mb-2">
                1. Skip Ordering Queues
              </h4>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Order directly from your phone while finishing a lecture or walking across campus. Your food is scheduled or cooked fresh right on time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-glass-sm hover:shadow-glass-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-brand-emerald flex items-center justify-center mb-4">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-ink-primary mb-2">
                2. Live Menu & Stock Visibility
              </h4>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Know immediately what’s fresh, what’s vegetarian or gluten-free, and what’s sold out before you even step inside the dining hall.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-glass-sm hover:shadow-glass-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-ink-primary mb-2">
                3. Order Now or Schedule for Later
              </h4>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Pick an exact 15-minute pickup window for your meal break. Our concurrency-safe capacity engine prevents counter congestion.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-glass-sm hover:shadow-glass-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-ink-primary mb-2">
                4. Pay Your Way
              </h4>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Complete digital checkout using UPI apps, debit/credit cards, or opt for Cash-at-Counter collection with zero payment friction.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-glass-sm hover:shadow-glass-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-ink-primary mb-2">
                5. Live Kitchen Tracking & Tokens
              </h4>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Watch your order progress from Placed to In Kitchen to Ready. Show your digital token number and QR code for rapid pickup.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-glass-sm hover:shadow-glass-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-ink-primary mb-2">
                6. Real-time Canteen Operations
              </h4>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Kitchen staff manage orders on an auto-updating live board. Administrators access peak-hour heatmaps, sales analytics, and audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Role Showcase */}
      <section className="py-20 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-2">
            Tailored Experiences
          </h2>
          <h3 className="text-3xl font-black text-ink-primary mb-6">
            Designed for every campus stakeholder.
          </h3>

          <div className="inline-flex p-1 bg-white rounded-full border border-slate-200 shadow-sm mb-10">
            <button
              onClick={() => setActiveTab('student')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'student' ? 'bg-brand-blue text-white shadow-brand-glow' : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Student Portal
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'staff' ? 'bg-brand-blue text-white shadow-brand-glow' : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Kitchen & Staff Board
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'admin' ? 'bg-brand-blue text-white shadow-brand-glow' : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Administrator Analytics
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-glass-lg p-6 sm:p-10 text-left">
            {activeTab === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-bold uppercase tracking-wider">
                    Fast & Seamless Ordering
                  </span>
                  <h4 className="text-2xl font-black text-ink-primary mt-3 mb-3">
                    Order your favorites before break begins.
                  </h4>
                  <p className="text-sm text-ink-secondary leading-relaxed mb-6">
                    Filter by dietary preferences, customize spicy levels, select immediate preparation or schedule for an upcoming break, and track your food live with digital tokens.
                  </p>
                  <Link
                    to="/student/home"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold shadow-brand-glow hover:bg-brand-blue-hover transition-all"
                  >
                    <span>Launch Student Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 p-4">
                  <img
                    src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop"
                    alt="Menu Preview"
                    className="rounded-xl w-full h-48 object-cover mb-3"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ink-primary">Masala Dosa • Token #CF-101</span>
                    <span className="text-emerald-600 font-bold">Kitchen Preparing</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'staff' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                    Operational Control
                  </span>
                  <h4 className="text-2xl font-black text-ink-primary mt-3 mb-3">
                    Kitchen order management made lightning fast.
                  </h4>
                  <p className="text-sm text-ink-secondary leading-relaxed mb-6">
                    Real-time Kanban order board with one-click Accept, Cook, and Mark Ready buttons. Instant pickup counter lookup prevents mix-ups.
                  </p>
                  <Link
                    to="/staff/orders"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-emerald-glow hover:bg-emerald-700 transition-all"
                  >
                    <span>Launch Staff Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-brand-blue">#CF-101</span>
                      <p className="font-bold text-ink-primary">2x Deluxe Thali</p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px]">
                      Cooking
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-emerald-600">#CF-100</span>
                      <p className="font-bold text-ink-primary">1x Kadak Chai, 1x Samosa</p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                      Ready for Collection
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                    Institutional Oversight
                  </span>
                  <h4 className="text-2xl font-black text-ink-primary mt-3 mb-3">
                    Campus-wide dining analytics & policy control.
                  </h4>
                  <p className="text-sm text-ink-secondary leading-relaxed mb-6">
                    Review revenue trends, hourly peak meal break distributions, payment reconciliation, staff user roles, and full operational audit logs.
                  </p>
                  <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm hover:bg-black transition-all"
                  >
                    <span>Launch Admin Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-ink-primary">Peak Hour Distribution</span>
                    <span className="text-ink-secondary">12:00 - 14:00 (68% load)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full w-4/5" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-ink-secondary block">UPI Revenue</span>
                      <span className="font-bold text-ink-primary">₹12,450 (67%)</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-ink-secondary block">Cash Settled</span>
                      <span className="font-bold text-ink-primary">₹6,000 (33%)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 border-t border-slate-200/80 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-2">
              Four Easy Steps
            </h2>
            <h3 className="text-3xl font-black text-ink-primary tracking-tight">
              From hungry to hot meal in minutes.
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 relative">
              <span className="text-3xl font-black text-slate-300 block mb-2">01</span>
              <h4 className="font-bold text-sm text-ink-primary mb-1">Browse Menu</h4>
              <p className="text-xs text-ink-secondary">
                View live availability, prices, and dietary tags from any device.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 relative">
              <span className="text-3xl font-black text-slate-300 block mb-2">02</span>
              <h4 className="font-bold text-sm text-ink-primary mb-1">Select Timing</h4>
              <p className="text-xs text-ink-secondary">
                Choose immediate kitchen prep or reserve a 15-min scheduled pickup slot.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 relative">
              <span className="text-3xl font-black text-slate-300 block mb-2">03</span>
              <h4 className="font-bold text-sm text-ink-primary mb-1">Instant Payment</h4>
              <p className="text-xs text-ink-secondary">
                Pay online securely with UPI or select counter cash payment.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 relative">
              <span className="text-3xl font-black text-slate-300 block mb-2">04</span>
              <h4 className="font-bold text-sm text-ink-primary mb-1">Show Token & Collect</h4>
              <p className="text-xs text-ink-secondary">
                Walk up to Counter 1 only when your status says Ready and collect your tray.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-slate-200/80 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-black text-ink-primary">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-glass-sm"
              >
                <h4 className="font-bold text-sm text-ink-primary mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-blue" />
                  {faq.q}
                </h4>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-secondary">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-brand-blue" />
            <span className="font-bold text-ink-primary">CanteenFlow</span>
            <span>— Your campus canteen, without the chaos.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-ink-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-ink-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="/login" className="font-semibold text-brand-blue hover:underline">
              Member Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
