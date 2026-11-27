export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  allocatedAmount: number;
  month: string; // YYYY-MM
  icon?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category?: string;
  color?: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  category: string;
  isPaid: boolean;
  paidDate?: string;
  recurring: 'monthly' | 'one-time' | 'yearly';
  reminderDays: number;
}

export interface UserProfile {
  name: string;
  email: string;
  monthlyIncomeTarget: number;
  currency: string;
}

export interface CategoryOption {
  name: string;
  type: TransactionType | 'both';
  icon: string;
  color: string;
}
