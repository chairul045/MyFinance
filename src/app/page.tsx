import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function RootPage() {
  let user = null;
  let onboardingCompleted = false;

  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();
      onboardingCompleted = Boolean(profile?.onboarding_completed);
    }
  } catch {
    redirect('/login');
  }

  if (!user) {
    redirect('/login');
  }

  if (!onboardingCompleted) {
    redirect('/onboarding');
  }

  redirect('/dashboard');
}
