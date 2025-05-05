import { Task } from './supabase';
import { differenceInDays } from 'date-fns';

/**
 * Calculate priority score for a task based on weight and due date
 * Higher score = higher priority
 */
export const calculatePriorityScore = (task: Task): number => {
  if (!task.due_date) {
    // Tasks without due dates get lower priority
    return task.weight * 10;
  }

  const dueDate = new Date(task.due_date);
  const today = new Date();
  const daysUntilDue = differenceInDays(dueDate, today);
  
  // Algorithm weighs tasks that are due soon as higher priority
  // The closer to due date, the higher the priority score
  // Past due items get highest priority
  if (daysUntilDue < 0) {
    // Overdue tasks get higher priority based on how overdue they are
    return 1000 + (task.weight * 100) + (Math.abs(daysUntilDue) * 10);
  } else if (daysUntilDue === 0) {
    // Due today
    return 900 + (task.weight * 100);
  } else if (daysUntilDue <= 1) {
    // Due tomorrow
    return 800 + (task.weight * 100);
  } else if (daysUntilDue <= 3) {
    // Due in 2-3 days
    return 700 + (task.weight * 50) - (daysUntilDue * 5);
  } else if (daysUntilDue <= 7) {
    // Due this week
    return 600 + (task.weight * 40) - (daysUntilDue * 4);
  } else if (daysUntilDue <= 14) {
    // Due next week
    return 400 + (task.weight * 30) - (daysUntilDue * 2);
  } else if (daysUntilDue <= 30) {
    // Due this month
    return 300 + (task.weight * 20) - daysUntilDue;
  } else {
    // Due later
    return 100 + (task.weight * 10);
  }
};

/**
 * Sort tasks by priority score (descending)
 */
export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => b.priority_score - a.priority_score);
};

/**
 * Get top N urgent tasks
 */
export const getTopUrgentTasks = (tasks: Task[], limit = 5): Task[] => {
  return sortTasksByPriority(tasks).slice(0, limit);
};

/**
 * Get tasks due today or tomorrow
 */
export const getUpcomingTasks = (tasks: Task[]): Task[] => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  return tasks.filter(task => {
    if (!task.due_date) return false;
    const taskDateStr = task.due_date.split('T')[0];
    return taskDateStr === todayStr || taskDateStr === tomorrowStr;
  });
};