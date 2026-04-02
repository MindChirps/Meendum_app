import type { Task } from '../types/database';

interface CurrentTaskProps {
  task: Task | null;
}

export function CurrentTask({ task }: CurrentTaskProps) {
  if (!task) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <p className="text-2xl text-gray-500">பணிகள் இல்லை</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <p className="text-2xl text-gray-600 mb-2">அப்பா இப்போது:</p>
      <div className="flex items-center gap-4">
        <span className="text-6xl">{task.icon}</span>
        <h2 className="text-4xl font-bold text-gray-900">{task.tamil_text}</h2>
      </div>
    </div>
  );
}
