'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Paperclip,
  ChevronLeft,
  ChevronRight,
  Repeat,
} from 'lucide-react';
import { deleteTransactionAction, updateTransactionAction } from '@/actions/transactions';
import {
  createRecurringTransactionAction,
  toggleRecurringActiveAction,
  deleteRecurringTransactionAction,
  processDueRecurringTransactionsAction,
} from '@/actions/planning';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah, formatDateIndo } from '@/lib/utils';
import { FREQUENCY_LABELS } from '@/lib/constants';
import { getJakartaDateString } from '@/lib/finance-calc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type {
  TransactionRecord,
  AccountWithBalance,
  Category,
  RecurringTransactionRecord,
} from '@/types/fintrack';

export function TransactionsClient({
  transactions,
  totalCount,
  page,
  pageSize,
  accounts,
  categories,
  recurring,
  initialFilters,
}: {
  transactions: TransactionRecord[];
  totalCount: number;
  page: number;
  pageSize: number;
  accounts: AccountWithBalance[];
  categories: Category[];
  recurring: RecurringTransactionRecord[];
  initialFilters: {
    search?: string;
    type?: string;
    accountId?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  };
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialFilters.search || '');
  const [type, setType] = useState(initialFilters.type || 'all');
  const [accountId, setAccountId] = useState(initialFilters.accountId || '');
  const [categoryId, setCategoryId] = useState(initialFilters.categoryId || '');
  const [startDate, setStartDate] = useState(initialFilters.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters.endDate || '');

  // Edit modal state
  const [editingTx, setEditingTx] = useState<TransactionRecord | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');

  // Recurring form state
  const [recDesc, setRecDesc] = useState('');
  const [recType, setRecType] = useState<'income' | 'expense'>('expense');
  const [recAmount, setRecAmount] = useState('');
  const [recAccountId, setRecAccountId] = useState(accounts[0]?.id || '');
  const [recCategoryId, setRecCategoryId] = useState(categories[0]?.id || '');
  const [recFreq, setRecFreq] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [recStart, setRecStart] = useState(getJakartaDateString());
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const applyFilters = (targetPage = 1) => {
    const q = new URLSearchParams();
    if (search.trim()) q.set('search', search.trim());
    if (type !== 'all') q.set('type', type);
    if (accountId) q.set('accountId', accountId);
    if (categoryId) q.set('categoryId', categoryId);
    if (startDate) q.set('startDate', startDate);
    if (endDate) q.set('endDate', endDate);
    q.set('page', String(targetPage));
    router.push(`/transactions?${q.toString()}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini? Saldo rekening akan otomatis disesuaikan.')) return;
    await deleteTransactionAction(id);
    router.refresh();
  };

  const handleOpenReceipt = async (filePath: string) => {
    const supabase = createClient();
    const { data } = await supabase.storage.from('receipts').createSignedUrl(filePath, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    const res = await updateTransactionAction(editingTx.id, {
      account_id: editingTx.account_id,
      category_id: editingTx.category_id,
      type: editingTx.type,
      amount: Number(editAmount),
      transaction_date: editDate,
      description: editDesc,
      notes: editingTx.notes,
    });
    if (res.success) {
      setEditingTx(null);
      router.refresh();
    }
  };

  const handleCreateRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createRecurringTransactionAction({
      account_id: recAccountId,
      category_id: recCategoryId,
      type: recType,
      amount: Number(recAmount),
      description: recDesc,
      frequency: recFreq,
      start_date: recStart,
    });
    if (res.success) {
      setRecDesc('');
      setRecAmount('');
      setStatusMsg('Jadwal transaksi berulang berhasil ditambahkan.');
      router.refresh();
    }
  };

  const handleRunDueRecurring = async () => {
    const res = await processDueRecurringTransactionsAction();
    setStatusMsg(`Pemrosesan selesai: ${res.processed} transaksi jatuh tempo dicatat.`);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold">Daftar Transaksi</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Total {totalCount} transaksi ditemukan.
          </p>
        </div>
        <Link
          href="/transactions/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Transaksi
        </Link>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
          {statusMsg}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari deskripsi atau catatan..."
              className="pl-9"
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
          >
            <option value="all">Semua Jenis</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
          >
            <option value="">Semua Rekening</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type === 'income' ? 'Masuk' : 'Keluar'})
              </option>
            ))}
          </select>
          <Button onClick={() => applyFilters(1)} className="w-full">
            Terapkan Filter
          </Button>
          <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2 text-xs">
            <span className="text-slate-500 shrink-0">Dari:</span>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span className="text-slate-500 shrink-0">Sampai:</span>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingTx && (
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle>Edit Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Deskripsi</Label>
                <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Nominal</Label>
                <Input type="number" min="1" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Tanggal</Label>
                <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
              </div>
              <div className="sm:col-span-3 flex gap-2">
                <Button type="submit" size="sm">Simpan</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setEditingTx(null)}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table / Mobile Cards */}
      <Card>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-12">Belum ada transaksi yang sesuai.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{tx.description}</span>
                      <Badge variant={tx.type === 'income' ? 'success' : 'destructive'}>
                        {tx.category?.name || 'Kategori'}
                      </Badge>
                      {tx.attachments && tx.attachments.length > 0 && (
                        <button
                          onClick={() => handleOpenReceipt(tx.attachments![0].file_path)}
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                        >
                          <Paperclip className="w-3 h-3" /> Bukti
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatDateIndo(tx.transaction_date)} • {tx.account?.name}
                      {tx.notes ? ` • ${tx.notes}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span
                      className={`text-sm font-bold ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatRupiah(tx.amount)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingTx(tx);
                          setEditDesc(tx.description);
                          setEditAmount(String(tx.amount));
                          setEditDate(tx.transaction_date);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600"
                        onClick={() => handleDelete(tx.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => applyFilters(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => applyFilters(page + 1)}
            >
              Berikutnya <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Transaksi Berulang Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-blue-600" /> Transaksi Berulang Terjadwal
            </CardTitle>
            <CardDescription>
              Jadwalkan gaji, sewa, internet, atau cicilan secara idempoten (tidak tercatat ganda).
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={handleRunDueRecurring}>
            Proses Jadwal Jatuh Tempo
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCreateRecurring} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Input
              placeholder="Deskripsi (mis. Gaji)"
              value={recDesc}
              onChange={(e) => setRecDesc(e.target.value)}
              required
            />
            <select
              value={recType}
              onChange={(e) => setRecType(e.target.value as 'income' | 'expense')}
              className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
            >
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
            <Input
              type="number"
              min="1"
              placeholder="Nominal"
              value={recAmount}
              onChange={(e) => setRecAmount(e.target.value)}
              required
            />
            <select
              value={recAccountId}
              onChange={(e) => setRecAccountId(e.target.value)}
              className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <select
              value={recFreq}
              onChange={(e) => setRecFreq(e.target.value as 'weekly' | 'monthly' | 'yearly')}
              className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
            >
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </select>
            <div className="flex gap-2">
              <Input type="date" value={recStart} onChange={(e) => setRecStart(e.target.value)} required />
              <Button type="submit" size="sm">Simpan</Button>
            </div>
          </form>

          {recurring.length > 0 && (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recurring.map((r) => (
                <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold">
                      {r.description} • <Badge variant="secondary">{FREQUENCY_LABELS[r.frequency]}</Badge>
                    </p>
                    <p className="text-slate-500">
                      Jadwal berikut: {formatDateIndo(r.next_run_date)}
                      {r.last_run_date ? ` • Terakhir realisasi: ${formatDateIndo(r.last_run_date)}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatRupiah(r.amount)}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await toggleRecurringActiveAction(r.id, !r.is_active);
                        router.refresh();
                      }}
                    >
                      {r.is_active ? 'Aktif' : 'Nonaktif'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600"
                      onClick={async () => {
                        await deleteRecurringTransactionAction(r.id);
                        router.refresh();
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
