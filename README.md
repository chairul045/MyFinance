# MyFinance – Personal Finance Management System

Aplikasi manajemen keuangan pribadi modern dengan estetika 21st UI yang dirancang dengan Next.js 14, TypeScript, Tailwind CSS, Recharts, jsPDF, dan SheetJS.

## Fitur Utama

1. **Dashboard Arus Kas**
   - Saldo saat ini, total pemasukan, total pengeluaran, total tabungan
   - Grafik interaktif pemasukan vs pengeluaran (Recharts)
   - Donut chart distribusi pengeluaran per kategori
   - Peringatan dini anggaran dan ringkasan tagihan terdekat

2. **Manajemen Transaksi**
   - Catat pemasukan dan pengeluaran harian
   - Filter berdasarkan jenis (Masuk/Keluar), kategori, dan kata kunci
   - Hapus & sortir data secara instan

3. **Anggaran Bulanan (Budgeting)**
   - Penetapan batas pengeluaran per kategori (Makan, Transportasi, Hiburan, dll)
   - Template otomatis alokasi ideal Rp5.000.000 (Makan 20%, Tabungan 24%, dll)
   - Indikator visual progres dan peringatan dini saat anggaran mendekati batas (>75% / >100%)

4. **Target Tabungan (Savings Goals)**
   - Buat impian menabung dengan nominal target dan tanggal pencapaian
   - Setor dan tarik dana tabungan secara mudah
   - Indikator persentase pencapaian serta selebrasi target tercapai

5. **Pengingat Tagihan (Bill Reminders)**
   - Catat tagihan rutin (Listrik PLN, WiFi Indihome, BPJS, Cicilan)
   - Countdown tanggal jatuh tempo dan peringatan keterlambatan
   - Tandai lunas dengan opsi pencatatan otomatis ke transaksi pengeluaran

6. **Laporan & Evaluasi Keuangan**
   - Perbandingan multi-bulan
   - Tingkat tabungan (*Savings Rate*)
   - **Export Laporan PDF** profesional dengan tabel mutasi (jsPDF + autoTable)
   - **Export Laporan Excel** (.xlsx dengan Sheet Ringkasan, Transaksi, & Anggaran)

7. **Landing Page & Pengaturan**
   - Landing page modern dengan informasi alur siklus keuangan
   - Pengaturan profil & target pemasukan
   - Mode Dark / Light yang nyaman di mata
   - Backup & Restore data via JSON

## Menjalankan Aplikasi

```bash
# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.
