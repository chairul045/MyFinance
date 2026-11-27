'use client';

import React, { useState, useMemo } from 'react';
import {
  Menu,
  Plus,
  Bell,
  Sun,
  Moon,
  Calendar,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { navigationItems } from './Sidebar';
import { formatRupiah, getMonthNameIndo } from '@/lib/utils';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
  onOpenAddTxModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileSidebar,
  onOpenAddTxModal,
}) => {
  const {
    activeTab,
    theme,
    setTheme,
    currentMonth,
    setCurrentMonth,
    budgetAlerts,
    bills,
    transactions,
    budgets,
  } = useFinance();

  const [showNotifications, setShowNotifications] = useState(false);

  const activeNavItem = navigationItems.find(item => item.id === activeTab);

  // Unpaid bills within next 7 days
  const unpaidBills = bills.filter(b => !b.isPaid);
  const totalNotifications = budgetAlerts.length + unpaidBills.length;

  // Generate dynamic months list containing real current date + neighboring months + any transaction/budget month
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();

    const now = new Date();
    // 6 months past to 6 months future
    for (let i = -6; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      monthsSet.add(`${y}-${m}`);
    }

    // Add any months from transactions
    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        monthsSet.add(t.date.slice(0, 7));
      }
    });

    // Add any months from budgets
    budgets.forEach(b => {
      if (b.month) monthsSet.add(b.month);
    });

    if (currentMonth) {
      monthsSet.add(currentMonth);
    }

    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  }, [transactions, budgets, currentMonth]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 sm:h-20 px-3 sm:px-4 md:px-8 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80">
      {/* Left Title & Mobile Menu Button */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 sm:p-2.5 rounded-xl bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 lg:hidden shrink-0"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl md:text-2xl font-bold text-white tracking-tight truncate">
            {activeNavItem ? activeNavItem.name : 'Dashboard'}
          </h1>
          <p className="text-xs text-slate-400 hidden md:block">
            Pantau dan optimalkan kesehatan finansial Anda
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Dynamic Month Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <select
            value={currentMonth}
            onChange={e => setCurrentMonth(e.target.value)}
            className="bg-transparent border-none outline-none font-medium text-slate-200 cursor-pointer text-xs max-w-[90px] sm:max-w-none"
          >
            {availableMonths.map(m => (
              <option key={m} value={m} className="bg-slate-900 text-white">
                {getMonthNameIndo(m)}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Add Button – desktop only (mobile uses bottom nav) */}
        <button
          onClick={onOpenAddTxModal}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium text-xs md:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Transaksi</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Notifikasi & Peringatan"
          >
            <Bell className="w-5 h-5" />
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-sm font-semibold text-white">
                  Notifikasi & Pengingat ({totalNotifications})
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Tutup
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto mt-2 space-y-2">
                {budgetAlerts.length === 0 && unpaidBills.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Semua anggaran aman & tagihan telah lunas! 🎉
                  </p>
                ) : (
                  <>
                    {budgetAlerts.map((alert, idx) => (
                      <div
                        key={`b-alert-${idx}`}
                        className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <p className="font-semibold text-amber-300">
                            Peringatan Anggaran: {alert.category}
                          </p>
                          <p className="text-slate-300 mt-0.5">
                            Pengeluaran {formatRupiah(alert.spent)} dari batas{' '}
                            {formatRupiah(alert.limit)} ({alert.percent.toFixed(0)}%)
                          </p>
                        </div>
                      </div>
                    ))}

                    {unpaidBills.map(bill => (
                      <div
                        key={`bill-alert-${bill.id}`}
                        className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3"
                      >
                        <Receipt className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <p className="font-semibold text-rose-300">
                            Tagihan Menanti: {bill.name}
                          </p>
                          <p className="text-slate-300 mt-0.5">
                            Nominal {formatRupiah(bill.amount)} - Jatuh tempo: {bill.dueDate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Ganti Tema"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-300" />
          )}
        </button>
      </div>
    </header>
  );
};
