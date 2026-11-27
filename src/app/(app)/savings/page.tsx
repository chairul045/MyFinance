import React from 'react';
import { getSavingsGoalsWithContributions } from '@/actions/planning';
import { getAccountsWithBalances } from '@/actions/accounts';
import { SavingsClient } from '@/components/fintrack/SavingsClient';

export default async function SavingsPage() {
  const [goals, accounts] = await Promise.all([
    getSavingsGoalsWithContributions(),
    getAccountsWithBalances(),
  ]);

  return <SavingsClient goals={goals} accounts={accounts} />;
}
