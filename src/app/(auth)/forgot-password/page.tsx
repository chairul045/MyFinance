'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wallet, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/schemas/auth';
import { forgotPasswordAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null);
    setServerMessage(null);
    const result = await forgotPasswordAction(data);
    if (!result.success) {
      setServerError(result.error || 'Gagal mengirim tautan reset.');
      return;
    }
    setServerMessage(result.message || 'Tautan reset password telah dikirim.');
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
            <CardTitle>Lupa Password</CardTitle>
            <CardDescription>
              Masukkan email terdaftar untuk menerima tautan reset password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                  {serverError}
                </div>
              )}
              {serverMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
                  {serverMessage}
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Mengirim...
                  </>
                ) : (
                  'Kirim Tautan Reset'
                )}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Halaman Masuk
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
