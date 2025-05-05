import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { Task } from '../../lib/supabase';
import { useTaskContext } from '../../context/TaskContext';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import 'react-calendar/dist/Calendar.css';

interface DateTasksProps {
  selectedDate: Date;
  tasks: Task[];
}

const DateTasks: React.FC<DateTasksProps> = ({ selectedDate, tasks }) => {
  const { updateTask } = useTaskContext();
  
  const toggleComplete = async (taskId: string, completed: boolean) => {
    await updateTask(taskId, { completed: !completed });
  };

  if (tasks.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">No tasks for this day</p>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      {tasks.map(task => (
        <Card key={task.id} className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task.id, task.completed)}
                className="mr-3 h-5 w-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
              />
              <div>
                <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}
              </div>
            </div>
            <Badge 
              variant={
                task.weight === 5 ? 'error' : 
                task.weight === 4 ? 'warning' : 
                task.weight === 3 ? 'secondary' : 
                task.weight === 2 ? 'primary' : 'gray'
              }
            >
              P{task.weight}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
};

const CalendarView: React.FC = () => {
  const { tasks } = useTaskContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    if (!task.due_date) return acc;
    
    const dateStr = task.due_date.split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Custom tile content to show task counts
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTasks = tasksByDate[dateStr] || [];
    
    if (dayTasks.length === 0) return null;
    
    return (
      <div className="task-count mt-1">
        <div className="h-1.5 w-1.5 rounded-full bg-primary-500 mx-auto"></div>
      </div>
    );
  };

  // Get tasks for selected date
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDateTasks = tasksByDate[selectedDateStr] || [];
  
  return (
    <div className="calendar-view">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Calendar View</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="calendar-container">
          <Card className="p-2 sm:p-4">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              className="w-full custom-calendar"
            />
          </Card>
        </div>
        
        <div className="tasks-for-day">
          <Card className="p-4">
            <h3 className="text-xl font-semibold mb-4">
              Tasks for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <DateTasks
              selectedDate={selectedDate}
              tasks={selectedDateTasks}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;