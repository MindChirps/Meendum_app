/*
  # Fix order_index and scheduled_time for proper task sequencing

  1. Issues Fixed:
    - order_index was not unique per session, causing next-task advancement to skip incorrectly
    - scheduled_time was missing (NULL), preventing proper session assignment
    - Multiple tasks had duplicate order_index values across sessions
  
  2. Changes:
    - Renumber all tasks so order_index is sequential (1, 2, 3...) WITHIN each session
    - Set appropriate scheduled_time for each session based on session_type:
      - morning: 08:00
      - afternoon: 14:00
      - evening: 18:00
    - Ensure no gaps or duplicates in ordering per session
*/

DO $$
DECLARE
  v_task RECORD;
  v_new_order INT;
  v_current_session TEXT;
BEGIN
  -- First, set scheduled_time for all tasks based on session_type
  UPDATE tasks
  SET scheduled_time = CASE
    WHEN session_type = 'morning' THEN '08:00'::time
    WHEN session_type = 'afternoon' THEN '14:00'::time
    WHEN session_type = 'evening' THEN '18:00'::time
    ELSE '12:00'::time
  END
  WHERE scheduled_time IS NULL;

  -- Now renumber order_index sequentially within each session
  -- First, create a temp table with proper numbering
  CREATE TEMP TABLE temp_task_order AS
  SELECT 
    id,
    session_type,
    ROW_NUMBER() OVER (PARTITION BY session_type ORDER BY order_index, id) as new_order
  FROM tasks
  WHERE session_type IS NOT NULL;

  -- Update tasks with correct sequential order_index per session
  UPDATE tasks t
  SET order_index = tto.new_order
  FROM temp_task_order tto
  WHERE t.id = tto.id;

  -- Drop temp table
  DROP TABLE temp_task_order;
END $$;
