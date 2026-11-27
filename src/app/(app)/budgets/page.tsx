import React from 'react';
import { getBudgetsWithSpending } from '@/actions/planning';
import { getCategories } from '@/actions/accounts';
import { getJakartaMonthYear } from '@/lib/finance-calc';
import { BudgetsClient } from '@/components/fintrack/BudgetsClient';

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const current = getJakartaMonthYear();
  const month = Number(searchParams.month) || current.month;
  const year = Number(searchParams.year) || current.year;

  const [budgets, categories] = await Promise.all([
    getBudgetsWithSpending(month, year),
    getCategories(),
  ]);

  return <BudgetsClient budgets={budgets} categories={categories} month={month} year={year} />;
}
