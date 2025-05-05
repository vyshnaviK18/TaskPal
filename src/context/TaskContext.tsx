import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task } from '../lib/supabase';
import { TaskAPI } from '../lib/apiClient';
import { useAuthContext } from './AuthContext';
import { updatePriorityScores } from '../lib/taskUtils';
import toast from 'react-hot-toast';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  refreshTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'priority_score'>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTaskPositions: (tasks: Pick<Task, 'id' | 'position'>[]) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch tasks when user changes
  useEffect(() => {
    if (user) {
      refreshTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user]);

  // Refresh tasks from the API
  const refreshTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const fetchedTasks = await TaskAPI.getUserTasks(user.id);
      
      // Update priority scores
      const tasksWithUpdatedScores = updatePriorityScores(fetchedTasks);
      setTasks(tasksWithUpdatedScores);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'priority_score'>) => {
    try {
      const newTask = await TaskAPI.createTask(task);
      setTasks(prev => [...prev, newTask]);
      toast.success('Task created');
      return newTask;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to create task');
      throw error;
    }
  };

  // Update an existing task
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await TaskAPI.updateTask(taskId, updates);
      setTasks(prev => 
        prev.map(task => task.id === taskId ? updatedTask : task)
      );
      if (updates.completed !== undefined) {
        toast.success(updates.completed ? 'Task completed!' : 'Task marked as incomplete');
      } else {
        toast.success('Task updated');
      }
      return updatedTask;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to update task');
      throw error;
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    try {
      await TaskAPI.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to delete task');
      throw error;
    }
  };

  // Update task positions (for drag and drop)
  const updateTaskPositions = async (updatedTasks: Pick<Task, 'id' | 'position'>[]) => {
    try {
      // Optimistically update the UI
      setTasks(prev => {
        const updatedTasksMap = new Map(updatedTasks.map(t => [t.id, t.position]));
        return prev.map(task => {
          const newPosition = updatedTasksMap.get(task.id);
          if (newPosition !== undefined) {
            return { ...task, position: newPosition };
          }
          return task;
        });
      });
      
      // Send the update to the server
      await TaskAPI.updateTaskPositions(updatedTasks);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to update task order');
      // Refresh tasks to get the correct order
      refreshTasks();
      throw error;
    }
  };

  const value = {
    tasks,
    loading,
    error,
    refreshTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskPositions,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}