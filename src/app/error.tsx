'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Terjadi Kesalahan Server
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {error?.message?.includes('Konfigurasi Supabase')
              ? error.message
              : 'Pastikan konfigurasi environment Supabase dan migrasi database sudah dijalankan dengan benar.'}
          </p>
          {error?.digest && (
            <p className="text-[11px] text-slate-400 font-mono">Digest: {error.digest}</p>
          )}
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button size="sm" onClick={() => reset()}>
            <RefreshCw className="w-4 h-4" /> Coba Lagi
          </Button>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <LogIn className="w-4 h-4" /> Ke Halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}
