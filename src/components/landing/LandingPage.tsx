'use client';

import React, { useState } from 'react';
import {
  WalletCards,
  ArrowRight,
  TrendingUp,
  PieChart,
  PiggyBank,
  Receipt,
  FileBarChart,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  LogIn,
  Layers,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';

export const LandingPage: React.FC = () => {
  const { setIsLoggedIn } = useFinance();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30">
      {/* Navbar Landing */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
              <WalletCards className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-white tracking-tight">MyFinance</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Personal Management
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              Masuk
            </button>
            <button
              onClick={() => setIsLoggedIn(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
            >
              <span>Buka Aplikasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden">
        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Desain 21st Modern Financial Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Atur Uang Lebih Cerdas, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Capai Kebebasan Finansial
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Aplikasi manajemen keuangan pribadi yang membantu Anda mengontrol pemasukan, membatasi pengeluaran bulanan, mengumpulkan tabungan, dan mengingat tagihan tanpa ribet.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsLoggedIn(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <span>Mulai Kelola Keuangan Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setIsAuthModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
            >
              Registrasi Akun Baru
            </button>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
            <div className="p-3">
              <p className="text-2xl font-black text-white">100%</p>
              <p className="text-xs text-slate-400 mt-0.5">Kontrol Anggaran</p>
            </div>
            <div className="p-3">
              <p className="text-2xl font-black text-emerald-400">Rp5 Juta</p>
              <p className="text-xs text-slate-400 mt-0.5">Template Siap Pakai</p>
            </div>
            <div className="p-3">
              <p className="text-2xl font-black text-teal-400">PDF & Excel</p>
              <p className="text-xs text-slate-400 mt-0.5">Export Laporan Cepat</p>
            </div>
            <div className="p-3">
              <p className="text-2xl font-black text-cyan-400">Real-Time</p>
              <p className="text-xs text-slate-400 mt-0.5">Notifikasi & Peringatan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Semua Fitur Esensial Dalam Satu Aplikasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Dirancang khusus untuk gaya hidup modern dan kebutuhan finansial keluarga & profesional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard Ringkasan */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1. Dashboard Arus Kas</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pantau total pemasukan, pengeluaran, saldo tersedia, total tabungan, dan grafik keuangan bulanan secara seketika.
            </p>
          </div>

          {/* Transaksi */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-5 group-hover:scale-110 transition-transform">
              <WalletCards className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2. Pencatatan Transaksi</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Catat pemasukan dari gaji, bisnis, dan pengeluaran harian lengkap dengan kategori, metode bayar, dan filter pencarian canggih.
            </p>
          </div>

          {/* Anggaran */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3. Anggaran Bulanan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tentukan batas pengeluaran makan, transportasi, hiburan, dan dapatkan peringatan dini sebelum anggaran habis atau jebol.
            </p>
          </div>

          {/* Tabungan */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
              <PiggyBank className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">4. Target Tabungan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tentukan target impian finansial, catat uang yang disetor, dan pantau persentase serta sisa dana menuju tujuan Anda.
            </p>
          </div>

          {/* Tagihan */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-5 group-hover:scale-110 transition-transform">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">5. Pengingat Tagihan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Catat tagihan listrik PLN, internet, cicilan, dan tenggat waktu jatuh tempo dengan notifikasi status belum / sudah lunas.
            </p>
          </div>

          {/* Laporan */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
              <FileBarChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">6. Laporan & Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluasi keuangan komparatif antarbulan, rasio tabungan, dan ekspor instan format file PDF serta Excel (.xlsx).
            </p>
          </div>
        </div>
      </section>

      {/* Monthly Financial Workflow Timeline */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full">
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="mb-8">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Roadmap Siklus Keuangan
            </span>
            <h3 className="text-2xl font-bold text-white mt-1">Alur Praktis Pengelolaan Setiap Bulan</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-xs font-bold text-emerald-400 block mb-1">Tanggal 1</span>
              <p className="text-sm font-semibold text-white">Input Gaji & Anggaran</p>
              <p className="text-xs text-slate-400 mt-1">Catat pemasukan dan alokasikan pos-pos belanja.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-xs font-bold text-teal-400 block mb-1">Tanggal 2–14</span>
              <p className="text-sm font-semibold text-white">Catat & Pantau Harian</p>
              <p className="text-xs text-slate-400 mt-1">Input mutasi harian dan jaga batas pengeluaran.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-xs font-bold text-amber-400 block mb-1">Tanggal 15–25</span>
              <p className="text-sm font-semibold text-white">Evaluasi Pertengahan</p>
              <p className="text-xs text-slate-400 mt-1">Periksa batas sisa anggaran dan cegah pemborosan.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-xs font-bold text-rose-400 block mb-1">Akhir Bulan</span>
              <p className="text-sm font-semibold text-white">Laporan & Evaluasi</p>
              <p className="text-xs text-slate-400 mt-1">Cek sisa saldo, lunasi tagihan, dan cetak PDF.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-500">
        <p>© 2026 MyFinance – Personal Finance Management System. Dilengkapi standar estetika 21st UI.</p>
      </footer>

      {/* Login / Register Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white text-center">
              {authMode === 'login' ? 'Masuk ke MyFinance' : 'Daftar Akun Baru'}
            </h3>
            <p className="text-xs text-slate-400 text-center mt-1 mb-6">
              Kelola keuangan pribadi Anda sekarang juga
            </p>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="nama@example.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all"
              >
                {authMode === 'login' ? 'Masuk Sekarang' : 'Daftar & Mulai'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  {authMode === 'login'
                    ? 'Belum punya akun? Buat akun di sini'
                    : 'Sudah punya akun? Masuk di sini'}
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Tutup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
