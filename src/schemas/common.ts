import { z } from 'zod';

/**
 * Validasi nominal uang positif (> 0) sesuai aturan Fintrack.
 */
export const positiveAmountSchema = z.coerce
  .number({ error: 'Nominal harus berupa angka' })
  .positive('Nominal harus lebih besar dari nol');

/**
 * Validasi format tanggal YYYY-MM-DD.
 */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid (YYYY-MM-DD)');

/**
 * Validasi bulan & tahun.
 */
export const monthYearSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});
