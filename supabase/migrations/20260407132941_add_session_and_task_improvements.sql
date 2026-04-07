/*
  # Add Session Type and Task Improvements

  1. New Columns
    - `tasks.session_type` - 'morning' | 'afternoon' | 'evening'
    - `tasks.reps_or_time_target` - Target reps or time in seconds
    - `completions.duration_seconds` - How long task took
    - `completions.status` - 'completed' | 'skipped'
    - `completions.skip_reason` - 'pain' | 'fatigue' (if skipped)
  
  2. Updates
    - Populate existing tasks with session_type based on scheduled_time
    - Set status='completed' for all existing completions (backfill)
    - Add constraints and defaults

  3. Important Notes
    - Activities now visible with session grouping (morning/afternoon/evening)
    - Skip reasons tracked for caregiver visibility
    - Duration tracking for progress monitoring
*/

-- Add new columns to tasks table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'session_type') THEN
    ALTER TABLE tasks ADD COLUMN session_type TEXT DEFAULT 'morning';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'reps_or_time_target') THEN
    ALTER TABLE tasks ADD COLUMN reps_or_time_target INTEGER;
  END IF;
END $$;

-- Add new columns to completions table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'completions' AND column_name = 'duration_seconds') THEN
    ALTER TABLE completions ADD COLUMN duration_seconds INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'completions' AND column_name = 'status') THEN
    ALTER TABLE completions ADD COLUMN status TEXT DEFAULT 'completed';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'completions' AND column_name = 'skip_reason') THEN
    ALTER TABLE completions ADD COLUMN skip_reason TEXT;
  END IF;
END $$;

-- Populate session_type based on scheduled_time
UPDATE tasks SET session_type = 'morning' WHERE scheduled_time >= '06:00'::time AND scheduled_time < '12:00'::time;
UPDATE tasks SET session_type = 'afternoon' WHERE scheduled_time >= '12:00'::time AND scheduled_time < '17:00'::time;
UPDATE tasks SET session_type = 'evening' WHERE scheduled_time >= '17:00'::time AND scheduled_time < '21:00'::time;

-- Set default reps_or_time_target (5 repetitions/minutes for each task)
UPDATE tasks SET reps_or_time_target = 5 WHERE reps_or_time_target IS NULL;

-- Backfill status as 'completed' for all existing completions
UPDATE completions SET status = 'completed' WHERE status IS NULL;