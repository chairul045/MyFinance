import React from 'react';
import { getDashboardData } from '@/actions/dashboard';
import { getJakartaMonthYear } from '@/lib/finance-calc';
import { DashboardClient } from '@/components/fintrack/DashboardClient';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const current = getJakartaMonthYear();
  const month = Number(searchParams.month) || current.month;
  const year = Number(searchParams.year) || current.year;

  const data = await getDashboardData(month, year);

  if (!data) {
    return null;
  }

  return <DashboardClient data={data} month={month} year={year} />;
}
