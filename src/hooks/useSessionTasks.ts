import { useState, useEffect, useCallback } from 'react';
import { supabase, getLocalToday } from '../lib/supabase';
import type { Task, SessionType } from '../types/database';

/**
 * Fetches the tasks for the given session that have NOT yet been logged
 * today (neither completed nor skipped). Returns them in `order_index` order.
 */
export function useSessionTasks(session: SessionType | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!session) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const today = getLocalToday();

    const { data: sessionTasks, error: tasksErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('session_type', session)
      .order('order_index', { ascending: true });

    if (tasksErr) {
      setError('பணிகளைப் பெற இயலவில்லை');
      setLoading(false);
      return;
    }

    const { data: todaysLogs, error: logsErr } = await supabase
      .from('completions')
      .select('task_id')
      .eq('date', today);

    if (logsErr) {
      setError('நிறைவுத் தரவைப் பெற இயலவில்லை');
      setLoading(false);
      return;
    }

    const loggedIds = new Set((todaysLogs || []).map(l => l.task_id));
    const remaining = (sessionTasks || []).filter(t => !loggedIds.has(t.id));

    setTasks(remaining as Task[]);
    setError(null);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('session_tasks_logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'completions' },
        () => fetchTasks()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => fetchTasks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks };
}
