import React from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { getTopUrgentTasks } from '../../lib/priority';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

const PriorityView: React.FC = () => {
  const { tasks, updateTask } = useTaskContext();
  
  // Get top 5 urgent tasks
  const topUrgentTasks = getTopUrgentTasks(tasks, 5);
  
  const getDateStatus = (dateStr: string | null) => {
    if (!dateStr) return { text: 'No due date', variant: 'gray' };
    
    const date = new Date(dateStr);
    
    if (isPast(date) && !isToday(date)) {
      return { text: `Overdue: ${format(date, 'MMM d')}`, variant: 'error' };
    } else if (isToday(date)) {
      return { text: 'Due today', variant: 'warning' };
    } else if (isTomorrow(date)) {
      return { text: 'Due tomorrow', variant: 'accent' };
    } else {
      return { text: `Due: ${format(date, 'MMM d')}`, variant: 'primary' };
    }
  };
  
  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    await updateTask(taskId, { completed: !completed });
  };
  
  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center mb-4">
        <AlertTriangle size={20} className="text-warning-500 mr-2" />
        <h2 className="text-xl font-bold">Priority Focus</h2>
      </div>
      
      {topUrgentTasks.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No tasks to prioritize yet. Add some tasks to get started!
        </p>
      ) : (
        <ul className="space-y-3">
          {topUrgentTasks.map(task => {
            const dateStatus = getDateStatus(task.due_date);
            
            return (
              <li 
                key={task.id}
                className={`p-3 rounded-lg border-l-4 ${
                  task.weight === 5 ? 'border-error-500 bg-error-50' :
                  task.weight === 4 ? 'border-warning-500 bg-warning-50' :
                  task.weight === 3 ? 'border-secondary-500 bg-secondary-50' :
                  task.weight === 2 ? 'border-primary-500 bg-primary-50' :
                  'border-gray-500 bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id, task.completed)}
                    className="mr-3 h-5 w-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                  />
                  
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                      </h3>
                      <Badge variant={dateStatus.variant} size="sm" className="flex items-center ml-2">
                        <Clock size={12} className="mr-1" />
                        {dateStatus.text}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default PriorityView;