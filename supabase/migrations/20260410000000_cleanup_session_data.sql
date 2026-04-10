/*
  # Cleanup: fix session assignments and remove test duplicates

  The original backfill in 20260407120000 naively assigned ALL pre-existing
  tasks to 'morning'. This migration:

  1. Deletes orphan test rows (added via Amma's config form during testing,
     identifiable by NULL scheduled_time — these are duplicates not part of
     the original seed data).

  2. Re-assigns session_type for the original seed tasks based on their
     scheduled_time:
       08:00–11:59 → morning
       12:00–16:59 → afternoon
       17:00+       → evening

  3. Sets a default reps_or_time_target (10) on any tasks still missing it.

  Idempotent: safe to re-run.
*/

-- 1. Remove test duplicates: rows that have no scheduled_time are
--    not original seed data — they were added via the config form.
DELETE FROM tasks
WHERE scheduled_time IS NULL;

-- 2. Reassign session_type based on actual scheduled_time
UPDATE tasks
SET session_type = CASE
  WHEN scheduled_time::time < '12:00:00' THEN 'morning'
  WHEN scheduled_time::time < '17:00:00' THEN 'afternoon'
  ELSE 'evening'
END
WHERE scheduled_time IS NOT NULL;

-- 3. Backfill reps_or_time_target where missing
UPDATE tasks
SET reps_or_time_target = 10
WHERE reps_or_time_target IS NULL;
