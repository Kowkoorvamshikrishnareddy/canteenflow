import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { realtime } from '../../services/realtime';
import { MenuItem, Order } from '../../types';
import { FoodCard } from '../../components/menu/FoodCard';
import { FoodModal } from '../../components/menu/FoodModal';
import { OrderStatusBadge } from '../../components/common/StatusBadge';
import {
  UtensilsCrossed,
  Sparkles,
  Clock,
  ArrowRight,
  Flame,
  ChefHat,
  ChevronRight,
  PackageCheck,
  ShoppingBag,
} from 'lucide-react';

export const StudentHomePage: React.FC = () => {
  const { user, canteen } = useAuth();
  const { openCart, itemCount } = useCart();
  const navigate = useNavigate();

  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, ordersRes] = await Promise.all([
        api.getMenu({ available: true }),
        api.getOrders(),
      ]);

      setFeaturedItems(menuRes.items.slice(0, 4));

      // Find first active order (not COLLECTED or CANCELLED)
      const currentActive = ordersRes.orders.find((o) =>
        ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)
      );
      setActiveOrder(currentActive || null);
    } catch (err) {
      console.error('Failed to load student home data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to realtime order updates
    const unsubOrder = realtime.on('ORDER_UPDATED', (updatedOrder: Order) => {
      if (updatedOrder.userId === user?.id) {
        if (['COLLECTED', 'CANCELLED', 'REJECTED'].includes(updatedOrder.status)) {
          setActiveOrder(null);
        } else {
          setActiveOrder(updatedOrder);
        }
      }
    });

    const unsubCreated = realtime.on('ORDER_CREATED', (newOrder: Order) => {
      if (newOrder.userId === user?.id) {
        setActiveOrder(newOrder);
      }
    });

    return () => {
      unsubOrder();
      unsubCreated();
    };
  }, [user?.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Personalized Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-white/80 to-indigo-50/40 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-glass-sm backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
              Apex Campus Dining
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Counter Open (08:00 - 20:00)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
            {greeting}, {user?.fullName?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            {canteen?.name || 'Green Leaf Central Canteen'} is serving fresh hot meals and quick snacks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/student/menu"
            className="px-5 py-2.5 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-brand-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Order Food Now</span>
          </Link>

          <button
            onClick={openCart}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-ink-primary text-xs font-bold shadow-sm flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-brand-blue" />
            <span>Tray ({itemCount})</span>
          </button>
        </div>
      </div>

      {/* Active Live Order Tracker Banner (If Order Active) */}
      {activeOrder && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 shadow-glass-md border border-indigo-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold font-mono tracking-wide">
                  Token {activeOrder.orderNumber}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-amber-300 font-semibold">
                  <ChefHat className="w-3.5 h-3.5 animate-bounce" />
                  {activeOrder.status === 'READY' ? 'Ready for Pickup!' : 'Kitchen is Preparing'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {activeOrder.items[0]?.itemNameSnapshot}
                {activeOrder.items.length > 1 && ` + ${activeOrder.items.length - 1} more`}
              </h3>
              <p className="text-xs text-slate-300">
                {activeOrder.orderType} Order • Total: ₹{activeOrder.total.toFixed(2)}
              </p>
            </div>

            <Link
              to={`/student/orders/${activeOrder.id}`}
              className="px-5 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <span>View Live Token & QR</span>
              <ArrowRight className="w-4 h-4 text-brand-blue" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Action Category Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/student/menu?category=cat-breakfast"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-glass-sm hover:shadow-glass-md hover:border-slate-300 transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            🍳
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink-primary">South Indian</h4>
            <span className="text-[10px] text-ink-secondary">Dosas & Idlis</span>
          </div>
        </Link>

        <Link
          to="/student/menu?category=cat-lunch"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-glass-sm hover:shadow-glass-md hover:border-slate-300 transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            🍱
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink-primary">Campus Meals</h4>
            <span className="text-[10px] text-ink-secondary">Thalis & Rolls</span>
          </div>
        </Link>

        <Link
          to="/student/menu?category=cat-snacks"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-glass-sm hover:shadow-glass-md hover:border-slate-300 transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            🥟
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink-primary">Quick Bites</h4>
            <span className="text-[10px] text-ink-secondary">Samosas & Pavs</span>
          </div>
        </Link>

        <Link
          to="/student/menu?category=cat-beverages"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-glass-sm hover:shadow-glass-md hover:border-slate-300 transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            ☕
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink-primary">Beverages</h4>
            <span className="text-[10px] text-ink-secondary">Kadak Chai & Frappes</span>
          </div>
        </Link>
      </div>

      {/* Featured Specials Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-black text-ink-primary tracking-tight">
              Chef's Specials & Popular Picks
            </h3>
          </div>
          <Link
            to="/student/menu"
            className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
          >
            <span>View All ({featuredItems.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <FoodCard key={item.id} item={item} onSelect={(i) => setSelectedItem(i)} />
            ))}
          </div>
        )}
      </div>

      {/* Food Details Modal */}
      <FoodModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
};
