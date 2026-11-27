'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { accountSchema, categorySchema, transferSchema } from '@/schemas/finance';
import { calculateAccountBalance } from '@/lib/finance-calc';
import type { AccountWithBalance, Category, TransferRecord } from '@/types/fintrack';

export async function getAccountsWithBalances(): Promise<AccountWithBalance[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [accountsRes, txRes, transfersRes] = await Promise.all([
    supabase.from('accounts').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
    supabase.from('transactions').select('account_id, type, amount').eq('user_id', user.id),
    supabase.from('transfers').select('from_account_id, to_account_id, amount').eq('user_id', user.id),
  ]);

  const accounts = accountsRes.data || [];
  const txs = txRes.data || [];
  const transfers = transfersRes.data || [];

  return accounts.map((acc) => {
    let incomeTotal = 0;
    let expenseTotal = 0;
    let transferIn = 0;
    let transferOut = 0;

    for (const tx of txs) {
      if (tx.account_id === acc.id) {
        if (tx.type === 'income') incomeTotal += Number(tx.amount);
        else expenseTotal += Number(tx.amount);
      }
    }

    for (const tr of transfers) {
      if (tr.to_account_id === acc.id) transferIn += Number(tr.amount);
      if (tr.from_account_id === acc.id) transferOut += Number(tr.amount);
    }

    const current_balance = calculateAccountBalance({
      initialBalance: Number(acc.initial_balance),
      incomeTotal,
      expenseTotal,
      transferIn,
      transferOut,
    });

    return {
      ...acc,
      initial_balance: Number(acc.initial_balance),
      current_balance,
      total_income: incomeTotal,
      total_expense: expenseTotal,
      transfer_in: transferIn,
      transfer_out: transferOut,
    };
  });
}

export async function createAccountAction(input: unknown) {
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data rekening tidak valid' };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.from('accounts').insert({
    user_id: user.id,
    name: parsed.data.name,
    type: parsed.data.type,
    initial_balance: parsed.data.initial_balance,
    color: parsed.data.color,
    is_active: true,
  });

  if (error) return { success: false, error: 'Gagal menambahkan rekening.' };
  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateAccountAction(id: string, input: unknown) {
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data rekening tidak valid' };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('accounts')
    .update({
      name: parsed.data.name,
      type: parsed.data.type,
      initial_balance: parsed.data.initial_balance,
      color: parsed.data.color,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: 'Gagal memperbarui rekening.' };
  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function toggleAccountActiveAction(id: string, isActive: boolean) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('accounts')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: 'Gagal mengubah status rekening.' };
  revalidatePath('/accounts');
  return { success: true };
}

export async function deleteAccountAction(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  // Cek apakah rekening masih dipakai di transaksi atau transfer
  const [txCheck, trCheck] = await Promise.all([
    supabase.from('transactions').select('id').eq('account_id', id).eq('user_id', user.id).limit(1),
    supabase
      .from('transfers')
      .select('id')
      .eq('user_id', user.id)
      .or(`from_account_id.eq.${id},to_account_id.eq.${id}`)
      .limit(1),
  ]);

  if ((txCheck.data && txCheck.data.length > 0) || (trCheck.data && trCheck.data.length > 0)) {
    return {
      success: false,
      error: 'Rekening memiliki riwayat transaksi/transfer. Nonaktifkan saja agar data historis tetap aman.',
    };
  }

  const { error } = await supabase.from('accounts').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { success: false, error: 'Gagal menghapus rekening.' };

  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function createTransferAction(input: unknown) {
  const parsed = transferSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data transfer tidak valid' };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  // Pastikan kedua rekening milik user yang sama dan aktif
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, is_active')
    .eq('user_id', user.id)
    .in('id', [parsed.data.from_account_id, parsed.data.to_account_id]);

  if (!accounts || accounts.length !== 2) {
    return { success: false, error: 'Rekening asal atau tujuan tidak ditemukan.' };
  }

  if (accounts.some((a) => !a.is_active)) {
    return { success: false, error: 'Kedua rekening harus dalam status aktif.' };
  }

  const { error } = await supabase.from('transfers').insert({
    user_id: user.id,
    from_account_id: parsed.data.from_account_id,
    to_account_id: parsed.data.to_account_id,
    amount: parsed.data.amount,
    transfer_date: parsed.data.transfer_date,
    notes: parsed.data.notes || null,
  });

  if (error) return { success: false, error: 'Gagal mencatat transfer antar rekening.' };
  revalidatePath('/accounts');
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getTransfers(): Promise<TransferRecord[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('transfers')
    .select(
      '*, from_account:accounts!transfers_from_account_id_fkey(id, name), to_account:accounts!transfers_to_account_id_fkey(id, name)'
    )
    .eq('user_id', user.id)
    .order('transfer_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  return (data || []) as TransferRecord[];
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('type', { ascending: true })
    .order('name', { ascending: true });

  return (data || []) as Category[];
}

export async function createCategoryAction(input: unknown) {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data kategori tidak valid' };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name: parsed.data.name,
    type: parsed.data.type,
    color: parsed.data.color,
    icon: 'tag',
    is_default: false,
  });

  if (error) return { success: false, error: 'Kategori dengan nama tersebut sudah ada.' };
  revalidatePath('/settings');
  revalidatePath('/transactions');
  revalidatePath('/budgets');
  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: usedTx } = await supabase
    .from('transactions')
    .select('id')
    .eq('category_id', id)
    .eq('user_id', user.id)
    .limit(1);

  if (usedTx && usedTx.length > 0) {
    return { success: false, error: 'Kategori masih digunakan pada transaksi.' };
  }

  const { error } = await supabase.from('categories').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { success: false, error: 'Gagal menghapus kategori.' };
  revalidatePath('/settings');
  return { success: true };
}
