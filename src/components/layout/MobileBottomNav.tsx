'use client';

import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  PiggyBank,
  Receipt,
  Plus,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  onOpenAddTx: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenAddTx }) => {
  const { activeTab, setActiveTab } = useFinance();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transaksi', icon: ArrowLeftRight },
    { id: 'add', label: 'Tambah', icon: Plus, isAction: true },
    { id: 'budgets', label: 'Anggaran', icon: PieChart },
    { id: 'savings', label: 'Tabungan', icon: PiggyBank },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onOpenAddTx}
                className="-mt-5 w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform active:scale-95"
                title="Tambah Transaksi"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px]",
                isActive ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
              <span className="text-[10px] font-medium mt-1 truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
