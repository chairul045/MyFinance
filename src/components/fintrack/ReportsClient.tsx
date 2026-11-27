'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileDown, FileSpreadsheet, TrendingUp, TrendingDown } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatRupiah, formatDateIndo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ReportsClient({
  report,
  period,
  startDate,
  endDate,
}: {
  report: any;
  period: string;
  startDate: string;
  endDate: string;
}) {
  const router = useRouter();
  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);

  const handleSelectPeriod = (newPeriod: string) => {
    router.push(`/reports?period=${newPeriod}`);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/reports?period=custom&start=${customStart}&end=${customEnd}`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Laporan Keuangan Fintrack', 14, 18);
    doc.setFontSize(10);
    doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 25);
    doc.text(`Total Pemasukan: ${formatRupiah(report.totalIncome)}`, 14, 32);
    doc.text(`Total Pengeluaran: ${formatRupiah(report.totalExpense)}`, 14, 38);
    doc.text(`Selisih Bersih: ${formatRupiah(report.netDifference)}`, 14, 44);

    autoTable(doc, {
      startY: 52,
      head: [['Tanggal', 'Jenis', 'Kategori', 'Rekening', 'Deskripsi', 'Nominal']],
      body: report.transactions.map((t: any) => [
        t.transaction_date,
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        t.category?.name || '-',
        t.account?.name || '-',
        t.description,
        formatRupiah(t.amount),
      ]),
    });

    doc.save(`Fintrack-Laporan-${startDate}-${endDate}.pdf`);
  };

  const handleExportExcel = () => {
    const rows = report.transactions.map((t: any) => ({
      Tanggal: t.transaction_date,
      Jenis: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      Kategori: t.category?.name || '-',
      Rekening: t.account?.name || '-',
      Deskripsi: t.description,
      Nominal: t.amount,
      Catatan: t.notes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Keuangan');
    XLSX.writeFile(wb, `Fintrack-Laporan-${startDate}-${endDate}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold">Laporan Keuangan</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Periode aktif: {formatDateIndo(startDate)} — {formatDateIndo(endDate)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleExportPDF}>
            <FileDown className="w-4 h-4 text-rose-600" /> Export PDF
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </Button>
        </div>
      </div>

      {/* Period Switcher */}
      <Card>
        <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'daily', label: 'Harian' },
              { id: 'weekly', label: 'Mingguan' },
              { id: 'monthly', label: 'Bulanan' },
              { id: 'yearly', label: 'Tahunan' },
            ].map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant={period === p.id ? 'default' : 'outline'}
                onClick={() => handleSelectPeriod(p.id)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <form onSubmit={handleApplyCustom} className="flex flex-wrap items-center gap-2 text-xs">
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-36 h-9"
            />
            <span>s/d</span>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-36 h-9"
            />
            <Button type="submit" size="sm" variant="secondary">
              Terapkan
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Total Pemasukan</p>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-600 mt-1">
              {formatRupiah(report.totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Total Pengeluaran</p>
            <p className="text-lg sm:text-xl font-extrabold text-rose-600 mt-1">
              {formatRupiah(report.totalExpense)}
            </p>
            {report.expenseChangePercent !== null && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                {report.expenseChangePercent >= 0 ? '+' : ''}
                {report.expenseChangePercent.toFixed(1)}% vs periode lalu
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Selisih Bersih</p>
            <p
              className={`text-lg sm:text-xl font-extrabold mt-1 ${
                report.netDifference >= 0 ? 'text-blue-600' : 'text-rose-600'
              }`}
            >
              {formatRupiah(report.netDifference)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Kategori Terbesar</p>
            <p className="text-sm sm:text-base font-bold mt-1 truncate">
              {report.topExpenseCategory ? report.topExpenseCategory.name : '-'}
            </p>
            <p className="text-xs text-slate-500">
              {report.topExpenseCategory ? formatRupiah(report.topExpenseCategory.amount) : 'Belum ada data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tren Pemasukan & Pengeluaran</CardTitle>
            <CardDescription>Pergerakan harian pada periode terpilih</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {report.dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={report.dailyTrend}>
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}Jt`} />
                  <Tooltip formatter={(v: number) => formatRupiah(v)} />
                  <Line type="monotone" dataKey="income" name="Pemasukan" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500 text-center py-16">Belum ada transaksi pada periode ini.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengeluaran per Kategori</CardTitle>
            <CardDescription>Saving Rate periode ini: {report.savingRate.toFixed(1)}%</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {report.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.categoryBreakdown}>
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}Jt`} />
                  <Tooltip formatter={(v: number) => formatRupiah(v)} />
                  <Bar dataKey="amount" name="Pengeluaran" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500 text-center py-16">Belum ada pengeluaran pada periode ini.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi Periode Ini ({report.transactions.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
          {report.transactions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">Tidak ada transaksi.</p>
          ) : (
            report.transactions.map((tx: any) => (
              <div key={tx.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  {tx.type === 'income' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{tx.description}</p>
                    <p className="text-xs text-slate-500">
                      {formatDateIndo(tx.transaction_date)} • {tx.category?.name} • {tx.account?.name}
                    </p>
                  </div>
                </div>
                <Badge variant={tx.type === 'income' ? 'success' : 'destructive'}>
                  {tx.type === 'income' ? '+' : '-'}
                  {formatRupiah(tx.amount)}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
