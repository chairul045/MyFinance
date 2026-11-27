-- ============================================================================
-- FINTRACK - PERSONAL FINANCE MANAGEMENT
-- Migration: Full 14-Table Schema, Indexes, Triggers, Storage & Strict RLS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  currency TEXT NOT NULL DEFAULT 'IDR',
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  notify_budget BOOLEAN NOT NULL DEFAULT true,
  notify_bills BOOLEAN NOT NULL DEFAULT true,
  notify_savings BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ACCOUNTS
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'ewallet', 'savings')),
  initial_balance NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (initial_balance >= 0),
  color TEXT NOT NULL DEFAULT '#2563eb',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT NOT NULL DEFAULT 'tag',
  color TEXT NOT NULL DEFAULT '#2563eb',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name, type)
);

-- 4. RECURRING TRANSACTIONS (dibuat sebelum transactions agar bisa direferensikan)
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  next_run_date DATE NOT NULL,
  last_run_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  recurring_transaction_id UUID REFERENCES public.recurring_transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TRANSFERS
CREATE TABLE IF NOT EXISTS public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  to_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  transfer_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (from_account_id <> to_account_id)
);

-- 7. BUDGETS
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id, month, year)
);

-- 8. SAVINGS GOALS
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(15,2) NOT NULL CHECK (target_amount > 0),
  target_date DATE NOT NULL,
  color TEXT NOT NULL DEFAULT '#10b981',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. SAVINGS CONTRIBUTIONS
CREATE TABLE IF NOT EXISTS public.savings_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  contribution_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. BILLS
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  frequency TEXT CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
  reminder_days INT NOT NULL DEFAULT 3 CHECK (reminder_days >= 0),
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. BILL PAYMENTS
CREATE TABLE IF NOT EXISTS public.bill_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  paid_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. ATTACHMENTS
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. MONTHLY NOTES
CREATE TABLE IF NOT EXISTS public.monthly_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, month, year)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON public.transactions(user_id, account_id);
CREATE INDEX IF NOT EXISTS idx_transfers_user_date ON public.transfers(user_id, transfer_date DESC);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON public.budgets(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON public.savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_contrib_goal ON public.savings_contributions(user_id, goal_id);
CREATE INDEX IF NOT EXISTS idx_bills_user_due ON public.bills(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_bill_payments_bill ON public.bill_payments(user_id, bill_id);
CREATE INDEX IF NOT EXISTS idx_recurring_user_next ON public.recurring_transactions(user_id, next_run_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attachments_tx ON public.attachments(user_id, transaction_id);
CREATE INDEX IF NOT EXISTS idx_monthly_notes_period ON public.monthly_notes(user_id, year, month);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'profiles', 'accounts', 'categories', 'recurring_transactions',
    'transactions', 'transfers', 'budgets', 'savings_goals',
    'savings_contributions', 'bills', 'bill_payments', 'notifications',
    'attachments', 'monthly_notes'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at_%I ON public.%I;', tbl, tbl);
    EXECUTE format('CREATE TRIGGER set_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();', tbl, tbl);
  END LOOP;
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY (STRICT ISOLATION PER AUTH.UID())
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_notes ENABLE ROW LEVEL SECURITY;

-- Profile policies (id = auth.uid())
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Generic user_id isolation policies
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'accounts', 'categories', 'recurring_transactions', 'transactions',
    'transfers', 'budgets', 'savings_goals', 'savings_contributions',
    'bills', 'bill_payments', 'notifications', 'attachments', 'monthly_notes'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Isolate user %I" ON public.%I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "Isolate user %I" ON public.%I FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);', tbl, tbl);
  END LOOP;
END $$;

-- ============================================================================
-- AUTO PROFILE ON SIGNUP TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PRIVATE STORAGE BUCKET FOR RECEIPTS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users manage own receipts" ON storage.objects;
CREATE POLICY "Users manage own receipts"
ON storage.objects FOR ALL
USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
