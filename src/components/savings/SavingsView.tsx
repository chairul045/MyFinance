'use client';

import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatRupiah, formatDateIndo } from '@/lib/utils';

export const SavingsView: React.FC = () => {
  const { savingsGoals, addSavingsGoal, deleteSavingsGoal, adjustSavingsAmount } = useFinance();

  // Create Goal Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2027-12-31');
  const [category, setCategory] = useState('Impian Finansial');

  // Adjust Funds Modal State
  const [adjustModalData, setAdjustModalData] = useState<{
    id: string;
    name: string;
    action: 'deposit' | 'withdraw';
  } | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');

  const totalTargetAll = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSavedAll = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTargetAll > 0 ? (totalSavedAll / totalTargetAll) * 100 : 0;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(targetAmount.replace(/[^0-9]/g, ''));
    const initialNum = parseFloat(initialAmount.replace(/[^0-9]/g, '')) || 0;

    if (!targetNum || targetNum <= 0) {
      alert('Masukkan target nominal yang valid.');
      return;
    }

    addSavingsGoal({
      name: goalName.trim(),
      targetAmount: targetNum,
      currentAmount: initialNum,
      targetDate,
      category,
      color: '#10b981',
    });

    setGoalName('');
    setTargetAmount('');
    setInitialAmount('');
    setIsAddModalOpen(false);
  };

  const handleAdjustFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalData) return;
    const amountNum = parseFloat(adjustAmount.replace(/[^0-9]/g, ''));
    if (!amountNum || amountNum <= 0) {
      alert('Masukkan nominal yang valid.');
      return;
    }

    const change = adjustModalData.action === 'deposit' ? amountNum : -amountNum;
    adjustSavingsAmount(adjustModalData.id, change);

    setAdjustModalData(null);
    setAdjustAmount('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Target & Alokasi Tabungan</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-semibold">
                {savingsGoals.length} Target Aktif
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Capai impian finansial Anda secara bertahap dan teratur dengan alokasi target tabungan.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs shadow-lg shadow-teal-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Target Baru</span>
          </button>
        </div>

        {/* Global Progress */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium mb-2">
            <span className="text-slate-400">
              Total Terkumpul: <strong className="text-teal-400">{formatRupiah(totalSavedAll)}</strong>
            </span>
            <span className="text-slate-300">
              Target Keseluruhan: <strong className="text-white">{formatRupiah(totalTargetAll)}</strong> ({overallProgress.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(100, overallProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savingsGoals.map(goal => {
          const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isCompleted = goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className={`p-6 rounded-3xl bg-slate-900 border shadow-xl flex flex-col justify-between transition-all group ${
                isCompleted
                  ? 'border-teal-500/40 bg-gradient-to-b from-teal-950/20 to-slate-900'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header with Title and Delete */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                      {isCompleted ? <Trophy className="w-5 h-5 text-amber-400 animate-bounce" /> : <PiggyBank className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors">
                        {goal.name}
                      </h4>
                      <span className="text-[10px] text-slate-400">{goal.category || 'Tabungan Khusus'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Hapus target tabungan "${goal.name}"?`)) {
                        deleteSavingsGoal(goal.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Hapus Target"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Status and Percentage */}
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Target: {formatDateIndo(goal.targetDate)}</span>
                  </span>
                  <span className="text-xs font-bold text-teal-400">
                    {progress.toFixed(0)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-amber-400' : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>

                {/* Amounts Breakdown */}
                <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Terkumpul</span>
                    <span className="text-sm font-bold text-white">
                      {formatRupiah(goal.currentAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Sisa Dibutuhkan</span>
                    <span className={`text-sm font-bold ${isCompleted ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {isCompleted ? 'Lunas / Tercapai! 🎉' : formatRupiah(remaining)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Setor & Tarik */}
              <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAdjustModalData({ id: goal.id, name: goal.name, action: 'deposit' })}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-all"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Setor Uang</span>
                </button>
                <button
                  onClick={() => setAdjustModalData({ id: goal.id, name: goal.name, action: 'withdraw' })}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all"
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Tarik Dana</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-1">Buat Target Tabungan Baru</h3>
            <p className="text-xs text-slate-400 mb-4">
              Tentukan impian finansial yang ingin Anda capai secara terukur.
            </p>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Target
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Beli Motor, Dana Darurat, Umroh"
                  value={goalName}
                  onChange={e => setGoalName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Nominal (Rp)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 10000000"
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                  required
                  min="1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Saldo Awal (Opsional)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={initialAmount}
                    onChange={e => setInitialAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Tanggal
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="Keamanan Finansial">Keamanan Finansial (Dana Darurat)</option>
                  <option value="Kendaraan">Kendaraan & Otomotif</option>
                  <option value="Properti & Rumah">Properti / Renovasi Rumah</option>
                  <option value="Liburan & Wisata">Liburan & Travelling</option>
                  <option value="Peralatan & Karir">Peralatan Kerja / Gadget</option>
                  <option value="Pernikahan & Keluarga">Pernikahan / Pendidikan</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-500 hover:bg-teal-600 shadow-md shadow-teal-500/20"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Funds Modal (Deposit / Withdraw) */}
      {adjustModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-1">
              {adjustModalData.action === 'deposit' ? 'Setor Uang ke Tabungan' : 'Tarik Uang dari Tabungan'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Target: <strong className="text-white">{adjustModalData.name}</strong>
            </p>

            <form onSubmit={handleAdjustFunds} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 500000"
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(e.target.value)}
                  required
                  min="1"
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustModalData(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white ${
                    adjustModalData.action === 'deposit'
                      ? 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/20'
                      : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                  }`}
                >
                  {adjustModalData.action === 'deposit' ? 'Konfirmasi Setor' : 'Konfirmasi Tarik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
