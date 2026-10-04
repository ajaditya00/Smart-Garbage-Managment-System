import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckSquare, Trash2, Calendar, Clipboard, AlertCircle, Info } from 'lucide-react';

// Static/localStorage notifications helper utility
export const addNotification = (title, message, type = 'info') => {
  const current = JSON.parse(localStorage.getItem('swachhai_notifications') || '[]');
  const newNotif = {
    id: Date.now().toString(),
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('swachhai_notifications', JSON.stringify([newNotif, ...current]));
  window.dispatchEvent(new CustomEvent('swachhai-notification-updated'));
};

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  useEffect(() => {
    loadNotifications();
    const handleUpdate = () => loadNotifications();
    window.addEventListener('swachhai-notification-updated', handleUpdate);
    return () => window.removeEventListener('swachhai-notification-updated', handleUpdate);
  }, []);

  const loadNotifications = () => {
    const raw = localStorage.getItem('swachhai_notifications');
    let loaded = [];
    if (raw) {
      loaded = JSON.parse(raw);
    } else {
      // Prepopulate with a welcome notification if empty
      loaded = [
        {
          id: 'welcome-1',
          title: 'Welcome to Swachh AI 🌟',
          message: 'Explore your dashboard, report local issues, or join volunteer cleaning tasks.',
          type: 'info',
          read: false,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('swachhai_notifications', JSON.stringify(loaded));
    }
    setNotifications(loaded);
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  const saveNotifications = (updated) => {
    setNotifications(updated);
    localStorage.setItem('swachhai_notifications', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('swachhai-notification-updated'));
  };

  const getFilteredNotifications = () => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  };

  // Group notifications by Today, Yesterday, Older
  const getGroupedNotifications = () => {
    const filtered = getFilteredNotifications();
    const groups = { Today: [], Yesterday: [], Older: [] };

    filtered.forEach(n => {
      const date = new Date(n.createdAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        groups.Today.push(n);
      } else if (date.toDateString() === yesterday.toDateString()) {
        groups.Yesterday.push(n);
      } else {
        groups.Older.push(n);
      }
    });

    return groups;
  };

  const grouped = getGroupedNotifications();
  const hasNotifications = notifications.length > 0;
  const filteredListLength = getFilteredNotifications().length;

  // Render proper icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'complaint':
        return <Clipboard className="w-4 h-4 text-brand-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-warning-solid" />;
      case 'success':
        return <Check className="w-4 h-4 text-success-solid" />;
      default:
        return <Info className="w-4 h-4 text-info-solid" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-white dark:bg-neutral-900 shadow-2xl border-l border-neutral-200 dark:border-neutral-800 flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Bell className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">Notification Center</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Bar */}
              {hasNotifications && (
                <div className="px-6 py-3 border-b border-neutral-50 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between text-xs">
                  <div className="flex space-x-2.5">
                    <button
                      onClick={() => setFilter('all')}
                      className={`font-semibold transition-colors ${
                        filter === 'all' ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter('unread')}
                      className={`font-semibold transition-colors ${
                        filter === 'unread' ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      Unread
                    </button>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={markAllRead}
                      className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center space-x-1"
                    >
                      <CheckSquare size={12} />
                      <span>Mark all read</span>
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-neutral-500 hover:text-danger-solid flex items-center space-x-1"
                    >
                      <Trash2 size={12} />
                      <span>Clear all</span>
                    </button>
                  </div>
                </div>
              )}

              {/* List Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {filteredListLength === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center max-w-xs mx-auto py-12">
                    <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 border border-neutral-100 dark:border-neutral-700 mb-4">
                      <Bell className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">All caught up!</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                      {filter === 'unread' ? "You don't have any unread notifications." : "You've read all alerts and status logs."}
                    </p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([groupName, items]) => {
                    if (items.length === 0) return null;

                    return (
                      <div key={groupName} className="space-y-3">
                        <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-2">
                          {groupName}
                        </h4>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className={`p-3.5 border rounded-xl flex items-start space-x-3 transition-all relative ${
                                item.read
                                  ? 'bg-white dark:bg-neutral-900 border-neutral-150 dark:border-neutral-800 opacity-70'
                                  : 'bg-brand-50/20 dark:bg-brand-950/10 border-brand-100 dark:border-brand-900/30'
                              }`}
                            >
                              {/* Read Indicator dot */}
                              {!item.read && (
                                <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-brand-500" />
                              )}

                              <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border border-neutral-200/40 dark:border-neutral-700/40">
                                {getIcon(item.type)}
                              </div>

                              <div className="flex-1 min-w-0 pr-4">
                                <p className="text-xs font-bold text-neutral-900 dark:text-neutral-50">
                                  {item.title}
                                </p>
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                                  {item.message}
                                </p>
                                <span className="text-[9px] text-neutral-400 font-medium block mt-1.5">
                                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <div className="flex items-center space-x-1.5 self-center">
                                {!item.read && (
                                  <button
                                    onClick={() => markAsRead(item.id)}
                                    className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-400 hover:text-brand-500 transition-colors"
                                    title="Mark as read"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(item.id)}
                                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-400 hover:text-danger-solid transition-colors"
                                  title="Delete notification"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;
