import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { AppStateWithTask, Task } from '../types/database';

export function useAppState() {
  const [appState, setAppState] = useState<AppStateWithTask | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppState();

    const channel = supabase
      .channel('app_state_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_state'
        },
        () => {
          fetchAppState();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchAppState() {
    const { data: state } = await supabase
      .from('app_state')
      .select('*')
      .eq('id', 'singleton')
      .maybeSingle();

    if (state && state.current_task_id) {
      const { data: task } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', state.current_task_id)
        .maybeSingle();

      setAppState({
        ...state,
        current_task: task as Task | null
      });
    } else if (state) {
      setAppState({
        ...state,
        current_task: null
      });
    }

    setLoading(false);
  }

  return { appState, loading, refetch: fetchAppState };
}
