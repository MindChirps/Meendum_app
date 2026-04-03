import type { Task } from '../types/database';

interface DailyProgressProps {
  completedTaskIds: string[];
  tasks: Task[];
}

export function DailyProgress({ completedTaskIds, tasks }: DailyProgressProps) {
  return (
    <div className="mt-6">
      <h3 className="text-3xl font-bold text-gray-900 mb-4">இன்றைய சாதனைகள்</h3>
      <div className="space-y-3">
        {tasks.map((task) => {
          const isCompleted = completedTaskIds.includes(task.id);
          return (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-4 rounded-lg ${
                isCompleted ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              <span className="text-3xl">{isCompleted ? '✅' : '⬜'}</span>
              <span className="text-3xl">{task.icon}</span>
              <span className={`text-2xl ${isCompleted ? 'text-green-900' : 'text-gray-500'}`}>
                {task.tamil_text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
