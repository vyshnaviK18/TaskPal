import { supabase, Task, MoodRecord } from './supabase';
import { calculatePriorityScore } from './priority';

/**
 * Task API methods
 */
export const TaskAPI = {
  // Get all tasks for the current user
  async getUserTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },
  
  // Create a new task
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'priority_score'>): Promise<Task> {
    const now = new Date().toISOString();
    const priorityScore = calculatePriorityScore({
      ...task,
      id: '',
      created_at: now,
      updated_at: now,
      priority_score: 0
    });
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          created_at: now,
          updated_at: now,
          priority_score: priorityScore
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },
  
  // Update an existing task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const now = new Date().toISOString();
    
    try {
      // First get the current task to calculate new priority score
      const { data: currentTask, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Calculate new priority score if weight or due_date changed
      let priorityScore = currentTask.priority_score;
      if (updates.weight !== undefined || updates.due_date !== undefined) {
        const taskForScoring = {
          ...currentTask,
          ...updates
        };
        priorityScore = calculatePriorityScore(taskForScoring);
      }
      
      // Update the task
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: now,
          priority_score: priorityScore
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },
  
  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },
  
  // Update task positions (for drag and drop)
  async updateTaskPositions(tasks: Pick<Task, 'id' | 'position'>[]): Promise<void> {
    try {
      // Use a transaction to update all positions at once
      const updates = tasks.map(task => ({
        id: task.id,
        position: task.position
      }));
      
      const { error } = await supabase
        .from('tasks')
        .upsert(updates, { onConflict: 'id' });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating task positions:', error);
      throw error;
    }
  }
};

/**
 * Mood Record API methods
 */
export const MoodAPI = {
  // Get mood records for the current user
  async getUserMoodRecords(userId: string): Promise<MoodRecord[]> {
    try {
      const { data, error } = await supabase
        .from('mood_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching mood records:', error);
      throw error;
    }
  },
  
  // Create or update a mood record for today
  async updateMoodRecord(userId: string, score: number, tasksCompleted: number): Promise<MoodRecord> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Check if there's already a record for today
      const { data: existingRecord, error: fetchError } = await supabase
        .from('mood_records')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('mood_records')
          .update({
            score,
            tasks_completed: tasksCompleted
          })
          .eq('id', existingRecord.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('mood_records')
          .insert({
            user_id: userId,
            date: today,
            score,
            tasks_completed: tasksCompleted
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error updating mood record:', error);
      throw error;
    }
  }
};