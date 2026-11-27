import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function RootPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !profile.onboarding_completed) {
    redirect('/onboarding');
  }

  redirect('/dashboard');
}
