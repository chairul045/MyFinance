'use client';

import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  PiggyBank,
  Receipt,
  FileBarChart,
  Settings,
  WalletCards,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { cn } from '@/lib/utils';

export const navigationItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', name: 'Transaksi', icon: ArrowLeftRight },
  { id: 'budgets', name: 'Anggaran Bulanan', icon: PieChart },
  { id: 'savings', name: 'Tabungan', icon: PiggyBank },
  { id: 'bills', name: 'Pengingat Tagihan', icon: Receipt },
  { id: 'reports', name: 'Laporan Keuangan', icon: FileBarChart },
  { id: 'settings', name: 'Pengaturan', icon: Settings },
];

interface SidebarProps {
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, setIsOpenMobile }) => {
  const { activeTab, setActiveTab, setIsLoggedIn, user } = useFinance();

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900/95 border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 backdrop-blur-xl",
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
            <WalletCards className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">MyFinance</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400">Personal Management</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Navigasi
          </div>
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-300"
                  )}
                />
                <span className="flex-1 text-left">{item.name}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}

          {/* Quick Tip / 21st Card */}
          <div className="mt-8 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Smart Financial Tips</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Alokasikan 20% untuk tabungan di awal bulan sebelum pengeluaran lain.
            </p>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsLoggedIn(false)}
              title="Keluar ke Landing Page"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
