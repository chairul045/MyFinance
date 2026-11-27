'use client';

import React, { useState } from 'react';
import {
  Plus,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit2,
  PieChart as PieIcon,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatRupiah } from '@/lib/utils';
import { CATEGORIES } from '@/data/initialData';

export const BudgetView: React.FC = () => {
  const {
    budgets,
    setBudget,
    deleteBudget,
    categorySpending,
    currentMonth,
    totalIncome,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Makan & Minum');
  const [allocatedAmount, setAllocatedAmount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const monthBudgets = budgets.filter(b => b.month === currentMonth);
  const totalAllocated = monthBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalExpenseAllocated = monthBudgets.reduce(
    (sum, b) => sum + (categorySpending[b.category] || 0),
    0
  );

  const expenseCategories = CATEGORIES.filter(c => c.type === 'expense');

  const handleOpenAdd = () => {
    setEditingId(null);
    setSelectedCategory('Makan & Minum');
    setAllocatedAmount('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: string, amount: number) => {
    setEditingId(category);
    setSelectedCategory(category);
    setAllocatedAmount(String(amount));
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(allocatedAmount.replace(/[^0-9]/g, ''));
    if (!amountNum || amountNum <= 0) {
      alert('Masukkan jumlah anggaran yang valid.');
      return;
    }

    setBudget({
      category: selectedCategory,
      allocatedAmount: amountNum,
      month: currentMonth,
    });

    setIsModalOpen(false);
  };

  // Preset Indonesian 50/30/20 template from prompt
  const applyPresetTemplate = () => {
    if (
      confirm(
        'Terapkan template distribusi anggaran Rp5.000.000 (Makan 20%, Tabungan 24%, dll sesuai konsep panduan)?'
      )
    ) {
      const template = [
        { category: 'Makan & Minum', allocatedAmount: 1000000 },
        { category: 'Transportasi', allocatedAmount: 500000 },
        { category: 'Kebutuhan Pribadi', allocatedAmount: 500000 },
        { category: 'Tagihan & Utilitas', allocatedAmount: 500000 },
        { category: 'Hiburan & Hobi', allocatedAmount: 300000 },
        { category: 'Tabungan', allocatedAmount: 1200000 },
        { category: 'Dana Darurat', allocatedAmount: 500000 },
        { category: 'Sisa Cadangan', allocatedAmount: 500000 },
      ];
      template.forEach(item => {
        setBudget({
          category: item.category,
          allocatedAmount: item.allocatedAmount,
          month: currentMonth,
        });
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Overview Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Alokasi Anggaran Bulanan</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                {currentMonth}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Kendalikan gaya hidup dan pastikan pengeluaran tidak melampaui batas yang ditentukan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={applyPresetTemplate}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700/80 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
              title="Terapkan Alokasi Ideal Rp5.000.000"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gunakan Formula Rekomendasi</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Anggaran</span>
            </button>
          </div>
        </div>

        {/* Aggregate Progress Bar */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium mb-2">
            <span className="text-slate-400">
              Total Alokasi: <strong className="text-white">{formatRupiah(totalAllocated)}</strong>
              {totalIncome > 0 && ` (${((totalAllocated / totalIncome) * 100).toFixed(0)}% dari pendapatan)`}
            </span>
            <span className="text-slate-300">
              Terpakai: <strong className="text-rose-400">{formatRupiah(totalExpenseAllocated)}</strong> / Sisa:{' '}
              <strong className="text-emerald-400">
                {formatRupiah(Math.max(0, totalAllocated - totalExpenseAllocated))}
              </strong>
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalExpenseAllocated > totalAllocated
                  ? 'bg-rose-500'
                  : (totalExpenseAllocated / (totalAllocated || 1)) > 0.8
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  totalAllocated > 0 ? (totalExpenseAllocated / totalAllocated) * 100 : 0
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {monthBudgets.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <PieIcon className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white">Belum Ada Anggaran Bulanan</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Tentukan batas pengeluaran per kategori atau terapkan formula rekomendasi Rp5.000.000 untuk mengontrol pengeluaran Anda.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
              >
                + Tambah Anggaran Pertama
              </button>
              <button
                onClick={applyPresetTemplate}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all hover:scale-105"
              >
                Gunakan Formula Rekomendasi
              </button>
            </div>
          </div>
        ) : (
          monthBudgets.map(budget => {
          const spent = categorySpending[budget.category] || 0;
          const remaining = budget.allocatedAmount - spent;
          const percent = budget.allocatedAmount > 0 ? (spent / budget.allocatedAmount) * 100 : 0;

          // Status & Color
          let statusBadge = {
            label: 'Aman',
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-400',
            border: 'border-emerald-500/20',
            icon: CheckCircle,
          };

          if (percent >= 100) {
            statusBadge = {
              label: 'Over Budget!',
              bg: 'bg-rose-500/10',
              text: 'text-rose-400',
              border: 'border-rose-500/20',
              icon: AlertCircle,
            };
          } else if (percent >= 80) {
            statusBadge = {
              label: 'Hampir Habis',
              bg: 'bg-amber-500/10',
              text: 'text-amber-400',
              border: 'border-amber-500/20',
              icon: AlertTriangle,
            };
          }

          const StatusIcon = statusBadge.icon;

          return (
            <div
              key={budget.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-emerald-400">
                      <PieIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {budget.category}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {((budget.allocatedAmount / (totalAllocated || 1)) * 100).toFixed(0)}% dari total alokasi
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(budget.category, budget.allocatedAmount)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Ubah Batas Anggaran"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus anggaran ${budget.category}?`)) {
                          deleteBudget(budget.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Hapus Anggaran"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-4 flex items-center justify-between">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusBadge.label}</span>
                  </div>
                  <span className="text-xs font-bold text-white">{percent.toFixed(0)}%</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-2.5 w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      percent >= 100
                        ? 'bg-rose-500'
                        : percent >= 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>

              {/* Amounts Details Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-800/80 grid grid-cols-3 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Batas</span>
                  <span className="font-semibold text-slate-200">
                    {formatRupiah(budget.allocatedAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Terpakai</span>
                  <span className={`font-semibold ${spent > budget.allocatedAmount ? 'text-rose-400' : 'text-slate-300'}`}>
                    {formatRupiah(spent)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Sisa</span>
                  <span
                    className={`font-semibold ${
                      remaining < 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {formatRupiah(remaining)}
                  </span>
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Add / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-1">
              {editingId ? 'Ubah Batas Anggaran' : 'Tentukan Batas Anggaran'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Atur batas maksimal pengeluaran bulanan per kategori.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Kategori
                </label>
                <select
                  disabled={!!editingId}
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-60"
                >
                  {expenseCategories.map(c => (
                    <option key={c.name} value={c.name} className="bg-slate-900 text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Batas Pengeluaran (Rp)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 1000000"
                  value={allocatedAmount}
                  onChange={e => setAllocatedAmount(e.target.value)}
                  required
                  min="1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
                >
                  Simpan Anggaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
