import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCategories } from '@/actions/accounts';
import { SettingsClient } from '@/components/fintrack/SettingsClient';
import type { Profile } from '@/types/fintrack';

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [profileRes, categories] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    getCategories(),
  ]);

  return <SettingsClient profile={profileRes.data as Profile} categories={categories} />;
}
