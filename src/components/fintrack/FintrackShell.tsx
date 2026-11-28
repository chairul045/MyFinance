'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  PieChart,
  PiggyBank,
  Receipt,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Sun,
  Moon,
  Wallet,
} from 'lucide-react';
import { logoutAction } from '@/actions/auth';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types/fintrack';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { href: '/accounts', label: 'Rekening', icon: Landmark },
  { href: '/budgets', label: 'Anggaran', icon: PieChart },
  { href: '/savings', label: 'Tabungan', icon: PiggyBank },
  { href: '/bills', label: 'Tagihan', icon: Receipt },
  { href: '/reports', label: 'Laporan', icon: BarChart3 },
  { href: '/notifications', label: 'Notifikasi', icon: Bell },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
];

const MOBILE_DOCK_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { href: '/transactions/new', label: 'Tambah', icon: Plus, isAction: true },
  { href: '/budgets', label: 'Anggaran', icon: PieChart },
  { href: '/accounts', label: 'Rekening', icon: Landmark },
];

export function FintrackShell({
  profile,
  unreadNotifications,
  children,
}: {
  profile: Profile;
  unreadNotifications: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(profile.theme || 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const activeNav = NAV_ITEMS.find((item) => pathname.startsWith(item.href));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30">
        <div className="h-16 px-6 flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight">Fintrack</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Personal Finance</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </span>
                {item.href === '/notifications' && unreadNotifications > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-600 text-white">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="px-2 space-y-1">
            <div className="flex items-center justify-between gap-1.5">
              <p className="text-xs font-semibold truncate">{profile.full_name || 'Pengguna'}</p>
              {profile.is_admin && (
                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  👑 ADMIN
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{profile.email}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full flex flex-col border-r border-slate-200 dark:border-slate-800 z-10">
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-base font-extrabold">Fintrack</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium',
                      active
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </span>
                    {item.href === '/notifications' && unreadNotifications > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-600 text-white">
                        {unreadNotifications}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="px-2 space-y-1">
                <div className="flex items-center justify-between gap-1.5">
                  <p className="text-xs font-semibold truncate">{profile.full_name || 'Pengguna'}</p>
                  {profile.is_admin && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      👑 ADMIN
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{profile.email}</p>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <header className="sticky top-0 z-20 h-16 px-4 sm:px-6 lg:px-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-xl font-bold truncate">
              {activeNav?.label || 'Fintrack'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/transactions/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Catat Transaksi
            </Link>

            <Link
              href="/notifications"
              className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Link>

            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Ganti Tema"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 safe-area-pb">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {MOBILE_DOCK_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            if (item.isAction) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="-mt-5 w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 active:scale-95 transition-transform"
                  aria-label="Tambah Transaksi"
                >
                  <Plus className="w-6 h-6" />
                </Link>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[56px] text-[10px]',
                  active
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 font-medium'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="mt-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
