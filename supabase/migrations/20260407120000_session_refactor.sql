/*
  # Session-based refactor

  1. Tasks table additions
     - `session_type` TEXT — 'morning' | 'afternoon' | 'evening'
     - `reps_or_time_target` INT — caregiver-configured target

  2. Completions table additions (now used for both completed and skipped logs)
     - `duration_seconds` INT — time taken (null for skips)
     - `status` TEXT — 'completed' | 'skipped' (default 'completed')
     - `skip_reason` TEXT — 'pain' | 'fatigue' | NULL

  3. Constraint adjustments
     - Drop the existing UNIQUE(task_id, date) so a task can have both
       a skip log and a (later) completion log on the same day
     - Add a partial UNIQUE on (task_id, date) WHERE status = 'completed'
       to still prevent duplicate completion entries

  4. Idempotent default-task seeding
     - Only inserts the 7 default tasks if the tasks table is currently empty
     - Never deletes existing tasks or completion history
     - Safe to re-run on any database
*/

-- 1. Tasks: session + target
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS session_type TEXT,
  ADD COLUMN IF NOT EXISTS reps_or_time_target INT;

ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS tasks_session_type_check;

ALTER TABLE tasks
  ADD CONSTRAINT tasks_session_type_check
  CHECK (session_type IS NULL OR session_type IN ('morning', 'afternoon', 'evening'));

-- 2. Completions: status + duration + skip reason
ALTER TABLE completions
  ADD COLUMN IF NOT EXISTS duration_seconds INT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS skip_reason TEXT;

ALTER TABLE completions
  DROP CONSTRAINT IF EXISTS completions_status_check;

ALTER TABLE completions
  ADD CONSTRAINT completions_status_check
  CHECK (status IN ('completed', 'skipped'));

ALTER TABLE completions
  DROP CONSTRAINT IF EXISTS completions_skip_reason_check;

ALTER TABLE completions
  ADD CONSTRAINT completions_skip_reason_check
  CHECK (skip_reason IS NULL OR skip_reason IN ('pain', 'fatigue'));

-- 3. Replace strict unique with partial unique on completed only
ALTER TABLE completions
  DROP CONSTRAINT IF EXISTS completions_task_date_unique;

CREATE UNIQUE INDEX IF NOT EXISTS completions_task_date_completed_unique
  ON completions (task_id, date)
  WHERE status = 'completed';

-- 4. Idempotent seeding — only insert defaults if tasks table is empty.
-- This preserves any caregiver-configured tasks on re-runs and never
-- touches completion history.
INSERT INTO tasks (tamil_text, icon, session_type, reps_or_time_target, order_index)
SELECT * FROM (VALUES
  -- Morning
  ('தண்ணீர் குடிக்கவும்', '💧', 'morning', 1, 1),
  ('கையை உயர்த்துதல்', '🤲', 'morning', 10, 2),
  ('மூச்சு பயிற்சி', '🫁', 'morning', 5, 3),
  -- Afternoon
  ('பந்தை அழுத்துதல்', '🟠', 'afternoon', 10, 4),
  ('நடைப்பயிற்சி', '🚶', 'afternoon', 5, 5),
  -- Evening
  ('கையை உயர்த்துதல்', '🤲', 'evening', 10, 6),
  ('மூச்சு பயிற்சி', '🫁', 'evening', 5, 7)
) AS defaults(tamil_text, icon, session_type, reps_or_time_target, order_index)
WHERE NOT EXISTS (SELECT 1 FROM tasks);

-- Backfill any pre-existing tasks that don't yet have a session_type
-- (carry-over from the original schema's seeded tasks).
UPDATE tasks
  SET session_type = 'morning'
  WHERE session_type IS NULL;
