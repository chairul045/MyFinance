import { z } from 'zod';
import { positiveAmountSchema, dateStringSchema } from './common';

export const accountSchema = z.object({
  name: z.string().min(2, 'Nama rekening minimal 2 karakter').max(80),
  type: z.enum(['cash', 'bank', 'ewallet', 'savings']),
  initial_balance: z.coerce
    .number({ error: 'Saldo awal harus berupa angka' })
    .min(0, 'Saldo awal tidak boleh negatif'),
  color: z.string().default('#2563eb'),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Nama kategori minimal 2 karakter').max(60),
  type: z.enum(['income', 'expense']),
  color: z.string().default('#2563eb'),
});

export const transactionSchema = z.object({
  account_id: z.string().uuid('Pilih rekening yang valid'),
  category_id: z.string().uuid('Pilih kategori yang valid'),
  type: z.enum(['income', 'expense']),
  amount: positiveAmountSchema,
  transaction_date: dateStringSchema,
  description: z.string().min(2, 'Deskripsi minimal 2 karakter').max(200),
  notes: z.string().max(500).optional().nullable(),
});

export const transferSchema = z
  .object({
    from_account_id: z.string().uuid('Pilih rekening asal'),
    to_account_id: z.string().uuid('Pilih rekening tujuan'),
    amount: positiveAmountSchema,
    transfer_date: dateStringSchema,
    notes: z.string().max(300).optional().nullable(),
  })
  .refine((data) => data.from_account_id !== data.to_account_id, {
    message: 'Rekening asal dan tujuan tidak boleh sama',
    path: ['to_account_id'],
  });

export const budgetSchema = z.object({
  category_id: z.string().uuid('Pilih kategori pengeluaran'),
  amount: positiveAmountSchema,
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

export const savingsGoalSchema = z.object({
  name: z.string().min(2, 'Nama target minimal 2 karakter').max(100),
  target_amount: positiveAmountSchema,
  target_date: dateStringSchema,
  color: z.string().default('#10b981'),
});

export const savingsContributionSchema = z.object({
  goal_id: z.string().uuid('Target tabungan tidak valid'),
  account_id: z.string().uuid('Rekening tidak valid').optional().nullable(),
  amount: positiveAmountSchema,
  contribution_date: dateStringSchema,
  notes: z.string().max(300).optional().nullable(),
});

export const billSchema = z.object({
  name: z.string().min(2, 'Nama tagihan minimal 2 karakter').max(100),
  amount: positiveAmountSchema,
  due_date: dateStringSchema,
  category_id: z.string().uuid().optional().nullable(),
  account_id: z.string().uuid().optional().nullable(),
  is_recurring: z.boolean().default(false),
  frequency: z.enum(['weekly', 'monthly', 'yearly']).optional().nullable(),
  reminder_days: z.coerce.number().int().min(0).max(30).default(3),
});

export const recurringSchema = z.object({
  account_id: z.string().uuid('Pilih rekening'),
  category_id: z.string().uuid('Pilih kategori'),
  type: z.enum(['income', 'expense']),
  amount: positiveAmountSchema,
  description: z.string().min(2, 'Deskripsi minimal 2 karakter').max(200),
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
  start_date: dateStringSchema,
});

export const profileSettingsSchema = z.object({
  full_name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  currency: z.enum(['IDR', 'USD', 'SGD', 'MYR']),
  timezone: z.string().min(3),
  theme: z.enum(['light', 'dark']),
  notify_budget: z.boolean(),
  notify_bills: z.boolean(),
  notify_savings: z.boolean(),
});
