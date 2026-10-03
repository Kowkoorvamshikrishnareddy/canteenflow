import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { MenuCategory, MenuItem, DietaryTag } from '../../types';
import { FoodCard } from '../../components/menu/FoodCard';
import { FoodModal } from '../../components/menu/FoodModal';
import {
  Search,
  Filter,
  UtensilsCrossed,
  Sparkles,
  SlidersHorizontal,
  X,
} from 'lucide-react';

export const StudentMenuPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<DietaryTag | ''>('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const [selectedModalItem, setSelectedModalItem] = useState<MenuItem | null>(null);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const res = await api.getMenu({
        category: selectedCategory || undefined,
        q: searchQuery || undefined,
        dietary: selectedDietary || undefined,
        available: availableOnly || undefined,
      });
      setCategories(res.categories);
      setItems(res.items);
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [selectedCategory, selectedDietary, availableOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadMenu();
  };

  const dietaryOptions: { tag: DietaryTag; label: string }[] = [
    { tag: 'veg', label: 'Vegetarian' },
    { tag: 'vegan', label: 'Vegan' },
    { tag: 'high-protein', label: 'High Protein' },
    { tag: 'gluten-free', label: 'Gluten-Free' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
            Today's Fresh Campus Menu
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Green Leaf Canteen • Hygienically prepared breakfast, wholesome thalis, and quick refreshments
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dosa, thali, chai..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-glass-sm text-xs text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                loadMenu();
              }}
              className="absolute right-3 top-3 text-slate-400 hover:text-ink-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === ''
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-ink-secondary hover:text-ink-primary border border-slate-200/80 shadow-glass-sm'
          }`}
        >
          All Items ({items.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-brand-blue text-white shadow-brand-glow'
                : 'bg-white text-ink-secondary hover:text-ink-primary border border-slate-200/80 shadow-glass-sm'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Dietary Filters & Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white/70 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-glass-sm text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-ink-secondary font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Dietary:
          </span>
          {dietaryOptions.map((opt) => {
            const isSelected = selectedDietary === opt.tag;
            return (
              <button
                key={opt.tag}
                onClick={() => setSelectedDietary(isSelected ? '' : opt.tag)}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-ink-secondary hover:bg-slate-200/70'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none text-ink-secondary hover:text-ink-primary">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue/30 border-slate-300"
          />
          <span className="font-semibold text-xs">In-Stock Only</span>
        </label>
      </div>

      {/* Food Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-glass-sm">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-ink-primary mb-1">No items found</h3>
          <p className="text-xs text-ink-secondary max-w-sm mx-auto mb-4">
            Try adjusting your search keywords or dietary filters to view available cafeteria selections.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('');
              setSearchQuery('');
              setSelectedDietary('');
              setAvailableOnly(false);
            }}
            className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-ink-primary transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <FoodCard key={item.id} item={item} onSelect={(i) => setSelectedModalItem(i)} />
          ))}
        </div>
      )}

      {/* Item Modal */}
      <FoodModal item={selectedModalItem} onClose={() => setSelectedModalItem(null)} />
    </div>
  );
};
