import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, Clock, AlertTriangle, X, UserCheck, Heart, FileText, Star, TrendingUp, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import StatsCounter from '../components/StatsCounter';
import AnimatedCard from '../components/AnimatedCard';

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

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    verified: 'bg-purple-100 text-purple-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const filterOptions = [
    { key: 'all', label: 'All Complaints' },
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
      // Group completed and verified
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
      toast.success('Work rejected. Complaint is now available for reassignment.');
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
       return `${complaint.assignedTo.name} (${complaint.assignedType || 'unknown'})`;
    }

    const assigneeId = typeof complaint.assignedTo === 'object' ? complaint.assignedTo._id : complaint.assignedTo;
    const assigneeType = complaint.assignedType || complaint.assigneeType;

    const assignee = assigneeType === 'employee' 
      ? employees.find(emp => emp._id === assigneeId)
      : ngos.find(ngo => ngo._id === assigneeId);

    return assignee ? `${assignee.name} (${assigneeType})` : 'Unknown';
  };

  const tabInfo = {
    dashboard: { title: 'Admin Dashboard', desc: 'Manage complaints and assignments' },
    complaints: { title: 'All Complaints', desc: 'View and manage all system complaints' },
    users: { title: 'Manage Users', desc: 'View and manage all system users' },
    donations: { title: 'User Donations', desc: 'View all citizen payments and donations' },
    analytics: { title: 'Analytics', desc: 'Detailed system statistics and insights' }
  };

  const renderComplaintsTable = (data) => (
    <AnimatedCard>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proof / Results</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citizen Feedback</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No complaints found</td></tr>
            ) : (
              data.map((complaint) => (
                <motion.tr key={complaint._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img src={complaint.image} alt={complaint.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <div className="font-medium text-gray-900">{complaint.title}</div>
                        <div className="text-sm text-gray-500">{complaint.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{complaint.userId?.name}</div>
                    <div className="text-sm text-gray-500">{complaint.userId?.email}</div>
                  </td>
                   <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[complaint.status]}`}>
                      {complaint.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-1">{getAssigneeInfo(complaint) || 'Unassigned'}</div>
                  </td>
                  <td className="px-6 py-4">
                    {complaint.proofImage ? (
                      <div className="flex flex-col gap-1">
                        <img 
                          src={complaint.proofImage} 
                          alt="Proof" 
                          className="w-16 h-12 rounded border border-gray-200 object-cover cursor-pointer hover:scale-150 transition-transform" 
                          onClick={() => window.open(complaint.proofImage)}
                        />
                        <span className="text-[10px] text-emerald-600 font-bold">Proof Uploaded</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">No proof yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {complaint.feedbackRating ? (
                      <div>
                        <div className="flex text-yellow-500 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} fill={i < complaint.feedbackRating ? "currentColor" : "none"} />
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-600 italic line-clamp-1">"{complaint.feedbackComment}"</p>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">No feedback yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">{formatDate(complaint.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      {complaint.status === 'pending' || complaint.status === 'rejected' ? (
                        <button
                          onClick={() => { setSelectedComplaint(complaint); setShowAssignModal(true); }}
                          className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm"
                        >
                          Assign Task
                        </button>
                      ) : null}
                      
                      {complaint.status === 'completed' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleVerify(complaint._id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                          >
                            <UserCheck size={12} /> Verify
                          </button>
                          <button
                            onClick={() => handleReject(complaint._id)}
                            className="bg-rose-500 hover:bg-rose-600 text-white px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                          >
                            <X size={12} /> Reject
                          </button>
                        </div>
                      )}
                      
                      {complaint.status === 'verified' && (
                        <span className="text-emerald-500 font-black text-[10px] flex items-center gap-1">
                          <CheckCircle size={12} /> VERIFIED
                        </span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AnimatedCard>
  );

  const renderDashboardContent = () => (
    <>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {[
          { label: 'Total Reports', value: stats.totalComplaints, icon: AlertTriangle, gradient: 'from-blue-600 to-indigo-700' },
          { label: 'Pending', value: stats.pending, icon: Clock, gradient: 'from-amber-400 to-orange-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, gradient: 'from-emerald-500 to-green-700' },
          { label: 'Total Revenue', value: stats.totalRevenue, icon: Heart, gradient: 'from-rose-500 to-pink-600', prefix: '₹' },
          { label: 'Avg Rating', value: stats.avgRating, icon: Star, gradient: 'from-yellow-400 to-orange-400', suffix: '/5' },
          { label: 'Total Users', value: stats.totalUsers, icon: Users, gradient: 'from-violet-500 to-purple-700' }
        ].map((stat, index) => {
          const Icon = stat.icon || AlertTriangle;
          return (
            <AnimatedCard key={index} delay={index * 0.1}>
              <div className={`p-5 text-white rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-xl relative overflow-hidden h-full group hover:scale-[1.02] transition-transform`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                  <Icon size={70} />
                </div>
                <div className="relative z-10">
                   <h3 className="text-[11px] font-black text-white/80 uppercase tracking-widest flex items-center mb-1">
                     {stat.label}
                   </h3>
                   <div className="text-3xl font-black mb-1">
                     <StatsCounter end={stat.value} duration={1.5} prefix={stat.prefix} suffix={stat.suffix} color="text-white" />
                   </div>
                </div>
              </div>
            </AnimatedCard>
          );
        })}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <AlertTriangle className="mr-2 text-primary-500" /> Recent Complaints
        </h2>
        {renderComplaintsTable(filteredComplaints.slice(0, 5))}
      </div>
    </>
  );

  const renderComplaintsContent = () => (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => setFilter(option.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === option.key ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {renderComplaintsTable(filteredComplaints)}
    </>
  );

  const renderUsersContent = () => (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'citizen', 'employee', 'ngo'].map(role => (
          <button
            key={role}
            onClick={() => setUserFilter(role)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${userFilter === role ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>
      <AnimatedCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No users found</td></tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{u.name}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AnimatedCard>
    </>
  );

  const renderAnalyticsContent = () => {
    // Calculate Total Revenue
    const totalRevenue = adminDonations
      .filter(d => d.status === 'success' || d.status === 'paid')
      .reduce((sum, d) => sum + d.amount, 0);

    return (
      <div className="space-y-6">
        {/* Top Level Financials & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatedCard>
            <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-700 text-white rounded-xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Heart size={80} />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-medium text-green-50 flex items-center mb-2">
                   <Heart className="mr-2" size={20} /> Total Revenue Collected
                </h3>
                <div className="text-4xl font-bold mb-1">
                  <StatsCounter end={totalRevenue} duration={2} prefix="₹" color="text-white" />
                </div>
                <p className="text-green-100 text-sm">from generous citizen donations</p>
              </div>
            </div>
          </AnimatedCard>
          
          <AnimatedCard delay={0.1}>
            <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-700 text-white rounded-xl shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-20">
                <Users size={80} />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-medium text-blue-50 flex items-center mb-2">
                   <Users className="mr-2" size={20} /> Total Platform Users
                </h3>
                <div className="text-4xl font-bold mb-1">
                  <StatsCounter end={stats.totalUsers} duration={1.5} color="text-white" />
                </div>
                <p className="text-blue-100 text-sm">registered community members</p>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Detailed Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Complaints by Category */}
          <AnimatedCard delay={0.2}>
            <div className="p-8 h-full bg-white rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <AlertTriangle className="mr-2 text-orange-500" size={24} /> Complaints by Category
              </h3>
              <div className="space-y-6">
                {statsDataRaw?.complaintsByCategory?.length > 0 ? statsDataRaw.complaintsByCategory.map((c, index) => {
                  const percent = Math.min((c.count / (stats.totalComplaints || 1)) * 100, 100);
                  return (
                    <div key={c._id} className="group">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-gray-700 capitalize group-hover:text-primary-600 transition-colors">{c._id}</span>
                        <span className="text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full">{c.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="bg-primary-500 h-full rounded-full shadow-inner" 
                        ></motion.div>
                      </div>
                    </div>
                  );
                }) : <div className="text-center py-8 text-gray-400">No category data available.</div>}
              </div>
            </div>
          </AnimatedCard>

          {/* User Demographics */}
          <AnimatedCard delay={0.3}>
            <div className="p-8 h-full bg-white rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="mr-2 text-blue-500" size={24} /> User Demographics
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Citizens', count: statsDataRaw?.users?.citizenCount || 0, color: 'text-green-600', bg: 'bg-green-50', icon: UserCheck },
                  { label: 'Employees', count: statsDataRaw?.users?.employeeCount || 0, color: 'text-blue-600', bg: 'bg-blue-50', icon: Users },
                  { label: 'NGOs', count: statsDataRaw?.users?.ngoCount || 0, color: 'text-purple-600', bg: 'bg-purple-50', icon: FileText }
                ].map((demo, idx) => {
                  const Icon = demo.icon;
                  return (
                    <motion.div 
                      key={demo.label}
                      whileHover={{ scale: 1.02 }}
                      className={`flex justify-between items-center p-5 rounded-xl border border-transparent hover:border-gray-200 transition-all ${demo.bg}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 bg-white rounded-lg shadow-sm ${demo.color}`}>
                          <Icon size={20} />
                        </div>
                        <span className="text-gray-800 font-semibold">{demo.label}</span>
                      </div>
                      <span className={`text-2xl font-bold bg-white px-4 py-1 rounded-lg shadow-sm ${demo.color}`}>
                        {demo.count}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    );
  };

  const renderDonationsContent = () => {
    const totalDonated = adminDonations
      .filter(d => d.status === 'success' || d.status === 'paid')
      .reduce((sum, d) => sum + d.amount, 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard>
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <DollarSign className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-black text-gray-900">₹{totalDonated.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.1}>
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Heart className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Donations</p>
                <p className="text-2xl font-black text-gray-900">{adminDonations.length}</p>
              </div>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.2}>
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Avg Donation</p>
                <p className="text-2xl font-black text-gray-900">
                  ₹{adminDonations.length > 0 ? Math.round(totalDonated / adminDonations.length).toLocaleString('en-IN') : 0}
                </p>
              </div>
            </div>
          </AnimatedCard>
        </div>

        <AnimatedCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Citizen</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
                ) : adminDonations.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No donations found</td></tr>
                ) : (
                  adminDonations.map(d => (
                    <tr key={d._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                            {d.userId?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{d.userId?.name || 'Unknown User'}</div>
                            <div className="text-xs text-gray-500">{d.userId?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-gray-900 text-lg">
                          ₹{d.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700">{new Date(d.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric'})}</span>
                          <span className="text-xs opacity-60">{new Date(d.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit'})}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
                          d.status === 'success' || d.status === 'paid' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-700'
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
        </AnimatedCard>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{tabInfo[activeTab]?.title || tabInfo.dashboard.title}</h1>
          <p className="text-gray-600 mt-1">{tabInfo[activeTab]?.desc || tabInfo.dashboard.desc}</p>
        </motion.div>

        {activeTab === 'dashboard' && renderDashboardContent()}
        {activeTab === 'complaints' && renderComplaintsContent()}
        {activeTab === 'users' && renderUsersContent()}
        {activeTab === 'donations' && renderDonationsContent()}
        {activeTab === 'analytics' && renderAnalyticsContent()}
      </div>

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssignModal && selectedComplaint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Assign Complaint</h3>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complaint: {selectedComplaint.title}
                    </label>
                    <p className="text-sm text-gray-600">{selectedComplaint.description}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign Type
                    </label>
                    <select
                      value={assignType}
                      onChange={(e) => {
                        setAssignType(e.target.value);
                        setAssignTo('');
                      }}
                      className="input-field"
                    >
                      <option value="employee">Employee</option>
                      <option value="ngo">NGO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign To
                    </label>
                    <select
                      value={assignTo}
                      onChange={(e) => setAssignTo(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select {assignType}</option>
                      {(assignType === 'employee' ? employees : ngos).map((person) => (
                        <option key={person._id} value={person._id}>
                          {person.name} - {person.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssign}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;