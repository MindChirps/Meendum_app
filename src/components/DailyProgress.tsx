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

export function DailyProgress({ completions, tasks }: DailyProgressProps) {
  const sessions: SessionType[] = ['morning', 'afternoon', 'evening'];

  // Index latest log per task (a task may have a skip then a completion)
  const logByTask = new Map<string, Completion>();
  for (const c of completions) {
    const existing = logByTask.get(c.task_id);
    if (!existing || (c.status === 'completed' && existing.status === 'skipped')) {
      logByTask.set(c.task_id, c);
    }
  }

  return (
    <div className="mt-6">
      <h3 className="text-3xl font-bold text-gray-900 mb-4">இன்றைய சாதனைகள்</h3>
      <div className="space-y-6">
        {sessions.map(session => {
          const sessionTasks = tasks.filter(t => t.session_type === session);
          if (sessionTasks.length === 0) return null;

          return (
            <div key={session}>
              <h4 className="text-2xl font-semibold text-gray-700 mb-2">
                {SESSION_LABELS[session]}
              </h4>
              <div className="space-y-2">
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
