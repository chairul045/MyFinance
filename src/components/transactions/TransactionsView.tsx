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
    <div className="space-y-6 pb-12">
      {/* Top Banner and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white">Riwayat Transaksi Lengkap</h2>
          <p className="text-xs text-slate-400 mt-1">
            Total {filteredTransactions.length} transaksi tercatat dalam riwayat Anda
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <span className="text-slate-400 block">Total Pemasukan:</span>
            <span className="font-bold text-emerald-400">{formatRupiah(totalFilteredIncome)}</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs">
            <span className="text-slate-400 block">Total Pengeluaran:</span>
            <span className="font-bold text-rose-400">{formatRupiah(totalFilteredExpense)}</span>
          </div>
          <button
            onClick={onOpenAddTx}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari transaksi, ket, metode..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/70 border border-slate-700 text-xs">
            <button
              onClick={() => setSelectedType('all')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                selectedType === 'all'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                selectedType === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                selectedType === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Keluar
            </button>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {CATEGORIES.map(c => (
                <option key={c.name} value={c.name} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Urutan: {sortOrder === 'desc' ? 'Terbaru Dahulu' : 'Terlama Dahulu'}</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/50 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Tipe & Tanggal</th>
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
                    {/* Tipe & Tanggal */}
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

                    {/* Keterangan */}
                    <td className="py-4 px-6 font-medium text-white max-w-xs truncate">
                      {tx.description}
                    </td>

                    {/* Kategori */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                        {tx.category}
                      </span>
                    </td>

                    {/* Metode */}
                    <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                      {tx.paymentMethod || '-'}
                    </td>

                    {/* Nominal */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <span
                        className={`text-sm font-bold ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                      </span>
                    </td>

                    {/* Aksi */}
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
