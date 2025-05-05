import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please make sure you have .env file with credentials or connect to Supabase.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  parent_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  weight: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
  priority_score: number;
  position: number;
};

export type MoodRecord = {
  id: string;
  user_id: string;
  date: string;
  score: number;
  tasks_completed: number;
};