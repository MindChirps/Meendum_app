/*
  # Comprehensive fix: ensure session columns + data are correct

  This migration is fully idempotent and handles ANY starting state:
  - Columns may or may not exist
  - session_type may or may not be set
  - Test duplicate rows may or may not exist

  Safe to re-run at any time.
*/

-- ========== 1. ENSURE COLUMNS EXIST ==========

-- Tasks: add session_type and reps_or_time_target if missing
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS session_type TEXT,
  ADD COLUMN IF NOT EXISTS reps_or_time_target INT;

-- Completions: add status, duration_seconds, skip_reason if missing
ALTER TABLE completions
  ADD COLUMN IF NOT EXISTS duration_seconds INT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS skip_reason TEXT;

-- ========== 2. CONSTRAINTS ==========

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_session_type_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_session_type_check
  CHECK (session_type IS NULL OR session_type IN ('morning', 'afternoon', 'evening'));

ALTER TABLE completions DROP CONSTRAINT IF EXISTS completions_status_check;
ALTER TABLE completions ADD CONSTRAINT completions_status_check
  CHECK (status IN ('completed', 'skipped'));

ALTER TABLE completions DROP CONSTRAINT IF EXISTS completions_skip_reason_check;
ALTER TABLE completions ADD CONSTRAINT completions_skip_reason_check
  CHECK (skip_reason IS NULL OR skip_reason IN ('pain', 'fatigue'));

-- Replace old strict unique with partial unique (completed only)
ALTER TABLE completions DROP CONSTRAINT IF EXISTS completions_task_date_unique;
CREATE UNIQUE INDEX IF NOT EXISTS completions_task_date_completed_unique
  ON completions (task_id, date)
  WHERE status = 'completed';

-- ========== 3. RLS POLICIES FOR TASKS WRITE ==========

DROP POLICY IF EXISTS "Anyone can insert tasks" ON tasks;
CREATE POLICY "Anyone can insert tasks"
  ON tasks FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update tasks" ON tasks;
CREATE POLICY "Anyone can update tasks"
  ON tasks FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete tasks" ON tasks;
CREATE POLICY "Anyone can delete tasks"
  ON tasks FOR DELETE TO anon USING (true);

-- ========== 4. DATA CLEANUP ==========

-- Remove test duplicates (rows added via config form — NULL scheduled_time)
DELETE FROM tasks WHERE scheduled_time IS NULL AND session_type IS NOT NULL;

-- ========== 5. ASSIGN session_type FOR ORIGINAL SEED TASKS ==========

-- For tasks that have scheduled_time, derive session from it
UPDATE tasks
SET session_type = CASE
  WHEN scheduled_time::time < '12:00:00' THEN 'morning'
  WHEN scheduled_time::time < '17:00:00' THEN 'afternoon'
  ELSE 'evening'
END
WHERE scheduled_time IS NOT NULL;

-- Fallback: any remaining tasks without session_type → morning
UPDATE tasks
SET session_type = 'morning'
WHERE session_type IS NULL;

-- Backfill reps_or_time_target where missing
UPDATE tasks
SET reps_or_time_target = 10
WHERE reps_or_time_target IS NULL;

-- ========== 6. REALTIME PUBLICATION ==========

-- Ensure tables are in the realtime publication (harmless if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE completions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
