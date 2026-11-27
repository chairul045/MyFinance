'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Plus, Trash2, AlertTriangle } from 'lucide-react';
import {
  upsertBudgetAction,
  deleteBudgetAction,
  copyPreviousMonthBudgetsAction,
} from '@/actions/planning';
import { formatRupiah } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Category } from '@/types/fintrack';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function BudgetsClient({
  budgets,
  categories,
  month,
  year,
}: {
  budgets: any[];
  categories: Category[];
  month: number;
  year: number;
}) {
  const router = useRouter();
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    const res = await upsertBudgetAction({
      category_id: categoryId,
      amount: Number(amount),
      month,
      year,
    });
    if (!res.success) {
      setError(res.error || 'Gagal menyimpan anggaran.');
      return;
    }
    setAmount('');
    setMsg('Anggaran berhasil disimpan.');
    router.refresh();
  };

  const handleCopyPrev = async () => {
    setMsg(null);
    setError(null);
    const res = await copyPreviousMonthBudgetsAction(month, year);
    if (!res.success) {
      setError(res.error || 'Gagal menyalin anggaran.');
      return;
    }
    setMsg(`Berhasil menyalin ${res.count} anggaran dari bulan sebelumnya.`);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold">
            Anggaran Bulanan — {MONTH_NAMES[month - 1]} {year}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pantau batas pengeluaran dengan peringatan 50%, 80%, 100%, dan terlampaui.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => router.push(`/budgets?month=${e.target.value}&year=${year}`)}
            className="h-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={m} value={idx + 1}>{m}</option>
            ))}
          </select>
          <Button size="sm" variant="outline" onClick={handleCopyPrev}>
            <Copy className="w-3.5 h-3.5" /> Salin Bulan Lalu
          </Button>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
          {msg}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tetapkan Anggaran Kategori</CardTitle>
          <CardDescription>Pilih kategori pengeluaran dan tentukan batas maksimal bulan ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="space-y-1.5">
              <Label>Kategori Pengeluaran</Label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
              >
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Batas Anggaran (Rp)</Label>
              <Input
                type="number"
                min="1"
                placeholder="1000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <Button type="submit">
              <Plus className="w-4 h-4" /> Simpan Anggaran
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="p-10 text-center text-xs text-slate-500">
              Belum ada anggaran untuk bulan ini. Tambahkan anggaran atau salin dari bulan lalu.
            </CardContent>
          </Card>
        ) : (
          budgets.map((b) => {
            const badgeVariant =
              b.status === 'exceeded' || b.status === 'full'
                ? 'destructive'
                : b.status === 'warning'
                ? 'warning'
                : b.status === 'info'
                ? 'default'
                : 'success';

            return (
              <Card key={b.id}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{b.category?.name}</span>
                      <Badge variant={badgeVariant}>
                        {b.percent.toFixed(0)}% • {b.statusLabel}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600"
                      onClick={async () => {
                        await deleteBudgetAction(b.id);
                        router.refresh();
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        b.percent > 100
                          ? 'bg-rose-600'
                          : b.percent >= 80
                          ? 'bg-amber-500'
                          : b.percent >= 50
                          ? 'bg-blue-600'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, b.percent)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Terpakai: <strong className="text-slate-900 dark:text-slate-100">{formatRupiah(b.spent)}</strong></span>
                    <span>Batas: <strong className="text-slate-900 dark:text-slate-100">{formatRupiah(b.allocated)}</strong></span>
                  </div>

                  <div className="text-xs flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Sisa Anggaran</span>
                    <span className={`font-bold ${b.remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {formatRupiah(b.remaining)}
                    </span>
                  </div>

                  {b.percent >= 80 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{b.statusLabel} untuk kategori ini.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
