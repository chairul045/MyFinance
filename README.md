# MyFinance – Personal Finance Management System

[![Deployed with Vercel](https://vercel.com/button)](https://vercel.com)

Aplikasi manajemen keuangan pribadi modern dengan estetika **21st UI** yang dirancang dengan Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, jsPDF, dan SheetJS.

---

## 🔐 Akun & Autentikasi

Aplikasi telah dilengkapi sistem multi-akun terisolasi:

1. **Akun Admin Bawaan**:
   - **Email**: `Chairulanwarr003@gmail.com`
   - **Password**: `Chirull00_`
   - *Tersedia tombol satu-klik "Isi Otomatis Akun Admin" di halaman Login.*

2. **Pendaftaran Akun Baru (User Real)**:
   - Pengguna dapat membuat akun baru menggunakan alamat Gmail atau email mana pun.
   - **Data Real Bersih**: Akun baru dimulai dengan data saldo `Rp0`, 0 transaksi, 0 anggaran, 0 tabungan, dan 0 tagihan, siap digunakan untuk pencatatan keuangan asli.

---

## 🌟 Fitur Utama

1. **Dashboard Arus Kas**
   - Saldo saat ini, total pemasukan, total pengeluaran, total tabungan
   - Grafik interaktif pemasukan vs pengeluaran (Recharts)
   - Donut chart distribusi pengeluaran per kategori
   - Peringatan dini anggaran dan ringkasan tagihan terdekat
   - Opsi *Muat Data Demo* & *Kosongkan Data Real (0)*

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

---

## 🚀 Menjalankan Secara Lokal

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🌐 Deployment (Vercel)

Proyek ini telah dikonfigurasi secara optimal untuk deployment otomatis di [Vercel](https://vercel.com). Setiap push ke branch `main` pada repository GitHub **[chairul045/MyFinance](https://github.com/chairul045/MyFinance)** akan otomatis memicu build dan deploy versi terbaru.
