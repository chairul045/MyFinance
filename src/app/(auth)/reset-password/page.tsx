'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wallet, Lock, Loader2 } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordInput } from '@/schemas/auth';
import { resetPasswordAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    const result = await resetPasswordAction(data);
    if (!result.success) {
      setServerError(result.error || 'Gagal memperbarui password.');
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
            <CardTitle>Atur Ulang Password</CardTitle>
            <CardDescription>
              Masukkan password baru Anda untuk mengamankan akun Fintrack.
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
                <Label htmlFor="password">Password Baru</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    className="pl-9"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Ulangi password baru"
                    className="pl-9"
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Password Baru'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
