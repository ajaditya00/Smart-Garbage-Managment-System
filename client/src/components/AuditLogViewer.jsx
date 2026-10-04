import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Eye, 
  Clock, 
  User, 
  Layers, 
  Activity, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  Smartphone,
  Globe,
  FileText,
  UserCheck,
  LogIn,
  SlidersHorizontal,
  X
} from 'lucide-react';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:5002/api';

const ACTION_CONFIG = {
  CREATE: {
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    icon: PlusCircle,
    label: 'Create (C)'
  },
  UPDATE: {
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    icon: Edit3,
    label: 'Update (U)'
  },
  DELETE: {
    color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    icon: Trash2,
    label: 'Delete (D)'
  },
  STATUS_CHANGE: {
    color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    icon: RefreshCw,
    label: 'Status Change'
  },
  ASSIGN: {
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    icon: UserCheck,
    label: 'Assignment'
  },
  LOGIN: {
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    icon: LogIn,
    label: 'Authentication'
  }
};

const ROLE_BADGES = {
  admin: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200',
  citizen: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200',
  employee: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200',
  ngo: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200',
  system: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-300'
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Just now';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${Math.max(1, diffInSeconds)}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Filters & Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, 7d, 30d

  // Auth token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  // Fetch Audit Logs from API
  const fetchAuditLogs = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      let queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (actionFilter !== 'all') queryParams.append('action', actionFilter);
      if (resourceFilter !== 'all') queryParams.append('resource', resourceFilter);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (search.trim()) queryParams.append('search', search.trim());

      // Calculate date filters
      const now = new Date();
      if (dateFilter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        queryParams.append('startDate', today.toISOString());
      } else if (dateFilter === '7d') {
        const last7 = new Date();
        last7.setDate(last7.getDate() - 7);
        queryParams.append('startDate', last7.toISOString());
      } else if (dateFilter === '30d') {
        const last30 = new Date();
        last30.setDate(last30.getDate() - 30);
        queryParams.append('startDate', last30.toISOString());
      }

      const res = await fetch(`${API_BASE}/admin/audit-logs?${queryParams.toString()}`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error('Failed to fetch audit records');
      }

      const data = await res.json();
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalLogs(data.pagination?.total || 0);
    } catch (err) {
      console.error('AuditLog fetch error:', err);
      if (!isSilent) toast.error('Unable to fetch audit logs');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [page, limit, actionFilter, resourceFilter, statusFilter, search, dateFilter]);

  // Fetch Stats breakdown
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/audit-logs/stats`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('AuditLog stats error:', err);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    fetchStats();
  }, [fetchAuditLogs]);

  // Auto-refresh interval (every 10 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchAuditLogs(true);
      fetchStats();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAuditLogs]);

  // Handle Export CSV
  const handleExportCSV = async () => {
    try {
      toast.loading('Generating Audit Trail CSV...', { id: 'export-csv' });
      const res = await fetch(`${API_BASE}/admin/audit-logs/export?format=csv`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swachh-ai-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Audit logs downloaded successfully!', { id: 'export-csv' });
    } catch (err) {
      toast.error('Failed to export audit logs', { id: 'export-csv' });
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setActionFilter('all');
    setResourceFilter('all');
    setStatusFilter('all');
    setDateFilter('all');
    setPage(1);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <Card padding="p-5" className="border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Total Audit Events</p>
              <h3 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
                {stats?.totalLogs || totalLogs}
              </h3>
              <p className="text-[11px] text-neutral-500 mt-1">Immutable ledger trail</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
          </div>
        </Card>

        {/* Creates */}
        <Card padding="p-5" className="border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Create Operations (C)</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {stats?.actionCounts?.CREATE || 0}
              </h3>
              <p className="text-[11px] text-neutral-500 mt-1">Reports, accounts & donations</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <PlusCircle size={24} />
            </div>
          </div>
        </Card>

        {/* Updates / Status Changes */}
        <Card padding="p-5" className="border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">State Transitions (U)</p>
              <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {(stats?.actionCounts?.STATUS_CHANGE || 0) + (stats?.actionCounts?.ASSIGN || 0) + (stats?.actionCounts?.UPDATE || 0)}
              </h3>
              <p className="text-[11px] text-neutral-500 mt-1">Status changes & crew assignments</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <RefreshCw size={24} />
            </div>
          </div>
        </Card>

        {/* Deletes & Destructive Actions */}
        <Card padding="p-5" className="border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Delete Actions (D)</p>
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {stats?.actionCounts?.DELETE || 0}
              </h3>
              <p className="text-[11px] text-neutral-500 mt-1">Purges & removals tracked</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Trash2 size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Control Bar & Filters */}
      <Card padding="p-4" className="border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Actor Name, Email, Complaint Title, Target ID, or Description..."
              className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 rounded-xl text-xs font-medium text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Auto-Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                autoRefresh
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-300 dark:border-emerald-700'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
              }`}
              title="Toggle Live Real-time Poll"
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
              {autoRefresh ? 'Live' : 'Live Off'}
            </button>

            {/* Manual Refresh */}
            <button
              onClick={() => {
                fetchAuditLogs();
                fetchStats();
                toast.success('Audit trail refreshed');
              }}
              disabled={loading}
              className="p-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700/80 text-neutral-700 dark:text-neutral-200 rounded-xl transition-all"
              title="Refresh Logs"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Export CSV Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              className="border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-bold gap-1.5"
            >
              <Download size={14} /> Export CSV
            </Button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-black uppercase tracking-wider mr-1">
            <Filter size={14} /> Filters:
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Actions (CRUD)</option>
            <option value="CREATE">CREATE (C)</option>
            <option value="UPDATE">UPDATE (U)</option>
            <option value="DELETE">DELETE (D)</option>
            <option value="STATUS_CHANGE">STATUS CHANGE</option>
            <option value="ASSIGN">ASSIGNMENT</option>
            <option value="LOGIN">AUTHENTICATION</option>
          </select>

          {/* Resource Filter */}
          <select
            value={resourceFilter}
            onChange={(e) => {
              setResourceFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Resources</option>
            <option value="Complaint">Complaints</option>
            <option value="User">Users</option>
            <option value="Assignment">Assignments</option>
            <option value="Donation">Donations</option>
            <option value="Feedback">Feedback</option>
            <option value="Auth">Auth & Sessions</option>
          </select>

          {/* Date Filter Buttons */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800/80 p-0.5 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50">
            {['all', 'today', '7d', '30d'].map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDateFilter(d);
                  setPage(1);
                }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all capitalize ${
                  dateFilter === d
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {d === 'all' ? 'All Time' : d === 'today' ? 'Today' : d === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>

          {(search || actionFilter !== 'all' || resourceFilter !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-bold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Main Audit Logs Table */}
      <Card padding="p-0" className="border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" text="Querying immutable audit logs..." />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-neutral-400">
              <ShieldCheck size={28} />
            </div>
            <h4 className="text-base font-bold text-neutral-800 dark:text-neutral-200">No Audit Events Found</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              No CRUD operations match your current search or filter criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-xl text-xs font-bold hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/70 dark:bg-neutral-800/40 border-b border-neutral-100 dark:border-neutral-800">
                <tr>
                  <th className="px-5 py-3.5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Actor (Initiator)</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Operation</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Resource Target</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Description & Mutation</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Origin (IP)</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
                {logs.map((log) => {
                  const actionStyle = ACTION_CONFIG[log.action] || {
                    color: 'bg-neutral-100 text-neutral-800 border-neutral-200',
                    icon: Activity,
                    label: log.action
                  };
                  const ActionIcon = actionStyle.icon;
                  const roleBadge = ROLE_BADGES[log.actor?.role] || ROLE_BADGES.system;

                  return (
                    <tr 
                      key={log._id} 
                      className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* Timestamp */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                            <Clock size={12} className="text-neutral-400" />
                            {formatTimeAgo(log.createdAt)}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 flex items-center justify-center font-bold text-xs text-neutral-700 dark:text-neutral-300">
                            {(log.actor?.name || 'A')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-[130px]">
                                {log.actor?.name || 'Anonymous'}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider border ${roleBadge}`}>
                                {log.actor?.role || 'user'}
                              </span>
                            </div>
                            <span className="text-[11px] text-neutral-400 block truncate max-w-[160px]">
                              {log.actor?.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action Operation */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${actionStyle.color}`}>
                          <ActionIcon size={12} />
                          {actionStyle.label}
                        </span>
                      </td>

                      {/* Resource Target */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                            <Layers size={12} className="text-neutral-400" />
                            {log.resource}
                          </span>
                          {log.target?.title ? (
                            <span className="text-[11px] text-neutral-500 truncate max-w-[160px]" title={log.target.title}>
                              "{log.target.title}"
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {log.resourceId ? `#${log.resourceId.slice(-6)}` : '—'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-5 py-4">
                        <p className="text-neutral-700 dark:text-neutral-300 font-medium line-clamp-2 leading-relaxed max-w-md">
                          {log.description}
                        </p>
                      </td>

                      {/* Origin (IP & Client) */}
                      <td className="px-5 py-4 whitespace-nowrap font-mono text-[11px] text-neutral-500">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1">
                            <Globe size={11} className="text-neutral-400" />
                            {log.ipAddress || '127.0.0.1'}
                          </span>
                          <span className="text-[9px] text-neutral-400 font-sans truncate max-w-[120px]" title={log.userAgent}>
                            {log.userAgent?.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser'}
                          </span>
                        </div>
                      </td>

                      {/* Inspect Action */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs inline-flex items-center gap-1 transition-all"
                        >
                          <Eye size={12} /> Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && logs.length > 0 && (
          <div className="px-5 py-3.5 bg-neutral-50/70 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-neutral-500 font-medium">
              Showing <span className="font-bold text-neutral-900 dark:text-neutral-100">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                {Math.min(page * limit, totalLogs)}
              </span>{' '}
              of <span className="font-bold text-neutral-900 dark:text-neutral-100">{totalLogs}</span> events
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-neutral-600 dark:text-neutral-400 font-bold px-2">
                Page {page} of {totalPages || 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Inspect Event Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Details & Payload"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4 text-left">
            {/* Header info */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200/70 dark:border-neutral-800">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${ACTION_CONFIG[selectedLog.action]?.color}`}>
                  {selectedLog.action}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  Log ID: {selectedLog._id}
                </span>
              </div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {selectedLog.description}
              </h4>
            </div>

            {/* Key Value Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Actor Information</p>
                <p className="font-bold text-neutral-900 dark:text-neutral-100 mt-1">{selectedLog.actor?.name}</p>
                <p className="text-neutral-500">{selectedLog.actor?.email}</p>
                <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded font-black uppercase border ${ROLE_BADGES[selectedLog.actor?.role]}`}>
                  {selectedLog.actor?.role}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Resource Target</p>
                <p className="font-bold text-neutral-900 dark:text-neutral-100 mt-1">{selectedLog.resource}</p>
                <p className="text-neutral-500 font-mono text-[11px] truncate">
                  ID: {selectedLog.resourceId || 'N/A'}
                </p>
                {selectedLog.target?.title && (
                  <p className="text-neutral-600 dark:text-neutral-300 font-semibold mt-1 truncate">
                    Title: "{selectedLog.target.title}"
                  </p>
                )}
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Network Origin</p>
                <p className="font-mono font-bold text-neutral-900 dark:text-neutral-100 mt-1">{selectedLog.ipAddress}</p>
                <p className="text-neutral-500 truncate text-[11px] mt-0.5" title={selectedLog.userAgent}>
                  {selectedLog.userAgent}
                </p>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Audit Timestamp</p>
                <p className="font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold capitalize mt-0.5 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Execution Status: {selectedLog.status}
                </p>
              </div>
            </div>

            {/* Mutation Payload JSON Inspector */}
            <div>
              <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-1.5 flex items-center gap-1">
                <FileText size={12} /> Mutation Details / Change Payload:
              </p>
              <pre className="p-3.5 bg-neutral-900 text-neutral-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-56 border border-neutral-800 leading-relaxed">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
                Close Inspector
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogViewer;
