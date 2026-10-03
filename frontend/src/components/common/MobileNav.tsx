import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  Compass,
  UtensilsCrossed,
  Clock,
  UserCheck,
  ShoppingBag,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { user } = useAuth();
  const { itemCount, openCart } = useCart();
  const location = useLocation();

  if (user?.role !== 'student') return null;

  const links = [
    { label: 'Home', path: '/student/home', icon: <Compass className="w-5 h-5" /> },
    { label: 'Menu', path: '/student/menu', icon: <UtensilsCrossed className="w-5 h-5" /> },
    { label: 'Orders', path: '/student/orders', icon: <Clock className="w-5 h-5" /> },
    { label: 'Profile', path: '/student/profile', icon: <UserCheck className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 px-4 py-2 flex items-center justify-around shadow-glass-lg">
      {links.map((link) => {
        const isActive = location.pathname.startsWith(link.path);
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-brand-blue font-bold scale-105' : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            {link.icon}
            <span className="text-[10px]">{link.label}</span>
          </Link>
        );
      })}

      {/* Floating Cart in Mobile Nav */}
      <button
        onClick={openCart}
        className="relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-ink-secondary hover:text-brand-blue transition-all"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-brand-blue text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">Cart</span>
      </button>
    </div>
  );
};
