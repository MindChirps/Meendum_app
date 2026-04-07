export type SessionType = 'morning' | 'afternoon' | 'evening';
export type TaskStatus = 'completed' | 'skipped';
export type SkipReason = 'pain' | 'fatigue';

export interface Task {
  id: string;
  tamil_text: string;
  icon: string;
  audio_url: string | null;
  scheduled_time: string | null;
  order_index: number;
  session_type: SessionType | null;
  reps_or_time_target: number | null;
}

export interface AppState {
  id: string;
  mode: 'task' | 'rest';
  current_task_id: string | null;
  updated_at: string;
}

export interface Completion {
  id: string;
  task_id: string;
  completed_at: string;
  date: string;
  duration_seconds: number | null;
  status: TaskStatus;
  skip_reason: SkipReason | null;
}

export interface AppStateWithTask extends AppState {
  current_task: Task | null;
}
