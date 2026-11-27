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
  CheckCircle2,
  Sparkles,
  LogIn,
  UserPlus,
  AlertCircle,
  KeyRound,
  Mail,
  User,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';

export const LandingPage: React.FC = () => {
  const { login, register } = useFinance();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Error & Status feedback
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = login(loginEmail, loginPassword);
    if (!res.success) {
      setAuthError(res.error || 'Email atau kata sandi tidak cocok. Silakan coba lagi.');
    } else {
      setIsAuthModalOpen(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (regPassword !== regConfirmPassword) {
      setAuthError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (regPassword.length < 5) {
      setAuthError('Kata sandi minimal 5 karakter.');
      return;
    }

    const res = register(regName, regEmail, regPassword);
    if (!res.success) {
      setAuthError(res.error || 'Gagal membuat akun.');
    } else {
      setIsAuthModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30">
      {/* Navbar Landing */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
              <WalletCards className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight">MyFinance</span>
              <span className="hidden md:inline-block ml-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Personal Management
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
                setIsAuthModalOpen(true);
              }}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              Masuk
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <span>Daftar Akun</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[250px] sm:h-[350px] bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] sm:text-xs font-semibold mb-5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Personal Finance App</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Atur Uang Lebih Cerdas, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Capai Kebebasan Finansial
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed px-2">
            Aplikasi manajemen keuangan pribadi yang membantu Anda mengontrol pemasukan gaji, membatasi pengeluaran, mengumpulkan target tabungan, dan mengingat tagihan tanpa ribet.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
            <button
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
                setIsAuthModalOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <span>Mulai Buat Akun Baru</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
                setIsAuthModalOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk ke Akun Saya</span>
            </button>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
            <div className="p-2 sm:p-3">
              <p className="text-xl sm:text-2xl font-black text-white">100%</p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Data Real Bersih</p>
            </div>
            <div className="p-2 sm:p-3">
              <p className="text-xl sm:text-2xl font-black text-emerald-400">Live Auto</p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Sisa Kas Real-Time</p>
            </div>
            <div className="p-2 sm:p-3">
              <p className="text-xl sm:text-2xl font-black text-teal-400">PDF & Excel</p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Export Laporan Cepat</p>
            </div>
            <div className="p-2 sm:p-3">
              <p className="text-xl sm:text-2xl font-black text-cyan-400">Mobile Ready</p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Responsif di HP</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Semua Fitur Esensial Dalam Satu Aplikasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Dirancang khusus untuk gaya hidup modern dan kenyamanan akses di smartphone maupun laptop
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">1. Dashboard Arus Kas</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pantau total pemasukan, pengeluaran, saldo kas tersedia, total tabungan, dan grafik keuangan bulanan secara seketika.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
              <WalletCards className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">2. Pencatatan Transaksi</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Catat pemasukan dari gaji, bisnis, dan pengeluaran harian lengkap dengan kategori, metode bayar, dan filter pencarian.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
              <PieChart className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">3. Anggaran Bulanan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tentukan batas pengeluaran makan, transportasi, hiburan, dan dapatkan peringatan dini sebelum anggaran habis atau jebol.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
              <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">4. Target Tabungan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tentukan target impian finansial, catat uang yang disetor, dan pantau persentase serta sisa dana menuju tujuan Anda.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">5. Pengingat Tagihan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Catat tagihan listrik PLN, internet, cicilan, dan tenggat waktu jatuh tempo dengan notifikasi status belum / sudah lunas.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
              <FileBarChart className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">6. Laporan & Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluasi keuangan komparatif antarbulan, rasio tabungan, dan ekspor instan format file PDF serta Excel (.xlsx).
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 sm:py-8 px-4 sm:px-6 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-500">
        <p>© 2026 MyFinance – Personal Finance Management System.</p>
      </footer>

      {/* Login / Register Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                {authMode === 'login' ? <LogIn className="w-5 h-5 sm:w-6 sm:h-6" /> : <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {authMode === 'login' ? 'Masuk ke MyFinance' : 'Daftar Akun Baru'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {authMode === 'login'
                  ? 'Gunakan Email atau Gmail Anda untuk masuk'
                  : 'Akun baru dimulai dengan data real kosong (Rp0)'}
              </p>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email / Gmail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="nama@gmail.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
                >
                  Masuk Sekarang
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError(null);
                    }}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Belum punya akun? Buat akun di sini
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Nama Anda"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email / Gmail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="contoh@gmail.com"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Kata Sandi
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Konfirmasi Sandi
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-[11px] text-slate-400">
                  ✨ Akun baru dibuat dengan <strong>data finansial bersih (Rp0)</strong> sehingga Anda dapat langsung mencatat keuangan pribadi Anda.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
                >
                  Daftar Akun Baru
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                    }}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Sudah punya akun? Masuk di sini
                  </button>
                </div>
              </form>
            )}

            <div className="pt-4 text-center border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
