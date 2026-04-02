import { useEffect, useRef } from 'react';
import type { Task } from '../types/database';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (task.audio_url && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [task.audio_url, task.id]);

  return (
    <div className="flex flex-col items-center justify-center px-6 pt-16 w-full">
      <div className="text-8xl mb-12">
        {task.icon}
      </div>

      <h1 className="text-5xl font-bold text-center text-gray-900 leading-tight">
        {task.tamil_text}
      </h1>

      {task.audio_url && (
        <audio ref={audioRef} src={task.audio_url} preload="auto" />
      )}
    </div>
  );
}
