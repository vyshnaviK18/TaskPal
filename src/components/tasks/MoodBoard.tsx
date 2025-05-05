import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import Card from '../ui/Card';
import { MoodRecord } from '../../lib/supabase';
import { format } from 'date-fns';

interface MoodBoardProps {
  moodRecords: MoodRecord[];
  taskCompletionRate: number;
}

const MoodBoard: React.FC<MoodBoardProps> = ({ 
  moodRecords, 
  taskCompletionRate 
}) => {
  const lastSevenRecords = [...moodRecords]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);
  
  const chartData = lastSevenRecords.map(record => ({
    date: format(new Date(record.date), 'MMM d'),
    mood: record.score,
    tasks: record.tasks_completed
  }));
  
  const getMoodDescription = (completionRate: number) => {
    if (completionRate >= 80) {
      return {
        emoji: "🎉",
        text: "Excellent productivity! Keep up the great work!",
        color: "text-success-500"
      };
    } else if (completionRate >= 60) {
      return { 
        emoji: "😊",
        text: "Good progress! You're on the right track.",
        color: "text-primary-500"
      };
    } else if (completionRate >= 40) {
      return {
        emoji: "🙂",
        text: "Steady progress. Keep pushing forward!",
        color: "text-secondary-500"
      };
    } else if (completionRate >= 20) {
      return {
        emoji: "😐",
        text: "You're making some progress. Try to focus more.",
        color: "text-warning-500"
      };
    } else {
      return {
        emoji: "😔",
        text: "Time to get back on track. You can do this!",
        color: "text-error-500"
      };
    }
  };
  
  const moodInfo = getMoodDescription(taskCompletionRate);
  
  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-xl font-bold mb-4">Mood & Productivity Board</h2>
      
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">{moodInfo.emoji}</div>
        <p className={`font-medium ${moodInfo.color}`}>{moodInfo.text}</p>
        <p className="text-gray-600 mt-1">
          Task completion rate: {taskCompletionRate}%
        </p>
      </div>
      
      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Mood Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#0ea5e9" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="h-64">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tasks Completed</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="#14b8a6" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          No mood data yet. Complete some tasks to see your trends!
        </p>
      )}
    </Card>
  );
};

export default MoodBoard;