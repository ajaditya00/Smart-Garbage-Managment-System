import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, FileText, User, Users, Heart, Clipboard, HelpCircle, ArrowRight, CornerDownLeft, Sparkles, Clock, Trash2, ShieldCheck } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  // Load search history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('swachhai_search_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // List of static pages based on user role
  const getStaticPages = () => {
    const defaultPages = [
      { name: 'Profile Settings', path: '/profile', icon: User, category: 'Pages' },
      { name: 'Garbage & Cleanup Donations', path: '/donate', icon: Heart, category: 'Pages' }
    ];

    if (user) {
      defaultPages.unshift({ name: 'Dashboard', path: '/dashboard', icon: Command, category: 'Pages' });
      if (user.role === 'admin') {
        defaultPages.push({ name: 'Audit Logs & CRUD Trail', path: '/admin/audit-logs', icon: ShieldCheck, category: 'Pages' });
      }
    }

    return defaultPages;
  };

  // List of Quick Actions based on user role
  const getQuickActions = () => {
    const actions = [];
    if (user?.role === 'citizen') {
      actions.push({
        name: 'Report New Garbage Complaint',
        action: () => {
          navigate('/dashboard');
          // Dispatch custom event to trigger CitizenDashboard modal opening
          setTimeout(() => window.dispatchEvent(new CustomEvent('open-new-complaint-modal')), 100);
        },
        icon: FileText,
        category: 'Quick Actions'
      });
    }
    actions.push({
      name: 'Make a Support Donation',
      action: () => navigate('/donate'),
      icon: Heart,
      category: 'Quick Actions'
    });
    actions.push({
      name: 'Update Profile Details',
      action: () => navigate('/profile'),
      icon: User,
      category: 'Quick Actions'
    });
    return actions;
  };

  // Debounced search logic for dynamic elements (complaints, users/employees/NGOs)
  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        let matchedItems = [];

        // 1. Search complaints
        const complaintsRes = await api.get('/complaints');
        const complaints = complaintsRes.data || [];
        const filteredComplaints = complaints
          .filter(c => 
            c.title.toLowerCase().includes(query.toLowerCase()) ||
            c.description.toLowerCase().includes(query.toLowerCase())
          )
          .map(c => ({
            id: c._id,
            name: c.title,
            description: c.description,
            path: `/complaint/${c._id}`,
            icon: Clipboard,
            category: 'Complaints'
          }));
        matchedItems = [...matchedItems, ...filteredComplaints];

        // 2. Search users/employees/NGOs (if Admin)
        if (user?.role === 'admin') {
          const usersRes = await api.get('/admin/users');
          const users = usersRes.data || [];
          const filteredUsers = users
            .filter(u => 
              u.name.toLowerCase().includes(query.toLowerCase()) ||
              u.email.toLowerCase().includes(query.toLowerCase()) ||
              u.role.toLowerCase().includes(query.toLowerCase())
            )
            .map(u => ({
              id: u._id,
              name: u.name,
              description: `${u.role.toUpperCase()} • ${u.email}`,
              path: '/dashboard', // Navigates to dashboard where employee/ngo logs are managed
              icon: u.role === 'ngo' ? Users : User,
              category: u.role === 'ngo' ? 'NGO Partners' : 'Employees'
            }));
          matchedItems = [...matchedItems, ...filteredUsers];
        }

        setResults(matchedItems);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Command palette search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, isOpen, user]);

  // Aggregate current active options list
  const getActiveOptions = () => {
    if (query.trim() === '') {
      // Show default pages + quick actions + recent history
      const sections = [...getQuickActions(), ...getStaticPages()];
      return sections;
    }
    return results;
  };

  const activeOptions = getActiveOptions();

  // Keyboard navigation listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, activeOptions.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + activeOptions.length) % Math.max(1, activeOptions.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeOptions[selectedIndex]) {
          executeOption(activeOptions[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeOptions, selectedIndex]);

  const executeOption = (option) => {
    // Save to history
    const itemToSave = { name: option.name, path: option.path, category: option.category };
    const updatedHistory = [itemToSave, ...history.filter(h => h.name !== option.name)].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem('swachhai_search_history', JSON.stringify(updatedHistory));

    onClose();
    if (option.action) {
      option.action();
    } else if (option.path) {
      navigate(option.path);
    }
  };

  const clearHistory = (e) => {
    e.stopPropagation();
    setHistory([]);
    localStorage.removeItem('swachhai_search_history');
  };

  // Helper to highlight matching text query
  const highlightMatch = (text, match) => {
    if (!match) return text;
    const parts = text.split(new RegExp(`(${match})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === match.toLowerCase() 
            ? <span key={i} className="bg-brand-100 text-brand-800 font-bold px-0.5 rounded">{part}</span>
            : part
        )}
      </span>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[70vh]"
          >
            {/* Input Header */}
            <div className="flex items-center px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
              <Search className="w-5 h-5 text-neutral-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands, complaints, or dashboard pages..."
                className="w-full text-sm font-medium text-neutral-900 dark:text-neutral-50 bg-transparent placeholder-neutral-400 outline-none"
              />
              <button 
                onClick={onClose}
                className="text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                ESC
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              {loading && (
                <div className="py-12 text-center text-sm text-neutral-400 flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching database...</span>
                </div>
              )}

              {!loading && activeOptions.length === 0 && (
                <div className="py-12 text-center text-sm text-neutral-400">
                  No matches found for <span className="font-semibold text-neutral-900 dark:text-neutral-100">"{query}"</span>
                </div>
              )}

              {!loading && activeOptions.length > 0 && (
                <div className="space-y-1">
                  {/* Group items by category to display nicely */}
                  {Object.entries(
                    activeOptions.reduce((acc, curr) => {
                      if (!acc[curr.category]) acc[curr.category] = [];
                      acc[curr.category].push(curr);
                      return acc;
                    }, {})
                  ).map(([category, items]) => (
                    <div key={category}>
                      <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        {category}
                      </div>
                      {items.map((item) => {
                        const Icon = item.icon;
                        const itemIndex = activeOptions.findIndex(o => o.name === item.name);
                        const isSelected = itemIndex === selectedIndex;

                        return (
                          <div
                            key={item.name}
                            onClick={() => executeOption(item)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-brand-50/70 dark:bg-brand-950/20 text-brand-900 dark:text-brand-300 border-l-2 border-brand-500 pl-2.5' 
                                : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-brand-500' : 'text-neutral-400'}`} />
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate">
                                  {highlightMatch(item.name, query)}
                                </p>
                                {item.description && (
                                  <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                                    {highlightMatch(item.description, query)}
                                  </p>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex items-center space-x-1.5 text-[10px] font-medium text-brand-600 dark:text-brand-400">
                                <span>Navigate</span>
                                <CornerDownLeft size={10} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}

              {/* Show Search History if query is empty */}
              {query.trim() === '' && history.length > 0 && (
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2.5 mt-2.5">
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center">
                      <Clock size={10} className="mr-1" />
                      Recent Searches
                    </span>
                    <button 
                      onClick={clearHistory}
                      className="text-[10px] text-neutral-400 hover:text-danger-solid transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  {history.map((hist, i) => (
                    <div
                      key={i}
                      onClick={() => navigate(hist.path)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400"
                    >
                      <div className="flex items-center space-x-2 text-xs">
                        <Clock size={12} className="text-neutral-400" />
                        <span className="font-medium">{hist.name}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">({hist.category})</span>
                      </div>
                      <ArrowRight size={10} className="text-neutral-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div className="bg-neutral-50 dark:bg-neutral-900 px-4 py-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400 font-medium">
              <div className="flex items-center space-x-4">
                <span className="flex items-center"><CornerDownLeft size={10} className="mr-1" /> to select</span>
                <span className="flex items-center"><ArrowRight size={10} className="mr-1 rotate-90" /> to navigate</span>
              </div>
              <div className="flex items-center space-x-1">
                <Sparkles size={10} className="text-brand-500 animate-pulse" />
                <span>Powered by Swachh AI Heuristics</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
