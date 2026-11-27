import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100),
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export const onboardingSchema = z.object({
  fullName: z.string().min(2, 'Nama pengguna minimal 2 karakter').max(100),
  currency: z.enum(['IDR', 'USD', 'SGD', 'MYR']).default('IDR'),
  initialBalance: z.coerce
    .number({ error: 'Saldo awal harus berupa angka' })
    .min(0, 'Saldo awal tidak boleh negatif'),
  accountName: z.string().min(2, 'Nama rekening minimal 2 karakter').max(80),
  accountType: z.enum(['cash', 'bank', 'ewallet', 'savings']),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
