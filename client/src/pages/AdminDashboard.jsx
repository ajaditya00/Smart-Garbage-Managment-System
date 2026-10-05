import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, Clock, AlertTriangle, X, UserCheck, Heart, FileText, Star, TrendingUp, DollarSign, ChevronDown, ChevronUp, Eye, EyeOff, Sparkles, Filter, ShieldCheck, Mail, ArrowUpRight, Truck, Activity, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import SkeletonLoader from '../components/SkeletonLoader';
import StatsCounter from '../components/StatsCounter';
import RecentActivityTimeline from '../components/RecentActivityTimeline';
import EmptyState from '../components/EmptyState';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import AuditLogViewer from '../components/AuditLogViewer';

const AdminDashboard = ({ activeTab = 'dashboard' }) => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pending: 0,
    assigned: 0,
    completed: 0,
    totalUsers: 0,
    totalRevenue: 0,
    avgRating: 0,
    rejected: 0
  });
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [adminDonations, setAdminDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignTo, setAssignTo] = useState('');
  const [assignType, setAssignType] = useState('employee');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('all');
  const [statsDataRaw, setStatsDataRaw] = useState(null);
  const [widgets, setWidgets] = useState({
    stats: true,
    complaints: true,
    activity: true
  });

  useEffect(() => {
    const saved = localStorage.getItem('swachhai_admin_widgets');
    if (saved) {
      setWidgets(JSON.parse(saved));
    }
  }, []);

  const toggleWidget = (name) => {
    const updated = { ...widgets, [name]: !widgets[name] };
    setWidgets(updated);
    localStorage.setItem('swachhai_admin_widgets', JSON.stringify(updated));
  };

  const filterOptions = [
    { key: 'all', label: 'All Reports' },
    { key: 'pending', label: 'Pending' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'completed', label: 'Pending Review' },
    { key: 'verified', label: 'Verified' },
    { key: 'rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredComplaints(complaints);
    } else if (filter === 'completed') {
      setFilteredComplaints(complaints.filter(complaint => complaint.status === 'completed' || complaint.status === 'verified'));
    } else {
      setFilteredComplaints(complaints.filter(complaint => complaint.status === filter));
    }
  }, [filter, complaints]);

  useEffect(() => {
    if (userFilter === 'all') {
      setFilteredUsers(allUsers);
    } else {
      setFilteredUsers(allUsers.filter(user => user.role === userFilter));
    }
  }, [userFilter, allUsers]);

  const fetchData = async () => {
    try {
      const [statsRes, complaintsRes, employeesRes, ngosRes, usersRes, donationsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/complaints'),
        api.get('/admin/users?role=employee'),
        api.get('/admin/users?role=ngo'),
        api.get('/admin/users'),
        api.get('/admin/donations')
      ]);

      const statsData = statsRes.data;
      setStatsDataRaw(statsData);
      setStats({
        totalComplaints: statsData.overview?.totalComplaints || 0,
        completed: (statsData.overview?.completedComplaints || 0) + (statsData.overview?.verifiedComplaints || 0),
        pending: statsData.overview?.pendingComplaints || 0,
        assigned: statsData.overview?.assignedComplaints || 0,
        totalUsers: statsData.users?.totalUsers || 0,
        totalRevenue: donationsRes.data.filter(d => d.status === 'success' || d.status === 'paid').reduce((sum, d) => sum + d.amount, 0),
        avgRating: statsData.feedback?.averageRating || 0,
        rejected: statsData.overview?.rejectedComplaints || 0
      });
      setComplaints(complaintsRes.data);
      setFilteredComplaints(complaintsRes.data);
      setEmployees(employeesRes.data);
      setNgos(ngosRes.data);
      setAllUsers(usersRes.data);
      setFilteredUsers(usersRes.data);
      setAdminDonations(donationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assignTo) {
      toast.error('Please select someone to assign');
      return;
    }

    try {
      await api.post(`/admin/assign`, {
        complaintId: selectedComplaint._id,
        assigneeId: assignTo,
        assigneeType: assignType
      });

      toast.success('Complaint assigned successfully!');
      setShowAssignModal(false);
      setSelectedComplaint(null);
      setAssignTo('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign complaint');
    }
  };

  const handleVerify = async (id) => {
    try {
      await api.put(`/admin/verify/${id}`);
      toast.success('Complaint verified successfully! ✅');
      fetchData();
    } catch (error) {
      toast.error('Failed to verify complaint');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this work? It will be cleared for reassignment.')) return;
    try {
      await api.put(`/admin/reject/${id}`);
      toast.success('Work rejected. Re-released to board.');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject work');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAssigneeInfo = (complaint) => {
    if (!complaint.assignedTo) return null;

    if (complaint.assignedTo.name) {
      return `${complaint.assignedTo.name} (${complaint.assignedType || 'crew'})`;
    }

    const assigneeId = typeof complaint.assignedTo === 'object' ? complaint.assignedTo._id : complaint.assignedTo;
    const assigneeType = complaint.assignedType || complaint.assigneeType;

    const assignee = assigneeType === 'employee'
      ? employees.find(emp => emp._id === assigneeId)
      : ngos.find(ngo => ngo._id === assigneeId);

    return assignee ? `${assignee.name} (${assigneeType})` : 'Assigned';
  };

  const tabInfo = {
    dashboard: { title: 'Admin Overview', desc: 'Manage system complaints and resources' },
    complaints: { title: 'Garbage Incident Ledger', desc: 'Audit and assign incoming tickets' },
    users: { title: 'Workspace Directory', desc: 'View and audit registered system profiles' },
    donations: { title: 'Financial Ledger', desc: 'Track citizen support donations' },
    analytics: { title: 'Business Intelligence', desc: 'Visual analytics dashboard' },
    'audit-logs': { title: 'System Security & Audit Trail', desc: 'Immutable timeline of all CRUD operations, data mutations, and access logs' }
  };

  const renderComplaintsTable = (data) => (
    <Card padding="p-0" className="border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="bg-neutral-50/75 dark:bg-neutral-800/40 border-b border-neutral-200/60 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Incident Details</th>
              <th className="px-4 py-3">Reporter</th>
              <th className="px-4 py-3">Assignment Status</th>
              <th className="px-4 py-3">Action Proof</th>
              <th className="px-4 py-3">Citizen Review</th>
              <th className="px-4 py-3">Created Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-4 py-5">
                    <div className="h-4 bg-neutral-100 dark:bg-neutral-800 shimmer rounded w-3/4"></div>
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-neutral-400 text-xs">
                  No incident records found.
                </td>
              </tr>
            ) : (
              data.map((complaint) => (
                <tr key={complaint._id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex items-center gap-3">
                      <img
                        src={complaint.image}
                        alt={complaint.title}
                        className="w-9 h-9 rounded-lg object-cover border border-neutral-200/80 dark:border-neutral-800 shrink-0 shadow-2xs"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=200'; }}
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/complaint/${complaint._id}`}
                          className="font-bold text-neutral-900 dark:text-neutral-100 hover:text-brand-500 dark:hover:text-brand-400 transition-colors text-xs truncate max-w-[130px] block"
                        >
                          {complaint.title}
                        </Link>
                        <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 capitalize block truncate">
                          {complaint.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate max-w-[120px]">
                      {complaint.userId?.name || 'Citizen'}
                    </div>
                    <div className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate max-w-[120px] mt-0.5">
                      {complaint.userId?.email || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    <StatusBadge status={complaint.status} size="sm" />
                    <div className="flex items-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400 font-medium mt-1 truncate max-w-[130px]">
                      <Users size={11} className="text-neutral-400 shrink-0" />
                      <span className="truncate">{getAssigneeInfo(complaint) || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    {complaint.proofImage ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={complaint.proofImage}
                          alt="Cleanup Proof"
                          className="w-7 h-7 rounded-md object-cover cursor-pointer hover:ring-2 hover:ring-brand-500/50 transition-all border border-neutral-200/80 dark:border-neutral-800 shrink-0 shadow-2xs"
                          onClick={() => window.open(complaint.proofImage)}
                        />
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          <CheckCircle size={10} /> Proof
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-neutral-400 dark:text-neutral-500">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    {complaint.feedbackRating ? (
                      <div className="space-y-0.5">
                        <div className="flex text-amber-400 gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} fill={i < complaint.feedbackRating ? "currentColor" : "none"} />
                          ))}
                        </div>
                        {complaint.feedbackComment && (
                          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate max-w-[100px]" title={complaint.feedbackComment}>
                            "{complaint.feedbackComment}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-neutral-400 dark:text-neutral-500">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-middle text-[11px] text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                    {formatDate(complaint.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 text-right align-middle whitespace-nowrap">
                    <div className="flex justify-end gap-1.5 items-center">
                      {(complaint.status === 'pending' || complaint.status === 'rejected') && (
                        <Button
                          size="xs"
                          variant="primary"
                          onClick={() => { setSelectedComplaint(complaint); setShowAssignModal(true); }}
                          className="text-xs px-3 py-1 font-semibold rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-xs"
                        >
                          Assign
                        </Button>
                      )}

                      {complaint.status === 'completed' && (
                        <>
                          <Button
                            size="xs"
                            variant="primary"
                            onClick={() => handleVerify(complaint._id)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs flex items-center gap-1"
                            icon={<UserCheck size={12} />}
                          >
                            Verify
                          </Button>
                          <Button
                            size="xs"
                            variant="danger"
                            onClick={() => handleReject(complaint._id)}
                            className="text-xs px-2.5 py-1 rounded-lg font-semibold shadow-xs flex items-center gap-1"
                            icon={<X size={12} />}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {complaint.status === 'verified' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800/80 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          <CheckCircle size={11} className="text-emerald-500" /> Archived
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderRecentDispatches = () => {
    const recentList = filteredComplaints.slice(0, 10);

    if (loading) {
      return (
        <div className="space-y-3 flex-1 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/40 dark:bg-neutral-800/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-neutral-200/60 dark:bg-neutral-800 shimmer rounded-xl shrink-0"></div>
                <div className="space-y-2">
                  <div className="h-3.5 bg-neutral-200/60 dark:bg-neutral-800 shimmer rounded w-32"></div>
                  <div className="h-2.5 bg-neutral-200/60 dark:bg-neutral-800 shimmer rounded w-44"></div>
                </div>
              </div>
              <div className="w-16 h-7 bg-neutral-200/60 dark:bg-neutral-800 shimmer rounded-lg"></div>
            </div>
          ))}
        </div>
      );
    }

    if (recentList.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-neutral-400 text-xs">
          <AlertTriangle size={24} className="opacity-40 mb-2" />
          No recent incident dispatches logged.
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto pr-1.5 space-y-2.5 min-h-0">
        {recentList.map((complaint) => (
          <div
            key={complaint._id}
            className="p-3 rounded-xl border border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            {/* Left: Thumbnail & Details */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative shrink-0">
                <img
                  src={complaint.image}
                  alt={complaint.title}
                  className="w-11 h-11 rounded-xl object-cover border border-neutral-200/80 dark:border-neutral-800 shadow-2xs"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=200';
                  }}
                />
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-neutral-900/90 dark:bg-neutral-800 text-[9px] font-bold text-neutral-300 capitalize border border-neutral-700/50">
                  {complaint.category}
                </span>
              </div>

              <div className="min-w-0 space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/complaint/${complaint._id}`}
                    className="font-bold text-neutral-900 dark:text-neutral-100 hover:text-brand-500 dark:hover:text-brand-400 transition-colors text-xs truncate max-w-[180px] block"
                  >
                    {complaint.title}
                  </Link>
                  <StatusBadge status={complaint.status} size="xs" />
                </div>

                <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 flex-wrap">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300 truncate max-w-[110px]">
                    {complaint.userId?.name || 'Citizen'}
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-700">•</span>
                  <span className="text-neutral-400 whitespace-nowrap text-[10px]">
                    {formatDate(complaint.createdAt)}
                  </span>
                  {complaint.assignedTo && (
                    <>
                      <span className="text-neutral-300 dark:text-neutral-700">•</span>
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold truncate max-w-[130px] text-[10px]">
                        <Users size={11} className="shrink-0" />
                        {getAssigneeInfo(complaint)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Proof/Review & Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
              {complaint.proofImage && (
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-pointer hover:bg-emerald-500/20 transition-colors"
                  onClick={() => window.open(complaint.proofImage)}
                  title="View cleanup proof"
                >
                  <img src={complaint.proofImage} alt="Proof" className="w-5 h-5 rounded object-cover" />
                  <span className="text-[10px] font-bold">Proof</span>
                </div>
              )}

              {complaint.feedbackRating && (
                <div className="flex text-amber-400 gap-0.5" title={complaint.feedbackComment}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} fill={i < complaint.feedbackRating ? "currentColor" : "none"} />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1.5 whitespace-nowrap">
                {(complaint.status === 'pending' || complaint.status === 'rejected') && (
                  <Button
                    size="xs"
                    variant="primary"
                    onClick={() => { setSelectedComplaint(complaint); setShowAssignModal(true); }}
                    className="text-xs px-3 py-1 font-semibold rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-xs"
                  >
                    Assign
                  </Button>
                )}

                {complaint.status === 'completed' && (
                  <>
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => handleVerify(complaint._id)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs flex items-center gap-1"
                      icon={<UserCheck size={12} />}
                    >
                      Verify
                    </Button>
                    <Button
                      size="xs"
                      variant="danger"
                      onClick={() => handleReject(complaint._id)}
                      className="text-xs px-2.5 py-1 rounded-lg font-semibold shadow-xs flex items-center gap-1"
                      icon={<X size={12} />}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {complaint.status === 'verified' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800/80 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    <CheckCircle size={11} className="text-emerald-500" /> Archived
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDashboardContent = () => (
    <div className="space-y-6">

      {/* Overview Cards */}
      <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-5">
          <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp size={14} className="text-brand-500" /> Platform KPI Indicators
          </h3>
          <button
            onClick={() => toggleWidget('stats')}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 rounded-lg transition-colors duration-150 cursor-pointer"
            aria-label="Toggle stats widget"
          >
            {widgets.stats ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {widgets.stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {[
              { label: 'Total Incident Logs', value: stats.totalComplaints, icon: AlertTriangle, colors: 'bg-brand-50/50 text-brand-600 border border-brand-100 dark:bg-brand-950/10 dark:border-brand-900/30' },
              { label: 'Pending Dispatch', value: stats.pending, icon: Clock, colors: 'bg-amber-50/50 text-amber-600 border border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/30' },
              { label: 'Verified Closed', value: stats.completed, icon: CheckCircle, colors: 'bg-emerald-50/50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30' },
              { label: 'Platform Revenue', value: stats.totalRevenue, icon: DollarSign, colors: 'bg-teal-50/50 text-teal-600 border border-teal-100 dark:bg-teal-950/10 dark:border-teal-900/30', prefix: '₹' },
              { label: 'Average Feedback', value: stats.avgRating, icon: Star, colors: 'bg-yellow-50/50 text-yellow-600 border border-yellow-100 dark:bg-yellow-950/10 dark:border-yellow-900/30', suffix: '/5' },
              { label: 'Active Directories', value: stats.totalUsers, icon: Users, colors: 'bg-purple-50/50 text-purple-600 border border-purple-100 dark:bg-purple-950/10 dark:border-purple-900/30' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className={`p-4 rounded-xl flex items-center justify-between ${stat.colors}`}>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-1">{stat.label}</p>
                    <div className="text-xl font-black">
                      <StatsCounter end={stat.value} duration={1} prefix={stat.prefix} suffix={stat.suffix} color="currentColor" />
                    </div>
                  </div>
                  <Icon size={20} className="opacity-75" />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-widest flex items-center gap-1.5">
                <Truck size={14} className="text-brand-500" /> Recent Dispatches
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                Live
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                to="/admin/complaints" 
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 transition-colors"
              >
                View all <ArrowUpRight size={13} />
              </Link>
              <button
                onClick={() => toggleWidget('complaints')}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 rounded-lg transition-colors duration-150 cursor-pointer"
                aria-label="Toggle complaints widget"
              >
                {widgets.complaints ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>
          {widgets.complaints && (
            <Card className="border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-xs flex flex-col h-[520px]">
              {renderRecentDispatches()}
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={14} className="text-emerald-500" /> Live Activity Logs
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Real-time
              </span>
            </div>
            <button
              onClick={() => toggleWidget('activity')}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 rounded-lg transition-colors duration-150 cursor-pointer"
              aria-label="Toggle activity widget"
            >
              {widgets.activity ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
          {widgets.activity && (
            <Card className="border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-xs flex flex-col h-[520px]">
              <div className="flex-1 overflow-y-auto pr-1 min-h-0">
                <RecentActivityTimeline />
              </div>
            </Card>
          )}
        </div>
      </div>

    </div>
  );

  const renderComplaintsContent = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 items-center bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 p-1.5 rounded-xl shadow-sm max-w-fit">
        {filterOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => setFilter(option.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer ${filter === option.key
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/80'
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {renderComplaintsTable(filteredComplaints)}
    </div>
  );

  const renderUsersContent = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 items-center bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 p-1.5 rounded-xl shadow-sm max-w-fit">
        {['all', 'citizen', 'employee', 'ngo'].map(role => (
          <button
            key={role}
            onClick={() => setUserFilter(role)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer uppercase tracking-wider ${userFilter === role
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/80'
              }`}
          >
            {role}
          </button>
        ))}
      </div>

      <Card padding="p-0" className="border border-neutral-200/50 dark:border-neutral-800/85 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">User Profile</th>
                <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Assigned Workspace Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Registry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50 text-xs">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-5 text-center text-neutral-400 animate-pulse">Loading directory entries...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-neutral-400">No matching user records found.</td></tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-950 flex items-center justify-center font-bold text-brand-700 dark:text-brand-400 text-xs shrink-0 border border-brand-200/40">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-neutral-800 dark:text-neutral-200">{u.name}</div>
                          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[10px] text-neutral-400">{formatDate(u.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderAnalyticsContent = () => {
    return (
      <AnalyticsDashboard
        complaints={complaints}
        employees={employees}
        ngos={ngos}
        donations={adminDonations}
        loading={loading}
      />
    );
  };

  const renderDonationsContent = () => {
    const totalDonated = adminDonations
      .filter(d => d.status === 'success' || d.status === 'paid')
      .reduce((sum, d) => sum + d.amount, 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5 border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center text-emerald-600">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Aggregate Capital</p>
              <p className="text-xl font-black text-neutral-800 dark:text-neutral-100">₹{totalDonated.toLocaleString('en-IN')}</p>
            </div>
          </Card>

          <Card className="p-5 border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex items-center gap-4" delay={0.05}>
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Heart size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Total Deposits</p>
              <p className="text-xl font-black text-neutral-800 dark:text-neutral-100">{adminDonations.length}</p>
            </div>
          </Card>

          <Card className="p-5 border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex items-center gap-4" delay={0.1}>
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Average Support</p>
              <p className="text-xl font-black text-neutral-800 dark:text-neutral-100">
                ₹{adminDonations.length > 0 ? Math.round(totalDonated / adminDonations.length).toLocaleString('en-IN') : 0}
              </p>
            </div>
          </Card>
        </div>

        <Card padding="p-0" className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Supporter Profile</th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Capital Contributed</th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Received Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-5 text-center text-neutral-400">Loading ledger transaction records...</td></tr>
                ) : adminDonations.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-neutral-400">No support capital logs recorded.</td></tr>
                ) : (
                  adminDonations.map(d => (
                    <tr key={d._id} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-900/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold shrink-0">
                            {d.userId?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-neutral-100">{d.userId?.name || 'Supporting Citizen'}</div>
                            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">{d.userId?.email || 'No email log'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-neutral-900 dark:text-neutral-50">
                          ₹{d.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] text-neutral-400">
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">{new Date(d.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span className="text-[9px] opacity-70 mt-0.5">{new Date(d.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${d.status === 'success' || d.status === 'paid'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                          }`}>
                          {d.status === 'success' || d.status === 'paid' ? 'Paid' : d.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-left">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Sparkles className="text-brand-500" size={20} /> {tabInfo[activeTab]?.title || tabInfo.dashboard.title}
          </h1>
          <p className="text-xs text-neutral-500">
            {tabInfo[activeTab]?.desc || tabInfo.dashboard.desc}
          </p>
        </div>
      </div>

      {/* Render active tabs contents */}
      {activeTab === 'dashboard' && renderDashboardContent()}
      {activeTab === 'complaints' && renderComplaintsContent()}
      {activeTab === 'users' && renderUsersContent()}
      {activeTab === 'donations' && renderDonationsContent()}
      {activeTab === 'analytics' && renderAnalyticsContent()}
      {activeTab === 'audit-logs' && <AuditLogViewer />}

      {/* Task Assignment Modal Layout */}
      <Modal
        isOpen={showAssignModal && !!selectedComplaint}
        onClose={() => setShowAssignModal(false)}
        title="Assign Cleanup Crew Task"
        size="md"
      >
        <div className="space-y-5 text-left">
          <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
            <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1">
              Active Complaint Details
            </label>
            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">{selectedComplaint?.title}</p>
            <p className="text-[11px] text-neutral-500 mt-1 leading-normal">{selectedComplaint?.description}</p>
          </div>

          <div>
            <label htmlFor="assignType" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
              Assignment Mode
            </label>
            <select
              id="assignType"
              value={assignType}
              onChange={(e) => {
                setAssignType(e.target.value);
                setAssignTo('');
              }}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
            >
              <option value="employee">Municipal Employee</option>
              <option value="ngo">NGO Volunteer Partner</option>
            </select>
          </div>

          <div>
            <label htmlFor="assignTo" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
              Select Assignee profile
            </label>
            <select
              id="assignTo"
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
            >
              <option value="">Select dispatch target</option>
              {(assignType === 'employee' ? employees : ngos).map((person) => (
                <option key={person._id} value={person._id}>
                  {person.name} - {person.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-5">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowAssignModal(false)}
            className="flex-1 rounded-xl text-xs py-2 bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            className="flex-1 rounded-xl text-xs py-2 bg-brand-500 text-white"
          >
            Dispatch Task
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;