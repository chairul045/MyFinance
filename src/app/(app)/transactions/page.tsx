import React from 'react';
import { getTransactions } from '@/actions/transactions';
import { getAccountsWithBalances, getCategories } from '@/actions/accounts';
import { getRecurringTransactions } from '@/actions/planning';
import { TransactionsClient } from '@/components/fintrack/TransactionsClient';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    type?: 'all' | 'income' | 'expense';
    accountId?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
  };
}) {
  const page = Number(searchParams.page) || 1;
  const [txResult, accounts, categories, recurring] = await Promise.all([
    getTransactions({
      search: searchParams.search,
      type: searchParams.type,
      accountId: searchParams.accountId,
      categoryId: searchParams.categoryId,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
      page,
      pageSize: 15,
    }),
    getAccountsWithBalances(),
    getCategories(),
    getRecurringTransactions(),
  ]);

  return (
    <TransactionsClient
      transactions={txResult.items}
      totalCount={txResult.totalCount}
      page={txResult.page}
      pageSize={txResult.pageSize}
      accounts={accounts}
      categories={categories}
      recurring={recurring}
      initialFilters={searchParams}
    />
  );
}
