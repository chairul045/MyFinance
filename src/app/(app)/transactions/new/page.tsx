import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAccountsWithBalances, getCategories } from '@/actions/accounts';
import { NewTransactionClient } from '@/components/fintrack/NewTransactionClient';

export default async function NewTransactionPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [accounts, categories] = await Promise.all([
    getAccountsWithBalances(),
    getCategories(),
  ]);

  return <NewTransactionClient accounts={accounts} categories={categories} userId={user.id} />;
}
