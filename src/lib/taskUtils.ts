import { Task } from './supabase';
import { calculatePriorityScore } from './priority';

/**
 * Build a hierarchical tree from flat task list
 */
export const buildTaskTree = (tasks: Task[]): Task[] => {
  const taskMap = new Map<string, Task & { children: Task[] }>();
  
  // First pass: Create enhanced tasks with children array and add to map
  tasks.forEach(task => {
    taskMap.set(task.id, { ...task, children: [] });
  });
  
  // Second pass: Build hierarchy
  const rootTasks: Task[] = [];
  
  taskMap.forEach(task => {
    if (task.parent_id === null) {
      rootTasks.push(task);
    } else {
      const parent = taskMap.get(task.parent_id);
      if (parent) {
        parent.children.push(task);
      } else {
        // Orphaned task (parent doesn't exist)
        rootTasks.push(task);
      }
    }
  });
  
  return rootTasks;
};

/**
 * Flatten task tree back to array
 */
export const flattenTaskTree = (tasks: (Task & { children?: Task[] })[]): Task[] => {
  let result: Task[] = [];
  
  tasks.forEach(task => {
    // Add current task (without children property)
    const { children, ...taskWithoutChildren } = task;
    result.push(taskWithoutChildren);
    
    // Recursively add children
    if (children && children.length > 0) {
      result = result.concat(flattenTaskTree(children));
    }
  });
  
  return result;
};

/**
 * Update priority scores for all tasks
 */
export const updatePriorityScores = (tasks: Task[]): Task[] => {
  return tasks.map(task => ({
    ...task,
    priority_score: calculatePriorityScore(task)
  }));
};

/**
 * Generate recommendations for task management
 */
export const generateTaskRecommendations = (tasks: Task[]): string[] => {
  const recommendations: string[] = [];
  
  // Check for overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date() && !task.completed;
  });
  
  if (overdueTasks.length > 0) {
    recommendations.push(`You have ${overdueTasks.length} overdue tasks. Consider rescheduling or completing them soon.`);
  }
  
  // Check for tasks without due dates
  const tasksWithoutDueDates = tasks.filter(task => !task.due_date && !task.completed);
  if (tasksWithoutDueDates.length > 0) {
    recommendations.push(`${tasksWithoutDueDates.length} tasks don't have due dates. Adding due dates helps with prioritization.`);
  }
  
  // Check for high priority tasks due soon
  const highPriorityTasks = tasks.filter(task => task.weight >= 4 && !task.completed);
  if (highPriorityTasks.length > 0) {
    recommendations.push(`You have ${highPriorityTasks.length} high priority tasks. Focus on these first.`);
  }
  
  // Add general recommendations
  if (recommendations.length < 3) {
    recommendations.push("Break down large tasks into smaller subtasks for better manageability.");
  }
  
  if (recommendations.length < 3) {
    recommendations.push("Consider using the calendar view to plan your week ahead.");
  }
  
  return recommendations;
};

/**
 * Calculate task completion statistics
 */
export const calculateTaskStats = (tasks: Task[]): { completed: number; total: number; percentage: number } => {
  const completed = tasks.filter(task => task.completed).length;
  const total = tasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
};