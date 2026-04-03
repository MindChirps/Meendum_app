import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { TaskCard } from '../components/TaskCard';
import { DoneButton } from '../components/DoneButton';
import { RestScreen } from '../components/RestScreen';
import { supabase, playChime, getLocalToday } from '../lib/supabase';

export function AppaScreen() {
  const { appState, loading, error } = useAppState();
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    if (!appState?.current_task || completing) return;

    setCompleting(true);
    playChime();

    try {
      const { data: allTasks, error: tasksErr } = await supabase
        .from('tasks')
        .select('*')
        .order('order_index', { ascending: true });

      if (tasksErr || !allTasks) {
        setCompleting(false);
        return;
      }

      const { error: insertErr } = await supabase.from('completions').insert({
        task_id: appState.current_task.id,
        date: getLocalToday()
      });

      if (insertErr) {
        setCompleting(false);
        return;
      }

      const currentIndex = allTasks.findIndex(t => t.id === appState.current_task_id);
      const nextTask = allTasks[currentIndex + 1];

      if (nextTask) {
        await supabase
          .from('app_state')
          .update({
            current_task_id: nextTask.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', 'singleton');
      } else {
        // All tasks done — set rest mode and reset to first task for next session
        await supabase
          .from('app_state')
          .update({
            mode: 'rest',
            current_task_id: allTasks[0].id,
            updated_at: new Date().toISOString()
          })
          .eq('id', 'singleton');
      }
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-5xl">⏳</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center px-6 gap-4">
        <div className="text-5xl">⚠️</div>
        <p className="text-3xl text-center text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-8 py-4 bg-yellow-600 text-white text-2xl rounded-xl"
        >
          மீண்டும் முயற்சி
        </button>
      </div>
    );
  }

  if (appState?.mode === 'rest') {
    return <RestScreen />;
  }

  if (!appState?.current_task) {
    return (
      <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center px-6 gap-4">
        <div className="text-5xl text-center">பணிகள் இல்லை</div>
        <Link
          to="/amma"
          className="mt-4 px-8 py-4 bg-amber-600 text-white text-2xl rounded-xl"
        >
          அம்மா பக்கம் →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col justify-between py-8">
      <TaskCard task={appState.current_task} />

      <div className="px-4 pb-8">
        <DoneButton onClick={handleComplete} disabled={completing} />
      </div>
    </div>
  );
}
