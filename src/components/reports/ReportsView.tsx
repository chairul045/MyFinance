'use client';

import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useFinance } from '@/context/FinanceContext';
import { formatRupiah, formatDateIndo } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const ReportsView: React.FC = () => {
  const { transactions, budgets, currentMonth, user } = useFinance();
  const [rangeType, setRangeType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // Filter transactions for current month
  const currentMonthTx = transactions.filter(t => t.date.startsWith(currentMonth));

  const totalIncome = currentMonthTx
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTx
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Monthly Comparison Mock/History Data
  const monthlyComparisonData = [
    { month: 'Sep 2026', pemasukan: 4800000, pengeluaran: 3900000, tabungan: 900000 },
    { month: 'Okt 2026', pemasukan: 5200000, pengeluaran: 4100000, tabungan: 1100000 },
    { month: 'Nov 2026', pemasukan: totalIncome, pengeluaran: totalExpense, tabungan: Math.max(0, netSavings) },
  ];

  // Category breakdown
  const categorySummary: Record<string, { income: number; expense: number }> = {};
  currentMonthTx.forEach(t => {
    if (!categorySummary[t.category]) {
      categorySummary[t.category] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      categorySummary[t.category].income += t.amount;
    } else {
      categorySummary[t.category].expense += t.amount;
    }
  });

  // Export to PDF
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Title & Header
      doc.setFontSize(18);
      doc.setTextColor(16, 185, 129); // emerald
      doc.text('MyFinance - Laporan Keuangan Bulanan', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Periode: ${currentMonth} | Dibuat untuk: ${user.name} (${user.email})`, 14, 28);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 34);

      // Summary Box
      autoTable(doc, {
        startY: 42,
        head: [['Indikator Keuangan', 'Nilai']],
        body: [
          ['Total Pemasukan', formatRupiah(totalIncome)],
          ['Total Pengeluaran', formatRupiah(totalExpense)],
          ['Sisa Kas / Tabungan Bersih', formatRupiah(netSavings)],
          ['Savings Rate (Tingkat Tabungan)', `${savingsRate.toFixed(1)}%`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
      });

      // Transactions Table
      const txRows = currentMonthTx.map(t => [
        t.date,
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        t.category,
        t.description,
        formatRupiah(t.amount),
      ]);

      const lastY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setTextColor(30);
      doc.text('Daftar Rincian Mutasi Transaksi', 14, lastY);

      autoTable(doc, {
        startY: lastY + 5,
        head: [['Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Nominal']],
        body: txRows,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 8 },
      });

      doc.save(`Laporan_Keuangan_MyFinance_${currentMonth}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Gagal mengekspor PDF.');
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      // Sheet 1: Ringkasan
      const summaryData = [
        ['MYFINANCE - LAPORAN KEUANGAN BULANAN'],
        ['Periode', currentMonth],
        ['Nama Pengguna', user.name],
        ['Email', user.email],
        [''],
        ['Indikator', 'Jumlah (IDR)'],
        ['Total Pemasukan', totalIncome],
        ['Total Pengeluaran', totalExpense],
        ['Sisa Saldo / Net Savings', netSavings],
        ['Savings Rate (%)', savingsRate.toFixed(2)],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

      // Sheet 2: Transaksi
      const txData = [
        ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Metode Pembayaran', 'Nominal (IDR)'],
        ...currentMonthTx.map(t => [
          t.id,
          t.date,
          t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
          t.category,
          t.description,
          t.paymentMethod || '',
          t.amount,
        ]),
      ];
      const txSheet = XLSX.utils.aoa_to_sheet(txData);

      // Sheet 3: Anggaran
      const budgetData = [
        ['Kategori', 'Batas Anggaran (IDR)', 'Bulan'],
        ...budgets.map(b => [b.category, b.allocatedAmount, b.month]),
      ];
      const budgetSheet = XLSX.utils.aoa_to_sheet(budgetData);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');
      XLSX.utils.book_append_sheet(workbook, txSheet, 'Transaksi');
      XLSX.utils.book_append_sheet(workbook, budgetSheet, 'Anggaran');

      XLSX.writeFile(workbook, `Laporan_Keuangan_MyFinance_${currentMonth}.xlsx`);
    } catch (err) {
      console.error('Failed to export Excel:', err);
      alert('Gagal mengekspor Excel.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Export Controls */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Laporan & Evaluasi Keuangan</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Periode: {currentMonth}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Analisis performa finansial, perbandingan antarbulan, dan cetak laporan resmi PDF / Excel.
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all hover:scale-105"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-105"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-xs text-slate-400">Total Arus Kas Masuk</span>
            <p className="text-xl font-bold text-emerald-400 mt-1">{formatRupiah(totalIncome)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-xs text-slate-400">Total Arus Kas Keluar</span>
            <p className="text-xl font-bold text-rose-400 mt-1">{formatRupiah(totalExpense)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-xs text-slate-400">Tingkat Tabungan (Savings Rate)</span>
            <p className="text-xl font-bold text-teal-400 mt-1">{savingsRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Monthly Comparison Bar Chart */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-base font-bold text-white">Perbandingan Antarbulan</h4>
            <p className="text-xs text-slate-400">Trend 3 bulan terakhir (Pemasukan vs Pengeluaran vs Tabungan)</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                tickFormatter={value => `${value / 1000000} Jt`}
              />
              <Tooltip
                formatter={(val: number) => [formatRupiah(val)]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="pemasukan" name="Pemasukan" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#ef4444" radius={[6, 6, 0, 0]} />
              <Bar dataKey="tabungan" name="Tabungan Bersih" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown by Category Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <h4 className="text-base font-bold text-white mb-4">Rincian per Kategori ({currentMonth})</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/50 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Pemasukan</th>
                <th className="py-3 px-4 text-right">Pengeluaran</th>
                <th className="py-3 px-4 text-right">Selisih Bersih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {Object.entries(categorySummary).map(([cat, vals]) => {
                const diff = vals.income - vals.expense;
                return (
                  <tr key={cat} className="hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-medium text-white">{cat}</td>
                    <td className="py-3.5 px-4 text-right text-emerald-400 font-semibold">
                      {vals.income > 0 ? formatRupiah(vals.income) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-rose-400 font-semibold">
                      {vals.expense > 0 ? formatRupiah(vals.expense) : '-'}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-bold ${
                        diff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatRupiah(diff)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
