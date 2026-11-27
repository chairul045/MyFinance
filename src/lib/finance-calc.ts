/**
 * Engine perhitungan keuangan Fintrack (konsisten & bebas double-counting).
 */

export function calculateAccountBalance(params: {
  initialBalance: number;
  incomeTotal: number;
  expenseTotal: number;
  transferIn: number;
  transferOut: number;
}): number {
  const { initialBalance, incomeTotal, expenseTotal, transferIn, transferOut } = params;
  return (
    Number(initialBalance || 0) +
    Number(incomeTotal || 0) -
    Number(expenseTotal || 0) +
    Number(transferIn || 0) -
    Number(transferOut || 0)
  );
}

export type BudgetStatusLevel = 'normal' | 'info' | 'warning' | 'full' | 'exceeded';

export function calculateBudgetProgress(allocated: number, spent: number): {
  allocated: number;
  spent: number;
  remaining: number;
  percent: number;
  status: BudgetStatusLevel;
  statusLabel: string;
} {
  const safeAllocated = Math.max(0, Number(allocated || 0));
  const safeSpent = Math.max(0, Number(spent || 0));
  const remaining = safeAllocated - safeSpent;
  const percent = safeAllocated > 0 ? (safeSpent / safeAllocated) * 100 : 0;

  let status: BudgetStatusLevel = 'normal';
  let statusLabel = 'Aman';

  if (percent > 100) {
    status = 'exceeded';
    statusLabel = 'Anggaran terlampaui';
  } else if (percent === 100) {
    status = 'full';
    statusLabel = 'Anggaran habis';
  } else if (percent >= 80) {
    status = 'warning';
    statusLabel = 'Hampir mencapai batas';
  } else if (percent >= 50) {
    status = 'info';
    statusLabel = 'Penggunaan >50%';
  }

  return {
    allocated: safeAllocated,
    spent: safeSpent,
    remaining,
    percent,
    status,
    statusLabel,
  };
}

export function calculateSavingRate(savedAmount: number, incomeAmount: number): number {
  const income = Number(incomeAmount || 0);
  if (income <= 0) return 0;
  return (Number(savedAmount || 0) / income) * 100;
}

export function calculateExpenseChange(
  currentMonthExpense: number,
  previousMonthExpense: number
): number | null {
  const prev = Number(previousMonthExpense || 0);
  if (prev <= 0) return null;
  return ((Number(currentMonthExpense || 0) - prev) / prev) * 100;
}

export function getJakartaDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getJakartaMonthYear(date: Date = new Date()): { month: number; year: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(date);

  const month = Number(parts.find((p) => p.type === 'month')?.value || 1);
  const year = Number(parts.find((p) => p.type === 'year')?.value || new Date().getFullYear());
  return { month, year };
}

export function getMonthDateRange(month: number, year: number): { startDate: string; endDate: string } {
  const mm = String(month).padStart(2, '0');
  const lastDay = new Date(year, month, 0).getDate();
  return {
    startDate: `${year}-${mm}-01`,
    endDate: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
  };
}

export function addFrequencyToDate(dateStr: string, frequency: 'weekly' | 'monthly' | 'yearly'): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  if (frequency === 'weekly') {
    dt.setDate(dt.getDate() + 7);
  } else if (frequency === 'monthly') {
    dt.setMonth(dt.getMonth() + 1);
  } else {
    dt.setFullYear(dt.getFullYear() + 1);
  }
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function getBillStatus(bill: { is_paid: boolean; due_date: string }, todayStr: string): {
  code: 'paid' | 'overdue' | 'due_soon' | 'unpaid';
  label: string;
} {
  if (bill.is_paid) return { code: 'paid', label: 'Lunas' };
  if (bill.due_date < todayStr) return { code: 'overdue', label: 'Terlambat' };

  const todayMs = new Date(todayStr).getTime();
  const dueMs = new Date(bill.due_date).getTime();
  const diffDays = Math.ceil((dueMs - todayMs) / (1000 * 60 * 60 * 24));
  if (diffDays <= 3) return { code: 'due_soon', label: 'Jatuh Tempo' };
  return { code: 'unpaid', label: 'Belum Dibayar' };
}
