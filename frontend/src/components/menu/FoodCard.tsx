import React from 'react';
import { MenuItem } from '../../types';
import { DietaryBadge } from '../common/StatusBadge';
import { useCart } from '../../context/CartContext';
import { Clock, Plus, Minus, Check } from 'lucide-react';

interface FoodCardProps {
  item: MenuItem;
  onSelect?: (item: MenuItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onSelect }) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.item.id === item.id);
  const qtyInCart = cartItem?.quantity || 0;

  const isSoldOut = !item.isAvailable || (item.trackingMode === 'EXACT' && (item.availableQuantity ?? 0) <= 0);
  const isLowStock = !isSoldOut && item.trackingMode === 'EXACT' && (item.availableQuantity ?? 0) <= (item.lowStockThreshold ?? 5);

  return (
    <div
      onClick={() => onSelect && onSelect(item)}
      className={`group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-glass-sm hover:shadow-glass-md hover:border-slate-300 transition-all duration-200 cursor-pointer ${
        isSoldOut ? 'opacity-70 bg-slate-50' : ''
      }`}
    >
      {/* Food Image & Badge Overlay */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={item.imagePath}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop';
          }}
        />
        
        {/* Subtle glass gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

        {/* Dietary Tag Pill */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
          {item.dietaryTags.slice(0, 2).map((tag) => (
            <DietaryBadge key={tag} tag={tag} />
          ))}
        </div>

        {/* Estimated Prep Time */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{item.preparationMinutes}m prep</span>
        </div>

        {/* Sold Out Stamp */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-sm text-ink-primary group-hover:text-brand-blue transition-colors line-clamp-1">
              {item.name}
            </h4>
          </div>

          <p className="text-xs text-ink-secondary line-clamp-2 mb-3">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-xs text-ink-secondary">Price</span>
            <div className="text-base font-extrabold text-ink-primary">
              ₹{item.price.toFixed(2)}
            </div>
            {isLowStock && (
              <span className="text-[10px] text-amber-600 font-medium">
                Only {item.availableQuantity} left
              </span>
            )}
          </div>

          {/* Cart Controls */}
          {!isSoldOut && (
            <div onClick={(e) => e.stopPropagation()}>
              {qtyInCart > 0 ? (
                <div className="flex items-center gap-1.5 bg-brand-blue-light border border-brand-blue/30 rounded-full px-1.5 py-1">
                  <button
                    onClick={() => updateQuantity(item.id, qtyInCart - 1)}
                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-brand-blue shadow-sm hover:scale-110 active:scale-95 transition-all"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-brand-blue px-1.5">
                    {qtyInCart}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, qtyInCart + 1)}
                    className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addItem(item, 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-brand-blue hover:shadow-brand-glow active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
