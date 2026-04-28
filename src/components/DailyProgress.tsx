import type { Task, Completion, SessionType } from '../types/database';

interface DailyProgressProps {
  completions: Completion[];
  tasks: Task[];
}

const SESSION_LABELS: Record<SessionType, string> = {
  morning: 'காலை',
  afternoon: 'மதியம்',
  evening: 'மாலை'
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} வி`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins} நி ${secs} வி` : `${mins} நி`;
}

export function DailyProgress({ completions, tasks }: DailyProgressProps) {
  const sessions: SessionType[] = ['morning', 'afternoon', 'evening'];

  const logByTask = new Map<string, Completion>();
  for (const c of completions) {
    const existing = logByTask.get(c.task_id);
    if (!existing || (c.status === 'completed' && existing.status === 'skipped')) {
      logByTask.set(c.task_id, c);
    }
  }

  const totalTasks = tasks.length;
  const totalCompleted = completions.filter(c => c.status === 'completed').length;
  const totalSkipped = completions.filter(c => c.status === 'skipped').length;
  const totalRemaining = totalTasks - totalCompleted - totalSkipped;
  const overallPct = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-3xl font-bold text-gray-900">இன்றைய சாதனைகள்</h3>

      {/* Daily summary card */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            {totalCompleted}/{totalTasks} முடிந்தது
          </span>
          <span className="text-2xl font-bold text-green-700">{overallPct}%</span>
        </div>
        {/* Overall progress bar */}
        <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <div className="flex gap-6 text-lg text-gray-600">
          <span>✅ {totalCompleted}</span>
          {totalSkipped > 0 && <span>⏭️ {totalSkipped}</span>}
          {totalRemaining > 0 && <span>⬜ {totalRemaining}</span>}
        </div>
      </div>

      {/* Per-session breakdown */}
      <div className="space-y-6">
        {sessions.map(session => {
          const sessionTasks = tasks.filter(t => t.session_type === session);
          if (sessionTasks.length === 0) return null;

          const sessionCompleted = sessionTasks.filter(t => {
            const log = logByTask.get(t.id);
            return log?.status === 'completed';
          }).length;
          const sessionPct = Math.round((sessionCompleted / sessionTasks.length) * 100);

          return (
            <div key={session} className="space-y-2">
              {/* Session header with progress bar */}
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-semibold text-gray-700">
                  {SESSION_LABELS[session]}
                </h4>
                <span className="text-xl font-bold text-gray-600">
                  {sessionCompleted}/{sessionTasks.length}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${sessionPct}%`,
                    backgroundColor: sessionPct === 100 ? '#16a34a' : '#f59e0b'
                  }}
                />
              </div>

              {/* Task list */}
              <div className="space-y-2 mt-1">
                {sessionTasks.map(task => {
                  const log = logByTask.get(task.id);
                  const isCompleted = log?.status === 'completed';
                  const isSkipped = log?.status === 'skipped';

                  let bgClass = 'bg-gray-50';
                  let icon = '⬜';
                  let textClass = 'text-gray-500';
                  let extra: string | null = null;

                  if (isCompleted) {
                    bgClass = 'bg-green-50';
                    icon = '✅';
                    textClass = 'text-green-900';
                  } else if (isSkipped) {
                    bgClass = 'bg-orange-50';
                    icon = log?.skip_reason === 'pain' ? '🤕' : '🥱';
                    textClass = 'text-orange-900';
                    extra = log?.skip_reason === 'pain' ? 'வலி' : 'சோர்வு';
                  }

                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${bgClass}`}
                    >
                      <span className="text-3xl">{icon}</span>
                      <span className="text-3xl">{task.icon}</span>
                      <span className={`text-xl flex-1 ${textClass}`}>
                        {task.tamil_text}
                      </span>
                      {isCompleted && log?.duration_seconds != null && (
                        <span className="text-lg text-green-700 font-semibold">
                          {formatDuration(log.duration_seconds)}
                        </span>
                      )}
                      {extra && (
                        <span className="text-lg font-semibold text-orange-700">
                          {extra}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
