'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, ShieldCheck } from 'lucide-react';
import { updateProfileSettingsAction } from '@/actions/dashboard';
import { createCategoryAction, deleteCategoryAction } from '@/actions/accounts';
import { resetPasswordAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Profile, Category } from '@/types/fintrack';

export function SettingsClient({
  profile,
  categories,
}: {
  profile: Profile;
  categories: Category[];
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name);
  const [currency, setCurrency] = useState(profile.currency);
  const [timezone, setTimezone] = useState(profile.timezone);
  const [theme, setTheme] = useState<'light' | 'dark'>(profile.theme || 'light');
  const [notifyBudget, setNotifyBudget] = useState(profile.notify_budget);
  const [notifyBills, setNotifyBills] = useState(profile.notify_bills);
  const [notifySavings, setNotifySavings] = useState(profile.notify_savings);

  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'income' | 'expense'>('expense');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    const res = await updateProfileSettingsAction({
      full_name: fullName,
      currency,
      timezone,
      theme,
      notify_budget: notifyBudget,
      notify_bills: notifyBills,
      notify_savings: notifySavings,
    });
    if (!res.success) {
      setError(res.error || 'Gagal menyimpan pengaturan.');
      return;
    }
    setMsg('Pengaturan profil berhasil disimpan.');
    router.refresh();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    const res = await createCategoryAction({ name: catName, type: catType, color: '#2563eb' });
    if (!res.success) {
      setError(res.error || 'Gagal menambah kategori.');
      return;
    }
    setCatName('');
    setMsg('Kategori berhasil ditambahkan.');
    router.refresh();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    const res = await resetPasswordAction({
      password: newPassword,
      confirmPassword,
    });
    if (!res.success) {
      setError(res.error || 'Gagal mengubah password.');
      return;
    }
    setNewPassword('');
    setConfirmPassword('');
    setMsg('Password berhasil diperbarui.');
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profil & Preferensi</CardTitle>
            <CardDescription>Kelola nama pengguna, mata uang, zona waktu, tema, dan notifikasi.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nama Pengguna</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={profile.email} disabled />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Mata Uang</Label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                  >
                    <option value="IDR">IDR</option>
                    <option value="USD">USD</option>
                    <option value="SGD">SGD</option>
                    <option value="MYR">MYR</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Zona Waktu</Label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                  >
                    <option value="Asia/Jakarta">Asia/Jakarta</option>
                    <option value="Asia/Makassar">Asia/Makassar</option>
                    <option value="Asia/Jayapura">Asia/Jayapura</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Tema</Label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                    className="flex h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={notifyBudget} onChange={(e) => setNotifyBudget(e.target.checked)} />
                  Notifikasi peringatan anggaran
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={notifyBills} onChange={(e) => setNotifyBills(e.target.checked)} />
                  Notifikasi tagihan jatuh tempo
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={notifySavings} onChange={(e) => setNotifySavings(e.target.checked)} />
                  Notifikasi target tabungan tercapai
                </label>
              </div>

              <Button type="submit">
                <Save className="w-4 h-4" /> Simpan Pengaturan
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ubah Password</CardTitle>
            <CardDescription>Perbarui password akun Fintrack Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Password Baru</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Konfirmasi Password Baru</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  required
                />
              </div>
              <Button type="submit" variant="outline">
                Perbarui Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {profile.is_admin && (
        <Card className="border-amber-500/40 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    Hak Akses Administrator / Pemilik
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      SUPER ADMIN
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Akun Anda ({profile.email}) memiliki hak akses penuh terhadap seluruh fitur sistem Fintrack.
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400">Status Akses</span>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">Aktif & Unlimited</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400">Database Engine</span>
                <p className="font-semibold text-blue-600 dark:text-blue-400">Supabase PostgreSQL SSR</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400">Level Wewenang</span>
                <p className="font-semibold text-amber-600 dark:text-amber-400">Root Owner / Admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Management */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Kategori</CardTitle>
          <CardDescription>Tambah atau kelola kategori pemasukan dan pengeluaran Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAddCategory} className="flex flex-wrap gap-3">
            <Input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="Nama kategori baru..."
              className="max-w-xs"
              required
            />
            <select
              value={catType}
              onChange={(e) => setCatType(e.target.value as 'income' | 'expense')}
              className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
            >
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
            <Button type="submit">
              <Plus className="w-4 h-4" /> Tambah Kategori
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
              >
                <span>{c.name}</span>
                <Badge variant={c.type === 'income' ? 'success' : 'destructive'}>
                  {c.type === 'income' ? 'Masuk' : 'Keluar'}
                </Badge>
                {!c.is_default && (
                  <button
                    onClick={async () => {
                      const res = await deleteCategoryAction(c.id);
                      if (!res.success) setError(res.error || 'Gagal menghapus kategori.');
                      else router.refresh();
                    }}
                    className="text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
