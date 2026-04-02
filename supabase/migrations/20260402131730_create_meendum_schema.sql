/*
  # Meendum (மீண்டும்) - Tamil Stroke Recovery App Schema

  1. New Tables
    - `app_state`
      - Singleton table tracking current mode ('task' | 'rest') and current task
      - `id` (text, primary key, default 'singleton')
      - `mode` (text, default 'task')
      - `current_task_id` (uuid, foreign key to tasks)
      - `updated_at` (timestamptz)
    
    - `tasks`
      - Library of rehabilitation tasks in Tamil
      - `id` (uuid, primary key)
      - `tamil_text` (text) - Task description in Tamil
      - `icon` (text) - Emoji or icon identifier
      - `audio_url` (text, optional) - Cloud-hosted MP3 URL
      - `scheduled_time` (time) - Suggested time for task
      - `order_index` (int) - Sequence order for tasks
    
    - `completions`
      - Log of completed tasks
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key to tasks)
      - `completed_at` (timestamptz)
      - `date` (date) - Completion date for easy daily queries
  
  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (MVP - no auth)
    - Add policies for public write access to completions and app_state
  
  3. Initial Data
    - Seed tasks table with 5 initial Tamil rehabilitation tasks
    - Initialize app_state singleton with first task
*/

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tamil_text TEXT NOT NULL,
  icon TEXT NOT NULL,
  audio_url TEXT,
  scheduled_time TIME,
  order_index INT DEFAULT 0
);

-- Create app_state table
CREATE TABLE IF NOT EXISTS app_state (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  mode TEXT NOT NULL DEFAULT 'task',
  current_task_id UUID REFERENCES tasks(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create completions table
CREATE TABLE IF NOT EXISTS completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id),
  completed_at TIMESTAMPTZ DEFAULT now(),
  date DATE DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_state (public read/write for MVP)
CREATE POLICY "Anyone can read app state"
  ON app_state FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update app state"
  ON app_state FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert app state"
  ON app_state FOR INSERT
  TO anon
  WITH CHECK (true);

-- RLS Policies for tasks (public read)
CREATE POLICY "Anyone can read tasks"
  ON tasks FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for completions (public read/write for MVP)
CREATE POLICY "Anyone can read completions"
  ON completions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert completions"
  ON completions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Seed tasks table with initial Tamil rehabilitation tasks
INSERT INTO tasks (tamil_text, icon, scheduled_time, order_index) VALUES
  ('தண்ணீர் குடிக்கவும்', '💧', '08:00', 1),
  ('கை பயிற்சி செய்யுங்கள்', '🤲', '09:30', 2),
  ('சாப்பிடுங்கள்', '🍽️', '12:00', 3),
  ('மூச்சு பயிற்சி', '🫁', '15:00', 4),
  ('கால் பயிற்சி', '🦵', '16:30', 5)
ON CONFLICT DO NOTHING;

-- Initialize app_state with first task
INSERT INTO app_state (id, mode, current_task_id)
SELECT 'singleton', 'task', id
FROM tasks
WHERE order_index = 1
LIMIT 1
ON CONFLICT (id) DO NOTHING;