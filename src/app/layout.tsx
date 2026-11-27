import type { Metadata } from "next";
import "./globals.css";
import { FinanceProvider } from "@/context/FinanceContext";

export const metadata: Metadata = {
  title: "MyFinance – Personal Finance Management",
  description: "Kelola pemasukan, pengeluaran, anggaran bulanan, target tabungan, dan pengingat tagihan dengan cerdas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <FinanceProvider>{children}</FinanceProvider>
      </body>
    </html>
  );
}
