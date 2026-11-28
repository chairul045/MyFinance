import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FintrackShell } from '@/components/fintrack/FintrackShell';
import { isUserAdmin } from '@/lib/admin';
import type { Profile } from '@/types/fintrack';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let profile: Profile | null = null;
  let unreadCount = 0;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const [profileRes, notifRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false),
    ]);

    profile = (profileRes.data as Profile | null) || null;
    unreadCount = notifRes.count || 0;

    if (profile) {
      const adminStatus = isUserAdmin(profile.email || user.email);
      profile.is_admin = adminStatus;
      profile.role = adminStatus ? 'admin' : 'user';
    }
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'digest' in err && String((err as { digest: string }).digest).startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    redirect('/login');
  }

  if (!profile || !profile.onboarding_completed) {
    redirect('/onboarding');
  }

  return (
    <FintrackShell profile={profile} unreadNotifications={unreadCount}>
      {children}
    </FintrackShell>
  );
}
