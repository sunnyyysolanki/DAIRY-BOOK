import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, Plus, Minus, CheckCircle2, User, Sparkles } from 'lucide-react';
import { Customer, Product, Transaction } from '../types';

interface NewEntryViewProps {
  customers: Customer[];
  products: Product[];
  onSave: (customerId: string, items: { product: Product; quantity: number }[]) => void;
  onBack: () => void;
}

export default function NewEntryView({ customers, products, onSave, onBack }: NewEntryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('c1'); // Default to Rahul Sharma
  const [quantities, setQuantities] = useState<Record<string, number>>({
    'p1': 2, // Default 2 Amul Gold
    'p2': 0, // Default 0 Amul Taaza
    'p3': 1, // Default 1 Butter (500g)
  });
  const [isSaving, setIsSaving] = useState(false);

  // Filter customers by search
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers.slice(0, 4);
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  // Selected customer object
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || customers[0];
  }, [customers, selectedCustomerId]);

  const updateQuantity = (productId: string, delta: number) => {
    setQuantities(prev => {
      const curr = prev[productId] || 0;
      const next = Math.max(0, curr + delta);
      return { ...prev, [productId]: next };
    });
  };

  // Compute total value
  const totalValue = useMemo(() => {
    return (Object.entries(quantities) as [string, number][]).reduce((acc, [prodId, q]) => {
      const prod = products.find(p => p.id === prodId);
      if (!prod) return acc;
      return acc + (prod.price * q);
    }, 0);
  }, [quantities, products]);

  const handleSave = () => {
    if (!selectedCustomerId) return;
    setIsSaving(true);
    
    // Simulate real network save delay for delightful feedback
    setTimeout(() => {
      const saveItems = (Object.entries(quantities) as [string, number][])
        .filter(([_, q]) => q > 0)
        .map(([prodId, q]) => ({
          product: products.find(p => p.id === prodId)!,
          quantity: q
        }));
      
      onSave(selectedCustomerId, saveItems);
      setIsSaving(false);
    }, 850);
  };

  return (
    <div id="new-entry-screen" className="flex flex-col h-full bg-[#F2F2F7] dark:bg-black text-slate-900 dark:text-slate-50 overflow-hidden relative">
      {/* HEADER SECTION */}
      <header className="bg-white dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 h-14 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            id="back-btn"
            onClick={onBack} 
            className="p-1.5 rounded-full hover:bg-slate-100 dark:bg-[#3A3A3C] active:scale-90 transition-transform text-slate-700 dark:text-slate-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-display font-semibold text-lg text-slate-800 dark:text-slate-100">New Entry</span>
        </div>
        <button 
          id="clear-btn"
          onClick={() => setQuantities({})}
          className="px-4 py-1.5 rounded-full hover:bg-[#F9F9FB] dark:bg-[#2C2C2E] text-blue-600 font-medium text-sm transition-colors"
        >
          Clear
        </button>
      </header>

      {/* Main Form Fields scrolling container */}
      <div className="flex-1 overflow-y-auto p-5 pb-36 no-scrollbar space-y-6">
        
        {/* CUSTOMER SECTION */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-slate-50 opacity-40 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Customer Selection
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-[#EBEBF5]/60 w-5 h-5" />
            <input 
              id="customer-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#38383A] rounded-2xl py-3 pl-11 pr-4 text-xs focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all shadow-sm placeholder:text-slate-500 dark:text-[#EBEBF5]/60"
              placeholder="Search customer by name or phone..." 
              type="text"
            />
          </div>

          {/* Quick Select Buttons */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {customers.slice(0, 4).map((c) => (
              <motion.button
                key={c.id}
                id={`quick-customer-${c.id}`}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCustomerId(c.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                  selectedCustomerId === c.id 
                    ? 'bg-[#007AFF] border-[#007AFF] text-white shadow-sm shadow-[#007AFF]/20' 
                    : 'bg-white dark:bg-[#1C1C1E] border-slate-200 dark:border-[#38383A] text-slate-700 dark:text-slate-300 hover:bg-[#F9F9FB] dark:bg-[#2C2C2E]'
                }`}
              >
                {c.name}
              </motion.button>
            ))}
          </div>

          {searchQuery && (
            <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#38383A] rounded-2xl divide-y divide-slate-100 dark:divide-[#38383A] shadow-sm overflow-hidden">
              {filteredCustomers.length === 0 ? (
                <div className="p-3 text-xs text-slate-500 dark:text-[#EBEBF5]/60 text-center">No matching customers</div>
              ) : (
                filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomerId(c.id);
                      setSearchQuery('');
                    }}
                    className={`w-full p-3 text-left text-sm flex justify-between items-center ${
                      selectedCustomerId === c.id ? 'bg-blue-50/50' : 'hover:bg-slate-55'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</div>
                      <div className="text-xs text-slate-500 dark:text-[#EBEBF5]/60">{c.phone}</div>
                    </div>
                    {selectedCustomerId === c.id && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">Active</span>}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected Customer Feedback Card */}
        {selectedCustomer && (
          <div className="p-4.5 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#38383A] rounded-3xl flex items-center justify-between text-xs shadow-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F3F6FC] border border-slate-200 dark:border-[#38383A] text-[#007AFF] flex items-center justify-center font-bold text-xs">
                {selectedCustomer.initials}
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-50">{selectedCustomer.name}</div>
                <div className="text-[10px] text-gray-400">Contact: {selectedCustomer.phone}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-gray-400 block pb-0.5">Acc. Due</span>
              <span className={`font-semibold text-xs px-2.5 py-0.5 rounded-full border ${selectedCustomer.currentDue > 0 ? 'bg-amber-50 text-amber-700 border-amber-100/50' : 'bg-emerald-50 text-emerald-700 border-emerald-100/50'}`}>
                ₹{selectedCustomer.currentDue.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* PRODUCTS SECTION */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-slate-50 opacity-40 flex items-center gap-1.5 pt-1">
            <Sparkles className="w-3.5 h-3.5 text-[#007AFF]" /> Products
          </label>
          <div className="space-y-3.5">
            {products.slice(0, 4).map((p) => {
              const qty = quantities[p.id] || 0;
              return (
                <div 
                  key={p.id} 
                  id={`product-card-${p.id}`}
                  className={`bg-white dark:bg-[#1C1C1E] border transition-colors duration-200 rounded-3xl p-5 shadow-none flex items-center justify-between ${
                    qty > 0 ? 'border-[#007AFF] ring-1 ring-[#007AFF]/10' : 'border-slate-200 dark:border-[#38383A] hover:border-slate-200 dark:border-[#38383A]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon container based on product type */}
                    <div className={`w-11 h-11 flex items-center justify-center rounded-2xl ${
                      p.type === 'milk' ? 'bg-[#F3F6FC] border border-slate-200 dark:border-[#38383A] text-blue-600' : p.type === 'egg' ? 'bg-amber-50/50 border border-amber-100/40 text-amber-600' : 'bg-green-50/55 border border-green-100/40 text-green-600'
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
                      <h3 className="font-display font-semibold text-slate-900 dark:text-slate-50 text-[15px]">{p.name}</h3>
                      <p className="text-xs font-medium text-gray-450">
                        ₹{p.price} / {p.unit}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Material-You vs iOS Styled Stepper */}
                  <div className="flex items-center bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A]/60 rounded-2xl p-1">
                    <motion.button 
                      id={`dec-qty-${p.id}`}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(p.id, -1)}
                      disabled={qty === 0}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-[#1C1C1E] shadow-sm text-slate-700 dark:text-slate-300 active:bg-slate-200 dark:bg-[#48484A] transition-colors ${
                        qty === 0 ? 'opacity-40 cursor-not-allowed shadow-none' : ''
                      }`}
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[3]" />
                    </motion.button>
                    <span className="w-9 text-center font-display font-bold text-slate-900 dark:text-slate-50 text-[15px]">
                      {qty}
                    </span>
                    <motion.button 
                      id={`inc-qty-${p.id}`}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(p.id, 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#007AFF] text-white shadow-sm active:bg-blue-700 hover:bg-blue-500 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </motion.button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* FIXED BOTTOM ACTION BAR WITH LIVE TOTAL */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1C1C1E] border-t border-slate-200 dark:border-[#38383A] p-5 shadow-[0_-8px_30px_rgba(0,0,0,0.03)] z-30">
        <div className="flex justify-between items-center mb-4 px-1">
          <span className="text-sm font-semibold text-gray-400">Value Summary</span>
          <span className="font-display font-bold text-2xl text-slate-900 dark:text-slate-50 tracking-tight">
            ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        <motion.button 
          id="btn-save-entry"
          whileTap={totalValue > 0 && !isSaving ? { scale: 0.98 } : {}}
          animate={isSaving ? { 
            scale: [1, 0.94, 1.05, 0.98, 1],
            boxShadow: [
              "0px 6px 20px rgba(0,122,255,0.15)",
              "0px 0px 25px rgba(0,122,255,0.6)",
              "0px 6px 20px rgba(0,122,255,0.15)"
            ]
          } : { scale: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          onClick={handleSave}
          disabled={totalValue === 0 || isSaving}
          className={`w-full py-4 rounded-2xl font-display font-semibold text-[15px] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden ${
            totalValue === 0 
              ? 'bg-slate-100 dark:bg-[#3A3A3C] text-slate-500 dark:text-[#EBEBF5]/60 border border-slate-150 cursor-not-allowed' 
              : 'bg-[#007AFF] text-white hover:bg-blue-600 active:brightness-95 shadow-[0_6px_20px_rgba(0,122,255,0.15)]'
          }`}
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Saving Entry...</span>
            </div>
          ) : (
            <React.Fragment>
              <CheckCircle2 className="w-5 h-5" />
              <span>Save Direct Entry</span>
            </React.Fragment>
          )}
        </motion.button>
      </div>

    </div>
  );
}
