'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  onboardingSchema,
} from '@/schemas/auth';
import {
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
} from '@/lib/constants';

export type AuthActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
};

export async function loginAction(formData: unknown): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data tidak valid' };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return {
      success: false,
      error: error?.message === 'Invalid login credentials'
        ? 'Email atau password salah.'
        : error?.message || 'Gagal masuk ke akun.',
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!profile || !profile.onboarding_completed) {
    return { success: true, redirectTo: '/onboarding' };
  }

  return { success: true, redirectTo: '/dashboard' };
}

export async function registerAction(formData: unknown): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data tidak valid' };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message || 'Gagal mendaftar.' };
  }

  if (data.session) {
    return { success: true, redirectTo: '/onboarding' };
  }

  return {
    success: true,
    message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi, lalu masuk.',
    redirectTo: '/login',
  };
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function forgotPasswordAction(formData: unknown): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Email tidak valid' };
  }

  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message || 'Gagal mengirim email reset password.' };
  }

  return {
    success: true,
    message: 'Tautan reset password telah dikirim ke email Anda.',
  };
}

export async function resetPasswordAction(formData: unknown): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Password tidak valid' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: error.message || 'Gagal memperbarui password.' };
  }

  return {
    success: true,
    message: 'Password berhasil diperbarui.',
    redirectTo: '/dashboard',
  };
}

export async function completeOnboardingAction(formData: unknown): Promise<AuthActionResult> {
  const parsed = onboardingSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data onboarding tidak valid' };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Sesi tidak ditemukan. Silakan login kembali.', redirectTo: '/login' };
  }

  // 1. Update atau buat profile pengguna
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email || '',
    full_name: parsed.data.fullName,
    currency: parsed.data.currency,
    timezone: 'Asia/Jakarta',
    onboarding_completed: true,
  });

  if (profileError) {
    return { success: false, error: 'Gagal menyimpan profil pengguna.' };
  }

  // 2. Buat rekening pertama jika belum ada
  const { data: existingAccounts } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);

  if (!existingAccounts || existingAccounts.length === 0) {
    const { error: accountError } = await supabase.from('accounts').insert({
      user_id: user.id,
      name: parsed.data.accountName,
      type: parsed.data.accountType,
      initial_balance: parsed.data.initialBalance,
      color: '#2563eb',
      is_active: true,
    });

    if (accountError) {
      return { success: false, error: 'Gagal membuat rekening awal.' };
    }
  }

  // 3. Seed kategori default jika belum ada
  const { data: existingCategories } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);

  if (!existingCategories || existingCategories.length === 0) {
    const defaultCats = [
      ...DEFAULT_INCOME_CATEGORIES.map((c) => ({
        user_id: user.id,
        name: c.name,
        type: 'income' as const,
        icon: c.icon,
        color: c.color,
        is_default: true,
      })),
      ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
        user_id: user.id,
        name: c.name,
        type: 'expense' as const,
        icon: c.icon,
        color: c.color,
        is_default: true,
      })),
    ];

    await supabase.from('categories').insert(defaultCats);
  }

  return { success: true, redirectTo: '/dashboard' };
}
