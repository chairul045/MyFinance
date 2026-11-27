'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { profileSettingsSchema } from '@/schemas/finance';
import {
  getMonthDateRange,
  calculateBudgetProgress,
  calculateExpenseChange,
  calculateSavingRate,
} from '@/lib/finance-calc';
import { getAccountsWithBalances } from './accounts';

export async function getDashboardData(month: number, year: number) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { startDate, endDate } = getMonthDateRange(month, year);

  const [accounts, monthTxRes, recentTxRes, budgetsRes, savingsRes, billsRes] = await Promise.all([
    getAccountsWithBalances(),
    supabase
      .from('transactions')
      .select('id, type, amount, category_id, transaction_date, category:categories(id, name, color)')
      .eq('user_id', user.id)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate),
    supabase
      .from('transactions')
      .select('*, account:accounts(id, name, type), category:categories(id, name, color, icon)')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('budgets')
      .select('*, category:categories(id, name, color)')
      .eq('user_id', user.id)
      .eq('month', month)
      .eq('year', year),
    supabase
      .from('savings_contributions')
      .select('amount')
      .eq('user_id', user.id),
    supabase
      .from('bills')
      .select('*, category:categories(id, name)')
      .eq('user_id', user.id)
      .eq('is_paid', false)
      .order('due_date', { ascending: true })
      .limit(5),
  ]);

  const totalBalance = accounts
    .filter((a) => a.is_active)
    .reduce((sum, a) => sum + a.current_balance, 0);

  const monthTxs = monthTxRes.data || [];
  let monthIncome = 0;
  let monthExpense = 0;
  const expenseByCategoryMap: Record<string, { name: string; value: number; color: string }> = {};

  for (const tx of monthTxs) {
    const amt = Number(tx.amount);
    if (tx.type === 'income') {
      monthIncome += amt;
    } else {
      monthExpense += amt;
      const cat = tx.category as unknown as { id?: string; name?: string; color?: string } | null;
      const catName = cat?.name || 'Lainnya';
      const catColor = cat?.color || '#64748b';
      if (!expenseByCategoryMap[tx.category_id]) {
        expenseByCategoryMap[tx.category_id] = { name: catName, value: 0, color: catColor };
      }
      expenseByCategoryMap[tx.category_id].value += amt;
    }
  }

  // Hitung ringkasan anggaran bulanan
  const spendingByCat: Record<string, number> = {};
  for (const tx of monthTxs) {
    if (tx.type === 'expense') {
      spendingByCat[tx.category_id] = (spendingByCat[tx.category_id] || 0) + Number(tx.amount);
    }
  }

  const budgets = (budgetsRes.data || []).map((b) => {
    const spent = spendingByCat[b.category_id] || 0;
    return {
      ...b,
      amount: Number(b.amount),
      ...calculateBudgetProgress(Number(b.amount), spent),
    };
  });

  const totalBudgetAllocated = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalBudgetRemaining = totalBudgetAllocated - monthExpense;
  const totalSavings = (savingsRes.data || []).reduce((s, c) => s + Number(c.amount), 0);

  return {
    totalBalance,
    monthIncome,
    monthExpense,
    totalBudgetAllocated,
    totalBudgetRemaining,
    totalSavings,
    transactionCount: monthTxs.length,
    accounts,
    expenseByCategory: Object.values(expenseByCategoryMap).sort((a, b) => b.value - a.value),
    recentTransactions: (recentTxRes.data || []).map((t) => ({ ...t, amount: Number(t.amount) })),
    upcomingBills: (billsRes.data || []).map((b) => ({ ...b, amount: Number(b.amount) })),
    budgets,
  };
}

export async function getReportData(params: {
  startDate: string;
  endDate: string;
  prevStartDate: string;
  prevEndDate: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [currRes, prevRes, contribRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('*, account:accounts(id, name), category:categories(id, name, color)')
      .eq('user_id', user.id)
      .gte('transaction_date', params.startDate)
      .lte('transaction_date', params.endDate)
      .order('transaction_date', { ascending: false }),
    supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', user.id)
      .gte('transaction_date', params.prevStartDate)
      .lte('transaction_date', params.prevEndDate),
    supabase
      .from('savings_contributions')
      .select('amount')
      .eq('user_id', user.id)
      .gte('contribution_date', params.startDate)
      .lte('contribution_date', params.endDate),
  ]);

  const txs = (currRes.data || []).map((t) => ({ ...t, amount: Number(t.amount) }));
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryBreakdown: Record<string, { name: string; amount: number; color: string }> = {};
  const dailyTrend: Record<string, { date: string; income: number; expense: number }> = {};

  for (const tx of txs) {
    if (!dailyTrend[tx.transaction_date]) {
      dailyTrend[tx.transaction_date] = { date: tx.transaction_date, income: 0, expense: 0 };
    }
    if (tx.type === 'income') {
      totalIncome += tx.amount;
      dailyTrend[tx.transaction_date].income += tx.amount;
    } else {
      totalExpense += tx.amount;
      dailyTrend[tx.transaction_date].expense += tx.amount;
      const cat = tx.category as unknown as { name?: string; color?: string } | null;
      const key = tx.category_id;
      if (!categoryBreakdown[key]) {
        categoryBreakdown[key] = {
          name: cat?.name || 'Lainnya',
          amount: 0,
          color: cat?.color || '#64748b',
        };
      }
      categoryBreakdown[key].amount += tx.amount;
    }
  }

  let prevExpense = 0;
  let prevIncome = 0;
  for (const p of prevRes.data || []) {
    if (p.type === 'expense') prevExpense += Number(p.amount);
    else prevIncome += Number(p.amount);
  }

  const savedInPeriod = (contribRes.data || []).reduce((s, c) => s + Number(c.amount), 0);
  const categoriesSorted = Object.values(categoryBreakdown).sort((a, b) => b.amount - a.amount);

  return {
    totalIncome,
    totalExpense,
    netDifference: totalIncome - totalExpense,
    prevIncome,
    prevExpense,
    expenseChangePercent: calculateExpenseChange(totalExpense, prevExpense),
    savingRate: calculateSavingRate(savedInPeriod, totalIncome),
    topExpenseCategory: categoriesSorted[0] || null,
    categoryBreakdown: categoriesSorted,
    dailyTrend: Object.values(dailyTrend).sort((a, b) => a.date.localeCompare(b.date)),
    transactions: txs,
  };
}

export async function getNotifications() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return data || [];
}

export async function markNotificationReadAction(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', user.id);

  revalidatePath('/notifications');
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  revalidatePath('/notifications');
  return { success: true };
}

export async function updateProfileSettingsAction(input: unknown) {
  const parsed = profileSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Pengaturan tidak valid' };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.full_name,
      currency: parsed.data.currency,
      timezone: parsed.data.timezone,
      theme: parsed.data.theme,
      notify_budget: parsed.data.notify_budget,
      notify_bills: parsed.data.notify_bills,
      notify_savings: parsed.data.notify_savings,
    })
    .eq('id', user.id);

  if (error) return { success: false, error: 'Gagal menyimpan pengaturan.' };
  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { success: true };
}
