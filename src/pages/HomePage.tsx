import React from 'react';
import TaskList from '../components/tasks/TaskList';
import PriorityView from '../components/tasks/PriorityView';
import { useAuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="page-container">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskList />
        </div>
        <div>
          <PriorityView />
        </div>
      </div>
    </div>
  );
};

export default HomePage;