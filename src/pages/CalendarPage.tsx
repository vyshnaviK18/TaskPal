import React from 'react';
import CalendarView from '../components/tasks/CalendarView';
import { useAuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const CalendarPage: React.FC = () => {
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
      <CalendarView />
    </div>
  );
};

export default CalendarPage;