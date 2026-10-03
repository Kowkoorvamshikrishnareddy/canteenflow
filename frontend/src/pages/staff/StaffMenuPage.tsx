import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MenuItem, MenuCategory, DietaryTag } from '../../types';
import { DietaryBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Clock,
  CheckCircle2,
  XCircle,
  FolderPlus,
  RefreshCw,
} from 'lucide-react';

export const StaffMenuPage: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState(50);
  const [formPrepMinutes, setFormPrepMinutes] = useState(10);
  const [formImage, setFormImage] = useState('');
  const [formDietary, setFormDietary] = useState<DietaryTag[]>(['veg']);
  const [formQuantity, setFormQuantity] = useState(50);

  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');

  const loadMenu = async () => {
    try {
      setLoading(true);
      const res = await api.getMenu();
      setCategories(res.categories);
      setItems(res.items);
      if (res.categories.length > 0 && !formCategory) {
        setFormCategory(res.categories[0].id);
      }
    } catch (e) {
      console.error('Failed to load menu:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      const updated = await api.updateMenuItem(item.id, { isAvailable: !item.isAvailable });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (err: any) {
      alert(err.message || 'Failed to update availability');
    }
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.categoryId);
    setFormDescription(item.description);
    setFormPrice(item.price);
    setFormPrepMinutes(item.preparationMinutes);
    setFormImage(item.imagePath);
    setFormDietary(item.dietaryTags);
    setFormQuantity(item.availableQuantity || 50);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Update
        const updated = await api.updateMenuItem(editingItem.id, {
          name: formName,
          categoryId: formCategory,
          description: formDescription,
          price: Number(formPrice),
          preparationMinutes: Number(formPrepMinutes),
          imagePath: formImage || editingItem.imagePath,
          dietaryTags: formDietary,
          availableQuantity: Number(formQuantity),
        });
        setItems((prev) => prev.map((i) => (i.id === editingItem.id ? updated : i)));
        setEditingItem(null);
      } else {
        // Create
        const created = await api.createMenuItem({
          name: formName,
          categoryId: formCategory,
          description: formDescription,
          price: Number(formPrice),
          preparationMinutes: Number(formPrepMinutes),
          imagePath: formImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop',
          dietaryTags: formDietary,
          availableQuantity: Number(formQuantity),
          isAvailable: true,
        });
        setItems((prev) => [...prev, created]);
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'Save failed');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cat = await api.createCategory(categoryName, categoryDesc);
      setCategories((prev) => [...prev, cat]);
      setCategoryName('');
      setCategoryDesc('');
      setIsAddCategoryOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create category');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
            Menu Management
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Add new food items, update pricing, customize prep estimates, and toggle availability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddCategoryOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-ink-primary text-xs font-semibold hover:bg-slate-50 shadow-glass-sm transition-all"
          >
            <FolderPlus className="w-4 h-4 text-brand-blue" />
            <span>New Category</span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setFormName('');
              setFormDescription('');
              setFormPrice(60);
              setFormPrepMinutes(8);
              setFormImage('');
              setFormDietary(['veg']);
              setFormQuantity(40);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-brand-glow hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Items Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-glass-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-ink-secondary font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Food Item</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Prep Estimate</th>
                <th className="px-6 py-3.5">Stock</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Loading menu catalog...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No items in canteen menu yet.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const cat = categories.find((c) => c.id === item.categoryId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imagePath}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-ink-primary block">{item.name}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              {item.dietaryTags.map((t) => (
                                <DietaryBadge key={t} tag={t} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3.5 font-medium text-ink-secondary">
                        {cat?.name || 'General'}
                      </td>

                      <td className="px-6 py-3.5 font-bold text-ink-primary">
                        ₹{item.price.toFixed(2)}
                      </td>

                      <td className="px-6 py-3.5 text-ink-secondary">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          {item.preparationMinutes} mins
                        </span>
                      </td>

                      <td className="px-6 py-3.5 font-bold text-ink-primary">
                        {item.availableQuantity}
                      </td>

                      <td className="px-6 py-3.5">
                        <button
                          onClick={() => handleToggleAvailable(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            item.isAvailable
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {item.isAvailable ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>In Stock</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Sold Out</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-slate-100 transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      <Modal
        isOpen={isAddModalOpen || Boolean(editingItem)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? `Edit ${editingItem.name}` : 'Add New Food Item'}
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Item Name</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Masala Dosa with Sambar"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">Price (₹)</label>
              <input
                type="number"
                step="0.5"
                required
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Description</label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Crispy crepe with spiced potato filling..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">Prep Time (Mins)</label>
              <input
                type="number"
                required
                value={formPrepMinutes}
                onChange={(e) => setFormPrepMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">Stock Quantity</label>
              <input
                type="number"
                required
                value={formQuantity}
                onChange={(e) => setFormQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Image URL</label>
            <input
              type="url"
              value={formImage}
              onChange={(e) => setFormImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingItem(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-secondary hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-brand-glow"
            >
              Save Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        title="Add Menu Category"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Category Name</label>
            <input
              type="text"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Desserts & Sweet Treats"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">Description (Optional)</label>
            <input
              type="text"
              value={categoryDesc}
              onChange={(e) => setCategoryDesc(e.target.value)}
              placeholder="Freshly made sweet dishes"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddCategoryOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-secondary hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-brand-glow"
            >
              Create Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
