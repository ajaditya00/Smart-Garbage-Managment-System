import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  Settings, 
  LogOut,
  User,
  PlusCircle,
  BarChart3,
  Users,
  Heart
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAdmin, isCitizen, isEmployee, isNGO } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: Home }
    ];

    if (isCitizen) {
      return [
        ...commonItems,
        { path: '/report', label: 'Report Garbage', icon: PlusCircle },
        { path: '/my-complaints', label: 'My Complaints', icon: FileText },
        { path: '/donate', label: 'Donate', icon: Heart }
      ];
    }

    if (isAdmin) {
      return [
        ...commonItems,
        { path: '/admin/complaints', label: 'All Complaints', icon: FileText },
        { path: '/admin/users', label: 'Manage Users', icon: Users },
        { path: '/admin/donations', label: 'Donations', icon: Heart },
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 }
      ];
    }

    if (isEmployee || isNGO) {
      return [
        ...commonItems,
        { path: '/tasks', label: 'My Tasks', icon: FileText }
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  const NavItem = ({ path, label, icon: Icon, mobile = false }) => {
    const isActive = location.pathname === path;
    
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          to={path}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            isActive
              ? 'bg-primary-600 text-white'
              : mobile
              ? 'text-gray-700 hover:bg-gray-100'
              : 'text-gray-700 hover:text-primary-600'
          }`}
          onClick={() => setIsMenuOpen(false)}
        >
          <Icon size={18} />
          <span>{label}</span>
        </Link>
      </motion.div>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
          >
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">SGMS</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">Smart Garbage Management System</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user && navItems.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
            
            {user && (
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
                <motion.div
                  className="flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-50"
                  whileHover={{ scale: 1.02 }}
                >
                  <User size={18} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                  <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                    {user.role}
                  </span>
                </motion.div>
                
                <motion.button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <LogOut size={18} />
                </motion.button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          {user && (
            <div className="md:hidden flex items-center">
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                whileTap={{ scale: 0.95 }}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-white border-t border-gray-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <NavItem key={item.path} {...item} mobile />
              ))}
              
              <div className="pt-4 border-t border-gray-200 mt-4">
                <div className="flex items-center px-3 py-2">
                  <User size={18} className="text-gray-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                
                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;