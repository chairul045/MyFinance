import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FintrackShell } from '@/components/fintrack/FintrackShell';
import type { Profile } from '@/types/fintrack';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
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

  const profile = profileRes.data as Profile | null;
  if (!profile || !profile.onboarding_completed) {
    redirect('/onboarding');
  }

  return (
    <FintrackShell profile={profile} unreadNotifications={notifRes.count || 0}>
      {children}
    </FintrackShell>
  );
}
