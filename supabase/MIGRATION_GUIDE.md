## Fintrack – Full SQL Migration

Jalankan file ini di **Supabase Dashboard → SQL Editor → New Query**, lalu klik **Run**.

File migration tersimpan di: `supabase/migrations/20261127000001_fintrack_schema.sql`

### Langkah-langkah:
1. Buka https://supabase.com/dashboard/project/bnenitkgajjhpyipmbek
2. Klik **SQL Editor** → **+ New query**
3. Copy seluruh isi file `supabase/migrations/20261127000001_fintrack_schema.sql`
4. Paste ke editor, klik **RUN**
5. Pastikan semua tabel terbuat tanpa error

### Tabel yang akan dibuat:
1. `profiles` – profil pengguna (terhubung ke `auth.users`)
2. `accounts` – rekening (Cash, Bank, E-Wallet, Savings)
3. `categories` – kategori income/expense
4. `recurring_transactions` – jadwal transaksi berulang
5. `transactions` – transaksi income/expense
6. `transfers` – transfer antar rekening
7. `budgets` – anggaran bulanan per kategori
8. `savings_goals` – target tabungan
9. `savings_contributions` – riwayat setoran tabungan
10. `bills` – tagihan
11. `bill_payments` – riwayat pembayaran tagihan
12. `notifications` – notifikasi sistem
13. `attachments` – bukti transaksi (referensi ke private Storage)
14. `monthly_notes` – catatan bulanan

### Storage:
- Private bucket `receipts` sudah dibuat otomatis via SQL
- RLS bucket: hanya pemilik yang dapat upload/download

### Environment Variables di Vercel:
Pastikan sudah ada di Vercel → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` = URL produksi Vercel Anda (untuk link reset password)
