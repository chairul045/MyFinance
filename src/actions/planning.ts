'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  budgetSchema,
  savingsGoalSchema,
  savingsContributionSchema,
  billSchema,
  recurringSchema,
} from '@/schemas/finance';
import {
  calculateBudgetProgress,
  getMonthDateRange,
  addFrequencyToDate,
  getJakartaDateString,
} from '@/lib/finance-calc';

// ============================================================================
// BUDGETS
// ============================================================================
export async function getBudgetsWithSpending(month: number, year: number) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { startDate, endDate } = getMonthDateRange(month, year);

  const [budgetsRes, txRes] = await Promise.all([
    supabase
      .from('budgets')
      .select('*, category:categories(id, name, color)')
      .eq('user_id', user.id)
      .eq('month', month)
      .eq('year', year),
    supabase
      .from('transactions')
      .select('category_id, amount')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate),
  ]);

  const spendingByCat: Record<string, number> = {};
  for (const tx of txRes.data || []) {
    spendingByCat[tx.category_id] = (spendingByCat[tx.category_id] || 0) + Number(tx.amount);
  }

  return (budgetsRes.data || []).map((b) => {
    const spent = spendingByCat[b.category_id] || 0;
    const progress = calculateBudgetProgress(Number(b.amount), spent);
    return {
      ...b,
      amount: Number(b.amount),
      ...progress,
    };
  });
}

export async function upsertBudgetAction(input: unknown) {
  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data anggaran tidak valid' };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.from('budgets').upsert(
    {
      user_id: user.id,
      category_id: parsed.data.category_id,
      amount: parsed.data.amount,
      month: parsed.data.month,
      year: parsed.data.year,
    },
    { onConflict: 'user_id,category_id,month,year' }
  );

  if (error) return { success: false, error: 'Gagal menyimpan anggaran.' };
  revalidatePath('/budgets');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteBudgetAction(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.from('budgets').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { success: false, error: 'Gagal menghapus anggaran.' };
  revalidatePath('/budgets');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function copyPreviousMonthBudgetsAction(month: number, year: number) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const { data: prevBudgets } = await supabase
    .from('budgets')
    .select('category_id, amount')
    .eq('user_id', user.id)
    .eq('month', prevMonth)
    .eq('year', prevYear);

  if (!prevBudgets || prevBudgets.length === 0) {
    return { success: false, error: 'Tidak ada anggaran pada bulan sebelumnya untuk disalin.' };
  }

  const payload = prevBudgets.map((b) => ({
    user_id: user.id,
    category_id: b.category_id,
    amount: b.amount,
    month,
    year,
  }));

  const { error } = await supabase
    .from('budgets')
    .upsert(payload, { onConflict: 'user_id,category_id,month,year' });

  if (error) return { success: false, error: 'Gagal menyalin anggaran.' };
  revalidatePath('/budgets');
  revalidatePath('/dashboard');
  return { success: true, count: payload.length };
}

// ============================================================================
// SAVINGS GOALS & CONTRIBUTIONS
// ============================================================================
export async function getSavingsGoalsWithContributions() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [goalsRes, contribRes] = await Promise.all([
    supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('savings_contributions')
      .select('*')
      .eq('user_id', user.id)
      .order('contribution_date', { ascending: false }),
  ]);

  const contribs = contribRes.data || [];

  return (goalsRes.data || []).map((g) => {
    const goalContribs = contribs.filter((c) => c.goal_id === g.id);
    const collected = goalContribs.reduce((sum, c) => sum + Number(c.amount), 0);
    const target = Number(g.target_amount);
    const percent = target > 0 ? Math.min(100, (collected / target) * 100) : 0;

    return {
      ...g,
      target_amount: target,
      collected_amount: collected,
      remaining_amount: Math.max(0, target - collected),
      percent,
      contributions: goalContribs.map((c) => ({ ...c, amount: Number(c.amount) })),
    };
  });
}

export async function createSavingsGoalAction(input: unknown) {
  const parsed = savingsGoalSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data tabungan tidak valid' };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.from('savings_goals').insert({
    user_id: user.id,
    name: parsed.data.name,
    target_amount: parsed.data.target_amount,
    target_date: parsed.data.target_date,
    color: parsed.data.color,
    is_completed: false,
  });

  if (error) return { success: false, error: 'Gagal membuat target tabungan.' };
  revalidatePath('/savings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function toggleSavingsGoalCompletedAction(id: string, isCompleted: boolean) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('savings_goals')
    .update({ is_completed: isCompleted })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: 'Gagal memperbarui status target.' };
  revalidatePath('/savings');
  return { success: true };
}

export async function deleteSavingsGoalAction(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: 'Gagal menghapus target tabungan.' };
  revalidatePath('/savings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function addSavingsContributionAction(input: unknown) {
  const parsed = savingsContributionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data kontribusi tidak valid' };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  // Catat kontribusi tanpa membuat transaksi pengeluaran ganda agar saldo rekening tidak terhitung ganda
  const { error } = await supabase.from('savings_contributions').insert({
    user_id: user.id,
    goal_id: parsed.data.goal_id,
    account_id: parsed.data.account_id || null,
    amount: parsed.data.amount,
    contribution_date: parsed.data.contribution_date,
    notes: parsed.data.notes || null,
  });

  if (error) return { success: false, error: 'Gagal menambahkan kontribusi.' };

  // Cek apakah target tabungan sudah tercapai
  const { data: goal } = await supabase
    .from('savings_goals')
    .select('id, name, target_amount, is_completed')
    .eq('id', parsed.data.goal_id)
    .eq('user_id', user.id)
    .single();

  if (goal) {
    const { data: contribs } = await supabase
      .from('savings_contributions')
      .select('amount')
      .eq('goal_id', goal.id)
      .eq('user_id', user.id);
    const total = (contribs || []).reduce((s, c) => s + Number(c.amount), 0);

    if (total >= Number(goal.target_amount) && !goal.is_completed) {
      await supabase
        .from('savings_goals')
        .update({ is_completed: true })
        .eq('id', goal.id)
        .eq('user_id', user.id);

      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'savings_goal_reached',
        title: `Target Tabungan "${goal.name}" Tercapai!`,
        message: `Selamat! Tabungan "${goal.name}" telah mencapai target yang ditentukan.`,
        link: '/savings',
      });
    }
  }

  revalidatePath('/savings');
  revalidatePath('/dashboard');
  return { success: true };
}

// ============================================================================
// BILLS & PAYMENTS
// ============================================================================
export async function getBillsWithPayments() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [billsRes, paymentsRes] = await Promise.all([
    supabase
      .from('bills')
      .select('*, category:categories(id, name), account:accounts(id, name)')
      .eq('user_id', user.id)
      .order('is_paid', { ascending: true })
      .order('due_date', { ascending: true }),
    supabase
      .from('bill_payments')
      .select('*')
      .eq('user_id', user.id)
      .order('paid_date', { ascending: false }),
  ]);

  const payments = paymentsRes.data || [];

  return (billsRes.data || []).map((b) => ({
    ...b,
    amount: Number(b.amount),
    payments: payments.filter((p) => p.bill_id === b.id),
  }));
}

export async function createBillAction(input: unknown) {
  const parsed = billSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data tagihan tidak valid' };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.from('bills').insert({
    user_id: user.id,
    name: parsed.data.name,
    amount: parsed.data.amount,
    due_date: parsed.data.due_date,
    category_id: parsed.data.category_id || null,
    account_id: parsed.data.account_id || null,
    is_recurring: parsed.data.is_recurring,
    frequency: parsed.data.is_recurring ? parsed.data.frequency || 'monthly' : null,
    reminder_days: parsed.data.reminder_days,
    is_paid: false,
  });

  if (error) return { success: false, error: 'Gagal menambahkan tagihan.' };
  revalidatePath('/bills');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteBillAction(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.from('bills').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { success: false, error: 'Gagal menghapus tagihan.' };
  revalidatePath('/bills');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function payBillAction(billId: string, accountId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: bill } = await supabase
    .from('bills')
    .select('*')
    .eq('id', billId)
    .eq('user_id', user.id)
    .single();

  if (!bill) return { success: false, error: 'Tagihan tidak ditemukan.' };
  if (bill.is_paid) return { success: false, error: 'Tagihan ini sudah lunas (mencegah pembayaran ganda).' };

  // Pastikan punya kategori pengeluaran untuk pencatatan transaksi tagihan
  let categoryId = bill.category_id;
  if (!categoryId) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .order('name', { ascending: true })
      .limit(1)
      .maybeSingle();
    categoryId = cat?.id || null;
  }

  if (!categoryId) {
    return { success: false, error: 'Kategori pengeluaran belum tersedia.' };
  }

  const paidDate = getJakartaDateString();

  // 1. Catat transaksi pengeluaran
  const { data: tx, error: txErr } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      account_id: accountId,
      category_id: categoryId,
      type: 'expense',
      amount: bill.amount,
      transaction_date: paidDate,
      description: `Pembayaran Tagihan: ${bill.name}`,
      notes: 'Otomatis tercatat dari pembayaran tagihan',
    })
    .select('id')
    .single();

  if (txErr || !tx) {
    return { success: false, error: 'Gagal mencatat transaksi pembayaran tagihan.' };
  }

  // 2. Catat riwayat pembayaran tagihan
  await supabase.from('bill_payments').insert({
    user_id: user.id,
    bill_id: bill.id,
    account_id: accountId,
    transaction_id: tx.id,
    amount: bill.amount,
    paid_date: paidDate,
  });

  // 3. Tandai tagihan lunas; jika berulang, buat tagihan periode berikutnya
  await supabase
    .from('bills')
    .update({ is_paid: true })
    .eq('id', bill.id)
    .eq('user_id', user.id);

  if (bill.is_recurring && bill.frequency) {
    const nextDue = addFrequencyToDate(bill.due_date, bill.frequency);
    await supabase.from('bills').insert({
      user_id: user.id,
      name: bill.name,
      amount: bill.amount,
      due_date: nextDue,
      category_id: bill.category_id,
      account_id: bill.account_id,
      is_recurring: true,
      frequency: bill.frequency,
      reminder_days: bill.reminder_days,
      is_paid: false,
    });
  }

  revalidatePath('/bills');
  revalidatePath('/transactions');
  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  return { success: true };
}

// ============================================================================
// RECURRING TRANSACTIONS (IDEMPOTENT)
// ============================================================================
export async function getRecurringTransactions() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('recurring_transactions')
    .select('*, account:accounts(id, name), category:categories(id, name)')
    .eq('user_id', user.id)
    .order('next_run_date', { ascending: true });

  return (data || []).map((r) => ({ ...r, amount: Number(r.amount) }));
}

export async function createRecurringTransactionAction(input: unknown) {
  const parsed = recurringSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data jadwal tidak valid' };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.from('recurring_transactions').insert({
    user_id: user.id,
    account_id: parsed.data.account_id,
    category_id: parsed.data.category_id,
    type: parsed.data.type,
    amount: parsed.data.amount,
    description: parsed.data.description,
    frequency: parsed.data.frequency,
    start_date: parsed.data.start_date,
    next_run_date: parsed.data.start_date,
    is_active: true,
  });

  if (error) return { success: false, error: 'Gagal membuat transaksi berulang.' };
  revalidatePath('/transactions');
  return { success: true };
}

export async function toggleRecurringActiveAction(id: string, isActive: boolean) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('recurring_transactions')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: 'Gagal mengubah status jadwal.' };
  revalidatePath('/transactions');
  return { success: true };
}

export async function deleteRecurringTransactionAction(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('recurring_transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: 'Gagal menghapus jadwal.' };
  revalidatePath('/transactions');
  return { success: true };
}

export async function processDueRecurringTransactionsAction() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, processed: 0 };

  const today = getJakartaDateString();
  const { data: dueItems } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .lte('next_run_date', today);

  let processed = 0;
  for (const item of dueItems || []) {
    // Idempotency check: pastikan belum ada transaksi untuk recurring_transaction_id pada next_run_date
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('recurring_transaction_id', item.id)
      .eq('transaction_date', item.next_run_date)
      .limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from('transactions').insert({
        user_id: user.id,
        account_id: item.account_id,
        category_id: item.category_id,
        type: item.type,
        amount: item.amount,
        transaction_date: item.next_run_date,
        description: `${item.description} (Otomatis)`,
        recurring_transaction_id: item.id,
      });
      processed++;
    }

    const nextRun = addFrequencyToDate(item.next_run_date, item.frequency);
    await supabase
      .from('recurring_transactions')
      .update({ last_run_date: item.next_run_date, next_run_date: nextRun })
      .eq('id', item.id)
      .eq('user_id', user.id);
  }

  if (processed > 0) {
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/accounts');
  }

  return { success: true, processed };
}
