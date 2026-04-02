import { useState, useEffect, useCallback } from 'react';
import { supabase, getLocalToday } from '../lib/supabase';
import type { Completion } from '../types/database';

export function useCompletions() {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompletions = useCallback(async () => {
    const today = getLocalToday();

    const { data, error: fetchErr } = await supabase
      .from('completions')
      .select('*')
      .eq('date', today)
      .order('completed_at', { ascending: false });

    if (fetchErr) {
      setError('நிறைவுத் தரவைப் பெற இயலவில்லை');
      setLoading(false);
      return;
    }

    setCompletions(data || []);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCompletions();

    const channel = supabase
      .channel('completions_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'completions'
        },
        () => {
          fetchCompletions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCompletions]);

  return { completions, loading, error, refetch: fetchCompletions };
}
