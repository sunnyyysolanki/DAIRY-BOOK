import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getStoredData, setStoredData, 
  INITIAL_CUSTOMERS, INITIAL_PRODUCTS, INITIAL_TRANSACTIONS 
} from './initialData';
import { Customer, Product, Transaction, ViewMode, UserRole } from './types';
import AdminDashboard from './components/AdminDashboard';
import CustomersView from './components/CustomersView';
import NewEntryView from './components/NewEntryView';
import CustomerPortal from './components/CustomerPortal';
import ProductsView from './components/ProductsView';
import AuthView from './components/AuthView';
import { 
  LayoutDashboard, Users, Package, ReceiptText, 
  Filter, CheckCircle2, Sparkles, Receipt, LogIn,
  Sun, Moon
} from 'lucide-react';

export default function App() {
  // Application Data States (Bound to LocalStorage)
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Auth & Role states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>('admin');
  const [portalCustomerId, setPortalCustomerId] = useState<string>('');
  
  // Navigation Screen States & UI
  const [view, setView] = useState<ViewMode>('dashboard');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Synchronize state from LocalStorage on mount
  useEffect(() => {
    const storedCustomers = getStoredData<Customer[]>('df_customers', INITIAL_CUSTOMERS);
    const storedProducts = getStoredData<Product[]>('df_products', INITIAL_PRODUCTS);
    const storedTransactions = getStoredData<Transaction[]>('df_transactions', INITIAL_TRANSACTIONS);

    setCustomers(storedCustomers);
    setProducts(storedProducts);
    setTransactions(storedTransactions);
  }, []);

  // Sync state to LocalStorage when mutated
  const saveCustomersData = (updated: Customer[]) => {
    setCustomers(updated);
    setStoredData('df_customers', updated);
  };

  const saveTransactionsData = (updated: Transaction[]) => {
    setTransactions(updated);
    setStoredData('df_transactions', updated);
  };

  // Toast dispatch utility
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ACTION: Record a direct sale/purchase entry from Admin Desk
  const handleSavePurchaseEntry = (customerId: string, items: { product: Product; quantity: number }[]) => {
    if (items.length === 0) return;

    // Calculate sum price
    const entryTotal = items.reduce((acc, current) => acc + (current.product.price * current.quantity), 0);

    // 1. Update the Customer outstanding balance
    const updatedCustomers = customers.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          currentDue: Number((c.currentDue + entryTotal).toFixed(2))
        };
      }
      return c;
    });
    saveCustomersData(updatedCustomers);

    // 2. Generate detailed transaction log entry and prepend to history
    const targetCustomerName = customers.find(c => c.id === customerId)?.name || 'Unknown Customer';
    const primaryItemName = items[0].product.name;
    const additionalCount = items.length - 1;
    const desc = additionalCount > 0 
      ? `Purchased ${primaryItemName} + ${additionalCount} items` 
      : `Purchased ${primaryItemName}`;

    const newTx: Transaction = {
      id: `t_${Date.now()}`,
      customerId,
      customerName: targetCustomerName,
      type: 'purchase',
      description: desc,
      amount: Number(entryTotal.toFixed(2)),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      date: 'Today',
      isDelivered: true,
    };

    saveTransactionsData([newTx, ...transactions]);
    setView('dashboard');
    showToast(`Logged ₹${entryTotal.toLocaleString()} entry for ${targetCustomerName}`);
  };

  // ACTION: Record cash payment hand-over from Admin dialog
  const handleReceivePayment = (customerId: string, amount: number) => {
    // 1. Deduct from outstanding balance
    const updatedCustomers = customers.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          currentDue: Math.max(0, Number((c.currentDue - amount).toFixed(2)))
        };
      }
      return c;
    });
    saveCustomersData(updatedCustomers);

    // 2. Clear out log activity entry
    const targetCustomerName = customers.find(c => c.id === customerId)?.name || 'Unknown Customer';
    const newTx: Transaction = {
      id: `t_${Date.now()}`,
      customerId,
      customerName: targetCustomerName,
      type: 'payment_received',
      description: 'Recorded manual cash settling',
      amount: -Number(amount.toFixed(2)),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      date: 'Today',
      isDelivered: false
    };

    saveTransactionsData([newTx, ...transactions]);
    showToast(`Payment of ₹${amount.toLocaleString()} logged for ${targetCustomerName}`);
  };

  // ACTION: Register a completely new customer card
  const handleAddCustomer = (newCustomerDetails: Omit<Customer, 'id' | 'initials'>) => {
    const initials = newCustomerDetails.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'XX';

    const newCust: Customer = {
      ...newCustomerDetails,
      id: `c_${Date.now()}`,
      initials,
    };

    saveCustomersData([...customers, newCust]);
    showToast(`Successfully registered ${newCust.name}`);
  };

  // ACTION: Edit an existing customer account parameters
  const handleEditCustomer = (id: string, updatedFields: Partial<Customer>) => {
    const updated = customers.map(c => {
      if (c.id === id) {
        return { ...c, ...updatedFields };
      }
      return c;
    });
    saveCustomersData(updated);
    showToast(`Updated customer record parameters`);
  };

  // ACTION: Delete customer account ledger safely
  const handleDeleteCustomer = (id: string) => {
    const updated = customers.filter(c => c.id !== id);
    saveCustomersData(updated);
    showToast(`Customer directory book revoked`);
  };

  // ACTIONS: Product Management hooks
  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const nProd: Product = {
      ...newProduct,
      id: `custom_${Date.now()}`
    };
    const updated = [...products, nProd];
    setProducts(updated);
    setStoredData('df_products', updated);
    showToast(`Registered "${newProduct.name}" in dairy stock`);
  };

  const handleUpdateProductPrice = (id: string, nextPrice: number) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return { ...p, price: nextPrice };
      }
      return p;
    });
    setProducts(updated);
    setStoredData('df_products', updated);
    showToast(`Standard price updated to ₹${nextPrice}`);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    setStoredData('df_products', updated);
    showToast(`Removed product item from supply catalog`);
  };

  // ACTION: Simulated customer payment portal triggers
  const handleSimulateCustomerPayment = (amount: number) => {
    const updatedCustomers = customers.map(c => {
      if (c.id === portalCustomerId) {
        return {
          ...c,
          currentDue: Math.max(0, Number((c.currentDue - amount).toFixed(2)))
        };
      }
      return c;
    });
    saveCustomersData(updatedCustomers);

    const targetCustomerName = customers.find(c => c.id === portalCustomerId)?.name || 'Customer';
    const newTx: Transaction = {
      id: `t_${Date.now()}`,
      customerId: portalCustomerId,
      customerName: targetCustomerName,
      type: 'payment_received',
      description: 'Repaid bill via customer portal',
      amount: -Number(amount.toFixed(2)),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      date: 'Today',
      isDelivered: false,
    };

    saveTransactionsData([newTx, ...transactions]);
    showToast(`Cleared ₹${amount.toLocaleString()} outstanding due!`);
  };

  // RENDER SECTIONS BASED ON SELECTED BOTTOM TAB
  const renderAdminTabContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <AdminDashboard
            customers={customers}
            transactions={transactions}
            onNavigateToView={setView}
            onReceivePayment={handleReceivePayment}
          />
        );
      case 'customers':
        return (
          <CustomersView
            customers={customers}
            transactions={transactions}
            onAddCustomer={handleAddCustomer}
            onEditCustomer={handleEditCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onSwitchToPortal={(customerId) => {
              setPortalCustomerId(customerId);
              setRole('customer');
            }}
          />
        );
      case 'new_entry':
        return (
          <NewEntryView
            customers={customers}
            products={products}
            onSave={handleSavePurchaseEntry}
            onBack={() => setView('dashboard')}
          />
        );
      case 'products':
        return (
          <ProductsView
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProductPrice={handleUpdateProductPrice}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case 'billing':
        return (
          <div className="flex flex-col h-full bg-[#F4F4F7] text-slate-900 dark:text-white overflow-hidden">
            <header className="bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between sticky top-0 z-20 shrink-0">
              <span className="font-display font-semibold text-lg text-slate-800">Statement Ledgers</span>
            </header>
            <div className="flex-grow overflow-y-auto p-5 space-y-5 no-scrollbar">
              <div className="bg-rose-50 border border-rose-100/60 rounded-3xl p-5 flex items-start gap-3">
                <Filter className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-rose-800 uppercase tracking-widest">Unsettled accounts due</h4>
                  <p className="text-xs text-rose-700/80 leading-relaxed">
                    Over ₹{customers.filter(c => c.currentDue > 0).reduce((acc, c)=>acc+c.currentDue, 0).toLocaleString()} is aggregate due from pending cards. Review customers tab to print invoices.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.012)] divide-y divide-slate-100 overflow-hidden">
                {customers.map(c => (
                  <div key={c.id} className="p-4.5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                      <span className="text-xs text-gray-400 block mt-0.5">Ref ID: {c.phone}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block mb-1">Dues Ledger</span>
                      <span className={`font-bold ${c.currentDue > 0 ? 'text-rose-605' : 'text-emerald-600'}`}>
                        ₹{c.currentDue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Find dynamic selected Customer for simulation in CustomerPortal
  const activeCustomerRecord = useMemo(() => {
    return customers.find(c => c.id === portalCustomerId) || customers[0] || {
      id: 'c5',
      name: 'John Miller',
      phone: '555-0123',
      initials: 'JM',
      currentDue: 452.80,
    };
  }, [customers, portalCustomerId]);

  const handleLogin = (selectedRole: UserRole, targetCustomerId?: string) => {
    setRole(selectedRole);
    if (selectedRole === 'customer' && targetCustomerId) {
      setPortalCustomerId(targetCustomerId);
    }
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AuthView onLogin={handleLogin} customers={customers} />;
  }

  return (
    <div className="h-screen w-full bg-[#F2F2F7] dark:bg-black font-sans flex justify-center relative">
      <div className="w-full md:max-w-md lg:max-w-lg h-full bg-white dark:bg-[#000000] overflow-hidden flex flex-col relative md:shadow-2xl md:shadow-slate-200 dark:md:shadow-none">
        
        {/* INTERACTIVE ANIMATED APPLET SCREEN CANVAS */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${role}-${view}-${portalCustomerId}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              {role === 'admin' ? (
                renderAdminTabContent()
              ) : (
                <CustomerPortal
                  customer={activeCustomerRecord}
                  transactions={transactions.filter(t => t.customerId === activeCustomerRecord.id)}
                  onSimulateCustomerPayment={handleSimulateCustomerPayment}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* BOTTOM NAVIGATION TABS CONTROLLERS */}
        {view !== 'new_entry' && (
          <nav className="bg-white dark:bg-black border-t border-slate-200/80 dark:border-white/10 shrink-0 z-30 select-none pb-4 pt-2.5 px-3 flex justify-around items-center h-16">
            {role === 'admin' ? (
              // ADMIN INTERFACE NAVIGATION BAR
              <React.Fragment>
                <button
                  id="tab-admin-dashboard"
                  onClick={() => setView('dashboard')}
                  className={`flex flex-col items-center justify-center gap-1 cursor-pointer tap-highlight-transparent transition-all ${
                    view === 'dashboard' ? 'text-[#007AFF] font-bold scale-102' : 'text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  <LayoutDashboard className="w-5.5 h-5.5 stroke-[2]" />
                  <span className="text-[10px] tracking-tight font-medium">Dashboard</span>
                </button>

                <button
                  id="tab-admin-customers"
                  onClick={() => setView('customers')}
                  className={`flex flex-col items-center justify-center gap-1 cursor-pointer tap-highlight-transparent transition-all ${
                    view === 'customers' ? 'text-[#007AFF] font-bold scale-102' : 'text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  <Users className="w-5.5 h-5.5 stroke-[2]" />
                  <span className="text-[10px] tracking-tight font-medium">Customers</span>
                </button>

                <button
                  id="tab-admin-products"
                  onClick={() => setView('products')}
                  className={`flex flex-col items-center justify-center gap-1 cursor-pointer tap-highlight-transparent transition-all ${
                    view === 'products' ? 'text-[#007AFF] font-bold scale-102' : 'text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  <Package className="w-5.5 h-5.5 stroke-[2]" />
                  <span className="text-[10px] tracking-tight font-medium">Catalog</span>
                </button>

                <button
                  id="tab-admin-billing"
                  onClick={() => setView('billing')}
                  className={`flex flex-col items-center justify-center gap-1 cursor-pointer tap-highlight-transparent transition-all ${
                    view === 'billing' ? 'text-[#007AFF] font-bold scale-102' : 'text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  <Receipt className="w-5.5 h-5.5 stroke-[2]" />
                  <span className="text-[10px] tracking-tight font-medium">Statement</span>
                </button>
              </React.Fragment>
            ) : (
              // CUSTOMER PORTAL NAVIGATION BAR
              <React.Fragment>
                <div className="w-full flex justify-around">
                  <button
                    id="tab-customer-portal"
                    className="flex flex-col items-center justify-center gap-1 text-[#007AFF] font-bold scale-102"
                  >
                    <LayoutDashboard className="w-5.5 h-5.5 stroke-[2.2]" />
                    <span className="text-[10px] font-bold tracking-tight">Portal Home</span>
                  </button>

                  <button
                    id="tab-customer-logout"
                    onClick={() => {
                      setIsAuthenticated(false);
                      setPortalCustomerId('');
                    }}
                    className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-[#EBEBF5]/60 hover:text-slate-600"
                  >
                    <LogIn className="w-5.5 h-5.5 stroke-[2]" />
                    <span className="text-[10px] font-medium tracking-tight">Sign Out</span>
                  </button>
                </div>
              </React.Fragment>
            )}
          </nav>
        )}

        {/* DELIGHTFUL GLOBAL FLOATING SPRING TOAST NOTIFICATION CONTAINER */}
        <AnimatePresence>
          {toast && (
            <motion.div
              id="global-toast-notification"
              initial={{ opacity: 0, y: -22, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -15, x: '-50%' }}
              transition={{ type: 'spring', damping: 18, stiffness: 210 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 min-w-[280px] max-w-[90%] bg-slate-900 border border-slate-800 text-white py-3 px-5 rounded-full shadow-lg flex items-center justify-center gap-2.5 z-[100] cursor-pointer"
              onClick={() => setToast(null)}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              ) : (
                <Sparkles className="w-4.5 h-4.5 text-blue-400 shrink-0" />
              )}
              <span className="text-xs font-semibold tracking-tight text-center leading-tight">
                {toast.message}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
