import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { useCompletions } from '../hooks/useCompletions';
import { SOSButton } from '../components/SOSButton';
import { TaskConfigForm } from '../components/TaskConfigForm';
import { DailyProgress } from '../components/DailyProgress';
import { supabase } from '../lib/supabase';
import type { Task } from '../types/database';

export function AmmaScreen() {
  const { appState, loading: stateLoading, error: stateError, refetch: refetchState } = useAppState();
  const { completions, loading: completionsLoading, error: completionsError } = useCompletions();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [sosBusy, setSosBusy] = useState(false);

  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('order_index', { ascending: true });
    if (error) {
      console.error('Tasks fetch failed:', error);
    }
    const tasks = (data || []) as Task[];
    console.log('Fetched tasks:', tasks.length, 'with session_type:', tasks.map(t => t.session_type));
    setAllTasks(tasks);
    setTasksLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSOS = async () => {
    if (!appState || sosBusy) return;
    setSosBusy(true);
    const newMode = appState.mode === 'rest' ? 'task' : 'rest';
    const { error } = await supabase
      .from('app_state')
      .update({ mode: newMode, updated_at: new Date().toISOString() })
      .eq('id', 'singleton');
    if (error) {
      alert('நிலை மாற்ற இயலவில்லை');
    } else {
      refetchState();
    }
    setSosBusy(false);
  };

  if (stateLoading || completionsLoading || tasksLoading) {
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

  const completedCount = completions.filter(c => c.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-amber-100 p-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          இன்று: {completedCount} முடிந்தது ✅
        </h1>
        <Link
          to="/appa"
          className="px-4 py-2 bg-amber-600 text-white text-xl rounded-xl"
        >
          அப்பா →
        </Link>
      </div>

      <div className="p-6 space-y-6">
        {/* SOS / Rest button — always at the top so Amma can hit it instantly */}
        <SOSButton
          isResting={appState?.mode === 'rest'}
          onClick={handleSOS}
          disabled={sosBusy}
        />

        {/* Daily progress with skip reasons */}
        <DailyProgress completions={completions} tasks={allTasks} />

        {/* Collapsible task configuration */}
        <div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="w-full p-4 bg-white border-2 border-gray-200 text-2xl font-bold text-gray-900 rounded-2xl"
          >
            ⚙️ பயிற்சிகளை அமைக்கவும் {showConfig ? '▲' : '▼'}
          </button>
          {showConfig && (
            <div className="mt-4">
              <TaskConfigForm tasks={allTasks} onChanged={fetchTasks} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
