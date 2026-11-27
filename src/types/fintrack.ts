export type AccountType = 'cash' | 'bank' | 'ewallet' | 'savings';
export type TransactionType = 'income' | 'expense';
export type FrequencyType = 'weekly' | 'monthly' | 'yearly';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  currency: string;
  timezone: string;
  theme: 'light' | 'dark';
  onboarding_completed: boolean;
  notify_budget: boolean;
  notify_bills: boolean;
  notify_savings: boolean;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  initial_balance: number;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountWithBalance extends Account {
  current_balance: number;
  total_income: number;
  total_expense: number;
  transfer_in: number;
  transfer_out: number;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  is_default: boolean;
}

export interface TransactionRecord {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  transaction_date: string;
  description: string;
  notes: string | null;
  recurring_transaction_id: string | null;
  created_at: string;
  account?: { id: string; name: string; type: AccountType } | null;
  category?: { id: string; name: string; color: string; icon: string } | null;
  attachments?: { id: string; file_path: string; file_name: string; mime_type: string }[];
}

export interface TransferRecord {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  transfer_date: string;
  notes: string | null;
  created_at: string;
  from_account?: { id: string; name: string } | null;
  to_account?: { id: string; name: string } | null;
}

export interface BudgetRecord {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: number;
  year: number;
  category?: { id: string; name: string; color: string } | null;
}

export interface SavingsGoalRecord {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  target_date: string;
  color: string;
  is_completed: boolean;
  created_at: string;
}

export interface SavingsContributionRecord {
  id: string;
  user_id: string;
  goal_id: string;
  account_id: string | null;
  amount: number;
  contribution_date: string;
  notes: string | null;
}

export interface BillRecord {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_date: string;
  category_id: string | null;
  account_id: string | null;
  is_recurring: boolean;
  frequency: FrequencyType | null;
  reminder_days: number;
  is_paid: boolean;
  category?: { id: string; name: string } | null;
  account?: { id: string; name: string } | null;
}

export interface RecurringTransactionRecord {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  frequency: FrequencyType;
  start_date: string;
  next_run_date: string;
  last_run_date: string | null;
  is_active: boolean;
  account?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}
