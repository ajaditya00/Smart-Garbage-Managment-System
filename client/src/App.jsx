import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { pageVariants, pageTransition } from './utils/animations';

// Components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import AppShell from './components/AppShell';

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

// Dashboard Router - routes to appropriate dashboard based on role
const DashboardRouter = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'citizen':
      return <CitizenDashboard />;
    case 'admin':
      return <AdminDashboard activeTab="dashboard" />;
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
  const location = useLocation();
  const isDashboard = user && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register';

  const routes = (
    <Routes location={location}>
      {/* Public Routes */}
      <Route path="/" element={
        user ? <Navigate to="/dashboard" replace /> : <LandingPage />
      } />
      
      <Route path="/login" element={
        user ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      
      <Route path="/register" element={
        user ? <Navigate to="/dashboard" replace /> : <Register />
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardRouter />
        </ProtectedRoute>
      } />

      {/* Admin Nav Routes */}
      <Route path="/admin/complaints" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard activeTab="complaints" />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard activeTab="users" />
        </ProtectedRoute>
      } />
      <Route path="/admin/donations" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard activeTab="donations" />
        </ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard activeTab="analytics" />
        </ProtectedRoute>
      } />
      <Route path="/admin/audit-logs" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard activeTab="audit-logs" />
        </ProtectedRoute>
      } />

      {/* Citizen Nav Routes */}
      <Route path="/report" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <CitizenDashboard />
        </ProtectedRoute>
      } />
      <Route path="/my-complaints" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <CitizenDashboard />
        </ProtectedRoute>
      } />

      {/* Employee/NGO Nav Routes */}
      <Route path="/tasks" element={
        <ProtectedRoute allowedRoles={['employee', 'ngo']}>
          <DashboardRouter />
        </ProtectedRoute>
      } />

      {/* Citizen Routes */}
      <Route path="/complaint/:id" element={
        <ProtectedRoute>
          <ComplaintDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/donate" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <Donation />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

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
        {isDashboard ? (
          <AppShell>
            {routes}
          </AppShell>
        ) : (
          routes
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// App Content Layout Wrapper
const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isDashboard = user && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      {!isDashboard && <Navbar />}
      <AppRoutes />
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#18181b',
            color: '#fafafa',
            border: '1px solid #27272a',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '12px'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;