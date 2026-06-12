import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit3, X, Search, Check, Sparkles, Filter, Moon, Sun } from 'lucide-react';
import { Product } from '../types';
import { useTheme } from '../ThemeContext';

interface ProductsViewProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProductPrice: (id: string, newPrice: number) => void;
  onDeleteProduct: (id: string) => void;
}

export default function ProductsView({
  products,
  onAddProduct,
  onUpdateProductPrice,
  onDeleteProduct,
}: ProductsViewProps) {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('L');
  const [type, setType] = useState<'milk' | 'egg' | 'feed' | 'other'>('milk');

  // Filter products by query
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPrice = parseFloat(price);
    if (!name.trim() || isNaN(finalPrice) || finalPrice <= 0) return;

    onAddProduct({
      name: name.trim(),
      price: finalPrice,
      unit: unit || 'unit',
      type,
    });

    // Reset Form
    setName('');
    setPrice('');
    setUnit('L');
    setType('milk');
    setIsAddModalOpen(false);
  };

  const handleStartPriceEdit = (p: Product) => {
    setEditingFieldId(p.id);
    setEditPriceValue(p.price.toString());
  };

  const handleSavePriceEdit = (id: string) => {
    const nextPrice = parseFloat(editPriceValue);
    if (!isNaN(nextPrice) && nextPrice > 0) {
      onUpdateProductPrice(id, nextPrice);
    }
    setEditingFieldId(null);
  };

  return (
    <div id="products-management-screen" className="flex flex-col h-full bg-[#F2F2F7] dark:bg-black text-slate-900 dark:text-slate-50 overflow-hidden relative">
      {/* HEADER SECTION */}
      <header className="bg-white dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 h-14 flex items-center justify-between sticky top-0 z-20 shrink-0">
        <span className="font-display font-semibold text-lg text-slate-800 dark:text-slate-100">Inventory Catalog</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:bg-[#3A3A3C] text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            id="add-product-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:bg-[#3A3A3C] text-[#007AFF] transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* SEARCH BAR */}
      <div className="p-4 bg-[#F2F2F7] dark:bg-black border-b border-slate-200 dark:border-white/10 space-y-1.5 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-[#EBEBF5]/60 w-4.5 h-4.5" />
          <input
            id="product-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#38383A] rounded-2xl py-2.5 pl-10 pr-4 text-xs focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all shadow-sm placeholder:text-slate-500 dark:text-[#EBEBF5]/60"
            placeholder="Search catalog by name or type..."
            type="text"
          />
        </div>
      </div>

      {/* CATALOG DIRECTORY */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar pb-24">
        <div className="bg-[#1C1C1E] text-white p-6 rounded-3xl shadow-sm space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white dark:bg-[#1C1C1E]/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-[#EBEBF5]/60 block">Catalog Summary</span>
          <h4 className="font-display font-bold text-lg">Product Quality Verified</h4>
          <p className="text-[11px] text-slate-500 dark:text-[#EBEBF5]/60 leading-relaxed">
            Manage your daily dairy prices here. Changes will take effect immediately on new purchase entry screens.
          </p>
        </div>

        <div className="space-y-3.5">
          <AnimatePresence mode="popLayout">
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 space-y-2 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200 dark:border-[#38383A] p-6"
              >
                <div className="text-4xl">🧈</div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No products found</p>
                <p className="text-xs text-slate-500 dark:text-[#EBEBF5]/60">Try checking your search query spelling</p>
              </motion.div>
            ) : (
              filteredProducts.map((p, index) => {
                const isEditing = editingFieldId === p.id;
                return (
                  <motion.div
                    key={p.id}
                    id={`product-manage-card-${p.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index * 0.04, 0.2) } }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#38383A] rounded-3xl p-5 shadow-none flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 flex items-center justify-center rounded-2xl ${
                        p.type === 'milk' ? 'bg-[#F3F6FC] text-blue-600' : p.type === 'egg' ? 'bg-amber-50/50 text-amber-600' : 'bg-green-50/55 text-green-600'
                      }`}>
                        {p.type === 'milk' ? (
                          <span className="text-xl font-bold">💧</span>
                        ) : p.type === 'egg' ? (
                          <span className="text-xl font-bold">🍳</span>
                        ) : (
                          <span className="text-xl font-bold">🧈</span>
                        )}
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-900 dark:text-slate-50 text-sm">{p.name}</h5>
                        <p className="text-xs text-gray-400 mt-0.5">Base Unit: {p.unit}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            id={`edit-price-${p.id}`}
                            value={editPriceValue}
                            onChange={(e) => setEditPriceValue(e.target.value)}
                            className="w-14 bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-xl px-2 py-1 text-center font-bold text-xs focus:bg-white dark:bg-[#1C1C1E] outline-none focus:border-blue-500"
                            type="number"
                            step="0.1"
                          />
                          <button
                            id={`save-price-${p.id}`}
                            onClick={() => handleSavePriceEdit(p.id)}
                            className="bg-emerald-500 text-white rounded-lg p-1.5 hover:bg-emerald-600 shadow-sm"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="font-display font-black text-sm text-slate-900 dark:text-slate-50">₹{p.price}</span>
                          <button
                            id={`start-price-edit-${p.id}`}
                            onClick={() => handleStartPriceEdit(p)}
                            className="block text-[10px] text-blue-500 hover:underline text-right font-semibold"
                          >
                            Update Price
                          </button>
                        </div>
                      )}

                      {/* Delete Product (Allow deleting custom ones except default products to avoid breaks) */}
                      {p.id.startsWith('custom_') && (
                        <button
                          id={`del-product-${p.id}`}
                          onClick={() => onDeleteProduct(p.id)}
                          className="text-slate-350 hover:text-rose-500 transition-colors p-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ADD PRODUCT MODAL SHEET */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white dark:bg-[#1C1C1E] w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="px-4 py-3.5 border-b border-slate-200 dark:border-[#38383A] flex justify-between items-center bg-[#F9F9FB] dark:bg-[#2C2C2E]">
                <span className="font-display font-bold text-slate-800 dark:text-slate-100">Add New Dairy Product</span>
                <button
                  id="close-add-product-modal"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-200 dark:bg-[#48484A] transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-[#EBEBF5]/60" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddSubmit} className="p-4 space-y-4">
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-[#EBEBF5]/60 uppercase">Product Name</label>
                  <input
                    id="new-product-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-xl px-4 py-3 text-sm focus:bg-white dark:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="e.g. Pure Buffalo Ghee, cow butter"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Category Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-[#EBEBF5]/60 uppercase">Category</label>
                    <select
                      id="new-product-type"
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="milk">🥛 Milk / Dairy Liquid</option>
                      <option value="egg">🍳 Farm Eggs</option>
                      <option value="feed">🌾 Cattle Feed</option>
                      <option value="other">🧈 Ghee / Butter / Cheese</option>
                    </select>
                  </div>

                  {/* Pricing Unit */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-[#EBEBF5]/60 uppercase">Unit Measure</label>
                    <input
                      id="new-product-unit"
                      required
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-xl px-3 py-2.5 text-sm focus:bg-white dark:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="L, Kg, Dozen, Bag, Unit"
                    />
                  </div>
                </div>

                {/* Selling Price */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-[#EBEBF5]/60 uppercase">Price per Unit (₹)</label>
                  <input
                    id="new-product-price"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-xl px-4 py-3 text-sm focus:bg-white dark:bg-[#1C1C1E] focus:outline-none"
                    placeholder="e.g. 74.00"
                    type="number"
                    step="0.01"
                    min="0.1"
                  />
                </div>

                {/* Submit */}
                <motion.button
                  id="btn-create-product"
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-[#007AFF] text-white font-display font-semibold py-3.5 rounded-2xl shadow-md hover:bg-blue-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Register Product</span>
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
