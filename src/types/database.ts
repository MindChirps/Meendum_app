export interface Task {
  id: string;
  tamil_text: string;
  icon: string;
  audio_url: string | null;
  scheduled_time: string | null;
  order_index: number;
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
}

export interface AppStateWithTask extends AppState {
  current_task: Task | null;
}
