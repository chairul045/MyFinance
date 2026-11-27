'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wallet, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { onboardingSchema, type OnboardingInput } from '@/schemas/auth';
import { completeOnboardingAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OnboardingPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema) as any,
    defaultValues: {
      fullName: '',
      currency: 'IDR',
      initialBalance: 0,
      accountName: 'Dompet Utama',
      accountType: 'bank',
    },
  });

  const onSubmit = async (data: OnboardingInput) => {
    setServerError(null);
    const result = await completeOnboardingAction(data);
    if (!result.success) {
      setServerError(result.error || 'Gagal menyimpan data onboarding.');
      if (result.redirectTo) router.push(result.redirectTo);
      return;
    }
    router.push(result.redirectTo || '/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Fintrack
          </span>
        </div>

        <Card>
          <CardHeader>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 mb-1">
              <Sparkles className="w-4 h-4" /> Langkah Awal
            </div>
            <CardTitle>Siapkan Profil & Rekening Pertama Anda</CardTitle>
            <CardDescription>
              Lengkapi 5 informasi dasar berikut agar Fintrack dapat menghitung saldo Anda secara akurat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                  {serverError}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="fullName">1. Nama Pengguna</Label>
                <Input
                  id="fullName"
                  placeholder="Contoh: Budi Santoso"
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <p className="text-xs text-rose-600">{errors.fullName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currency">2. Mata Uang Utama</Label>
                  <select
                    id="currency"
                    className="flex h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    {...register('currency')}
                  >
                    <option value="IDR">IDR (Rupiah)</option>
                    <option value="USD">USD (Dolar AS)</option>
                    <option value="SGD">SGD (Dolar Singapura)</option>
                    <option value="MYR">MYR (Ringgit)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="initialBalance">3. Saldo Awal (Rp)</Label>
                  <Input
                    id="initialBalance"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0"
                    {...register('initialBalance')}
                  />
                  {errors.initialBalance && (
                    <p className="text-xs text-rose-600">{errors.initialBalance.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="accountName">4. Nama Rekening Pertama</Label>
                  <Input
                    id="accountName"
                    placeholder="Contoh: BCA Utama"
                    {...register('accountName')}
                  />
                  {errors.accountName && (
                    <p className="text-xs text-rose-600">{errors.accountName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="accountType">5. Jenis Rekening</Label>
                  <select
                    id="accountType"
                    className="flex h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    {...register('accountType')}
                  >
                    <option value="bank">Bank</option>
                    <option value="cash">Cash / Tunai</option>
                    <option value="ewallet">E-Wallet</option>
                    <option value="savings">Tabungan (Savings)</option>
                  </select>
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menyiapkan Dashboard...
                  </>
                ) : (
                  <>
                    Mulai Gunakan Fintrack <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
