import React from 'react';
import { getReportData } from '@/actions/dashboard';
import { getJakartaDateString, getJakartaMonthYear, getMonthDateRange } from '@/lib/finance-calc';
import { ReportsClient } from '@/components/fintrack/ReportsClient';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { period?: string; start?: string; end?: string };
}) {
  const period = searchParams.period || 'monthly';
  const todayStr = getJakartaDateString();
  const { month, year } = getJakartaMonthYear();

  let startDate = todayStr;
  let endDate = todayStr;
  let prevStartDate = todayStr;
  let prevEndDate = todayStr;

  if (period === 'daily') {
    startDate = todayStr;
    endDate = todayStr;
  } else if (period === 'weekly') {
    const dt = new Date(todayStr);
    const prev = new Date(dt);
    prev.setDate(dt.getDate() - 6);
    startDate = prev.toISOString().slice(0, 10);
    endDate = todayStr;
  } else if (period === 'yearly') {
    startDate = `${year}-01-01`;
    endDate = `${year}-12-31`;
    prevStartDate = `${year - 1}-01-01`;
    prevEndDate = `${year - 1}-12-31`;
  } else if (period === 'custom' && searchParams.start && searchParams.end) {
    startDate = searchParams.start;
    endDate = searchParams.end;
  } else {
    const currRange = getMonthDateRange(month, year);
    startDate = currRange.startDate;
    endDate = currRange.endDate;
    const prevM = month === 1 ? 12 : month - 1;
    const prevY = month === 1 ? year - 1 : year;
    const prevRange = getMonthDateRange(prevM, prevY);
    prevStartDate = prevRange.startDate;
    prevEndDate = prevRange.endDate;
  }

  const report = await getReportData({ startDate, endDate, prevStartDate, prevEndDate });
  if (!report) return null;

  return <ReportsClient report={report} period={period} startDate={startDate} endDate={endDate} />;
}
