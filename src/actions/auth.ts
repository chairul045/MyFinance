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
    let errorMsg = 'Gagal masuk ke akun.';
    if (error?.message === 'Invalid login credentials') {
      errorMsg = 'Email atau password salah. Jika Anda baru mendaftar, pastikan email telah dikonfirmasi atau periksa kembali password Anda.';
    } else if (error?.message === 'Email not confirmed') {
      errorMsg = 'Email Anda belum dikonfirmasi. Silakan periksa inbox/spam email Anda, atau matikan opsi "Confirm email" di Dashboard Supabase (Authentication -> Providers -> Email) agar dapat langsung masuk.';
    } else if (error?.message) {
      errorMsg = error.message;
    }

    return {
      success: false,
      error: errorMsg,
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
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    const rawMsg = (error.message || '').toLowerCase();
    if (rawMsg.includes('rate limit')) {
      return {
        success: false,
        error: 'Batas kuota kirim email Supabase tercapai (rate limit). Cara instan: Buka Dashboard Supabase Anda -> Authentication -> Providers -> Email -> nonaktifkan centang "Confirm email" agar pendaftaran instan tanpa batas kirim email.',
      };
    }
    if (rawMsg.includes('already registered')) {
      // Coba langsung login jika sudah terdaftar
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (signInData?.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', signInData.user.id)
          .maybeSingle();

        return {
          success: true,
          redirectTo: profile?.onboarding_completed ? '/dashboard' : '/onboarding',
        };
      }

      if (signInError?.message === 'Email not confirmed') {
        return {
          success: false,
          error: 'Email ini sudah terdaftar tapi belum dikonfirmasi. Silakan periksa email Anda atau matikan "Confirm email" di Supabase.',
          redirectTo: `/login?email=${encodeURIComponent(parsed.data.email)}`,
        };
      }

      return {
        success: false,
        error: 'Email ini sudah terdaftar. Silakan langsung masuk di menu Login dengan password Anda.',
        redirectTo: `/login?email=${encodeURIComponent(parsed.data.email)}`,
      };
    }

    if (rawMsg.includes('invalid')) {
      return {
        success: false,
        error: 'Format email tidak valid atau dibatasi oleh pengaturan Supabase.',
      };
    }

    return { success: false, error: error.message || 'Gagal mendaftar.' };
  }

  // Jika Supabase mengembalikan data.user dengan identities kosong, artinya user sudah terdaftar sebelumnya (email enumeration protection)
  const isExistingUser = Boolean(
    data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0
  );

  if (isExistingUser) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (signInData?.session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', signInData.user.id)
        .maybeSingle();

      return {
        success: true,
        redirectTo: profile?.onboarding_completed ? '/dashboard' : '/onboarding',
      };
    }

    if (signInError?.message === 'Email not confirmed') {
      return {
        success: false,
        error: 'Email ini sudah terdaftar tapi belum dikonfirmasi. Silakan periksa inbox/spam email Anda, atau matikan opsi "Confirm email" di Supabase.',
        redirectTo: `/login?email=${encodeURIComponent(parsed.data.email)}`,
      };
    }

    return {
      success: false,
      error: 'Email ini sudah pernah didaftarkan. Silakan langsung masuk menggunakan password Anda di menu Login.',
      redirectTo: `/login?email=${encodeURIComponent(parsed.data.email)}`,
    };
  }

  // Jika Confirm email di-disable di Supabase, session langsung terbentuk
  if (data.session) {
    return { success: true, redirectTo: '/onboarding' };
  }

  // Jika data.session null, coba login langsung (berlaku jika project sudah mematikan email confirmation)
  const { data: signInData } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInData?.session) {
    return { success: true, redirectTo: '/onboarding' };
  }

  return {
    success: true,
    message: 'Registrasi berhasil! Tautan konfirmasi telah dikirim ke email Anda. Silakan periksa kotak masuk/spam atau nonaktifkan "Confirm email" di Dashboard Supabase agar dapat langsung login.',
    redirectTo: `/login?registered=1&email=${encodeURIComponent(parsed.data.email)}`,
  };
}

export async function resendConfirmationAction(email: string): Promise<AuthActionResult> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Silakan masukkan alamat email yang valid.' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim(),
  });

  if (error) {
    const raw = (error.message || '').toLowerCase();
    if (raw.includes('rate limit')) {
      return {
        success: false,
        error: 'Batas kuota email Supabase tercapai. Cara instan: Matikan centang "Confirm email" di Dashboard Supabase (Authentication -> Providers -> Email) agar akun aktif langsung.',
      };
    }
    return { success: false, error: error.message || 'Gagal mengirim ulang email verifikasi.' };
  }

  return {
    success: true,
    message: 'Tautan verifikasi telah dikirim ulang! Silakan periksa kotak masuk dan spam email Anda.',
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
