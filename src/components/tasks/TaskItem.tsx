import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Edit, Trash, CheckCircle, Circle, Plus } from 'lucide-react';
import { Task } from '../../lib/supabase';
import { format, isValid } from 'date-fns';
import TaskForm from './TaskForm';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useTaskContext } from '../../context/TaskContext';

interface TaskItemProps {
  task: Task;
  subtasks: Task[];
  level: number;
  aiRecommendations?: string[];
}

const TaskItem: React.FC<TaskItemProps> = ({ task, subtasks, level, aiRecommendations = [] }) => {
  const { updateTask, deleteTask, createTask } = useTaskContext();
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleComplete = async () => {
    await updateTask(task.id, { completed: !task.completed });
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task? All subtasks will also be deleted.')) {
      await deleteTask(task.id);
    }
  };

  const handleAddSubtask = async (newTask: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'priority_score'>) => {
    await createTask(newTask);
    setShowAddSubtask(false);
  };

  const getPriorityColor = (weight: number) => {
    switch (weight) {
      case 1: return 'gray';
      case 2: return 'primary';
      case 3: return 'secondary';
      case 4: return 'warning';
      case 5: return 'error';
      default: return 'gray';
    }
  };

  const formattedDueDate = task.due_date && isValid(new Date(task.due_date))
    ? format(new Date(task.due_date), 'MMM d, yyyy')
    : 'No due date';

  // Get the indentation based on level
  const indentationClass = `ml-${level * 6}`;
  
  return (
    <>
      <div 
        className={`task-item task-priority-${task.weight} p-3 mb-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all ${indentationClass}`}
      >
        <div className="flex items-center">
          {subtasks.length > 0 && (
            <button 
              onClick={toggleExpand} 
              className="mr-2 text-gray-500 hover:text-gray-800 transition-all"
            >
              {isExpanded ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>
          )}
          
          <button 
            onClick={toggleComplete}
            className="mr-2 text-gray-600 hover:text-primary-500 transition-all"
          >
            {task.completed ? (
              <CheckCircle size={20} className="text-success-500" />
            ) : (
              <Circle size={20} />
            )}
          </button>
          
          <div className="flex-grow">
            <div className="flex items-center">
              <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                {task.title}
              </h3>
              <Badge 
                variant={getPriorityColor(task.weight)}
                size="sm"
                className="ml-2"
              >
                P{task.weight}
              </Badge>
            </div>
            
            {task.description && (
              <p className="text-sm text-gray-600 mt-1">
                {task.description}
              </p>
            )}
            
            <div className="text-xs text-gray-500 mt-1">
              Due: {formattedDueDate}
            </div>
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => setShowAddSubtask(!showAddSubtask)}
              className="p-1 text-gray-500 hover:text-primary-500 transition-all"
              title="Add subtask"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 text-gray-500 hover:text-primary-500 transition-all"
              title="Edit task"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={handleDeleteTask}
              className="p-1 text-gray-500 hover:text-error-500 transition-all"
              title="Delete task"
            >
              <Trash size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {isEditing && (
        <div className={`mb-2 ${indentationClass}`}>
          <div className="bg-white rounded-lg shadow-md p-4 animate-slide-up">
            <h3 className="text-lg font-semibold mb-4">Edit Task</h3>
            {/* Edit form would go here */}
            <Button onClick={() => setIsEditing(false)}>Close</Button>
          </div>
        </div>
      )}
      
      {showAddSubtask && (
        <div className={`mb-2 ${indentationClass}`}>
          <TaskForm
            parentId={task.id}
            onSubmit={handleAddSubtask}
            onCancel={() => setShowAddSubtask(false)}
            userId={task.user_id}
            aiRecommendations={aiRecommendations}
          />
        </div>
      )}
      
      {isExpanded && (
        <div className="subtasks animate-fade-in">
          {subtasks.map((subtask) => {
            const nestedSubtasks = subtasks.filter(
              (t) => t.parent_id === subtask.id
            );
            
            return (
              <TaskItem
                key={subtask.id}
                task={subtask}
                subtasks={nestedSubtasks}
                level={level + 1}
                aiRecommendations={aiRecommendations}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export default TaskItem;