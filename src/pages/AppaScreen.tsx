import { useAppState } from '../hooks/useAppState';
import { TaskCard } from '../components/TaskCard';
import { DoneButton } from '../components/DoneButton';
import { RestScreen } from '../components/RestScreen';
import { supabase, playChime } from '../lib/supabase';

export function AppaScreen() {
  const { appState, loading } = useAppState();

  const handleComplete = async () => {
    if (!appState?.current_task) return;

    playChime();

    const { data: allTasks } = await supabase
      .from('tasks')
      .select('*')
      .order('order_index', { ascending: true });

    await supabase.from('completions').insert({
      task_id: appState.current_task.id,
      date: new Date().toISOString().split('T')[0]
    });

    if (allTasks) {
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
        await supabase
          .from('app_state')
          .update({
            mode: 'rest',
            updated_at: new Date().toISOString()
          })
          .eq('id', 'singleton');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-5xl">⏳</div>
      </div>
    );
  }

  if (appState?.mode === 'rest') {
    return <RestScreen />;
  }

  if (!appState?.current_task) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-5xl text-center px-6">பணிகள் இல்லை</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col justify-between py-8">
      <TaskCard task={appState.current_task} />

      <div className="px-4 pb-8">
        <DoneButton onClick={handleComplete} />
      </div>
    </div>
  );
}
