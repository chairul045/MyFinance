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

export const DEFAULT_ADMIN: UserAccount = {
  name: 'Chairul Anwar (Admin)',
  email: 'Chairulanwarr003@gmail.com',
  password: 'Chirull00_',
  role: 'admin',
  createdAt: '2026-11-27T00:00:00Z',
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
  
  // Calculations
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  totalSavings: number;
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
  const [currentMonth, setCurrentMonth] = useState('2026-11');
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

  // Helper to load or initialize user data
  const loadUserData = (email: string, name: string, role: 'admin' | 'user' = 'user') => {
    const dataKey = getUserDataKey(email);
    const storedDataRaw = localStorage.getItem(dataKey);

    if (storedDataRaw) {
      try {
        const parsed = JSON.parse(storedDataRaw);
        setUser(parsed.user || { name, email, monthlyIncomeTarget: 0, currency: 'IDR', role });
        setTransactions(parsed.transactions || []);
        setBudgets(parsed.budgets || []);
        setSavingsGoals(parsed.savingsGoals || []);
        setBills(parsed.bills || []);
        return;
      } catch (err) {
        console.error('Failed to parse user data:', err);
      }
    }

    // New clean data
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
      const savedAccountsRaw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      const accounts: UserAccount[] = savedAccountsRaw ? JSON.parse(savedAccountsRaw) : [DEFAULT_ADMIN];

      const found = accounts.find(
        a => a.email.toLowerCase().trim() === emailInput.toLowerCase().trim()
      );

      if (!found) {
        return { success: false, error: 'Email belum terdaftar. Silakan buat akun baru.' };
      }

      if (found.password !== passwordInput) {
        return { success: false, error: 'Kata sandi salah. Silakan coba lagi.' };
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
  };

  // Completely wipe data (real empty)
  const clearAllData = () => {
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    setBills([]);
    setUser(prev => ({ ...prev, monthlyIncomeTarget: 0 }));
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
        totalIncome,
        totalExpense,
        currentBalance,
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
