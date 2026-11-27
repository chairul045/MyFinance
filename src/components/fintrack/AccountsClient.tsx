'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Landmark,
  Plus,
  ArrowRightLeft,
  Pencil,
  Trash2,
  Power,
  Wallet,
} from 'lucide-react';
import {
  createAccountAction,
  updateAccountAction,
  toggleAccountActiveAction,
  deleteAccountAction,
  createTransferAction,
} from '@/actions/accounts';
import { ACCOUNT_TYPE_LABELS } from '@/lib/constants';
import { formatRupiah, formatDateIndo } from '@/lib/utils';
import { getJakartaDateString } from '@/lib/finance-calc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AccountWithBalance, TransferRecord, AccountType } from '@/types/fintrack';

export function AccountsClient({
  accounts,
  transfers,
}: {
  accounts: AccountWithBalance[];
  transfers: TransferRecord[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Account form state
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [initialBalance, setInitialBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  // Transfer form state
  const activeAccounts = accounts.filter((a) => a.is_active);
  const [fromId, setFromId] = useState(activeAccounts[0]?.id || '');
  const [toId, setToId] = useState(activeAccounts[1]?.id || '');
  const [trAmount, setTrAmount] = useState('');
  const [trDate, setTrDate] = useState(getJakartaDateString());
  const [trNotes, setTrNotes] = useState('');
  const [trLoading, setTrLoading] = useState(false);

  const totalSaldo = accounts
    .filter((a) => a.is_active)
    .reduce((sum, a) => sum + a.current_balance, 0);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const payload = {
      name,
      type,
      initial_balance: Number(initialBalance),
      color: '#2563eb',
    };
    const res = editingId
      ? await updateAccountAction(editingId, payload)
      : await createAccountAction(payload);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Gagal menyimpan rekening.');
      return;
    }
    setEditingId(null);
    setName('');
    setInitialBalance('0');
    router.refresh();
  };

  const handleEdit = (acc: AccountWithBalance) => {
    setEditingId(acc.id);
    setName(acc.name);
    setType(acc.type);
    setInitialBalance(String(acc.initial_balance));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus rekening ini?')) return;
    setError(null);
    const res = await deleteAccountAction(id);
    if (!res.success) setError(res.error || 'Gagal menghapus rekening.');
    else router.refresh();
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTrLoading(true);
    const res = await createTransferAction({
      from_account_id: fromId,
      to_account_id: toId,
      amount: Number(trAmount),
      transfer_date: trDate,
      notes: trNotes,
    });
    setTrLoading(false);

    if (!res.success) {
      setError(res.error || 'Gagal melakukan transfer.');
      return;
    }
    setTrAmount('');
    setTrNotes('');
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Total Saldo Card */}
      <Card>
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Saldo Seluruh Rekening Aktif</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">{formatRupiah(totalSaldo)}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>

      {/* Account List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <Card key={acc.id} className={!acc.is_active ? 'opacity-60' : ''}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-sm">{acc.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{ACCOUNT_TYPE_LABELS[acc.type]}</p>
                </div>
                <Badge variant={acc.is_active ? 'success' : 'secondary'}>
                  {acc.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-slate-500">Saldo Saat Ini</p>
                <p className="text-xl font-extrabold mt-0.5">{formatRupiah(acc.current_balance)}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Masuk: +{formatRupiah(acc.total_income + acc.transfer_in)}</span>
                <span className="text-right">Keluar: -{formatRupiah(acc.total_expense + acc.transfer_out)}</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => handleEdit(acc)}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    await toggleAccountActiveAction(acc.id, !acc.is_active);
                    router.refresh();
                  }}
                >
                  <Power className="w-3.5 h-3.5" /> {acc.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(acc.id)} className="text-rose-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Forms: Add/Edit Account & Transfer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Rekening' : 'Tambah Rekening Baru'}</CardTitle>
            <CardDescription>Kelola sumber dana Cash, Bank, E-Wallet, atau Tabungan.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nama Rekening</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Bank Mandiri / GoPay"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Jenis Rekening</Label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AccountType)}
                    className="flex h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                  >
                    <option value="bank">Bank</option>
                    <option value="cash">Cash / Tunai</option>
                    <option value="ewallet">E-Wallet</option>
                    <option value="savings">Tabungan</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Saldo Awal (Rp)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  <Plus className="w-4 h-4" /> {editingId ? 'Simpan Perubahan' : 'Tambah Rekening'}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setName('');
                      setInitialBalance('0');
                    }}
                  >
                    Batal
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" /> Transfer Antar Rekening
            </CardTitle>
            <CardDescription>
              Pindah saldo antar rekening tanpa dihitung sebagai pemasukan atau pengeluaran.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeAccounts.length < 2 ? (
              <p className="text-xs text-slate-500 py-6">
                Minimal diperlukan 2 rekening aktif untuk melakukan transfer antar rekening.
              </p>
            ) : (
              <form onSubmit={handleTransfer} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Dari Rekening</Label>
                    <select
                      value={fromId}
                      onChange={(e) => setFromId(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                    >
                      {activeAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Ke Rekening</Label>
                    <select
                      value={toId}
                      onChange={(e) => setToId(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                    >
                      {activeAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nominal (Rp)</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="100000"
                      value={trAmount}
                      onChange={(e) => setTrAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tanggal</Label>
                    <Input
                      type="date"
                      value={trDate}
                      onChange={(e) => setTrDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Catatan (Opsional)</Label>
                  <Input
                    value={trNotes}
                    onChange={(e) => setTrNotes(e.target.value)}
                    placeholder="Contoh: Topup e-wallet bulanan"
                  />
                </div>
                <Button type="submit" disabled={trLoading}>
                  {trLoading ? 'Memproses...' : 'Kirim Transfer'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transfer History */}
      {transfers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transfer Antar Rekening</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
            {transfers.map((tr) => (
              <div key={tr.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <p className="font-semibold">
                    {tr.from_account?.name} → {tr.to_account?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDateIndo(tr.transfer_date)} {tr.notes ? `• ${tr.notes}` : ''}
                  </p>
                </div>
                <span className="font-bold text-blue-600">{formatRupiah(tr.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
