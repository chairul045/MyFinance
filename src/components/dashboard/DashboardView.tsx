'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertTriangle,
  ArrowRight,
  Receipt,
  CheckCircle2,
  Clock,
  Sparkles,
  CalendarDays,
  Plus,
  RotateCcw,
  ShieldCheck,
  Equal,
  Minus,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useFinance } from '@/context/FinanceContext';
import { formatRupiah, formatDateIndo, getMonthNameIndo } from '@/lib/utils';

const PIE_COLORS = [
  '#f97316', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899', '#10b981', '#eab308', '#64748b'
];

interface DashboardViewProps {
  onOpenAddTx: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenAddTx }) => {
  const {
    user,
    transactions,
    budgets,
    bills,
    currentMonth,
    allIncome,
    allExpense,
    currentBalance,
    totalIncome,
    totalExpense,
    totalSavings,
    budgetAlerts,
    toggleBillPaid,
    setActiveTab,
    loadDemoData,
    clearAllData,
  } = useFinance();

  // Filter current month
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  const recentTransactions = transactions.slice(0, 5);

  // Category breakdown data for PieChart
  const expenseByCategory: Record<string, number> = {};
  currentMonthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // Bar Chart comparison data
  const comparisonData = [
    { name: 'Pemasukan', amount: totalIncome, fill: '#10b981' },
    { name: 'Pengeluaran', amount: totalExpense, fill: '#ef4444' },
    { name: 'Sisa Saldo', amount: Math.max(0, currentBalance), fill: '#3b82f6' },
  ];

  // Total allocated budget
  const monthBudgets = budgets.filter(b => b.month === currentMonth);
  const totalAllocatedBudget = monthBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const budgetUsagePercent = totalAllocatedBudget > 0 ? (totalExpense / totalAllocatedBudget) * 100 : 0;

  // Upcoming unpaid bills
  const upcomingBills = bills.filter(b => !b.isPaid).slice(0, 4);
  const isDataEmpty = transactions.length === 0 && budgets.length === 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner for Real Clean Account */}
      {isDataEmpty && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Selamat Datang, {user.name || 'Pengguna Baru'}!
                </h3>
                {user.role === 'admin' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Akun Anda telah aktif dengan <strong>data finansial bersih / real kosong</strong>. Silakan mulai catat pemasukan gaji atau pengeluaran harian Anda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenAddTx}
              className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Transaksi Pertama</span>
            </button>
            <button
              onClick={() => {
                if (confirm('Muat data simulasi contoh (Rp5.000.000)?')) {
                  loadDemoData();
                }
              }}
              className="px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all"
              title="Isi dengan data contoh simulasi"
            >
              Muat Data Demo
            </button>
          </div>
        </div>
      )}

      {/* Live Arithmetic Cashflow Indicator (Gaji Berkurang Otomatis Saat Ada Pengeluaran) */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Kalkulasi Sisa Uang Real-Time
            </h4>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400">
            Sisa uang langsung berkurang saat ada pengeluaran
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 items-center">
          {/* Pemasukan */}
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
              <span>Total Pemasukan</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-base sm:text-xl font-black text-emerald-300">
              +{formatRupiah(allIncome)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
              Bulan aktif: {formatRupiah(totalIncome)}
            </p>
          </div>

          {/* Pengeluaran */}
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-center justify-between text-xs text-rose-400 font-semibold mb-1">
              <span>Total Pengeluaran</span>
              <TrendingDown className="w-4 h-4" />
            </div>
            <p className="text-base sm:text-xl font-black text-rose-400">
              -{formatRupiah(allExpense)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
              Bulan aktif: {formatRupiah(totalExpense)}
            </p>
          </div>

          {/* Sisa Kas */}
          <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${
            currentBalance >= 0 
              ? 'bg-cyan-500/10 border-cyan-500/30' 
              : 'bg-rose-500/20 border-rose-500/50'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className={currentBalance >= 0 ? 'text-cyan-300' : 'text-rose-300'}>
                Sisa Uang Anda (Dompet)
              </span>
              <Wallet className="w-4 h-4 text-cyan-400" />
            </div>
            <p className={`text-base sm:text-xl font-black ${
              currentBalance >= 0 ? 'text-white' : 'text-rose-400'
            }`}>
              ={formatRupiah(currentBalance)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
              {currentBalance >= 0 ? 'Saldo kas aman & siap pakai' : 'Peringatan: Saldo defisit!'}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards (Responsive 2x2 on Mobile, 4 cols on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Saldo Kas Saat Ini */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/80 border border-slate-800/90 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
              Sisa Kas
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Wallet className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h3 className={`text-sm sm:text-2xl font-black tracking-tight truncate ${
              currentBalance >= 0 ? 'text-white' : 'text-rose-400'
            }`}>
              {formatRupiah(currentBalance)}
            </h3>
            <p className="text-[9px] sm:text-[11px] text-emerald-400/90 mt-0.5 truncate font-medium">
              Live Real-Time
            </p>
          </div>
        </div>

        {/* Total Pemasukan Bulan Berjalan */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/80 border border-slate-800/90 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
              Pemasukan
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h3 className="text-sm sm:text-2xl font-black text-emerald-400 tracking-tight truncate">
              {formatRupiah(totalIncome)}
            </h3>
            <p className="text-[9px] sm:text-xs text-slate-400 mt-0.5 truncate">
              Total: {formatRupiah(allIncome)}
            </p>
          </div>
        </div>

        {/* Total Pengeluaran Bulan Berjalan */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/80 border border-slate-800/90 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
              Pengeluaran
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <TrendingDown className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h3 className="text-sm sm:text-2xl font-black text-rose-400 tracking-tight truncate">
              {formatRupiah(totalExpense)}
            </h3>
            <p className="text-[9px] sm:text-xs text-slate-400 mt-0.5 truncate">
              Total: {formatRupiah(allExpense)}
            </p>
          </div>
        </div>

        {/* Total Tabungan Terkumpul */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/80 border border-slate-800/90 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
              Tabungan
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
              <PiggyBank className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h3 className="text-sm sm:text-2xl font-black text-teal-400 tracking-tight truncate">
              {formatRupiah(totalSavings)}
            </h3>
            <p className="text-[9px] sm:text-xs text-teal-500/80 mt-0.5 truncate">
              Target aktif
            </p>
          </div>
        </div>
      </div>

      {/* Alert Banner if any budget exceeds 80% */}
      {budgetAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs sm:text-sm text-amber-200">
              <strong>Peringatan Anggaran:</strong> Ada {budgetAlerts.length} kategori yang telah mencapai lebih dari 75% batas pengeluaran bulan ini!
            </p>
          </div>
          <button
            onClick={() => setActiveTab('budgets')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0 ml-2"
          >
            Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base font-bold text-white">Ringkasan Arus Kas ({getMonthNameIndo(currentMonth)})</h4>
              <p className="text-xs text-slate-400">Perbandingan pemasukan vs pengeluaran bulan berjalan</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Real-Time
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={value => `${value / 1000000} Jt`}
                />
                <Tooltip
                  formatter={(val: number) => [formatRupiah(val), 'Jumlah']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Budget Health Bar */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-400">Total Anggaran Terpakai ({budgetUsagePercent.toFixed(1)}%)</span>
              <span className="text-slate-200">
                {formatRupiah(totalExpense)} / {formatRupiah(totalAllocatedBudget)}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUsagePercent > 90
                    ? 'bg-rose-500'
                    : budgetUsagePercent > 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Expense Category Distribution */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-white">Distribusi Pengeluaran</h4>
            <p className="text-xs text-slate-400">Proporsi kategori belanja bulan ini</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center my-2">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [formatRupiah(val), 'Pengeluaran']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                <PieChart className="w-8 h-8 text-slate-700 mx-auto mb-2 opacity-50" />
                <p>Belum ada data pengeluaran di bulan ini</p>
              </div>
            )}
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {pieData.length > 0 ? (
              pieData.slice(0, 4).map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-slate-300 truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-white">{formatRupiah(item.value)}</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-500 text-center">Data kategori muncul otomatis setelah input transaksi</p>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Transactions & Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-white">Transaksi Terbaru</h4>
              <p className="text-xs text-slate-400">Mutasi keuangan terbaru yang tercatat di sistem</p>
            </div>
            {recentTransactions.length > 0 && (
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                Semua Transaksi <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(tx => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">
                        {tx.description}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{formatDateIndo(tx.date)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-xs sm:text-sm font-bold ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                    </p>
                    <p className="text-[10px] text-slate-500">{tx.paymentMethod || 'Metode Tunai'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                <p className="text-slate-400 font-medium">Belum ada transaksi di akun ini.</p>
                <button
                  onClick={onOpenAddTx}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all"
                >
                  + Tambah Transaksi Pertama
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Bills (1 col) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-white">Tagihan Menanti</h4>
                <p className="text-xs text-slate-400">Pengingat jatuh tempo tagihan</p>
              </div>
              <button
                onClick={() => setActiveTab('bills')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-3">
              {upcomingBills.length > 0 ? (
                upcomingBills.map(bill => (
                  <div
                    key={bill.id}
                    className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{bill.name}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Tempo: {formatDateIndo(bill.dueDate)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-white">{formatRupiah(bill.amount)}</p>
                      <button
                        onClick={() => toggleBillPaid(bill.id)}
                        className="mt-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Bayar</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Tidak ada tagihan yang belum dibayar.</p>
                </div>
              )}
            </div>
          </div>

          {/* Financial Cycle Workflow Banner */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
              <CalendarDays className="w-4 h-4" />
              <span>Siklus Keuangan Bulanan</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Tgl 1: Budgeting • Tgl 2-25: Catat harian & pantau • Akhir bulan: Evaluasi & Laporan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
