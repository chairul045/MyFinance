'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wallet, Mail, Lock, ArrowRight, Loader2, Info } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/schemas/auth';
import { loginAction, resendConfirmationAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const defaultEmail = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: '',
    },
  });

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setValue('email', emailParam);
    }

    if (searchParams.get('registered') === '1') {
      setServerSuccess('Pendaftaran berhasil! Akun Anda telah dibuat. Silakan masukkan password untuk masuk.');
    }

    const err = searchParams.get('error');
    if (err === 'auth_callback_failed') {
      setServerError('Verifikasi email kedaluwarsa atau tidak valid. Silakan masukkan email dan klik tombol kirim ulang verifikasi di bawah.');
    } else if (err === 'verification_failed') {
      setServerError('Tautan verifikasi tidak valid atau telah kedaluwarsa.');
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setServerSuccess(null);
    const result = await loginAction(data);
    if (!result.success) {
      setServerError(result.error || 'Gagal masuk.');
      return;
    }
    router.push(result.redirectTo || '/dashboard');
    router.refresh();
  };

  const handleResendVerification = async () => {
    const email = getValues('email');
    if (!email) {
      setServerError('Ketik email Anda di kolom email terlebih dahulu untuk mengirim ulang verifikasi.');
      return;
    }
    setIsResending(true);
    setServerSuccess(null);
    const res = await resendConfirmationAction(email);
    setIsResending(false);
    if (!res.success) {
      setServerError(res.error || 'Gagal mengirim ulang email verifikasi.');
    } else {
      setServerError(null);
      setServerSuccess(res.message || 'Email verifikasi berhasil dikirim!');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Masuk ke Akun Anda</CardTitle>
        <CardDescription>
          Kelola keuangan pribadi bulanan Anda secara aman dan real-time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 space-y-2">
              <p className="leading-relaxed">{serverError}</p>
              {(serverError.toLowerCase().includes('konfirmasi') ||
                serverError.toLowerCase().includes('verifikasi') ||
                serverError.toLowerCase().includes('confirmed')) && (
                <button
                  type="button"
                  disabled={isResending}
                  onClick={handleResendVerification}
                  className="inline-block mt-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {isResending ? 'Mengirim ulang...' : '→ Klik di sini untuk kirim ulang email verifikasi'}
                </button>
              )}
            </div>
          )}

          {serverSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
              {serverSuccess}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                className="pl-9"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Lupa password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-600">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Memproses Masuk...
              </>
            ) : (
              <>
                Masuk <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-blue-600 hover:underline">
            Daftar sekarang
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
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

        <Suspense fallback={
          <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> Memuat...
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
