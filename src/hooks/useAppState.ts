import { useState, useEffect, useCallback } from 'react';
import { supabase, getLocalToday } from '../lib/supabase';
import type { AppStateWithTask, Task } from '../types/database';

export function useAppState() {
  const [appState, setAppState] = useState<AppStateWithTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppState = useCallback(async () => {
    const { data: state, error: stateErr } = await supabase
      .from('app_state')
      .select('*')
      .eq('id', 'singleton')
      .maybeSingle();

    if (stateErr) {
      setError('நிலை தரவைப் பெற இயலவில்லை');
      setLoading(false);
      return;
    }

    if (state) {
      // Daily reset: if the last update was before today and mode is 'rest',
      // reset to 'task' mode with the first task.
      const lastUpdateDate = state.updated_at
        ? new Date(state.updated_at).toLocaleDateString('en-CA')
        : null;
      const today = getLocalToday();

      if (lastUpdateDate && lastUpdateDate < today && state.mode === 'rest') {
        const { data: firstTask } = await supabase
          .from('tasks')
          .select('id')
          .order('order_index', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (firstTask) {
          await supabase
            .from('app_state')
            .update({
              mode: 'task',
              current_task_id: firstTask.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', 'singleton');

          // Re-fetch after reset
          await fetchAppState();
          return;
        }
      }

      if (state.current_task_id) {
        const { data: task, error: taskErr } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', state.current_task_id)
          .maybeSingle();

        if (taskErr) {
          setError('பணி தரவைப் பெற இயலவில்லை');
          setLoading(false);
          return;
        }

        setAppState({ ...state, current_task: task as Task | null });
      } else {
        setAppState({ ...state, current_task: null });
      }
    }

    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAppState();

    const channel = supabase
      .channel('app_state_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
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
  }, [fetchAppState]);

  return { appState, loading, error, refetch: fetchAppState };
}
