import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { pageVariants, pageTransition } from './utils/animations';

// Components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Citizen Pages
import CitizenDashboard from './pages/citizen/Dashboard';
import ReportGarbage from './pages/citizen/ReportGarbage';
import MyComplaints from './pages/citizen/MyComplaints';
import ComplaintDetail from './pages/citizen/ComplaintDetail';
import DonatePage from './pages/citizen/DonatePage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminComplaints from './pages/admin/Complaints';
import ManageUsers from './pages/admin/ManageUsers';
import Analytics from './pages/admin/Analytics';

// Employee/NGO Pages
import TaskDashboard from './pages/tasks/Dashboard';
import TaskDetail from './pages/tasks/TaskDetail';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Page wrapper with animations
const PageWrapper = ({ children }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Dashboard Router - routes to appropriate dashboard based on role
const DashboardRouter = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'citizen':
      return <CitizenDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'employee':
    case 'ngo':
      return <TaskDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// App Routes Component
const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <PageWrapper>
          {user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        </PageWrapper>
      } />
      
      <Route path="/login" element={
        <PageWrapper>
          {user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        </PageWrapper>
      } />
      
      <Route path="/register" element={
        <PageWrapper>
          {user ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
        </PageWrapper>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <PageWrapper>
            <DashboardRouter />
          </PageWrapper>
        </ProtectedRoute>
      } />

      {/* Citizen Routes */}
      <Route path="/report" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <PageWrapper>
            <ReportGarbage />
          </PageWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/my-complaints" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <PageWrapper>
            <MyComplaints />
          </PageWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/complaint/:id" element={
        <ProtectedRoute>
          <PageWrapper>
            <ComplaintDetail />
          </PageWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/donate" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <PageWrapper>
            <DonatePage />
          </PageWrapper>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/complaints" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PageWrapper>
            <AdminComplaints />
          </PageWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PageWrapper>
            <ManageUsers />
          </PageWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/analytics" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PageWrapper>
            <Analytics />
          </PageWrapper>
        </ProtectedRoute>
      } />

      {/* Employee/NGO Routes */}
      <Route path="/tasks" element={
        <ProtectedRoute allowedRoles={['employee', 'ngo']}>
          <PageWrapper>
            <TaskDashboard />
          </PageWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/task/:id" element={
        <ProtectedRoute allowedRoles={['employee', 'ngo']}>
          <PageWrapper>
            <TaskDetail />
          </PageWrapper>
        </ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <AppRoutes />
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#22c55e',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;