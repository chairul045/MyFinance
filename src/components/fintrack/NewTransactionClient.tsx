'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import { createTransactionAction, attachReceiptAction } from '@/actions/transactions';
import { createTransferAction } from '@/actions/accounts';
import { createClient } from '@/lib/supabase/client';
import { getJakartaDateString } from '@/lib/finance-calc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { AccountWithBalance, Category } from '@/types/fintrack';

export function NewTransactionClient({
  accounts,
  categories,
  userId,
}: {
  accounts: AccountWithBalance[];
  categories: Category[];
  userId: string;
}) {
  const router = useRouter();
  const activeAccounts = accounts.filter((a) => a.is_active);

  const [mode, setMode] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [accountId, setAccountId] = useState(activeAccounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(activeAccounts[1]?.id || '');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getJakartaDateString());
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === mode);
  const effectiveCategoryId =
    filteredCategories.find((c) => c.id === categoryId)?.id || filteredCategories[0]?.id || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'transfer') {
      const res = await createTransferAction({
        from_account_id: accountId,
        to_account_id: toAccountId,
        amount: Number(amount),
        transfer_date: date,
        notes: notes || description,
      });
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Gagal mencatat transfer.');
        return;
      }
      router.push('/accounts');
      router.refresh();
      return;
    }

    const res = await createTransactionAction({
      account_id: accountId,
      category_id: effectiveCategoryId,
      type: mode,
      amount: Number(amount),
      transaction_date: date,
      description,
      notes,
    });

    if (!res.success || !res.id) {
      setLoading(false);
      setError(res.error || 'Gagal menyimpan transaksi.');
      return;
    }

    // Upload bukti transaksi ke private storage bucket 'receipts' jika ada
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setLoading(false);
        setError('Transaksi tersimpan, namun ukuran file bukti maksimal 5MB.');
        return;
      }
      const supabase = createClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${userId}/${res.id}/${Date.now()}_${safeName}`;
      const { error: uploadErr } = await supabase.storage
        .from('receipts')
        .upload(filePath, file, { upsert: false });

      if (!uploadErr) {
        await attachReceiptAction({
          transactionId: res.id,
          filePath,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          fileSize: file.size,
        });
      }
    }

    setLoading(false);
    router.push('/transactions');
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link
        href="/transactions"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Transaksi
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Catat Transaksi Baru</CardTitle>
          <CardDescription>Pilih jenis pemasukan, pengeluaran, atau transfer antar rekening.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 mb-5">
            <button
              type="button"
              onClick={() => setMode('expense')}
              className={`py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                mode === 'expense'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setMode('income')}
              className={`py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                mode === 'income'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setMode('transfer')}
              className={`py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                mode === 'transfer'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Transfer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{mode === 'transfer' ? 'Rekening Asal' : 'Rekening'}</Label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                  required
                >
                  {activeAccounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              {mode === 'transfer' ? (
                <div className="space-y-1.5">
                  <Label>Rekening Tujuan</Label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                    required
                  >
                    {activeAccounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <select
                    value={effectiveCategoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                    required
                  >
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nominal (Rp)</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {mode !== 'transfer' && (
              <div className="space-y-1.5">
                <Label>Deskripsi</Label>
                <Input
                  placeholder="Contoh: Makan siang / Gaji bulanan"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Catatan (Opsional)</Label>
              <Input
                placeholder="Tambahan keterangan transaksi..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {mode !== 'transfer' && (
              <div className="space-y-1.5">
                <Label>Upload Bukti Transaksi (Opsional, Maks 5MB)</Label>
                <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 cursor-pointer text-xs text-slate-500 hover:border-blue-500">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>{file ? file.name : 'Pilih foto struk / bukti transfer (PNG, JPG, PDF)'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                'Simpan Transaksi'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
