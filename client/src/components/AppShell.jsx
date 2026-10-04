import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Trash2,
  HelpCircle,
  Sliders,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CommandPalette from './CommandPalette';
import NotificationCenter from './NotificationCenter';

const AppShell = ({ children }) => {
  const { user, logout, isAdmin, isCitizen, isEmployee, isNGO } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('swachhai_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
  });

  // Toggle Sidebar Collapse
  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('swachhai_sidebar_collapsed', JSON.stringify(next));
      return next;
    });
  };

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

  // Sync notification unread count
  useEffect(() => {
    const updateUnreadCount = () => {
      const raw = localStorage.getItem('swachhai_notifications');
      if (raw) {
        const notifs = JSON.parse(raw);
        const unread = notifs.filter(n => !n.read).length;
        setUnreadNotifications(unread);
      } else {
        setUnreadNotifications(1);
      }
    };

    updateUnreadCount();
    window.addEventListener('swachhai-notification-updated', updateUnreadCount);
    return () => window.removeEventListener('swachhai-notification-updated', updateUnreadCount);
  }, []);

  // Theme Toggler
  const toggleTheme = () => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Roles Navigation Items mapping
  const navItems = (() => {
    const items = [
      { path: '/dashboard', label: 'Dashboard', icon: Home }
    ];

    if (isCitizen) {
      items.push(
        { path: '/report', label: 'Report Garbage', icon: PlusCircle },
        { path: '/my-complaints', label: 'My Complaints', icon: FileText },
        { path: '/donate', label: 'Donate Fund', icon: Heart }
      );
    } else if (isAdmin) {
      items.push(
        { path: '/admin/complaints', label: 'All Reports', icon: FileText },
        { path: '/admin/users', label: 'Manage Users', icon: Users },
        { path: '/admin/donations', label: 'Donations', icon: Heart },
        { path: '/admin/analytics', label: 'SaaS Analytics', icon: BarChart3 },
        { path: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldCheck }
      );
    } else if (isEmployee || isNGO) {
      items.push(
        { path: '/tasks', label: 'Assigned Tasks', icon: FileText }
      );
    }

    // Common Profile Tab
    items.push({ path: '/profile', label: 'User Profile', icon: User });
    return items;
  })();

  // Generate dynamic breadcrumbs based on pathname
  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    return segments.map((seg, index) => {
      const url = `/${segments.slice(0, index + 1).join('/')}`;
      const isLast = index === segments.length - 1;
      const cleanLabel = seg.replace(/-/g, ' ');
      return { url, label: cleanLabel, isLast };
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex transition-colors duration-300">
      
      {/* ===== FLOATING rounded SIDEBAR ===== */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? '76px' : '260px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-4 bottom-4 left-4 z-40 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 rounded-2xl shadow-xl shadow-neutral-100/50 dark:shadow-none flex flex-col justify-between overflow-hidden print:hidden"
      >
        {/* Workspace Brand Logo */}
        <div>
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 shrink-0 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Trash2 size={20} className="text-white" />
              </div>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <p className="text-neutral-900 dark:text-neutral-50 font-black text-sm leading-tight tracking-tight">Swachh AI</p>
                  <p className="text-[10px] text-brand-600 font-bold tracking-widest uppercase mt-0.5">SaaS Node</p>
                </motion.div>
              )}
            </Link>
          </div>

          {/* Sidebar Navigation Items */}
          <nav className="p-3 space-y-1.5 mt-4" role="navigation" aria-label="Sidebar Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-150 relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 ${
                    isActive 
                      ? 'text-brand-700 dark:text-brand-400 bg-brand-50/90 dark:bg-brand-950/40 dark:border dark:border-brand-800/30 font-bold shadow-xs' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70'
                  }`}
                >
                  <Icon 
                    size={18} 
                    className={`shrink-0 transition-colors duration-150 ${
                      isActive 
                        ? 'text-brand-600 dark:text-brand-400' 
                        : 'text-neutral-400 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200'
                    }`} 
                  />
                  {!isSidebarCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="ml-3 truncate leading-none"
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute right-0 top-2 bottom-2 w-1 bg-brand-500 dark:bg-brand-400 rounded-l-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Collapsible toggle & Profile trigger */}
        <div>
          {/* Collapse sidebar controller */}
          <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <button
              onClick={toggleSidebar}
              className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 transition-colors duration-150 cursor-pointer"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* User profile capsule card */}
          {user && (
            <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900">
              <div className="flex items-center p-1.5 rounded-xl justify-between overflow-hidden">
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950/80 flex items-center justify-center font-bold text-brand-700 dark:text-brand-400 text-xs shrink-0 border border-brand-200/50 dark:border-brand-800/40">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  {!isSidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-left overflow-hidden"
                    >
                      <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">{user.name}</p>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest leading-none mt-0.5 truncate">{user.role}</p>
                    </motion.div>
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <button 
                    onClick={handleLogout}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-150 cursor-pointer"
                    aria-label="Logout"
                  >
                    <LogOut size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ===== STICKY HEADER & MAIN LAYOUT PANEL ===== */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'pl-28' : 'pl-[290px]'
      } pr-6 py-4`}>
        
        {/* Sticky Header component */}
        <header className="sticky top-4 z-30 bg-white/70 dark:bg-neutral-900/75 backdrop-blur-md border border-neutral-200/40 dark:border-neutral-800/40 rounded-2xl shadow-sm px-6 py-3.5 mb-8 flex justify-between items-center print:hidden">
          
          {/* Breadcrumb section */}
          <div className="flex items-center space-x-2">
            <Link to="/dashboard" className="text-xs font-bold text-neutral-400 hover:text-brand-600 transition-colors">
              Home
            </Link>
            {breadcrumbs.map((crumb) => (
              <React.Fragment key={crumb.url}>
                <ChevronRight size={12} className="text-neutral-300 dark:text-neutral-700" />
                <Link
                  to={crumb.url}
                  className={`text-xs font-black capitalize transition-colors ${
                    crumb.isLast 
                      ? 'text-neutral-800 dark:text-neutral-200 cursor-default' 
                      : 'text-neutral-400 hover:text-brand-600'
                  }`}
                  onClick={(e) => crumb.isLast && e.preventDefault()}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </div>

          {/* Quick Actions & Header Controls */}
          <div className="flex items-center space-x-4">
            
            {/* Search command shortcut */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:flex items-center space-x-2 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/70 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-xl px-3.5 py-1.5 transition-colors duration-150 font-medium cursor-pointer"
            >
              <Search size={13} />
              <span>Search platform...</span>
              <kbd className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-750 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase text-neutral-500 dark:text-neutral-400">
                ⌘K
              </kbd>
            </button>

            {/* Notification Bell toggle with unread badge */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 text-neutral-500 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 rounded-xl transition-colors duration-150 cursor-pointer"
              aria-label="Open notifications drawer"
            >
              <Bell size={16} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white dark:ring-neutral-900" />
              )}
            </button>

            {/* Light/Dark Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 text-neutral-500 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 rounded-xl transition-colors duration-150 cursor-pointer"
              aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Quick Actions Dropdown */}
            {isCitizen && (
              <Link 
                to="/report" 
                className="bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-xs font-bold shadow-xs px-3.5 py-2 rounded-xl transition-colors duration-150 flex items-center gap-1.5"
              >
                <PlusCircle size={14} /> Report Spot
              </Link>
            )}

            {/* Profile Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-1.5 p-1 rounded-xl hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 transition-colors duration-150 cursor-pointer"
                  aria-label="User menu"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-950/80 flex items-center justify-center font-bold text-brand-700 dark:text-brand-400 text-xs border border-brand-200/50 dark:border-brand-800/40">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown size={12} className="text-neutral-400" />
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl shadow-neutral-100/50 dark:shadow-none p-1.5 z-50 text-left"
                      >
                        <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                          <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">{user.name}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5 truncate">{user.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center w-full px-3 py-2 mt-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/80 rounded-lg transition-colors"
                        >
                          <User size={13} className="mr-2" /> View Profile
                        </Link>
                        <button
                          onClick={() => { setIsProfileDropdownOpen(false); handleLogout(); }}
                          className="flex items-center w-full px-3 py-2 mt-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors text-left"
                        >
                          <LogOut size={13} className="mr-2" /> Logout
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

          </div>
        </header>

        {/* Main Dashboard Screen Viewport */}
        <main className="flex-1 min-h-0 flex flex-col justify-start">
          {children}
        </main>
      </div>

      {/* Mounting command palette and drawer overlays */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
      <NotificationCenter 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />

    </div>
  );
};

export default AppShell;
