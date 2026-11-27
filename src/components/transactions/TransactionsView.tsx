'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatRupiah, formatDateIndo } from '@/lib/utils';
import { CATEGORIES } from '@/data/initialData';

interface TransactionsViewProps {
  onOpenAddTx: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onOpenAddTx }) => {
  const { transactions, deleteTransaction } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filter & Search
  const filteredTransactions = transactions
    .filter(tx => {
      const matchesSearch =
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.paymentMethod && tx.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === 'all' || tx.type === selectedType;
      const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;

      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const totalFilteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleDelete = (id: string, desc: string) => {
    if (confirm(`Yakin ingin menghapus transaksi "${desc}"?`)) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-4 pb-24 lg:pb-12">
      {/* Top Banner and Summary */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-white">Riwayat Transaksi</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {filteredTransactions.length} transaksi tercatat
            </p>
          </div>
          <button
            onClick={onOpenAddTx}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Tambah</span>
          </button>
        </div>

        {/* Summary Chips */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] text-slate-400 block">Total Pemasukan</span>
            <span className="font-bold text-emerald-400 text-sm">{formatRupiah(totalFilteredIncome)}</span>
          </div>
          <div className="px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-[10px] text-slate-400 block">Total Pengeluaran</span>
            <span className="font-bold text-rose-400 text-sm">{formatRupiah(totalFilteredExpense)}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
        {/* Search + Filter toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
              showFilters
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          <button
            onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/70 border border-slate-700 text-xs font-medium text-slate-400 hover:text-slate-200 transition-all"
            title={sortOrder === 'desc' ? 'Terbaru Dahulu' : 'Terlama Dahulu'}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-800">
            {/* Type Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/70 border border-slate-700 text-xs">
              {(['all', 'income', 'expense'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-colors text-[10px] sm:text-xs ${
                    selectedType === t
                      ? t === 'income'
                        ? 'bg-emerald-500 text-white'
                        : t === 'expense'
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t === 'all' ? 'Semua' : t === 'income' ? 'Masuk' : 'Keluar'}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-2.5 py-2 rounded-xl bg-slate-800/70 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {CATEGORIES.map(c => (
                <option key={c.name} value={c.name} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ===== MOBILE: Card List (< lg) ===== */}
      <div className="lg:hidden space-y-2.5">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(tx => (
            <div
              key={tx.id}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center gap-3"
            >
              {/* Type Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  tx.type === 'income'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {tx.type === 'income' ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{tx.description}</p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
                    {tx.category}
                  </span>
                  <span className="text-[10px] text-slate-500">{formatDateIndo(tx.date)}</span>
                  {tx.paymentMethod && (
                    <span className="text-[10px] text-slate-500 truncate">• {tx.paymentMethod}</span>
                  )}
                </div>
              </div>

              {/* Amount + Delete */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={`text-sm font-bold ${
                    tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                </span>
                <button
                  onClick={() => handleDelete(tx.id, tx.description)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center text-slate-500">
            <p className="text-sm font-medium text-slate-400">Tidak ada transaksi.</p>
            <button
              onClick={onOpenAddTx}
              className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              + Tambah Transaksi Pertama
            </button>
          </div>
        )}
      </div>

      {/* ===== DESKTOP: Table (>= lg) ===== */}
      <div className="hidden lg:block rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/50 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Tipe &amp; Tanggal</th>
                <th className="py-4 px-6">Keterangan</th>
                <th className="py-4 px-6">Kategori</th>
                <th className="py-4 px-6">Metode</th>
                <th className="py-4 px-6 text-right">Nominal</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
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
                        <div>
                          <span
                            className={`font-semibold block ${
                              tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {formatDateIndo(tx.date)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-white max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                      {tx.paymentMethod || '-'}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <span
                        className={`text-sm font-bold ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(tx.id, tx.description)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    Tidak ada transaksi yang cocok dengan pencarian / filter Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
