'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wallet, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/schemas/auth';
import { loginAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const result = await loginAction(data);
    if (!result.success) {
      setServerError(result.error || 'Gagal masuk.');
      return;
    }
    router.push(result.redirectTo || '/dashboard');
    router.refresh();
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
            <CardTitle>Masuk ke Akun Anda</CardTitle>
            <CardDescription>
              Kelola keuangan pribadi bulanan Anda secara aman dan real-time.
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
                    <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
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
      </div>
    </div>
  );
}
