import React from 'react';
import { motion } from 'motion/react';
import { Store, LogIn, HardHat, Phone, Moon, Sun } from 'lucide-react';
import { Customer, UserRole } from '../types';
import { useTheme } from '../ThemeContext';

interface AuthViewProps {
  onLogin: (role: UserRole, customerId?: string) => void;
  customers: Customer[];
}

export default function AuthView({ onLogin, customers }: AuthViewProps) {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [mode, setMode] = React.useState<'select' | 'customer'>('select');
  const [selectedCustomerId, setSelectedCustomerId] = React.useState('');

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomerId) {
      onLogin('customer', selectedCustomerId);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] flex items-center justify-center p-4 relative">
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#1C1C1E] shadow-sm text-slate-600 dark:text-slate-300 transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1C1C1E] max-w-sm w-full rounded-3xl p-8 shadow-none border border-slate-200 dark:border-[#38383A] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-black text-2xl text-white tracking-tight">DairyFlow</h1>
          <p className="text-slate-500 dark:text-[#EBEBF5]/60 text-xs font-medium mt-1 uppercase tracking-widest">Workspace Portal</p>
        </div>

        {mode === 'select' ? (
          <div className="space-y-3 relative z-10">
            <button 
              onClick={() => onLogin('admin')} 
              className="w-full bg-[#007AFF] text-white font-semibold py-4 rounded-xl hover:bg-blue-600 transition-all flex justify-center items-center gap-2 shadow-sm"
            >
              <HardHat className="w-5 h-5"/> 
              <span className="font-display">Dairy Owner Login</span>
            </button>
            
            <div className="relative py-3 flex items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-[#38383A]"></div>
              <span className="flex-shrink-0 mx-4 text-slate-500 dark:text-[#EBEBF5]/60 text-[10px] font-bold uppercase tracking-wider">or sign in as</span>
              <div className="flex-grow border-t border-slate-200 dark:border-[#38383A]"></div>
            </div>
            
            <button 
              onClick={() => setMode('customer')} 
              className="w-full bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] text-slate-700 dark:text-slate-300 font-semibold py-4 rounded-xl hover:bg-slate-100 dark:bg-[#3A3A3C] transition-all flex justify-center items-center gap-2"
            >
              <LogIn className="w-5 h-5 text-slate-500 dark:text-[#EBEBF5]/60"/> 
              <span className="font-display">Customer Ledger</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomerLogin} className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-[#EBEBF5]/60 uppercase tracking-wider block">Simulate Customer Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-[#EBEBF5]/60" />
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-xl py-3.5 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none font-medium"
                >
                  <option value="" disabled>Select your account...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={!selectedCustomerId}
              className="w-full bg-slate-900 text-white font-display font-semibold py-4 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Access Portal
            </button>

            <button 
              type="button"
              onClick={() => setMode('select')}
              className="w-full text-[11px] font-bold text-slate-500 dark:text-[#EBEBF5]/60 hover:text-slate-500 dark:text-[#EBEBF5]/60 uppercase tracking-widest pt-2"
            >
              ← Back to roles
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
