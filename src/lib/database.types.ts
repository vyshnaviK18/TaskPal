export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          parent_id: string | null
          title: string
          description: string | null
          due_date: string | null
          weight: number
          completed: boolean
          created_at: string
          updated_at: string
          priority_score: number
          position: number
        }
        Insert: {
          id?: string
          user_id: string
          parent_id?: string | null
          title: string
          description?: string | null
          due_date?: string | null
          weight?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
          priority_score?: number
          position?: number
        }
        Update: {
          id?: string
          user_id?: string
          parent_id?: string | null
          title?: string
          description?: string | null
          due_date?: string | null
          weight?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
          priority_score?: number
          position?: number
        }
      }
      mood_records: {
        Row: {
          id: string
          user_id: string
          date: string
          score: number
          tasks_completed: number
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          score: number
          tasks_completed: number
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          score?: number
          tasks_completed?: number
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: string
          notifications_enabled: boolean
          google_calendar_connected: boolean
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string
          notifications_enabled?: boolean
          google_calendar_connected?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string
          notifications_enabled?: boolean
          google_calendar_connected?: boolean
        }
      }
    }
  }
}