/*
  # Initial Schema for TaskPal

  1. New Tables
    - `tasks` - Stores task data with hierarchical relationships
    - `mood_records` - Tracks user mood and productivity data
    - `user_preferences` - Stores user preferences like theme and notification settings

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  weight smallint NOT NULL DEFAULT 3 CHECK (weight BETWEEN 1 AND 5),
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  priority_score float NOT NULL DEFAULT 0,
  position integer NOT NULL DEFAULT 0
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks (user_id);
CREATE INDEX IF NOT EXISTS tasks_parent_id_idx ON tasks (parent_id);

-- Create mood_records table
CREATE TABLE IF NOT EXISTS mood_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  score smallint NOT NULL CHECK (score BETWEEN 1 AND 10),
  tasks_completed integer NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS mood_records_user_id_idx ON mood_records (user_id);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'light',
  notifications_enabled boolean NOT NULL DEFAULT true,
  google_calendar_connected boolean NOT NULL DEFAULT false,
  UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can CRUD their own tasks"
  ON tasks
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for mood_records
CREATE POLICY "Users can CRUD their own mood records"
  ON mood_records
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_preferences
CREATE POLICY "Users can CRUD their own preferences"
  ON user_preferences
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);