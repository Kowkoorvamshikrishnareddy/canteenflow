import React, { useState } from 'react';
import { MenuItem } from '../../types';
import { Modal } from '../common/Modal';
import { DietaryBadge } from '../common/StatusBadge';
import { useCart } from '../../context/CartContext';
import { Clock, Plus, Minus, ShoppingBag, Sparkles } from 'lucide-react';

interface FoodModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const FoodModal: React.FC<FoodModalProps> = ({ item, onClose }) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  if (!item) return null;

  const handleAddToCart = () => {
    addItem(item, quantity, note.trim() || undefined);
    onClose();
  };

  const totalPrice = item.price * quantity;

  return (
    <Modal isOpen={Boolean(item)} onClose={onClose} title={item.name} maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        {/* Large Food Image */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80">
          <img
            src={item.imagePath}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
            {item.dietaryTags.map((tag) => (
              <DietaryBadge key={tag} tag={tag} />
            ))}
          </div>
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{item.preparationMinutes} mins prep</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-sm text-ink-secondary leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Customization instructions */}
        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            Special Preparation Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Less spicy, extra green chutney, no onions"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
          />
        </div>

        {/* Quantity and Add to Cart */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-secondary">Quantity</span>
            <div className="flex items-center gap-2 bg-slate-100 rounded-full px-2 py-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-ink-primary shadow-sm hover:scale-105 active:scale-95"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-bold text-ink-primary w-5 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-sm hover:scale-105 active:scale-95"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-brand-glow hover:scale-105 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add for ₹{totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
