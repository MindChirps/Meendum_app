import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Completion } from '../types/database';

export function useCompletions() {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  async function fetchCompletions() {
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('completions')
      .select('*')
      .eq('date', today)
      .order('completed_at', { ascending: false });

    setCompletions(data || []);
    setLoading(false);
  }

  return { completions, loading, refetch: fetchCompletions };
}
