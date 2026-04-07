/*
  # Allow anon to manage tasks (Amma config screen)

  The original schema only granted SELECT on `tasks` to the anon role.
  This caused the "+ சேர்க்க" (Add) and "நீக்கு" (Delete) buttons in
  Amma's configuration screen to silently fail with RLS errors.

  This migration adds INSERT, UPDATE, and DELETE policies for the anon
  role on the `tasks` table, matching the same MVP-level "single-family
  trusted device" model already used by `app_state` and `completions`.

  Idempotent: uses DROP POLICY IF EXISTS before each CREATE.
*/

DROP POLICY IF EXISTS "Anyone can insert tasks" ON tasks;
CREATE POLICY "Anyone can insert tasks"
  ON tasks FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update tasks" ON tasks;
CREATE POLICY "Anyone can update tasks"
  ON tasks FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete tasks" ON tasks;
CREATE POLICY "Anyone can delete tasks"
  ON tasks FOR DELETE
  TO anon
  USING (true);