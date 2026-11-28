'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wallet, User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@/schemas/auth';
import { registerAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    setServerMessage(null);
    const result = await registerAction(data);
    if (!result.success) {
      setServerError(result.error || 'Gagal mendaftar.');
      if (result.redirectTo) {
        setIsRedirecting(true);
        setTimeout(() => {
          router.push(result.redirectTo!);
        }, 2000);
      }
      return;
    }

    if (result.redirectTo) {
      if (result.message) {
        setServerMessage(result.message);
        setIsRedirecting(true);
        setTimeout(() => {
          router.push(result.redirectTo!);
        }, 1800);
      } else {
        router.push(result.redirectTo);
        router.refresh();
      }
      return;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
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
            <CardTitle>Buat Akun Baru</CardTitle>
            <CardDescription>
              Mulai kelola pemasukan, anggaran, tabungan, dan tagihan Anda dengan rapi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 space-y-2">
                  <p className="leading-relaxed">{serverError}</p>
                  {(serverError.toLowerCase().includes('masuk') ||
                    serverError.toLowerCase().includes('login') ||
                    serverError.toLowerCase().includes('terdaftar')) && (
                    <Link
                      href="/login"
                      className="inline-block font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      → Buka Halaman Login Sekarang
                    </Link>
                  )}
                </div>
              )}
              {serverMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 space-y-2">
                  <p className="leading-relaxed">{serverMessage}</p>
                  <Link
                    href="/login"
                    className="inline-block font-semibold text-emerald-800 dark:text-emerald-200 underline"
                  >
                    → Menuju Halaman Login...
                  </Link>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="fullName"
                    placeholder="Budi Santoso"
                    className="pl-9"
                    disabled={isSubmitting || isRedirecting}
                    {...register('fullName')}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-rose-600">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    className="pl-9"
                    disabled={isSubmitting || isRedirecting}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    className="pl-9"
                    disabled={isSubmitting || isRedirecting}
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Ulangi password"
                    className="pl-9"
                    disabled={isSubmitting || isRedirecting}
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || isRedirecting}>
                {isSubmitting || isRedirecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />{' '}
                    {isRedirecting ? 'Mengalihkan ke halaman...' : 'Memproses Pendaftaran...'}
                  </>
                ) : (
                  <>
                    Daftar Sekarang <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                Masuk di sini
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
