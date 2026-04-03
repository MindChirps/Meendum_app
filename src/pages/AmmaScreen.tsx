import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { useCompletions } from '../hooks/useCompletions';
import { CurrentTask } from '../components/CurrentTask';
import { PauseButton } from '../components/PauseButton';
import { DailyProgress } from '../components/DailyProgress';
import { supabase } from '../lib/supabase';
import type { Task } from '../types/database';

export function AmmaScreen() {
  const { appState, loading: stateLoading, error: stateError } = useAppState();
  const { completions, loading: completionsLoading, error: completionsError } = useCompletions();
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  useEffect(() => {
    async function fetchTasks() {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .order('order_index', { ascending: true });
      setAllTasks(data || []);
    }
    fetchTasks();
  }, []);

  const handleTogglePause = async () => {
    if (!appState) return;

    const newMode = appState.mode === 'rest' ? 'task' : 'rest';

    const { error } = await supabase
      .from('app_state')
      .update({
        mode: newMode,
        updated_at: new Date().toISOString()
      })
      .eq('id', 'singleton');

    if (error) {
      alert('நிலை மாற்ற இயலவில்லை');
    }
  };

  if (stateLoading || completionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-5xl">⏳</div>
      </div>
    );
  }

  const displayError = stateError || completionsError;
  if (displayError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 gap-4">
        <div className="text-5xl">⚠️</div>
        <p className="text-3xl text-center text-red-700">{displayError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-8 py-4 bg-gray-600 text-white text-2xl rounded-xl"
        >
          மீண்டும் முயற்சி
        </button>
      </div>
    );
  }

  const completedTaskIds = completions.map(c => c.task_id);
  const isEvening = new Date().getHours() >= 18;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-amber-100 p-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          இன்று: {completions.length} பயிற்சிகள் ✅
        </h1>
        <Link
          to="/appa"
          className="px-4 py-2 bg-amber-600 text-white text-xl rounded-xl"
        >
          அப்பா →
        </Link>
      </div>

      <div className="p-6 space-y-6">
        {isEvening && completions.length > 0 ? (
          <div className="p-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold text-gray-900">
              இன்று நீங்கள் இருவரும் சேர்ந்து {completions.length} பயிற்சிகள் முடித்தீர்கள்!
            </h2>
          </div>
        ) : (
          <CurrentTask task={appState?.current_task || null} />
        )}

        <PauseButton
          isResting={appState?.mode === 'rest'}
          onClick={handleTogglePause}
        />

        <DailyProgress completedTaskIds={completedTaskIds} tasks={allTasks} />
      </div>
    </div>
  );
}
