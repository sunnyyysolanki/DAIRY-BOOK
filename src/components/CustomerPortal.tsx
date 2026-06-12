import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, CheckCircle, ArrowRight, Bell, Search, 
  CreditCard, Sparkles, MessageSquare, Ship, Calendar, 
  AlertCircle, ArrowDownLeft, Moon, Sun
} from 'lucide-react';
import { Customer, Transaction, Product } from '../types';
import { useTheme } from '../ThemeContext';

interface CustomerPortalProps {
  customer: Customer;
  transactions: Transaction[];
  onSimulateCustomerPayment: (amount: number) => void;
}

export default function CustomerPortal({ customer, transactions, onSimulateCustomerPayment }: CustomerPortalProps) {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [downloading, setDownloading] = useState(false);
  const [downloadCompleted, setDownloadCompleted] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(customer.currentDue.toString());
  const [paySaved, setPaySaved] = useState(false);

  // Dynamic feedback when downloading bills
  const triggerDownload = () => {
    setDownloading(true);
    setDownloadCompleted(false);
    setTimeout(() => {
      setDownloading(false);
      setDownloadCompleted(true);
      setTimeout(() => setDownloadCompleted(false), 2000);
    }, 1500);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;

    onSimulateCustomerPayment(amt);
    setPaySaved(true);
    
    setTimeout(() => {
      setPaySaved(false);
      setIsPayModalOpen(false);
    }, 1000);
  };

  return (
    <div id="customer-portal-screen" className="flex flex-col h-full bg-[#F2F2F7] dark:bg-black text-slate-900 dark:text-slate-50 overflow-hidden relative">
      {/* HEADER SECTION */}
      <header className="bg-white dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 h-14 flex items-center justify-between sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#3A3A3C] text-[#007AFF] flex items-center justify-center font-bold text-xs ring-1 ring-slate-100 dark:ring-white/10">
            {customer.initials}
          </div>
          <span className="font-display font-semibold text-slate-800 dark:text-slate-100 tracking-tight">DairyFlow Link</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#3A3A3C] text-slate-500 dark:text-slate-300 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button id="cust-notif-btn" className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#3A3A3C] text-slate-500 dark:text-slate-300 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-[#1C1C1E]" />
          </button>
        </div>
      </header>

      {/* PORTAL MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar pb-24">
        
        {/* WELCOME BLOCK */}
        <section className="space-y-1">
          <h2 className="font-display font-bold text-2xl tracking-tight text-slate-900 dark:text-slate-50">Welcome, {customer.name.split(' ')[0]}</h2>
          <p className="text-xs font-semibold text-gray-400">Account ID: DF-{customer.id.toUpperCase()}</p>
        </section>

        {/* OUTSTANDING DUE CARD (Premium Clean Royal Blue with download action) */}
        <section className="bg-[#007AFF] text-white rounded-3xl p-6 shadow-[0_15px_35px_rgba(0,122,255,0.18)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-[#1C1C1E]/5 rounded-full -mr-12 -mt-12 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white dark:bg-[#1C1C1E]/5 rounded-full -ml-8 -mb-8 pointer-events-none" />

          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F4F4F7]/70 block mb-1.5">Total Balance Outstanding</span>
              <div className="font-display font-bold text-3xl tracking-tight leading-none">
                ₹{customer.currentDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="flex justify-between items-end pt-1">
              <div className="text-[11px] text-[#F3F6FC]/80 space-y-0.5">
                <span className="opacity-70 block">Repayment grace period:</span>
                <span className="font-semibold block">Due by Oct 15, 2026</span>
              </div>

              {/* DOWNLOAD BILL BUTTON */}
              <motion.button 
                id="btn-download-bill"
                whileTap={{ scale: 0.95 }}
                onClick={triggerDownload}
                className="bg-white dark:bg-[#1C1C1E] hover:bg-[#F3F6FC] transition-colors text-[#007AFF] font-semibold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm"
              >
                {downloading ? (
                  <div className="flex items-center gap-1">
                    <svg className="animate-spin h-3.5 w-3.5 text-[#007AFF]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Fetching...</span>
                  </div>
                ) : downloadCompleted ? (
                  <span className="text-emerald-700 font-bold">✓ Bill Saved</span>
                ) : (
                  <React.Fragment>
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Download Bill</span>
                  </React.Fragment>
                )}
              </motion.button>
            </div>
          </div>
        </section>

        {/* QUICK OPTION: DIRECT PAY METRIC */}
        {customer.currentDue > 0 && (
          <motion.button
            id="btn-customer-self-pay"
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setPayAmount(customer.currentDue.toString());
              setIsPayModalOpen(true);
            }}
            className="w-full bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#38383A] text-[#007AFF] font-semibold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:bg-[#F9F9FB] dark:bg-[#2C2C2E]"
          >
            <CreditCard className="w-4 h-4" />
            <span>Simulate Bill Repayment</span>
          </motion.button>
        )}

        {/* TODAY'S DELIVERY CARD */}
        <section className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#38383A] rounded-3xl p-5 shadow-none space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#38383A] pb-3">
            <h3 className="font-display font-bold text-slate-900 dark:text-slate-50 text-sm uppercase tracking-widest opacity-40">Today's Dispatch</h3>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100/50 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>DELIVERED</span>
            </span>
          </div>

          <div className="space-y-3">
            {/* Hardcoded mock items for John Miller matching portal */}
            <div className="flex items-center justify-between text-xs p-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#F3F6FC] border border-slate-200 dark:border-[#38383A] text-blue-600 rounded-xl flex items-center justify-center font-bold text-base">
                  💧
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-50 block">Whole Milk</span>
                  <span className="text-gray-400 block mt-0.5">2 Gallons • ₹66/L</span>
                </div>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-50 shrink-0">₹452.80</span>
            </div>

            <div className="flex items-center justify-between text-xs p-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-50/55 border border-amber-100/50 text-amber-600 rounded-xl flex items-center justify-center font-bold text-base">
                  🍳
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-50 block">Farm Eggs</span>
                  <span className="text-gray-400 block mt-0.5">1 Dozen • Fresh Organic</span>
                </div>
              </div>
              <span className="font-bold text-slate-500 dark:text-[#EBEBF5]/60 shrink-0">Included</span>
            </div>
          </div>
        </section>

        {/* HISTORIC TRANSCRIPT (Past Deliveries & Statements) */}
        <section className="space-y-3">
          <h3 className="font-display font-bold text-sm uppercase tracking-widest text-slate-900 dark:text-slate-50 opacity-40">Log Breakdown</h3>
          <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#38383A] rounded-3xl shadow-none divide-y divide-slate-100 dark:divide-[#38383A]/50 overflow-hidden">
            
            {/* Delivery 1 */}
            <div className="p-4 flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#F3F6FC] border border-slate-200 dark:border-[#38383A] text-slate-500 dark:text-[#EBEBF5]/60 rounded-full flex items-center justify-center">
                  🚚
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-50 block">System Dispatch Delivery</span>
                  <span className="text-gray-450 block mt-0.5">Oct 10 • Milk & Eggs Bundle</span>
                </div>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-50 shrink-0">₹452.80</span>
            </div>

            {/* Delivery 2 */}
            <div className="p-4 flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#F3F6FC] border border-slate-200 dark:border-[#38383A] text-slate-500 dark:text-[#EBEBF5]/60 rounded-full flex items-center justify-center">
                  🚚
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-50 block">System Dispatch Delivery</span>
                  <span className="text-gray-450 block mt-0.5">Oct 08 • Whole Milk</span>
                </div>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-50 shrink-0">₹150.00</span>
            </div>

            {/* Payment Received */}
            <div className="p-4 flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-50 border border-emerald-100/50 text-emerald-600 rounded-full flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-50 block">Payment Settled - Thank you</span>
                  <span className="text-gray-450 block mt-0.5">Oct 01 • Clean clearance</span>
                </div>
              </div>
              <span className="font-bold text-emerald-600 shrink-0">-₹120.00</span>
            </div>

          </div>
        </section>

      </div>

      {/* PAY DUE MODAL SPEC FOR JOHN */}
      <AnimatePresence>
        {isPayModalOpen && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white dark:bg-[#1C1C1E] w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="px-4 py-3.5 border-b border-slate-200 dark:border-[#38383A] flex justify-between items-center bg-[#F9F9FB] dark:bg-[#2C2C2E]">
                <span className="font-display font-bold text-slate-850">Clear Outstanding Bill</span>
                <button 
                  id="close-pay-modal-btn"
                  onClick={() => setIsPayModalOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-200 dark:bg-[#48484A]"
                >
                  <AlertCircle className="w-5 h-5 text-slate-550" />
                </button>
              </div>

              {paySaved ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <h4 className="font-display font-medium text-white">Settled Account Outstanding</h4>
                  <p className="text-xs text-slate-500 dark:text-[#EBEBF5]/60">Your mock transaction ledger has cleared. Thank you!</p>
                </div>
              ) : (
                <form onSubmit={handlePaySubmit} className="p-4 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-[#EBEBF5]/60 uppercase">Payment Amount (₹)</label>
                    <input
                      id="customer-pay-amount"
                      required
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full bg-[#F9F9FB] dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#38383A] rounded-xl px-4 py-3 text-sm focus:bg-white dark:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="0.00"
                      type="number"
                      max={customer.currentDue}
                    />
                    <span className="text-[10px] text-slate-500 dark:text-[#EBEBF5]/60 block mt-1">Outstanding Due is max ₹{customer.currentDue.toLocaleString()}</span>
                  </div>

                  <motion.button
                    id="btn-confirm-cust-payment"
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-blue-600 text-white font-display font-semibold py-3.5 rounded-xl shadow-md hover:bg-blue-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Simulate Payment Transfer</span>
                  </motion.button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
