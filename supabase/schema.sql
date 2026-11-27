-- =================================================================
-- SKEMA DATABASE SUPABASE UNTUK MYFINANCE
-- Jalankan skrip ini di Dashboard Supabase -> SQL Editor -> New Query
-- =================================================================

-- 1. Tabel Profil Pengguna (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  monthly_income_target NUMERIC(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'IDR',
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabel Transaksi (Transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(15,2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabel Anggaran (Budgets)
CREATE TABLE IF NOT EXISTS public.budgets (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  category TEXT NOT NULL,
  allocated_amount NUMERIC(15,2) NOT NULL,
  month TEXT NOT NULL, -- Format YYYY-MM
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabel Target Tabungan (Savings Goals)
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(15,2) NOT NULL,
  current_amount NUMERIC(15,2) DEFAULT 0,
  target_date DATE NOT NULL,
  category TEXT,
  color TEXT DEFAULT '#10b981',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabel Pengingat Tagihan (Bills)
CREATE TABLE IF NOT EXISTS public.bills (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  due_date DATE NOT NULL,
  category TEXT,
  is_paid BOOLEAN DEFAULT false,
  paid_date DATE,
  recurring TEXT DEFAULT 'monthly',
  reminder_days INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing untuk pencarian cepat berdasarkan email
CREATE INDEX IF NOT EXISTS idx_tx_user_email ON public.transactions(user_email);
CREATE INDEX IF NOT EXISTS idx_budget_user_email ON public.budgets(user_email);
CREATE INDEX IF NOT EXISTS idx_savings_user_email ON public.savings_goals(user_email);
CREATE INDEX IF NOT EXISTS idx_bills_user_email ON public.bills(user_email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Buat Policy Akses (Mengizinkan akses baca & tulis penuh untuk anon/authenticated user)
CREATE POLICY "Allow public all access on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on budgets" ON public.budgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on savings_goals" ON public.savings_goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on bills" ON public.bills FOR ALL USING (true) WITH CHECK (true);
