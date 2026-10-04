import React, { useState, useEffect } from 'react';
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
  Heart,
  Bell,
  Search,
  ShieldCheck
} from 'lucide-react';
import CommandPalette from './CommandPalette';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const { user, logout, isAdmin, isCitizen, isEmployee, isNGO } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync notification unread count from localStorage
  useEffect(() => {
    const updateUnreadCount = () => {
      const raw = localStorage.getItem('swachhai_notifications');
      if (raw) {
        const notifs = JSON.parse(raw);
        const unread = notifs.filter(n => !n.read).length;
        setUnreadNotifications(unread);
      } else {
        setUnreadNotifications(1); // Prepopulated welcome is unread initially
      }
    };

    updateUnreadCount();
    window.addEventListener('swachhai-notification-updated', updateUnreadCount);
    return () => window.removeEventListener('swachhai-notification-updated', updateUnreadCount);
  }, []);

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
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldCheck }
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
      <div>
        <Link
          to={path}
          className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors duration-150 ${
            isActive
              ? 'bg-brand-500 text-white font-bold shadow-xs'
              : mobile
              ? 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
          onClick={() => setIsMenuOpen(false)}
        >
          <Icon size={18} className={isActive ? "text-white" : "text-neutral-400 dark:text-neutral-400"} />
          <span>{label}</span>
        </Link>
      </div>
    );
  };

  return (
    <nav className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-md border-b border-gray-100 dark:border-neutral-800 sticky top-0 z-50 w-full transition-all duration-300">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
          >
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">AI</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-neutral-100 hidden sm:block">Swachh AI</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {user ? (
              <>
                {/* Global Command Palette search box trigger */}
                <button
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-150 text-xs font-semibold mr-2 cursor-pointer"
                >
                  <Search size={14} />
                  <span>Search...</span>
                  <kbd className="text-[10px] text-neutral-400 bg-white dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">⌘K</kbd>
                </button>

                {navItems.map((item) => (
                  <NavItem key={item.path} {...item} />
                ))}
                
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-neutral-200 dark:border-neutral-800">
                  {/* Notifications bell icon with unread badge */}
                  <button
                    onClick={() => setIsNotificationsOpen(true)}
                    className="p-2 text-neutral-500 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 rounded-xl transition-colors duration-150 relative cursor-pointer"
                    aria-label="Open notifications"
                  >
                    <Bell size={18} />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                    )}
                  </button>

                  <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                    <div className="p-1 bg-brand-100 dark:bg-brand-950/80 rounded-lg">
                      <User size={16} className="text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 leading-tight">
                        {user.name}
                      </span>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
                        {user.role}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    aria-label="Logout"
                    className="p-2 text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 rounded-xl transition-colors duration-150 cursor-pointer"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-neutral-600 hover:text-brand-600 px-4 py-2 text-sm font-medium transition-all">
                  Sign In
                </Link>
                <Link to="/register" className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all hover:shadow">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className="p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-white border-t border-neutral-200 shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pt-2 pb-5 space-y-3">
              {user ? (
                <>
                  {navItems.map((item) => (
                    <NavItem key={item.path} {...item} mobile />
                  ))}
                  
                  <div className="pt-4 border-t border-neutral-200 mt-4">
                    <div className="flex items-center px-3 py-2">
                      <User size={18} className="text-neutral-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-neutral-700">{user.name}</p>
                        <p className="text-xs text-neutral-500 capitalize">{user.role}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2 mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
                    >
                      <LogOut size={18} className="mr-2" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full text-center bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-lg text-sm font-semibold shadow-xs transition-colors">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
      <NotificationCenter 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;