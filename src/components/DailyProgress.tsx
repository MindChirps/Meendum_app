import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Task } from '../types/database';

interface DailyProgressProps {
  completedTaskIds: string[];
}

export function DailyProgress({ completedTaskIds }: DailyProgressProps) {
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('order_index', { ascending: true });

    setAllTasks(data || []);
  }

  return (
    <div className="mt-6">
      <h3 className="text-3xl font-bold text-gray-900 mb-4">இன்றைய சாதனைகள்</h3>
      <div className="space-y-3">
        {allTasks.map((task) => {
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
