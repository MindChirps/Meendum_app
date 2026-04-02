/*
  # Add safety constraints

  1. Unique constraint on completions(task_id, date)
     - Prevents duplicate completions for the same task on the same day

  2. CHECK constraint on app_state.mode
     - Restricts mode to 'task' or 'rest' only

  These are additive and safe to run on an existing database.
*/

-- Prevent duplicate task completions per day
ALTER TABLE completions
  ADD CONSTRAINT completions_task_date_unique UNIQUE (task_id, date);

-- Restrict mode to known values
ALTER TABLE app_state
  ADD CONSTRAINT app_state_mode_check CHECK (mode IN ('task', 'rest'));
