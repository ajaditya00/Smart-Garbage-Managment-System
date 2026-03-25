import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, Clock, AlertTriangle, X, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import StatsCounter from '../components/StatsCounter';
import AnimatedCard from '../components/AnimatedCard';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pending: 0,
    assigned: 0,
    completed: 0,
    totalUsers: 0
  });
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignTo, setAssignTo] = useState('');
  const [assignType, setAssignType] = useState('employee');

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    verified: 'bg-purple-100 text-purple-800'
  };

  const filterOptions = [
    { key: 'all', label: 'All Complaints' },
    { key: 'pending', label: 'Pending' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredComplaints(complaints);
    } else {
      setFilteredComplaints(complaints.filter(complaint => complaint.status === filter));
    }
  }, [filter, complaints]);

  const fetchData = async () => {
    try {
      const [statsRes, complaintsRes, employeesRes, ngosRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/complaints'),
        api.get('/admin/employees'),
        api.get('/admin/ngos')
      ]);

      setStats(statsRes.data);
      setComplaints(complaintsRes.data);
      setFilteredComplaints(complaintsRes.data);
      setEmployees(employeesRes.data);
      setNgos(ngosRes.data);
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
      await api.post(`/admin/complaints/${selectedComplaint._id}/assign`, {
        assignedTo: assignTo,
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
    
    const assignee = complaint.assigneeType === 'employee' 
      ? employees.find(emp => emp._id === complaint.assignedTo)
      : ngos.find(ngo => ngo._id === complaint.assignedTo);

    return assignee ? `${assignee.name} (${complaint.assigneeType})` : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage complaints and assignments</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[
            { 
              label: 'Total Complaints', 
              value: stats.totalComplaints, 
              icon: AlertTriangle, 
              color: 'bg-blue-500' 
            },
            { 
              label: 'Pending', 
              value: stats.pending, 
              icon: Clock, 
              color: 'bg-yellow-500' 
            },
            { 
              label: 'Assigned', 
              value: stats.assigned, 
              icon: UserCheck, 
              color: 'bg-orange-500' 
            },
            { 
              label: 'Completed', 
              value: stats.completed, 
              icon: CheckCircle, 
              color: 'bg-green-500' 
            },
            { 
              label: 'Total Users', 
              value: stats.totalUsers, 
              icon: Users, 
              color: 'bg-purple-500' 
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <AnimatedCard key={index} delay={index * 0.1}>
                <div className="p-6">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    <StatsCounter end={stat.value} duration={1.5} />
                  </div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
              </AnimatedCard>
            );
          })}
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setFilter(option.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === option.key
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Table */}
        <AnimatedCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Complaint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No complaints found
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <motion.tr
                      key={complaint._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={complaint.image}
                            alt={complaint.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{complaint.title}</div>
                            <div className="text-sm text-gray-500">{complaint.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{complaint.reportedBy?.name}</div>
                        <div className="text-sm text-gray-500">{complaint.reportedBy?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[complaint.status]}`}>
                          {complaint.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getAssigneeInfo(complaint) || 'Not assigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(complaint.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {complaint.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowAssignModal(true);
                            }}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Assign
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AnimatedCard>
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