'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart as PieChartIcon,
  ArrowLeftRight,
  Plus,
  Receipt,
  ArrowRight,
  Calendar,
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
import { formatRupiah, formatDateIndo } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function DashboardClient({
  data,
  month,
  year,
}: {
  data: any;
  month: number;
  year: number;
}) {
  const router = useRouter();

  const barData = [
    { name: 'Pemasukan', amount: data.monthIncome, fill: '#10b981' },
    { name: 'Pengeluaran', amount: data.monthExpense, fill: '#ef4444' },
    { name: 'Selisih', amount: Math.max(0, data.monthIncome - data.monthExpense), fill: '#2563eb' },
  ];

  const handlePeriodChange = (newMonth: number, newYear: number) => {
    router.push(`/dashboard?month=${newMonth}&year=${newYear}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Filter Bulan & Tahun */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight">
            Ringkasan Keuangan — {MONTH_NAMES[month - 1]} {year}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Data aktual real-time dari seluruh rekening dan transaksi Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <Calendar className="w-4 h-4 text-blue-600" />
            <select
              value={month}
              onChange={(e) => handlePeriodChange(Number(e.target.value), year)}
              className="bg-transparent outline-none font-medium"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx + 1} className="dark:bg-slate-900">
                  {m}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => handlePeriodChange(month, Number(e.target.value))}
              className="bg-transparent outline-none font-medium"
            >
              {[year - 1, year, year + 1].map((y) => (
                <option key={y} value={y} className="dark:bg-slate-900">
                  {y}
                </option>
              ))}
            </select>
          </div>
          <Link
            href="/transactions/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Transaksi
          </Link>
        </div>
      </div>

      {/* 6 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Saldo Rekening</p>
              <p className="text-base sm:text-2xl font-extrabold mt-1 truncate">
                {formatRupiah(data.totalBalance)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pemasukan Bulan Ini</p>
              <p className="text-base sm:text-2xl font-extrabold text-emerald-600 mt-1 truncate">
                {formatRupiah(data.monthIncome)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pengeluaran Bulan Ini</p>
              <p className="text-base sm:text-2xl font-extrabold text-rose-600 mt-1 truncate">
                {formatRupiah(data.monthExpense)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Sisa Anggaran</p>
              <p
                className={`text-base sm:text-2xl font-extrabold mt-1 truncate ${
                  data.totalBudgetRemaining < 0 ? 'text-rose-600' : 'text-amber-600'
                }`}
              >
                {formatRupiah(data.totalBudgetRemaining)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
              <PieChartIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Tabungan</p>
              <p className="text-base sm:text-2xl font-extrabold text-emerald-600 mt-1 truncate">
                {formatRupiah(data.totalSavings)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
              <PiggyBank className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Jumlah Transaksi</p>
              <p className="text-base sm:text-2xl font-extrabold mt-1">
                {data.transactionCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pemasukan vs Pengeluaran</CardTitle>
            <CardDescription>Perbandingan arus kas bulan berjalan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barCategoryGap="30%">
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}Jt`}
                  />
                  <Tooltip
                    formatter={(val: number) => [formatRupiah(val), 'Nominal']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {barData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengeluaran per Kategori</CardTitle>
            <CardDescription>Distribusi belanja bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            {data.expenseByCategory.length > 0 ? (
              <>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.expenseByCategory}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={42}
                        outerRadius={70}
                        paddingAngle={3}
                      >
                        {data.expenseByCategory.map((item: any, idx: number) => (
                          <Cell key={idx} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => [formatRupiah(val), 'Pengeluaran']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-2">
                  {data.expenseByCategory.slice(0, 4).map((item: any) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className="font-semibold">{formatRupiah(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500 text-center py-12">Belum ada pengeluaran bulan ini.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ringkasan Anggaran, Transaksi Terbaru & Tagihan Mendekati Jatuh Tempo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ringkasan Anggaran</CardTitle>
              <CardDescription>Progres batas pengeluaran</CardDescription>
            </div>
            <Link href="/budgets" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              Detail <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.budgets.length > 0 ? (
              data.budgets.slice(0, 4).map((b: any) => (
                <div key={b.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{b.category?.name || 'Kategori'}</span>
                    <span className="text-slate-500">
                      {formatRupiah(b.spent)} / {formatRupiah(b.allocated)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        b.percent > 100
                          ? 'bg-rose-600'
                          : b.percent >= 80
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, b.percent)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">Belum ada anggaran bulan ini.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Transaksi Terbaru</CardTitle>
              <CardDescription>5 mutasi terakhir</CardDescription>
            </div>
            <Link href="/transactions" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentTransactions.length > 0 ? (
              data.recentTransactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{tx.description}</p>
                    <p className="text-slate-500">
                      {tx.category?.name} • {formatDateIndo(tx.transaction_date)}
                    </p>
                  </div>
                  <span
                    className={`font-bold shrink-0 ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatRupiah(tx.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">Belum ada transaksi.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tagihan Menanti</CardTitle>
              <CardDescription>Mendekati jatuh tempo</CardDescription>
            </div>
            <Link href="/bills" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              Kelola <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcomingBills.length > 0 ? (
              data.upcomingBills.map((bill: any) => (
                <div key={bill.id} className="flex items-center justify-between gap-2 text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2 min-w-0">
                    <Receipt className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{bill.name}</p>
                      <p className="text-slate-500">{formatDateIndo(bill.due_date)}</p>
                    </div>
                  </div>
                  <Badge variant="warning">{formatRupiah(bill.amount)}</Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">Tidak ada tagihan tertunda.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
