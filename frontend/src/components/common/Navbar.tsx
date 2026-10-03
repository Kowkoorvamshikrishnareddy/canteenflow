import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  UtensilsCrossed,
  ShoppingBag,
  Clock,
  Compass,
  LayoutDashboard,
  ClipboardList,
  ScanLine,
  Boxes,
  BarChart3,
  Users,
  Settings,
  Shield,
  LogOut,
  UserCheck,
  CreditCard,
  Star,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount, openCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const role = user?.role || 'student';

  const studentLinks = [
    { label: 'Home', path: '/student/home', icon: <Compass className="w-4 h-4" /> },
    { label: 'Menu', path: '/student/menu', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { label: 'My Orders', path: '/student/orders', icon: <Clock className="w-4 h-4" /> },
    { label: 'Profile', path: '/student/profile', icon: <UserCheck className="w-4 h-4" /> },
  ];

  const staffLinks = [
    { label: 'Live Orders', path: '/staff/orders', icon: <ClipboardList className="w-4 h-4" /> },
    { label: 'Counter Pickup', path: '/staff/pickup', icon: <ScanLine className="w-4 h-4" /> },
    { label: 'Menu Manager', path: '/staff/menu', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { label: 'Inventory', path: '/staff/inventory', icon: <Boxes className="w-4 h-4" /> },
    { label: 'Sales Reports', path: '/staff/reports', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Settings', path: '/staff/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const adminLinks = [
    { label: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Payments', path: '/admin/payments', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Feedback', path: '/admin/feedback', icon: <Star className="w-4 h-4" /> },
    { label: 'Users & Roles', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Canteens', path: '/admin/canteens', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { label: 'Audit Trail', path: '/admin/audit', icon: <Shield className="w-4 h-4" /> },
    { label: 'Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const navLinks = role === 'admin' ? adminLinks : role === 'staff' ? staffLinks : studentLinks;

  return (
    <header className="sticky top-0 z-40 w-full px-4 py-2.5 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-glass-sm transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-blue to-indigo-600 flex items-center justify-center text-white shadow-brand-glow group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-ink-primary flex items-center gap-1.5">
              Canteen<span className="text-brand-blue">Flow</span>
            </span>
            <span className="text-[10px] text-ink-secondary -mt-1 font-medium tracking-wide">
              CAMPUS SMART DINING
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-full border border-slate-200/60">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-brand-blue shadow-sm font-semibold'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-white/50'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          {/* Cart Icon for Student */}
          {role === 'student' && (
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-ink-primary transition-all border border-slate-200/70 flex items-center justify-center group"
              title="Open Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-ink-primary group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-blue text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-brand-glow animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile Pill */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm"
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-ink-primary leading-tight">
                  {user.fullName}
                </span>
                <span className="text-[10px] text-ink-secondary capitalize">
                  {user.role} Account
                </span>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-full bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue-hover shadow-brand-glow transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
