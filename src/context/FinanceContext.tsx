'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  Budget,
  SavingsGoal,
  Bill,
  UserProfile,
  UserAccount,
} from '@/types/finance';
import {
  INITIAL_BUDGETS,
  INITIAL_TRANSACTIONS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_BILLS,
} from '@/data/initialData';
import { supabase } from '@/lib/supabase';

export const DEFAULT_ADMIN: UserAccount = {
  name: 'Chairul Anwar (Admin)',
  email: 'Chairulanwarr003@gmail.com',
  password: 'Chirull00_',
  role: 'admin',
  createdAt: '2026-11-27T00:00:00Z',
};

// Helper for real current YYYY-MM
export const getRealCurrentMonth = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

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
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  
  // Auth methods
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  
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
  
  // Calculations - Akumulatif Keseluruhan (Real-Time Saldo Dompet)
  allIncome: number;
  allExpense: number;
  currentBalance: number; // Sisa uang bersih akumulatif (Pemasukan - Pengeluaran)
  
  // Calculations - Bulan Berjalan
  totalIncome: number; // Pemasukan bulan aktif
  totalExpense: number; // Pengeluaran bulan aktif
  monthBalance: number; // Surplus/defisit bulan aktif
  totalSavings: number; // Total tabungan
  categorySpending: Record<string, number>;
  budgetAlerts: { category: string; spent: number; limit: number; percent: number }[];
  
  // Data management
  loadDemoData: () => void;
  clearAllData: () => void;
  exportBackup: () => void;
  importBackup: (jsonData: string) => boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCOUNTS: 'myfinance_registered_accounts',
  SESSION: 'myfinance_active_session_email',
  THEME: 'myfinance_theme',
};

const getUserDataKey = (email: string) => `myfinance_userdata_${email.toLowerCase().trim()}`;

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentMonth, setCurrentMonth] = useState(getRealCurrentMonth());
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  const [user, setUser] = useState<UserProfile>({
    name: '',
    email: '',
    monthlyIncomeTarget: 0,
    currency: 'IDR',
    role: 'user',
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);

  // Initialize and load accounts / session
  useEffect(() => {
    try {
      // 1. Ensure registered accounts list exists with DEFAULT_ADMIN
      const savedAccountsRaw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      let accounts: UserAccount[] = savedAccountsRaw ? JSON.parse(savedAccountsRaw) : [];
      
      const adminExists = accounts.some(
        a => a.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase()
      );
      if (!adminExists) {
        accounts = [DEFAULT_ADMIN, ...accounts];
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      } else {
        // Update admin password if changed
        accounts = accounts.map(a =>
          a.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase()
            ? { ...a, password: DEFAULT_ADMIN.password, role: 'admin' }
            : a
        );
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      }

      // 2. Load theme
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as 'dark' | 'light' | null;
      if (savedTheme) {
        setThemeState(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else {
        document.documentElement.classList.add('dark');
      }

      // 3. Check active session
      const activeSessionEmail = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (activeSessionEmail) {
        const foundAccount = accounts.find(
          a => a.email.toLowerCase() === activeSessionEmail.toLowerCase()
        );
        if (foundAccount) {
          loadUserData(foundAccount.email, foundAccount.name, foundAccount.role);
          setIsLoggedIn(true);
        }
      }
    } catch (e) {
      console.error('Failed to initialize FinanceContext:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Helper to load or initialize user data with Supabase Cloud Sync
  const loadUserData = async (email: string, name: string, role: 'admin' | 'user' = 'user') => {
    const dataKey = getUserDataKey(email);
    const storedDataRaw = localStorage.getItem(dataKey);

    // Initial local baseline
    if (storedDataRaw) {
      try {
        const parsed = JSON.parse(storedDataRaw);
        setUser(parsed.user || { name, email, monthlyIncomeTarget: 0, currency: 'IDR', role });
        setTransactions(parsed.transactions || []);
        setBudgets(parsed.budgets || []);
        setSavingsGoals(parsed.savingsGoals || []);
        setBills(parsed.bills || []);

        if (parsed.transactions && parsed.transactions.length > 0) {
          const latestTx = parsed.transactions[0];
          if (latestTx.date && latestTx.date.length >= 7) {
            setCurrentMonth(latestTx.date.slice(0, 7));
          }
        }
      } catch (err) {
        console.error('Failed to parse user data:', err);
      }
    } else {
      const initialClean = {
        user: { name, email, monthlyIncomeTarget: 0, currency: 'IDR', role },
        transactions: [],
        budgets: [],
        savingsGoals: [],
        bills: [],
      };
      setUser(initialClean.user);
      setTransactions(initialClean.transactions);
      setBudgets(initialClean.budgets);
      setSavingsGoals(initialClean.savingsGoals);
      setBills(initialClean.bills);
      localStorage.setItem(dataKey, JSON.stringify(initialClean));
    }

    // Supabase Cloud Fetch if configured
    if (supabase) {
      try {
        const [txRes, budgetRes, savingsRes, billsRes] = await Promise.all([
          supabase.from('transactions').select('*').eq('user_email', email).order('date', { ascending: false }),
          supabase.from('budgets').select('*').eq('user_email', email),
          supabase.from('savings_goals').select('*').eq('user_email', email),
          supabase.from('bills').select('*').eq('user_email', email),
        ]);

        if (txRes.data && txRes.data.length > 0) {
          const mappedTx: Transaction[] = txRes.data.map(t => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount),
            category: t.category,
            date: t.date,
            description: t.description || '',
            paymentMethod: t.payment_method || '',
            createdAt: t.created_at || new Date().toISOString(),
          }));
          setTransactions(mappedTx);
        }

        if (budgetRes.data && budgetRes.data.length > 0) {
          const mappedBudgets: Budget[] = budgetRes.data.map(b => ({
            id: b.id,
            category: b.category,
            allocatedAmount: Number(b.allocated_amount),
            month: b.month,
          }));
          setBudgets(mappedBudgets);
        }

        if (savingsRes.data && savingsRes.data.length > 0) {
          const mappedSavings: SavingsGoal[] = savingsRes.data.map(s => ({
            id: s.id,
            name: s.name,
            targetAmount: Number(s.target_amount),
            currentAmount: Number(s.current_amount || 0),
            targetDate: s.target_date,
            category: s.category || '',
            color: s.color || '#10b981',
          }));
          setSavingsGoals(mappedSavings);
        }

        if (billsRes.data && billsRes.data.length > 0) {
          const mappedBills: Bill[] = billsRes.data.map(b => ({
            id: b.id,
            name: b.name,
            amount: Number(b.amount),
            dueDate: b.due_date,
            category: b.category || '',
            isPaid: Boolean(b.is_paid),
            paidDate: b.paid_date || undefined,
            recurring: b.recurring || 'monthly',
            reminderDays: b.reminder_days || 3,
          }));
          setBills(mappedBills);
        }
      } catch (cloudErr) {
        // Fallback to local storage gracefully if Supabase tables are not yet migrated
        console.warn('Supabase cloud fetch note:', cloudErr);
      }
    }
  };

  // Sync current user's data to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded || !isLoggedIn || !user.email) return;
    try {
      const dataKey = getUserDataKey(user.email);
      const dataToSave = {
        user,
        transactions,
        budgets,
        savingsGoals,
        bills,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(dataKey, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to sync user data to localStorage:', e);
    }
  }, [user, transactions, budgets, savingsGoals, bills, isLoggedIn, isLoaded]);

  // Auth: Login
  const login = (emailInput: string, passwordInput: string): { success: boolean; error?: string } => {
    try {
      const cleanEmail = emailInput.toLowerCase().trim();
      const savedAccountsRaw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      const accounts: UserAccount[] = savedAccountsRaw ? JSON.parse(savedAccountsRaw) : [DEFAULT_ADMIN];

      const found = accounts.find(
        a => a.email.toLowerCase().trim() === cleanEmail
      );

      if (!found) {
        return { success: false, error: 'Email atau kata sandi tidak cocok. Silakan periksa kembali.' };
      }

      if (found.password !== passwordInput) {
        return { success: false, error: 'Email atau kata sandi tidak cocok. Silakan periksa kembali.' };
      }

      // Valid: load user data
      loadUserData(found.email, found.name, found.role);
      localStorage.setItem(STORAGE_KEYS.SESSION, found.email);
      setIsLoggedIn(true);
      return { success: true };
    } catch {
      return { success: false, error: 'Terjadi kesalahan sistem saat login.' };
    }
  };

  // Auth: Register (New account is strictly clean/empty)
  const register = (
    nameInput: string,
    emailInput: string,
    passwordInput: string
  ): { success: boolean; error?: string } => {
    try {
      const cleanEmail = emailInput.toLowerCase().trim();
      if (!cleanEmail || !nameInput.trim() || !passwordInput) {
        return { success: false, error: 'Semua kolom wajib diisi.' };
      }

      const savedAccountsRaw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      const accounts: UserAccount[] = savedAccountsRaw ? JSON.parse(savedAccountsRaw) : [DEFAULT_ADMIN];

      const alreadyExists = accounts.some(a => a.email.toLowerCase().trim() === cleanEmail);
      if (alreadyExists) {
        return { success: false, error: 'Email ini sudah terdaftar. Silakan langsung masuk (login).' };
      }

      // Create new account
      const newAccount: UserAccount = {
        name: nameInput.trim(),
        email: cleanEmail,
        password: passwordInput,
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      const updatedAccounts = [...accounts, newAccount];
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updatedAccounts));

      // Strictly empty initial real data
      const initialClean = {
        user: {
          name: newAccount.name,
          email: newAccount.email,
          monthlyIncomeTarget: 0,
          currency: 'IDR',
          role: 'user' as const,
        },
        transactions: [],
        budgets: [],
        savingsGoals: [],
        bills: [],
      };

      const dataKey = getUserDataKey(cleanEmail);
      localStorage.setItem(dataKey, JSON.stringify(initialClean));

      // Sync profile to Supabase if configured
      if (supabase) {
        supabase.from('profiles').upsert([
          {
            email: cleanEmail,
            name: newAccount.name,
            role: 'user',
          },
        ]).then();
      }

      // Automatically log them in
      setUser(initialClean.user);
      setTransactions([]);
      setBudgets([]);
      setSavingsGoals([]);
      setBills([]);
      localStorage.setItem(STORAGE_KEYS.SESSION, cleanEmail);
      setIsLoggedIn(true);

      return { success: true };
    } catch {
      return { success: false, error: 'Gagal membuat akun baru.' };
    }
  };

  // Auth: Logout
  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  // Theme
  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Load sample demo data
  const loadDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setBills(INITIAL_BILLS);
    setUser(prev => ({ ...prev, monthlyIncomeTarget: 5000000 }));
    setCurrentMonth('2026-11');
  };

  // Completely wipe data (real empty)
  const clearAllData = () => {
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    setBills([]);
    setUser(prev => ({ ...prev, monthlyIncomeTarget: 0 }));

    if (supabase && user.email) {
      supabase.from('transactions').delete().eq('user_email', user.email).then();
      supabase.from('budgets').delete().eq('user_email', user.email).then();
      supabase.from('savings_goals').delete().eq('user_email', user.email).then();
      supabase.from('bills').delete().eq('user_email', user.email).then();
    }
  };

  // Transaction Actions - DUAL INSTANT LOCAL + SUPABASE CLOUD
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    if (tx.date && tx.date.length >= 7) {
      const txMonth = tx.date.slice(0, 7);
      setCurrentMonth(txMonth);
    }

    setTransactions(prev => [newTx, ...prev]);

    // Push to Supabase
    if (supabase && user.email) {
      supabase.from('transactions').insert([
        {
          id: newTx.id,
          user_email: user.email,
          type: newTx.type,
          amount: newTx.amount,
          category: newTx.category,
          date: newTx.date,
          description: newTx.description,
          payment_method: newTx.paymentMethod,
        },
      ]).then();
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));

    if (supabase) {
      supabase.from('transactions').delete().eq('id', id).then();
    }
  };

  // Budget Actions
  const setBudget = (budgetData: Omit<Budget, 'id'>) => {
    const budgetId = 'b-' + Date.now();
    setBudgets(prev => {
      const existingIdx = prev.findIndex(
        b => b.category === budgetData.category && b.month === budgetData.month
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], ...budgetData };
        return updated;
      }
      return [...prev, { ...budgetData, id: budgetId }];
    });

    if (supabase && user.email) {
      supabase.from('budgets').upsert([
        {
          id: budgetId,
          user_email: user.email,
          category: budgetData.category,
          allocated_amount: budgetData.allocatedAmount,
          month: budgetData.month,
        },
      ]).then();
    }
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));

    if (supabase) {
      supabase.from('budgets').delete().eq('id', id).then();
    }
  };

  // Savings Actions
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: 'sg-' + Date.now(),
    };
    setSavingsGoals(prev => [...prev, newGoal]);

    if (supabase && user.email) {
      supabase.from('savings_goals').insert([
        {
          id: newGoal.id,
          user_email: user.email,
          name: newGoal.name,
          target_amount: newGoal.targetAmount,
          current_amount: newGoal.currentAmount,
          target_date: newGoal.targetDate,
          category: newGoal.category,
          color: newGoal.color,
        },
      ]).then();
    }
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(s => s.id !== id));

    if (supabase) {
      supabase.from('savings_goals').delete().eq('id', id).then();
    }
  };

  const adjustSavingsAmount = (id: string, amountChange: number) => {
    setSavingsGoals(prev =>
      prev.map(goal => {
        if (goal.id === id) {
          const newAmount = Math.max(0, goal.currentAmount + amountChange);
          if (supabase) {
            supabase.from('savings_goals').update({ current_amount: newAmount }).eq('id', id).then();
          }
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

    if (supabase && user.email) {
      supabase.from('bills').insert([
        {
          id: newBill.id,
          user_email: user.email,
          name: newBill.name,
          amount: newBill.amount,
          due_date: newBill.dueDate,
          category: newBill.category,
          is_paid: newBill.isPaid,
          recurring: newBill.recurring,
          reminder_days: newBill.reminderDays,
        },
      ]).then();
    }
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));

    if (supabase) {
      supabase.from('bills').delete().eq('id', id).then();
    }
  };

  const toggleBillPaid = (id: string) => {
    setBills(prev =>
      prev.map(b => {
        if (b.id === id) {
          const nextState = !b.isPaid;
          const paidDate = nextState ? new Date().toISOString().split('T')[0] : undefined;
          if (supabase) {
            supabase.from('bills').update({ is_paid: nextState, paid_date: paidDate }).eq('id', id).then();
          }
          return {
            ...b,
            isPaid: nextState,
            paidDate,
          };
        }
        return b;
      })
    );
  };

  // ==========================================
  // REAL-TIME ACCUMULATED FINANCIAL METRICS
  // ==========================================

  const allIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const allExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = allIncome - allExpense;

  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthBalance = totalIncome - totalExpense;

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
    a.download = `myfinance-${user.email || 'backup'}-${new Date().toISOString().split('T')[0]}.json`;
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
        theme,
        setTheme,
        login,
        register,
        logout,
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
        allIncome,
        allExpense,
        currentBalance,
        totalIncome,
        totalExpense,
        monthBalance,
        totalSavings,
        categorySpending,
        budgetAlerts,
        loadDemoData,
        clearAllData,
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
