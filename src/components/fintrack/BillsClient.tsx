'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Receipt, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { createBillAction, deleteBillAction, payBillAction } from '@/actions/planning';
import { formatRupiah, formatDateIndo } from '@/lib/utils';
import { getBillStatus, getJakartaDateString } from '@/lib/finance-calc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AccountWithBalance, Category } from '@/types/fintrack';

export function BillsClient({
  bills,
  accounts,
  categories,
}: {
  bills: any[];
  accounts: AccountWithBalance[];
  categories: Category[];
}) {
  const router = useRouter();
  const activeAccounts = accounts.filter((a) => a.is_active);
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const todayStr = getJakartaDateString();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(todayStr);
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || '');
  const [isRecurring, setIsRecurring] = useState(true);
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [payAccountId, setPayAccountId] = useState(activeAccounts[0]?.id || '');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    const res = await createBillAction({
      name,
      amount: Number(amount),
      due_date: dueDate,
      category_id: categoryId || null,
      account_id: payAccountId || null,
      is_recurring: isRecurring,
      frequency: isRecurring ? frequency : null,
      reminder_days: 3,
    });
    if (!res.success) {
      setError(res.error || 'Gagal menambah tagihan.');
      return;
    }
    setName('');
    setAmount('');
    setMsg('Tagihan berhasil ditambahkan.');
    router.refresh();
  };

  const handlePay = async (billId: string) => {
    if (!payAccountId) {
      setError('Pilih rekening pembayaran terlebih dahulu.');
      return;
    }
    setMsg(null);
    setError(null);
    const res = await payBillAction(billId, payAccountId);
    if (!res.success) {
      setError(res.error || 'Gagal membayar tagihan.');
      return;
    }
    setMsg('Tagihan dibayar dan transaksi pengeluaran otomatis tercatat.');
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {msg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700">
          {msg}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tambah Tagihan Baru</CardTitle>
          <CardDescription>Kelola listrik, internet, air, cicilan, sewa, dan langganan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div className="space-y-1.5">
              <Label>Nama Tagihan</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Internet WiFi" required />
            </div>
            <div className="space-y-1.5">
              <Label>Nominal (Rp)</Label>
              <Input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Jatuh Tempo</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Kategori</Label>
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
            <Button type="submit">
              <Plus className="w-4 h-4" /> Tambah
            </Button>

            <div className="sm:col-span-2 lg:col-span-5 flex flex-wrap items-center gap-4 text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
                Tagihan Berulang
              </label>
              {isRecurring && (
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as 'weekly' | 'monthly' | 'yearly')}
                  className="h-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs"
                >
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                  <option value="yearly">Tahunan</option>
                </select>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-slate-500">Rekening Bayar Default:</span>
                <select
                  value={payAccountId}
                  onChange={(e) => setPayAccountId(e.target.value)}
                  className="h-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs"
                >
                  {activeAccounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tagihan & Riwayat Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
          {bills.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">Belum ada tagihan tercatat.</p>
          ) : (
            bills.map((bill) => {
              const status = getBillStatus(bill, todayStr);
              const badgeVariant =
                status.code === 'paid'
                  ? 'success'
                  : status.code === 'overdue'
                  ? 'destructive'
                  : status.code === 'due_soon'
                  ? 'warning'
                  : 'secondary';

              return (
                <div key={bill.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Receipt className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{bill.name}</span>
                        <Badge variant={badgeVariant}>{status.label}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        Jatuh tempo: {formatDateIndo(bill.due_date)}
                        {bill.category?.name ? ` • ${bill.category.name}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    <span className="font-bold text-sm">{formatRupiah(bill.amount)}</span>
                    {!bill.is_paid && (
                      <Button size="sm" variant="success" onClick={() => handlePay(bill.id)}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Bayar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600"
                      onClick={async () => {
                        await deleteBillAction(bill.id);
                        router.refresh();
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
