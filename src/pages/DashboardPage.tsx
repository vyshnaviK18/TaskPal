import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useTaskContext } from '../context/TaskContext';
import { calculateTaskStats, generateTaskRecommendations } from '../lib/taskUtils';
import { MoodAPI } from '../lib/apiClient';
import MoodBoard from '../components/tasks/MoodBoard';
import Card from '../components/ui/Card';
import { Navigate } from 'react-router-dom';
import { MoodRecord } from '../lib/supabase';
import { Lightbulb, CheckSquare, Clock } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuthContext();
  const { tasks, loading: tasksLoading } = useTaskContext();
  const [moodRecords, setMoodRecords] = useState<MoodRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoodRecords = async () => {
      if (!user) return;
      
      try {
        const records = await MoodAPI.getUserMoodRecords(user.id);
        setMoodRecords(records);
      } catch (error) {
        console.error('Error fetching mood records:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMoodRecords();
    }
  }, [user]);

  if (authLoading || tasksLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const taskStats = calculateTaskStats(tasks);
  const recommendations = generateTaskRecommendations(tasks);

  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-5 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <div className="flex items-center mb-2">
            <CheckSquare size={18} className="mr-2" />
            <h3 className="font-semibold">Completed Tasks</h3>
          </div>
          <p className="text-3xl font-bold">{taskStats.completed}</p>
          <p className="text-sm opacity-80">
            out of {taskStats.total} tasks ({taskStats.percentage}%)
          </p>
        </Card>
        
        <Card className="p-5 bg-gradient-to-br from-secondary-500 to-secondary-700 text-white">
          <div className="flex items-center mb-2">
            <Clock size={18} className="mr-2" />
            <h3 className="font-semibold">Active Tasks</h3>
          </div>
          <p className="text-3xl font-bold">{taskStats.total - taskStats.completed}</p>
          <p className="text-sm opacity-80">
            tasks in progress
          </p>
        </Card>
        
        <Card className="p-5 bg-gradient-to-br from-accent-500 to-accent-700 text-white">
          <div className="flex items-center mb-2">
            <Lightbulb size={18} className="mr-2" />
            <h3 className="font-semibold">Recommendations</h3>
          </div>
          <p className="text-3xl font-bold">{recommendations.length}</p>
          <p className="text-sm opacity-80">
            insights available
          </p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MoodBoard 
          moodRecords={moodRecords} 
          taskCompletionRate={taskStats.percentage} 
        />
        
        <Card className="p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <Lightbulb size={20} className="text-accent-500 mr-2" />
            <h2 className="text-xl font-bold">Recommendations for Productivity</h2>
          </div>
          
          {recommendations.length > 0 ? (
            <ul className="space-y-3">
              {recommendations.map((rec, idx) => (
                <li 
                  key={idx}
                  className="p-3 bg-gradient-to-r from-accent-50 to-white rounded-lg border border-accent-100"
                >
                  <div className="flex">
                    <span className="mr-3 text-accent-500">💡</span>
                    <p>{rec}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No recommendations available. Add more tasks to get insights!
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;