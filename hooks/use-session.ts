import { type Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { hasSupabaseConfig, supabase } from '@/lib/supabase';
import { getRememberDevice } from '@/utils/rememberDevice';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setLoading(false);
      return;
    }
    let mounted = true;

    (async () => {
      const remember = await getRememberDevice();
      if (!remember) {
        // Ensure no session is restored on this device
        try {
          await supabase.auth.signOut();
        } catch {}
        if (mounted) {
          setSession(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setSession(data.session);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    })();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
