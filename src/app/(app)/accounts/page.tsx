import React from 'react';
import { getAccountsWithBalances, getTransfers } from '@/actions/accounts';
import { AccountsClient } from '@/components/fintrack/AccountsClient';

export default async function AccountsPage() {
  const [accounts, transfers] = await Promise.all([
    getAccountsWithBalances(),
    getTransfers(),
  ]);

  return <AccountsClient accounts={accounts} transfers={transfers} />;
}
