'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  Budget,
  SavingsGoal,
  Bill,
  UserProfile,
} from '@/types/finance';
import {
  INITIAL_USER,
  INITIAL_BUDGETS,
  INITIAL_TRANSACTIONS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_BILLS,
} from '@/data/initialData';

interface FinanceContextType {
  user: UserProfile;
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  bills: Bill[];
  currentMonth: string; // YYYY-MM
  setCurrentMonth: (month: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  
  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  
  // Budgets
  setBudget: (budget: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;
  
  // Savings
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  deleteSavingsGoal: (id: string) => void;
  adjustSavingsAmount: (id: string, amountChange: number) => void;
  
  // Bills
  addBill: (bill: Omit<Bill, 'id'>) => void;
  deleteBill: (id: string) => void;
  toggleBillPaid: (id: string) => void;
  
  // Calculations
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  totalSavings: number;
  categorySpending: Record<string, number>;
  budgetAlerts: { category: string; spent: number; limit: number; percent: number }[];
  
  // Data management
  resetToDefaultData: () => void;
  exportBackup: () => void;
  importBackup: (jsonData: string) => boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'myfinance_user',
  TRANSACTIONS: 'myfinance_transactions',
  BUDGETS: 'myfinance_budgets',
  SAVINGS: 'myfinance_savings',
  BILLS: 'myfinance_bills',
  THEME: 'myfinance_theme',
  LOGGED_IN: 'myfinance_is_logged_in',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentMonth, setCurrentMonth] = useState('2026-11');
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(INITIAL_SAVINGS_GOALS);
  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);

  // Load from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) setUser(JSON.parse(savedUser));

      const savedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (savedTx) setTransactions(JSON.parse(savedTx));

      const savedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (savedBudgets) setBudgets(JSON.parse(savedBudgets));

      const savedSavings = localStorage.getItem(STORAGE_KEYS.SAVINGS);
      if (savedSavings) setSavingsGoals(JSON.parse(savedSavings));

      const savedBills = localStorage.getItem(STORAGE_KEYS.BILLS);
      if (savedBills) setBills(JSON.parse(savedBills));

      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as 'dark' | 'light' | null;
      if (savedTheme) {
        setThemeState(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else {
        document.documentElement.classList.add('dark');
      }

      const savedLoggedIn = localStorage.getItem(STORAGE_KEYS.LOGGED_IN);
      if (savedLoggedIn !== null) {
        setIsLoggedIn(savedLoggedIn === 'true');
      }
    } catch (e) {
      console.error('Failed to parse stored finance data:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savingsGoals));
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      localStorage.setItem(STORAGE_KEYS.LOGGED_IN, String(isLoggedIn));
    } catch (e) {
      console.error('Failed to sync to localStorage:', e);
    }
  }, [user, transactions, budgets, savingsGoals, bills, theme, isLoggedIn, isLoaded]);

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Transaction Actions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Budget Actions
  const setBudget = (budgetData: Omit<Budget, 'id'>) => {
    setBudgets(prev => {
      const existingIdx = prev.findIndex(
        b => b.category === budgetData.category && b.month === budgetData.month
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], ...budgetData };
        return updated;
      }
      return [...prev, { ...budgetData, id: 'b-' + Date.now() }];
    });
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // Savings Actions
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: 'sg-' + Date.now(),
    };
    setSavingsGoals(prev => [...prev, newGoal]);
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(s => s.id !== id));
  };

  const adjustSavingsAmount = (id: string, amountChange: number) => {
    setSavingsGoals(prev =>
      prev.map(goal => {
        if (goal.id === id) {
          const newAmount = Math.max(0, goal.currentAmount + amountChange);
          return { ...goal, currentAmount: newAmount };
        }
        return goal;
      })
    );
  };

  // Bills Actions
  const addBill = (bill: Omit<Bill, 'id'>) => {
    const newBill: Bill = {
      ...bill,
      id: 'bill-' + Date.now(),
    };
    setBills(prev => [...prev, newBill]);
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const toggleBillPaid = (id: string) => {
    setBills(prev =>
      prev.map(b => {
        if (b.id === id) {
          const nextState = !b.isPaid;
          return {
            ...b,
            isPaid: nextState,
            paidDate: nextState ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return b;
      })
    );
  };

  // Calculations for current month
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  const totalSavings = savingsGoals.reduce((sum, s) => sum + s.currentAmount, 0);

  const categorySpending: Record<string, number> = {};
  currentMonthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

  const monthBudgets = budgets.filter(b => b.month === currentMonth);
  const budgetAlerts = monthBudgets
    .map(b => {
      const spent = categorySpending[b.category] || 0;
      const percent = b.allocatedAmount > 0 ? (spent / b.allocatedAmount) * 100 : 0;
      return {
        category: b.category,
        spent,
        limit: b.allocatedAmount,
        percent,
      };
    })
    .filter(b => b.percent >= 75);

  const resetToDefaultData = () => {
    setUser(INITIAL_USER);
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setBills(INITIAL_BILLS);
    localStorage.clear();
  };

  const exportBackup = () => {
    const data = {
      user,
      transactions,
      budgets,
      savingsGoals,
      bills,
      exportedAt: new Date().toISOString(),
      app: 'MyFinance v1.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myfinance-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.transactions && parsed.budgets) {
        if (parsed.user) setUser(parsed.user);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.budgets) setBudgets(parsed.budgets);
        if (parsed.savingsGoals) setSavingsGoals(parsed.savingsGoals);
        if (parsed.bills) setBills(parsed.bills);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        user,
        transactions,
        budgets,
        savingsGoals,
        bills,
        currentMonth,
        setCurrentMonth,
        activeTab,
        setActiveTab,
        isLoggedIn,
        setIsLoggedIn,
        theme,
        setTheme,
        addTransaction,
        deleteTransaction,
        setBudget,
        deleteBudget,
        addSavingsGoal,
        deleteSavingsGoal,
        adjustSavingsAmount,
        addBill,
        deleteBill,
        toggleBillPaid,
        totalIncome,
        totalExpense,
        currentBalance,
        totalSavings,
        categorySpending,
        budgetAlerts,
        resetToDefaultData,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
