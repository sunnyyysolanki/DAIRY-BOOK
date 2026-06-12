import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Plus, Phone, Mail, MapPin, X, ArrowLeft, Trash2, 
  Edit3, Check, FileText, Printer, Sparkles, Clock, 
  CreditCard, Coins, Calendar, ChevronRight, Moon, Sun
} from 'lucide-react';
import { Customer, Transaction } from '../types';
import { useTheme } from '../ThemeContext';

interface CustomersViewProps {
  customers: Customer[];
  transactions: Transaction[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'initials'>) => void;
  onEditCustomer: (id: string, updated: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
  onSelectCustomer?: (customer: Customer) => void;
  onSwitchToPortal?: (customerId: string) => void;
}

type FilterType = 'all' | 'pending' | 'paid';
type ProfileTabType = 'ledger' | 'monthly_statement';

export default function CustomersView({ 
  customers, 
  transactions,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onSelectCustomer,
  onSwitchToPortal
}: CustomersViewProps) {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  // Modals / Profile states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeProfileCustomer, setActiveProfileCustomer] = useState<Customer | null>(null);
  const [profileTab, setProfileTab] = useState<ProfileTabType>('ledger');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Invoice slip popup
  const [activeInvoiceCustomer, setActiveInvoiceCustomer] = useState<Customer | null>(null);
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);

  // Add Customer Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [initialDue, setInitialDue] = useState('0');

  // Edit Customer Form states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Delete Confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Filter & search logic
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery);

      if (!matchesSearch) return false;

      if (activeFilter === 'pending') {
        return customer.currentDue > 0;
      } else if (activeFilter === 'paid') {
        return customer.currentDue === 0;
      }
      return true;
    });
  }, [customers, searchQuery, activeFilter]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onAddCustomer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      currentDue: parseFloat(initialDue) || 0,
    });

    // Reset Form
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setInitialDue('0');
    setIsAddModalOpen(false);
  };

  const handleOpenProfile = (customer: Customer) => {
    setActiveProfileCustomer(customer);
    setProfileTab('ledger');
    setIsEditingProfile(false);
    setShowDeleteConfirm(false);
    
    // Seed initial edit states
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditEmail(customer.email || '');
    setEditAddress(customer.address || '');
  };

  const handleSaveProfileEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfileCustomer || !editName.trim() || !editPhone.trim()) return;

    onEditCustomer(activeProfileCustomer.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim() || undefined,
      address: editAddress.trim() || undefined,
    });

    // Update active visual model safely
    setActiveProfileCustomer(prev => prev ? {
      ...prev,
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim() || undefined,
      address: editAddress.trim() || undefined,
    } : null);

    setIsEditingProfile(false);
  };

  const handleDeleteTrigger = () => {
    if (!activeProfileCustomer) return;
    onDeleteCustomer(activeProfileCustomer.id);
    setActiveProfileCustomer(null);
    setShowDeleteConfirm(false);
  };

  // Find all activities for the selected customer
  const customerLedgerTransactions = useMemo(() => {
    if (!activeProfileCustomer) return [];
    return transactions.filter(t => t.customerId === activeProfileCustomer.id);
  }, [transactions, activeProfileCustomer]);

  // Compute stats for billing statement
  const billMetrics = useMemo(() => {
    if (!activeProfileCustomer) return { totalCharged: 0, totalPaid: 0 };
    
    const charged = customerLedgerTransactions
      .filter(t => t.type !== 'payment_received')
      .reduce((acc, t) => acc + t.amount, 0);

    const paid = customerLedgerTransactions
      .filter(t => t.type === 'payment_received')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    return {
      totalCharged: charged,
      totalPaid: paid
    };
  }, [customerLedgerTransactions, activeProfileCustomer]);

  return (
    <div id="customers-screen" className="flex flex-col h-full bg-[#F2F2F7] dark:bg-black text-slate-900 dark:text-slate-50 overflow-hidden relative">
      {/* HEADER BAR */}
      <header className="bg-white dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 sticky top-0 px-4 h-14 flex items-center justify-between z-20 shrink-0">
        <span className="font-display font-semibold text-lg text-slate-800 dark:text-slate-100">Dairy Directory</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:bg-[#3A3A3C] text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            id="add-customer-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:bg-[#3A3A3C] text-[#007AFF] transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* SEARCH AND FILTERS */}
      <div className="p-4 bg-[#F2F2F7] dark:bg-black border-b border-slate-200 dark:border-white/10 space-y-3.5 shrink-0">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-[#EBEBF5]/60 w-4.5 h-4.5" />
          <input 
            id="customer-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-xs focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all shadow-sm placeholder:text-slate-500 dark:text-[#EBEBF5]/60"
            placeholder="Search customer full name or 10-digit mobile..." 
            type="text"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'pending', 'paid'] as const).map((filter) => (
            <button
              key={filter}
              id={`customer-filter-${filter}`}
              onClick={() => setActiveFilter(filter)}
              className={`relative px-4 py-1.5 rounded-full text-[11px] font-semibold capitalize transition-all select-none ${
                activeFilter === filter 
                  ? 'bg-slate-900 text-white shadow-sm shadow-slate-950/15' 
                  : 'bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#38383A] text-slate-500 dark:text-[#EBEBF5]/60 hover:bg-[#F9F9FB] dark:bg-[#2C2C2E]'
              }`}
            >
              {filter === 'all' ? 'All Ledger' : filter === 'pending' ? 'Outstanding Dues' : 'Cleared Balance'}
            </button>
          ))}
        </div>
      </div>

      {/* DIRECTORY LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar pb-24">
        <AnimatePresence mode="popLayout">
          {filteredCustomers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 space-y-3 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200 dark:border-[#38383A] p-6"
            >
              <div className="text-4xl text-slate-700 dark:text-slate-300">👥</div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Customers Found</h4>
              <p className="text-xs text-slate-500 dark:text-[#EBEBF5]/60 max-w-xs mx-auto">Click the "+" icon above to register a new customer in your dairy book ledger.</p>
            </motion.div>
          ) : (
            filteredCustomers.map((customer, index) => {
              const hasDue = customer.currentDue > 0;
              return (
                <motion.div
                  key={customer.id}
                  id={`customer-card-${customer.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index * 0.04, 0.2) } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenProfile(customer)}
                  className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#38383A] rounded-3xl p-5 shadow-none flex items-center justify-between group cursor-pointer hover:border-slate-200 dark:border-[#38383A] hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#F3F6FC] border border-slate-200 dark:border-[#38383A] text-[#007AFF] font-display font-semibold text-sm flex items-center justify-center shrink-0">
                      {customer.initials || customer.name.split(' ').map(n=>n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-slate-900 dark:text-slate-50 text-sm leading-tight flex items-center gap-1.5">
                        {customer.name}
                        {customer.status === 'inactive' && (
                          <span className="text-[9px] bg-slate-100 dark:bg-[#3A3A3C] text-slate-500 dark:text-[#EBEBF5]/60 px-1 py-0.5 rounded">Stopped</span>
                        )}
                      </h4>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                        <Phone className="w-3 h-3 text-slate-500 dark:text-[#EBEBF5]/60" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end pl-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Current Due</span>
                    <div className={`px-3.5 py-1.5 rounded-2xl text-[11px] font-bold shrink-0 flex items-center gap-1 ${
                      hasDue 
                        ? 'bg-rose-50 text-rose-700 border border-rose-100/50' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'
                    }`}>
                      <span>₹{customer.currentDue.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-55" />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* ADD CUSTOMER MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 210 }}
              className="bg-white dark:bg-[#1C1C1E] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden pointer-events-auto"
            >
              <div className="px-5 py-4 border-b border-slate-200 dark:border-[#38383A] flex justify-between items-center bg-[#F9F9FB] dark:bg-[#2C2C2E]">
                <span className="font-display font-bold text-slate-800 dark:text-slate-100">Add Customer</span>
                <button 
                  id="close-add-modal-btn"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200 dark:bg-[#48484A] transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-[#EBEBF5]/60" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-[#EBEBF5]/60 uppercase">Customer Name</label>
                  <input
                    id="new-customer-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-xl px-4 py-3 text-xs focus:bg-white dark:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-[#EBEBF5]/60 uppercase">10-Digit Mobile Number</label>
                  <input
                    id="new-customer-phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-xl px-4 py-3 text-xs focus:bg-white dark:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="e.g. 9876543210"
                    type="tel"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-[#EBEBF5]/60 uppercase">Email (Optional)</label>
                    <input
                      id="new-customer-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-xl px-3 py-2.5 text-xs focus:bg-white dark:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="e.g. rahul@me.com"
                      type="email"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-[#EBEBF5]/60 uppercase">Starting Due (₹)</label>
                    <input
                      id="new-customer-due"
                      value={initialDue}
                      onChange={(e) => setInitialDue(e.target.value)}
                      className="w-full bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-xl px-3 py-2.5 text-xs focus:bg-white dark:bg-[#1C1C1E] focus:outline-none"
                      placeholder="0.00"
                      type="number"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-[#EBEBF5]/60 uppercase">Physical Address</label>
                  <input
                    id="new-customer-addr"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-xl px-4 py-2.5 text-xs focus:bg-white dark:bg-[#1C1C1E] focus:outline-none"
                    placeholder="e.g. House 42, Block B, Sector 2"
                  />
                </div>

                <motion.button
                  id="btn-create-customer"
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-[#007AFF] text-white font-display font-semibold py-3.5 rounded-2xl shadow-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Register Customer Account</span>
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOMER CUSTOM PROFILE DRAWER MODAL */}
      <AnimatePresence>
        {activeProfileCustomer && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-40">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-[#F8F9FC] w-full sm:max-w-lg h-[92%] sm:h-[80%] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Profile Header */}
              <div className="bg-white dark:bg-[#1C1C1E] px-5 py-4.5 border-b border-slate-200 dark:border-[#38383A] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 text-[#007AFF] flex items-center justify-center font-bold text-base">
                    {activeProfileCustomer.initials || activeProfileCustomer.name.split(' ').map(n=>n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-900 dark:text-slate-50 text-base leading-tight">
                      {activeProfileCustomer.name}
                    </h3>
                    <span className="text-[10px] text-slate-500 dark:text-[#EBEBF5]/60 font-bold uppercase tracking-wider block mt-1">
                      ID: DF-CUST-{activeProfileCustomer.id.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Switch link button for customer simulation */}
                <div className="flex items-center gap-2">
                  <button
                    id="btn-switch-to-portal-draw"
                    onClick={() => {
                      if (onSwitchToPortal) {
                        onSwitchToPortal(activeProfileCustomer.id);
                        setActiveProfileCustomer(null);
                      }
                    }}
                    className="bg-blue-50 hover:bg-blue-100 text-[#007AFF] font-bold text-[10px] px-2.5 py-1.5 rounded-lg border border-blue-100 select-none cursor-pointer"
                  >
                    Launch Link
                  </button>
                  <button 
                    id="close-profile-btn"
                    onClick={() => {
                      setActiveProfileCustomer(null);
                      setIsEditingProfile(false);
                      setShowDeleteConfirm(false);
                    }}
                    className="p-1 rounded-full hover:bg-slate-100 dark:bg-[#3A3A3C]"
                  >
                    <X className="w-5 h-5 text-slate-500 dark:text-[#EBEBF5]/60" />
                  </button>
                </div>
              </div>

              {/* TAB SELECTIONS */}
              {!isEditingProfile && (
                <div className="bg-white dark:bg-[#1C1C1E] px-4 py-1 border-b border-slate-200 dark:border-[#38383A] flex shrink-0">
                  <button
                    id="profile-tab-ledger"
                    onClick={() => setProfileTab('ledger')}
                    className={`px-4 py-3 text-xs font-bold relative ${profileTab === 'ledger' ? 'text-[#007AFF]' : 'text-slate-500 dark:text-[#EBEBF5]/60'}`}
                  >
                    Ledger Account
                    {profileTab === 'ledger' && <motion.div layoutId="profileActiveTabLine" className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#007AFF]" />}
                  </button>
                  <button
                    id="profile-tab-statement"
                    onClick={() => setProfileTab('monthly_statement')}
                    className={`px-4 py-3 text-xs font-bold relative ${profileTab === 'monthly_statement' ? 'text-[#007AFF]' : 'text-slate-500 dark:text-[#EBEBF5]/60'}`}
                  >
                    Statement & Billing
                    {profileTab === 'monthly_statement' && <motion.div layoutId="profileActiveTabLine" className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#007AFF]" />}
                  </button>
                </div>
              )}

              {/* MAIN CONTENT AREA */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                
                {isEditingProfile ? (
                  // EDIT CUSTOMER FORM OVERLAY
                  <form onSubmit={handleSaveProfileEdit} className="bg-white dark:bg-[#1C1C1E] outline outline-slate-100 rounded-3xl p-5 space-y-4">
                    <h4 className="font-display font-bold text-sm text-slate-705">Modify Account Particulars</h4>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-450 block">Name</label>
                      <input
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-450 block">Contact Phone</label>
                      <input
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-450 block">Email Address</label>
                      <input
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100"
                        placeholder=" rahul@gmail.com"
                        type="email"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-450 block">Property address/Route</label>
                      <input
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100"
                        placeholder="Lane 3, B Block"
                      />
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 bg-slate-100 dark:bg-[#3A3A3C] hover:bg-slate-200 dark:bg-[#48484A] text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 rounded-xl transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  // STANDARD TAB SCREENS
                  <React.Fragment>
                    {/* Outstanding Due balance widget */}
                    <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#38383A] rounded-3xl p-5 shadow-none flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider block mb-1">Unbilled Balance</span>
                        <h4 className="font-display font-extrabold text-2xl text-slate-800 dark:text-slate-100">
                          ₹{activeProfileCustomer.currentDue.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                        </h4>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <button
                          id="btn-edit-profile-trigger"
                          onClick={() => setIsEditingProfile(true)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50/75 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-xl transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Info</span>
                        </button>
                      </div>
                    </div>

                    {profileTab === 'ledger' ? (
                      // SUB-TAB 1: LEDGER LIST
                      <div className="space-y-2.5">
                        <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-[#EBEBF5]/60">Account Activity Log</h4>
                        
                        {customerLedgerTransactions.length === 0 ? (
                          <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#38383A] rounded-3xl p-6 text-center text-xs text-slate-500 dark:text-[#EBEBF5]/60">
                            No ledger actions has been registered for this customer. Any purchases or payments will show up here.
                          </div>
                        ) : (
                          <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#38383A] rounded-3xl p-1 divide-y divide-slate-100 dark:divide-[#38383A] overflow-hidden">
                            {customerLedgerTransactions.map((tx, idx) => {
                              const isPayment = tx.type === 'payment_received';
                              return (
                                <div key={tx.id || idx} className="p-3.5 flex justify-between items-center text-xs hover:bg-[#F8F9FC] transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                      isPayment ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                      {isPayment ? '₹' : '🥛'}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-slate-850 block">{tx.description}</span>
                                      <span className="text-[10px] text-slate-500 dark:text-[#EBEBF5]/60 block mt-0.5">{tx.time || 'Today'}</span>
                                    </div>
                                  </div>
                                  <span className={`font-display font-semibold ${isPayment ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-100'}`}>
                                    {isPayment ? `-₹${Math.abs(tx.amount)}` : `+₹${tx.amount}`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      // SUB-TAB 2: MONTHLY STATEMENT GENERATOR
                      <div className="space-y-4">
                        <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#38383A] rounded-3xl p-5 space-y-4 shadow-sm">
                          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-[#EBEBF5]/60">Billing Statement Summary</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#F9F9FB] dark:bg-[#2C2C2E] p-3.5 rounded-2xl border border-slate-200 dark:border-[#38383A]">
                              <span className="text-[9px] font-bold text-slate-500 dark:text-[#EBEBF5]/60 uppercase tracking-widest block mb-1">Total Purchases</span>
                              <span className="font-display font-bold text-base text-slate-800 dark:text-slate-100">₹{billMetrics.totalCharged.toLocaleString()}</span>
                            </div>
                            <div className="bg-[#F9F9FB] dark:bg-[#2C2C2E] p-3.5 rounded-2xl border border-slate-200 dark:border-[#38383A]">
                              <span className="text-[9px] font-bold text-slate-500 dark:text-[#EBEBF5]/60 uppercase tracking-widest block mb-1">Payments Settled</span>
                              <span className="font-display font-bold text-base text-emerald-600">₹{billMetrics.totalPaid.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="bg-blue-50/50 outline outline-blue-150 p-4 rounded-2xl text-[11px] leading-relaxed text-slate-500 dark:text-[#EBEBF5]/60">
                            Automatic invoicing calculates total daily milk deliveries, premium ghee orders, and cattle feed hand-overs minus all checks & cash clearances.
                          </div>

                          <button
                            id="btn-trigger-statement-slip"
                            onClick={() => {
                              setActiveInvoiceCustomer(activeProfileCustomer);
                            }}
                            className="w-full bg-slate-900 text-white font-display font-semibold py-3.5 rounded-2xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm text-xs"
                          >
                            <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                            <span>Generate Professional Invoice Slip</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CONTACT METADATA CARDS */}
                    <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#38383A] rounded-3xl p-5 space-y-3">
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-[#EBEBF5]/60">Contact Specifics</h4>
                      <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-[#38383A] text-xs">
                        <div className="py-2.5 flex items-center gap-2.5">
                          <Phone className="w-4 h-4 text-slate-500 dark:text-[#EBEBF5]/60 shrink-0" />
                          <span className="text-slate-800 dark:text-slate-100">{activeProfileCustomer.phone}</span>
                        </div>
                        <div className="py-2.5 flex items-center gap-2.5">
                          <Mail className="w-4 h-4 text-slate-500 dark:text-[#EBEBF5]/60 shrink-0" />
                          <span className="text-slate-800 dark:text-slate-100">{activeProfileCustomer.email || 'No email attached'}</span>
                        </div>
                        <div className="py-2.5 flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-slate-500 dark:text-[#EBEBF5]/60 shrink-0" />
                          <span className="text-slate-800 dark:text-slate-100">{activeProfileCustomer.address || 'No location address registered'}</span>
                        </div>
                      </div>
                    </div>

                    {/* DELETE DANGER ZONE CONTROL */}
                    <div className="bg-rose-50/50 outline outline-rose-100 rounded-3xl p-5 space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 block">Danger Zone Action</span>
                      {showDeleteConfirm ? (
                        <div className="space-y-2">
                          <p className="text-xs text-rose-700 leading-relaxed font-medium">
                            Warning: Deleting Rahul's account will wipe out all transaction statements, pending dues, and ledger history forever. This is irreversible.
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setShowDeleteConfirm(false)}
                              className="flex-1 bg-white dark:bg-[#1C1C1E] border border-slate-205 text-slate-500 dark:text-[#EBEBF5]/60 font-bold text-xs py-2 rounded-xl"
                            >
                              No, Cancel
                            </button>
                            <button
                              id="btn-confirm-delete-cust"
                              type="button"
                              onClick={handleDeleteTrigger}
                              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 rounded-xl"
                            >
                              Yes, Delete Ledger
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-semibold text-xs text-white">Revoke Customer Account</h5>
                            <p className="text-[10px] text-slate-450 mt-0.5">Wipe data out of memory safely</p>
                          </div>
                          <button
                            id="btn-delete-account-trigger"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="bg-white dark:bg-[#1C1C1E] border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs px-3.5 py-2 rounded-xl"
                          >
                            Delete Book
                          </button>
                        </div>
                      )}
                    </div>

                  </React.Fragment>
                )}

              </div>
              
              {/* Bottom footer bar */}
              <div className="bg-white dark:bg-[#1C1C1E] border-t border-slate-200 dark:border-[#38383A] p-4 text-center shrink-0">
                <span className="text-[10px] text-slate-500 dark:text-[#EBEBF5]/60 font-medium font-mono uppercase">Ledger Synchronized with Storage</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROFESSIONAL PRINTABLE INVOICE SLIP (PDF GENERATION VIEW) */}
      <AnimatePresence>
        {activeInvoiceCustomer && (
          <div className="absolute inset-0 bg-slate-905/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1C1C1E] w-full max-w-sm rounded-3xl shadow-2xl p-6 border-4 border-double border-slate-200 dark:border-[#38383A] relative text-slate-900 dark:text-slate-50 font-sans"
            >
              {/* Decorative retro scissors clip */}
              <div className="border-t border-dashed border-slate-300 dark:border-[#48484A] my-2 pt-2" />

              {/* Invoice Logo Headers */}
              <div className="text-center space-y-1">
                <h2 className="font-display font-black text-xl tracking-tight text-white">🥛 DAIRYFLOW LTD.</h2>
                <p className="text-[10px] font-mono font-bold text-slate-450 uppercase">COOP DAIRY notebook INVOICE</p>
                <p className="text-[9px] text-slate-500 dark:text-[#EBEBF5]/60">Statement Reference ID: #DF-INV-{Math.floor(1000 + Math.random() * 9000)}-2026</p>
              </div>

              <div className="border-b border-slate-150 my-3.5 pb-2 text-xs space-y-1 text-slate-750">
                <div className="flex justify-between">
                  <span className="font-mono text-slate-500 dark:text-[#EBEBF5]/60">Date Issued:</span>
                  <span className="font-semibold">June 15, 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-slate-500 dark:text-[#EBEBF5]/60">Target Client:</span>
                  <span className="font-bold text-white">{activeInvoiceCustomer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-slate-500 dark:text-[#EBEBF5]/60">Client Contact:</span>
                  <span className="font-semibold">{activeInvoiceCustomer.phone}</span>
                </div>
                {activeInvoiceCustomer.address && (
                  <div className="flex justify-between">
                    <span className="font-mono text-slate-500 dark:text-[#EBEBF5]/60">Delivery Route:</span>
                    <span className="font-semibold">{activeInvoiceCustomer.address}</span>
                  </div>
                )}
              </div>

              {/* Itemized list of bills */}
              <div className="space-y-2.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-[#EBEBF5]/60 tracking-wider block">Delivered Ledger Items</span>
                <div className="divide-y divide-slate-100 dark:divide-[#38383A]">
                  
                  {/* Real or Simulated rows */}
                  <div className="py-2 flex justify-between text-slate-800 dark:text-slate-100">
                    <span>Base Cow Milk Supply (Liquid/L)</span>
                    <span className="font-mono font-bold">₹{billMetrics.totalCharged.toLocaleString()}</span>
                  </div>
                  <div className="py-2 flex justify-between text-emerald-700">
                    <span>Outstanding Payments Deducted</span>
                    <span className="font-mono font-bold">-₹{billMetrics.totalPaid.toLocaleString()}</span>
                  </div>
                </div>

                {/* Aggregated Total Cash ledger panel */}
                <div className="bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-2xl p-4 mt-2 outline outline-slate-150 relative">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-[#EBEBF5]/60 tracking-wider block">NET OUTSTANDING DUE</span>
                      <span className="text-slate-450 text-[9px] leading-tight block">Required balance immediate settlement</span>
                    </div>
                    <span className="font-display font-black text-xl text-rose-600">
                      ₹{activeInvoiceCustomer.currentDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2.5">
                {invoiceSuccess ? (
                  <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3 rounded-2xl text-center border border-emerald-100">
                    ✓ Invoice Slip Sent to Printer (PDF Ready)
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      id="btn-print-bill-slip-trigger"
                      onClick={() => {
                        setInvoiceSuccess(true);
                        setTimeout(() => {
                          setInvoiceSuccess(false);
                          setActiveInvoiceCustomer(null);
                        }, 2200);
                      }}
                      className="flex-1 bg-slate-900 border border-slate-900 hover:bg-slate-850 text-white font-semibold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Printer className="w-4 h-4 text-white" />
                      <span>Print Slip</span>
                    </button>
                    <button
                      id="btn-close-bill-slip"
                      onClick={() => setActiveInvoiceCustomer(null)}
                      className="bg-slate-100 dark:bg-[#3A3A3C] border border-slate-200 dark:border-[#38383A] hover:bg-slate-200 dark:bg-[#48484A] text-slate-700 dark:text-slate-300 font-semibold text-xs px-4 rounded-2xl cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
                
                <p className="text-[9px] text-center text-slate-500 dark:text-[#EBEBF5]/60 font-mono mt-2 leading-relaxed uppercase tracking-wider">
                  Receipt invoice generated automatically via DairyFlow SaaS MVP engine. Approved by cooperative dairy board.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
