import React, { useState } from 'react';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import { Task } from '../../lib/supabase';
import { buildTaskTree } from '../../lib/taskUtils';
import { useAuthContext } from '../../context/AuthContext';
import { useTaskContext } from '../../context/TaskContext';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';

const TaskList: React.FC = () => {
  const { user } = useAuthContext();
  const { tasks, createTask, loading } = useTaskContext();
  const [showForm, setShowForm] = useState(false);
  
  
  const aiRecommendations = [
    "Complete project proposal",
    "Schedule team meeting",
    "Review quarterly reports",
    "Prepare presentation slides",
    "Send follow-up emails"
  ];

  const handleCreateTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'priority_score'>) => {
    await createTask(task);
    setShowForm(false);
  };

  // Get available parent tasks (non-completed tasks)
  const availableParentTasks = tasks.filter(task => !task.completed);

  if (!user) {
    return <p className="text-center">Please log in to manage tasks.</p>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Build task tree
  const rootTasks = tasks.filter(task => task.parent_id === null);
  const taskTree = buildTaskTree(tasks);

  return (
    <div className="task-list-container">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Tasks</h2>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Add Task
        </Button>
      </div>

      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
          userId={user.id}
          availableParentTasks={availableParentTasks}
          aiRecommendations={aiRecommendations}
        />
      )}

      <div className="task-list">
        {rootTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-medium text-gray-500 mb-2">No tasks yet</h3>
            <p className="text-gray-500 mb-4">Create your first task to get started!</p>
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)}
                className="mx-auto"
              >
                Create Task
              </Button>
            )}
          </div>
        ) : (
          rootTasks.map(task => {
            const directSubtasks = tasks.filter(t => t.parent_id === task.id);
            return (
              <TaskItem
                key={task.id}
                task={task}
                subtasks={directSubtasks}
                level={0}
                aiRecommendations={aiRecommendations}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default TaskList;