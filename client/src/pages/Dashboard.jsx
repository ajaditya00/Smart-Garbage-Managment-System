import React from 'react';
import { useAuth } from '../context/AuthContext';
import CitizenDashboard from './CitizenDashboard';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import NgoDashboard from './NgoDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'citizen':
        return <CitizenDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      case 'ngo':
        return <NgoDashboard />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Invalid Role</h2>
              <p className="text-gray-600 mt-2">Please contact administrator</p>
            </div>
          </div>
        );
    }
  };

  return renderDashboard();
};

export default Dashboard;