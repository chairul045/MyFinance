export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Gaji', icon: 'banknote', color: '#10b981' },
  { name: 'Bisnis', icon: 'briefcase', color: '#059669' },
  { name: 'Freelance', icon: 'laptop', color: '#14b8a6' },
  { name: 'Bonus', icon: 'gift', color: '#22c55e' },
  { name: 'Investasi', icon: 'trending-up', color: '#0ea5e9' },
  { name: 'Lainnya', icon: 'plus-circle', color: '#64748b' },
] as const;

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Makanan', icon: 'utensils', color: '#f97316' },
  { name: 'Transportasi', icon: 'car', color: '#3b82f6' },
  { name: 'Kebutuhan Pribadi', icon: 'user', color: '#8b5cf6' },
  { name: 'Pendidikan', icon: 'graduation-cap', color: '#06b6d4' },
  { name: 'Kesehatan', icon: 'heart-pulse', color: '#ef4444' },
  { name: 'Tagihan', icon: 'receipt', color: '#eab308' },
  { name: 'Hiburan', icon: 'gamepad-2', color: '#ec4899' },
  { name: 'Belanja', icon: 'shopping-bag', color: '#f43f5e' },
  { name: 'Cicilan', icon: 'credit-card', color: '#6366f1' },
  { name: 'Lainnya', icon: 'tag', color: '#64748b' },
] as const;

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  cash: 'Cash / Tunai',
  bank: 'Bank',
  ewallet: 'E-Wallet',
  savings: 'Tabungan (Savings)',
};

export const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Mingguan',
  monthly: 'Bulanan',
  yearly: 'Tahunan',
};
