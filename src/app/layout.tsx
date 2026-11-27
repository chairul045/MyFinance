import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fintrack – Pengelolaan Keuangan Pribadi',
  description:
    'Kelola pemasukan, pengeluaran, anggaran, tabungan, dan tagihan Anda secara real-time dengan Fintrack.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
