import { useAppState } from '../hooks/useAppState';
import { useCompletions } from '../hooks/useCompletions';
import { CurrentTask } from '../components/CurrentTask';
import { PauseButton } from '../components/PauseButton';
import { DailyProgress } from '../components/DailyProgress';
import { supabase } from '../lib/supabase';

export function AmmaScreen() {
  const { appState, loading: stateLoading } = useAppState();
  const { completions, loading: completionsLoading } = useCompletions();

  const handleTogglePause = async () => {
    if (!appState) return;

    const newMode = appState.mode === 'rest' ? 'task' : 'rest';

    await supabase
      .from('app_state')
      .update({
        mode: newMode,
        updated_at: new Date().toISOString()
      })
      .eq('id', 'singleton');
  };

  if (stateLoading || completionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-5xl">⏳</div>
      </div>
    );
  }

  const completedTaskIds = completions.map(c => c.task_id);
  const isEvening = new Date().getHours() >= 18;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-amber-100 p-6">
        <h1 className="text-3xl font-bold text-gray-900">
          இன்று: {completions.length} பயிற்சிகள் ✅
        </h1>
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

        <DailyProgress completedTaskIds={completedTaskIds} />
      </div>
    </div>
  );
}
