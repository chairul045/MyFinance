'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Check,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatRupiah, formatDateIndo } from '@/lib/utils';

export const BillsView: React.FC = () => {
  const { bills, addBill, deleteBill, toggleBillPaid, addTransaction } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [billName, setBillName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Utilitas');
  const [recurring, setRecurring] = useState<'monthly' | 'one-time' | 'yearly'>('monthly');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const paidBills = bills.filter(b => b.isPaid);
  const unpaidBills = bills.filter(b => !b.isPaid);

  const totalUnpaidAmount = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
  const totalPaidAmount = paidBills.reduce((sum, b) => sum + b.amount, 0);

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!amountNum || amountNum <= 0) {
      alert('Masukkan nominal tagihan yang valid.');
      return;
    }

    addBill({
      name: billName.trim(),
      amount: amountNum,
      dueDate,
      category,
      isPaid: false,
      recurring,
      reminderDays: 3,
    });

    setBillName('');
    setAmount('');
    setDueDate('');
    setIsModalOpen(false);
  };

  const handleToggleAndRecord = (bill: typeof bills[0]) => {
    const willBePaid = !bill.isPaid;
    toggleBillPaid(bill.id);

    // If marked as paid, offer to record as expense transaction
    if (willBePaid) {
      if (confirm(`Tagihan "${bill.name}" ditandai Lunas. Catat otomatis ke pengeluaran transaksi hari ini?`)) {
        addTransaction({
          type: 'expense',
          amount: bill.amount,
          category: 'Tagihan & Utilitas',
          date: todayStr,
          description: `Pembayaran ${bill.name}`,
          paymentMethod: 'Transfer / QRIS',
        });
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Pengingat Tagihan & Kewajiban</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                {unpaidBills.length} Belum Dibayar
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Catat tagihan rutin, listrik PLN, internet WiFi, cicilan, dan jangan sampai terkena denda keterlambatan.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-lg shadow-rose-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tagihan</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Total Tagihan Belum Dibayar</span>
              <p className="text-xl font-bold text-rose-400 mt-0.5">
                {formatRupiah(totalUnpaidAmount)}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-300 font-semibold border border-rose-500/20">
              {unpaidBills.length} Tagihan
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Total Tagihan Sudah Lunas</span>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">
                {formatRupiah(totalPaidAmount)}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
              {paidBills.length} Tagihan
            </span>
          </div>
        </div>
      </div>

      {/* Bills List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bills.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <Receipt className="w-12 h-12 text-rose-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white">Belum Ada Catatan Tagihan</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Catat tagihan rutin seperti listrik PLN, WiFi internet, atau cicilan agar tidak terlambat membayar.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-5 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-md shadow-rose-500/20 transition-all hover:scale-105"
            >
              + Catat Tagihan Pertama
            </button>
          </div>
        ) : (
          bills.map(bill => {
            const isOverdue = !bill.isPaid && bill.dueDate < todayStr;
            const isToday = !bill.isPaid && bill.dueDate === todayStr;

            return (
              <div
                key={bill.id}
                className={`p-6 rounded-3xl bg-slate-900 border shadow-xl flex flex-col justify-between transition-all group ${
                  bill.isPaid
                    ? 'border-emerald-500/30 opacity-75'
                    : isOverdue
                    ? 'border-rose-500/60 bg-gradient-to-b from-rose-950/20 to-slate-900'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          bill.isPaid
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isOverdue
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                          {bill.name}
                        </h4>
                        <span className="text-[10px] text-slate-400">{bill.category}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Hapus tagihan "${bill.name}"?`)) {
                          deleteBill(bill.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Hapus Tagihan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Amount */}
                  <div className="mt-4">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                      Nominal Tagihan
                    </span>
                    <p className="text-xl font-black text-white mt-0.5">
                      {formatRupiah(bill.amount)}
                    </p>
                  </div>

                  {/* Status Badges */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {bill.isPaid ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sudah Lunas</span>
                      </span>
                    ) : isOverdue ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Terlambat!</span>
                      </span>
                    ) : isToday ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Hari Ini Jatuh Tempo!</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Belum Dibayar</span>
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>Tempo: {formatDateIndo(bill.dueDate)}</span>
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleToggleAndRecord(bill)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      bill.isPaid
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>{bill.isPaid ? 'Tandai Belum Lunas' : 'Tandai Sudah Dibayar'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Bill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-1">Catat Tagihan Baru</h3>
            <p className="text-xs text-slate-400 mb-4">
              Jadwalkan pengingat agar pembayaran tepat waktu tanpa denda.
            </p>

            <form onSubmit={handleCreateBill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Tagihan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Listrik PLN, WiFi Indihome, Cicilan KPR"
                  value={billName}
                  onChange={e => setBillName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 350000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  min="1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tanggal Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Utilitas">Listrik & Air (Utilitas)</option>
                    <option value="Internet">WiFi & Pulsa</option>
                    <option value="Cicilan">Cicilan & Hutang</option>
                    <option value="Kesehatan">BPJS / Asuransi</option>
                    <option value="Hiburan">Langganan Streaming</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Sifat Tagihan
                </label>
                <select
                  value={recurring}
                  onChange={e => setRecurring(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="monthly">Bulanan (Rutin setiap bulan)</option>
                  <option value="one-time">Sekali Bayar (One-time)</option>
                  <option value="yearly">Tahunan (Tahunan / Pajak)</option>
                </select>
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20"
                >
                  Simpan Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
