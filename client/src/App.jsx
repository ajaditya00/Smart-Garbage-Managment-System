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
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboards
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import NgoDashboard from './pages/NgoDashboard';

// Other Pages
import ComplaintDetail from './pages/ComplaintDetail';
import Donation from './pages/Donation';
import Profile from './pages/Profile';

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
      return <EmployeeDashboard />;
    case 'ngo':
      return <NgoDashboard />;
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
          {user ? <Navigate to="/dashboard" replace /> : <Login />}
        </PageWrapper>
      } />
      
      <Route path="/register" element={
        <PageWrapper>
          {user ? <Navigate to="/dashboard" replace /> : <Register />}
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
            <Donation />
          </PageWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <PageWrapper>
            <Profile />
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