import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { Task } from '../../lib/supabase';
import { ArrowRight } from 'lucide-react';

interface TaskFormProps {
  parentId?: string | null;
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'priority_score'>) => Promise<void>;
  onCancel?: () => void;
  userId: string;
  availableParentTasks?: Task[];
  aiRecommendations?: string[];
}

const TaskForm: React.FC<TaskFormProps> = ({
  parentId = null,
  onSubmit,
  onCancel,
  userId,
  availableParentTasks = [],
  aiRecommendations = [],
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [weight, setWeight] = useState<number>(3);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(parentId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit({
        user_id: userId,
        parent_id: selectedParentId,
        title,
        description: description || null,
        due_date: dueDate || null,
        weight,
        completed: false,
        position: 0, // Will be set on the server
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setDueDate('');
      setWeight(3);
      setSelectedParentId(null);
      setError(null);
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyRecommendation = (recommendation: string) => {
    setTitle(recommendation);
    generateDescription(recommendation);
  };

  const generateDescription = async (taskTitle: string) => {
    setIsGeneratingDescription(true);
    try {
      
      const descriptions = {
        "Complete project proposal": "Create a comprehensive project proposal document including objectives, timeline, resources required, and expected outcomes.",
        "Schedule team meeting": "Organize a team sync to discuss current project status, blockers, and next steps. Send calendar invites to all team members.",
        "Review quarterly reports": "Analyze and validate quarterly performance metrics, financial statements, and key performance indicators.",
        "Prepare presentation slides": "Design and develop presentation slides for the upcoming client meeting, focusing on project milestones and achievements.",
        "Send follow-up emails": "Draft and send follow-up emails to stakeholders regarding action items from the previous meeting."
      };
      
      const aiDescription = descriptions[taskTitle as keyof typeof descriptions] || 
        `${taskTitle} - Implement this task according to project requirements and best practices.`;
      
      setDescription(aiDescription);
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 animate-fade-in">
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold mb-4">
          {parentId ? 'Add Subtask' : 'Add New Task'}
        </h3>
        
        {!parentId && availableParentTasks.length > 0 && (
          <Select
            label="Parent Task (optional)"
            value={selectedParentId || ''}
            onChange={(e) => setSelectedParentId(e.target.value || null)}
            options={[
              { value: '', label: '-- No Parent (Top Level Task) --' },
              ...availableParentTasks.map(task => ({
                value: task.id,
                label: task.title
              }))
            ]}
          />
        )}
        
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
          autoFocus
        />
        
        <div className="relative">
          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
          />
          {title && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute right-2 top-8 bg-green-500 text-green-900 hover:bg-green-600 hover:text-green-950"
              onClick={() => generateDescription(title)}
              isLoading={isGeneratingDescription}
            >
  Generate Description
</Button>

          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Due Date (optional)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          
          <Select
            label="Priority (1-5)"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            options={[
              { value: 1, label: '1 - Low' },
              { value: 2, label: '2 - Medium-Low' },
              { value: 3, label: '3 - Medium' },
              { value: 4, label: '4 - Medium-High' },
              { value: 5, label: '5 - High' },
            ]}
          />
        </div>
        
        {aiRecommendations.length > 0 && (
          <div className="mt-4 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Tasks:</h4>
            <div className="flex flex-wrap gap-2">
              {aiRecommendations.map((rec, idx) => (
                <Button
                  key={idx}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyRecommendation(rec)}
                  className="flex items-center"
                >
                  {rec}
                  <ArrowRight size={14} className="ml-1" />
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {error && <p className="text-error-500 text-sm mt-2">{error}</p>}
        
        <div className="flex justify-end mt-4 gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;