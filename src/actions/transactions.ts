'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { transactionSchema } from '@/schemas/finance';
import { calculateBudgetProgress } from '@/lib/finance-calc';
import type { TransactionRecord } from '@/types/fintrack';

export interface TransactionFilterParams {
  search?: string;
  type?: 'all' | 'income' | 'expense';
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export async function getTransactions(params: TransactionFilterParams = {}): Promise<{
  items: TransactionRecord[];
  totalCount: number;
  page: number;
  pageSize: number;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [], totalCount: 0, page: 1, pageSize: 15 };

  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(5, params.pageSize || 15));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('transactions')
    .select(
      '*, account:accounts(id, name, type), category:categories(id, name, color, icon), attachments(id, file_path, file_name, mime_type)',
      { count: 'exact' }
    )
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (params.type && params.type !== 'all') {
    query = query.eq('type', params.type);
  }
  if (params.accountId) {
    query = query.eq('account_id', params.accountId);
  }
  if (params.categoryId) {
    query = query.eq('category_id', params.categoryId);
  }
  if (params.startDate) {
    query = query.gte('transaction_date', params.startDate);
  }
  if (params.endDate) {
    query = query.lte('transaction_date', params.endDate);
  }
  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    query = query.or(`description.ilike.%${q}%,notes.ilike.%${q}%`);
  }

  const { data, count } = await query.range(from, to);

  return {
    items: (data || []).map((t) => ({ ...t, amount: Number(t.amount) })) as TransactionRecord[],
    totalCount: count || 0,
    page,
    pageSize,
  };
}

async function checkBudgetNotification(
  userId: string,
  categoryId: string,
  transactionDate: string
) {
  const supabase = createClient();
  const [yearStr, monthStr] = transactionDate.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);

  const { data: budget } = await supabase
    .from('budgets')
    .select('id, amount, category:categories(name)')
    .eq('user_id', userId)
    .eq('category_id', categoryId)
    .eq('month', month)
    .eq('year', year)
    .maybeSingle();

  if (!budget) return;

  const startDate = `${yearStr}-${monthStr}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

  const { data: txs } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('category_id', categoryId)
    .eq('type', 'expense')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);

  const spent = (txs || []).reduce((sum, t) => sum + Number(t.amount), 0);
  const progress = calculateBudgetProgress(Number(budget.amount), spent);

  if (progress.status === 'warning' || progress.status === 'full' || progress.status === 'exceeded') {
    const catName = (budget.category as { name?: string } | null)?.name || 'Kategori';
    const title =
      progress.status === 'exceeded'
        ? `Anggaran ${catName} Terlampaui!`
        : progress.status === 'full'
        ? `Anggaran ${catName} Habis!`
        : `Anggaran ${catName} Hampir Habis (${progress.percent.toFixed(0)}%)`;

    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'budget_alert',
      title,
      message: `Pengeluaran kategori ${catName} bulan ini telah mencapai ${progress.percent.toFixed(1)}% dari batas anggaran.`,
      link: '/budgets',
    });
  }
}

export async function createTransactionAction(input: unknown) {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data transaksi tidak valid' };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: inserted, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      account_id: parsed.data.account_id,
      category_id: parsed.data.category_id,
      type: parsed.data.type,
      amount: parsed.data.amount,
      transaction_date: parsed.data.transaction_date,
      description: parsed.data.description,
      notes: parsed.data.notes || null,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    return { success: false, error: 'Gagal menyimpan transaksi.' };
  }

  if (parsed.data.type === 'expense') {
    await checkBudgetNotification(user.id, parsed.data.category_id, parsed.data.transaction_date);
  }

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  revalidatePath('/budgets');
  revalidatePath('/reports');
  return { success: true, id: inserted.id };
}

export async function updateTransactionAction(id: string, input: unknown) {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data transaksi tidak valid' };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('transactions')
    .update({
      account_id: parsed.data.account_id,
      category_id: parsed.data.category_id,
      type: parsed.data.type,
      amount: parsed.data.amount,
      transaction_date: parsed.data.transaction_date,
      description: parsed.data.description,
      notes: parsed.data.notes || null,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: 'Gagal memperbarui transaksi.' };

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  revalidatePath('/budgets');
  revalidatePath('/reports');
  return { success: true };
}

export async function deleteTransactionAction(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: 'Gagal menghapus transaksi.' };

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  revalidatePath('/budgets');
  revalidatePath('/reports');
  return { success: true };
}

export async function attachReceiptAction(params: {
  transactionId: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.from('attachments').insert({
    user_id: user.id,
    transaction_id: params.transactionId,
    file_path: params.filePath,
    file_name: params.fileName,
    mime_type: params.mimeType,
    file_size: params.fileSize,
  });

  if (error) return { success: false, error: 'Gagal menyimpan lampiran bukti.' };
  revalidatePath('/transactions');
  return { success: true };
}
