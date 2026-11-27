'use client';

import React, { useState } from 'react';
import {
  User,
  RotateCcw,
  Download,
  Upload,
  Database,
  CheckCircle,
  ShieldCheck,
  Moon,
  Sun,
  Code2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatRupiah } from '@/lib/utils';

export const SettingsView: React.FC = () => {
  const {
    user,
    theme,
    setTheme,
    loadDemoData,
    clearAllData,
    exportBackup,
    importBackup,
  } = useFinance();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [targetIncome, setTargetIncome] = useState(String(user.monthlyIncomeTarget));
  const [isSaved, setIsSaved] = useState(false);
  const [showSqlSchema, setShowSqlSchema] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    user.name = name;
    user.email = email;
    user.monthlyIncomeTarget = parseFloat(targetIncome) || 0;
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      if (content) {
        const success = importBackup(content);
        if (success) {
          alert('Data backup berhasil diimpor!');
        } else {
          alert('File JSON tidak valid atau struktur data tidak sesuai.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Pengaturan Akun & Preferensi</h2>
            {user.role === 'admin' ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> AKUN ADMIN
              </span>
            ) : (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                AKUN REAL
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Kelola profil personal, backup data, dan manipulasi data keuangan akun Anda.
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Informasi Akun</h3>
            <p className="text-xs text-slate-400">Data profil personal yang sedang aktif</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email / Gmail
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Pemasukan Bulanan (Rp)
            </label>
            <input
              type="number"
              value={targetIncome}
              onChange={e => setTargetIncome(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isSaved && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Profil berhasil diperbarui!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              Simpan Profil
            </button>
          </div>
        </form>
      </div>

      {/* Data Management: Real Clean vs Demo Simulation */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Manipulasi Data Akun</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pilih untuk memulai dari awal (real data bersih) atau memuat data contoh untuk presentasi/simulasi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              if (confirm('Kosongkan semua data transaksi, anggaran, tabungan, dan tagihan di akun ini menjadi 0 (Real Kosong)?')) {
                clearAllData();
                alert('Semua data berhasil dikosongkan. Akun Anda sekarang bersih 100%.');
              }
            }}
            className="p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/30 text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
              <Trash2 className="w-4 h-4" />
              <span>Kosongkan Semua Data (Real Data 0)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Menghapus semua mutasi simulasi sehingga Anda dapat mencatat keuangan asli dari awal.
            </p>
          </button>

          <button
            onClick={() => {
              if (confirm('Muat data simulasi contoh (Rp5.000.000 alokasi ideal)?')) {
                loadDemoData();
                alert('Data demo berhasil dimuat!');
              }
            }}
            className="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Muat Data Contoh Simulasi (Demo)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Mengisi akun dengan contoh data pemasukan Rp5 Juta dan alokasi anggaran siap presentasi.
            </p>
          </button>
        </div>
      </div>

      {/* Theme Preference */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Tampilan Tema (21st Style)</h3>
          <p className="text-xs text-slate-400 mt-0.5">Pilih mode tampilan gelap atau terang</p>
        </div>
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-800 border border-slate-700">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              theme === 'dark'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              theme === 'light'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </button>
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Backup & Pemulihan Data</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Simpan data keuangan ke file JSON lokal atau pulihkan data Anda kapan saja.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Backup (JSON)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 cursor-pointer transition-all hover:scale-105">
            <Upload className="w-4 h-4 text-teal-400" />
            <span>Pulihkan / Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Supabase & Database Integration Info */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Database & Supabase Auth Ready</h3>
              <p className="text-xs text-slate-400">
                Aplikasi ini dirancang siap terhubung dengan PostgreSQL / Supabase
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSqlSchema(!showSqlSchema)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 hover:text-white"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{showSqlSchema ? 'Sembunyikan SQL' : 'Lihat Schema SQL'}</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
          <p>
            <strong className="text-emerald-400">Mode Saat Ini:</strong> Penyimpanan Multi-Akun LocalStorage (Data per Gmail tersimpan aman dan terpisah di browser).
          </p>
          <p>
            Untuk menghubungkan ke server cloud Supabase, konfigurasikan file <code className="text-teal-300">.env.local</code> dengan:
          </p>
          <pre className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto">
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
          </pre>
        </div>

        {showSqlSchema && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64">
            <pre>
{`-- Tabel Pengguna
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel Transaksi
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL,
  type VARCHAR(10) NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  payment_method VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel Anggaran
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  allocated_amount NUMERIC(15,2) NOT NULL,
  month VARCHAR(7) NOT NULL
);`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
