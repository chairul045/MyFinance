'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { CATEGORIES } from '@/data/initialData';
import { TransactionType } from '@/types/finance';

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Makan & Minum');
  const [date, setDate] = useState(getTodayDateStr());
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('QRIS / Transfer Bank');

  useEffect(() => {
    if (isOpen) {
      setDate(getTodayDateStr());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCategories = CATEGORIES.filter(
    c => c.type === type || c.type === 'both'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!parsedAmount || parsedAmount <= 0) {
      alert('Masukkan jumlah uang yang valid.');
      return;
    }

    addTransaction({
      type,
      amount: parsedAmount,
      category,
      date,
      description: description.trim() || (type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
      paymentMethod,
    });

    // Reset and close
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white">Tambah Catatan Keuangan</h3>
            <p className="text-xs text-slate-400 mt-0.5">Catat arus kas Anda secara akurat</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-slate-800/80 border border-slate-700/50">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('Makan & Minum');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Gaji & Pendapatan');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Pemasukan</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                Rp
              </span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                min="1"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-lg font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kategori
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {filteredCategories.map(c => (
                  <option key={c.name} value={c.name} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Keterangan / Catatan
            </label>
            <input
              type="text"
              placeholder="Contoh: Makan siang nasi padang, bayar token, dll"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Metode Pembayaran
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Transfer Bank BCA" className="bg-slate-900 text-white">Transfer Bank (BCA/Mandiri/BRI)</option>
              <option value="QRIS / E-Wallet" className="bg-slate-900 text-white">QRIS (GoPay/OVO/ShopeePay/Dana)</option>
              <option value="Tunai" className="bg-slate-900 text-white">Uang Tunai (Cash)</option>
              <option value="Kartu Debit / Kredit" className="bg-slate-900 text-white">Kartu Debit / Kredit</option>
              <option value="Autodebit" className="bg-slate-900 text-white">Autodebit Tabungan / Reksadana</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
