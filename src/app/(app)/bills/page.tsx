import React from 'react';
import { getBillsWithPayments } from '@/actions/planning';
import { getAccountsWithBalances, getCategories } from '@/actions/accounts';
import { BillsClient } from '@/components/fintrack/BillsClient';

export default async function BillsPage() {
  const [bills, accounts, categories] = await Promise.all([
    getBillsWithPayments(),
    getAccountsWithBalances(),
    getCategories(),
  ]);

  return <BillsClient bills={bills} accounts={accounts} categories={categories} />;
}
