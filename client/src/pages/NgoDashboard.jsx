import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Hand, CheckCircle, Clock, Play, Upload, ShieldCheck, ClipboardList, Hash, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import AnimatedCard from '../components/AnimatedCard';
import ImageUpload from '../components/ImageUpload';
import StatsCounter from '../components/StatsCounter';

const NgoDashboard = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    inProgress: 0,
    pendingVerification: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [actionType, setActionType] = useState(''); // 'volunteer', 'update'
  const [newStatus, setNewStatus] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [proofImageFile, setProofImageFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    verified: 'bg-purple-100 text-purple-800'
  };

  const statusOptions = [
    { value: 'in-progress', label: 'Start Work (In Progress)', icon: Play },
    { value: 'completed', label: 'Mark as Completed', icon: CheckCircle }
  ];

  const tabs = [
    { key: 'available', label: 'Available Tasks', count: stats.total },
    { key: 'my-tasks', label: 'My Tasks', count: stats.assigned + stats.inProgress + stats.pendingVerification }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/ngo/tasks');
      const { availableTasks, assignedTasks } = response.data;

      setAvailableTasks(availableTasks);
      setMyTasks(assignedTasks);
      setStats({
        total: availableTasks.length,
        assigned: assignedTasks.filter(t => t.status === 'assigned').length,
        inProgress: assignedTasks.filter(t => t.status === 'in-progress').length,
        pendingVerification: assignedTasks.filter(t => t.status === 'completed').length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleVolunteer = async () => {
    setUpdating(true);
    
    try {
      await api.put(`/ngo/accept/${selectedTask._id}`);
      
      toast.success('Successfully volunteered for this task!');
      setSelectedTask(null);
      setActionType('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to volunteer for task');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    if (newStatus === 'completed' && !proofImageFile) {
      toast.error('Please upload completion proof image');
      return;
    }

    setUpdating(true);
    
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      if (proofImageFile) {
        formData.append('proofImage', proofImageFile);
      }

      await api.put(`/complaints/${selectedTask._id}/status`, formData);

      toast.success('Task updated successfully!');
      setSelectedTask(null);
      setActionType('');
      setNewStatus('');
      setProofImage(null);
      setProofImageFile(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task');
    } finally {
      setUpdating(false);
    }
  };

  const handleImageSelect = (file, preview) => {
    setProofImageFile(file);
    setProofImage(preview);
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

  const getNextStatus = (currentStatus) => {
    if (currentStatus === 'assigned') return 'in-progress';
    if (currentStatus === 'in-progress') return 'completed';
    return null;
  };

  const canUpdateStatus = (task) => {
    return task.status === 'assigned' || task.status === 'in-progress';
  };

  const renderTasks = (tasks, type) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }

    if (tasks.length === 0) {
      return (
        <AnimatedCard>
          <div className="p-8 text-center">
            {type === 'available' ? (
              <>
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No available tasks</h3>
                <p className="text-gray-600">There are no unassigned complaints available for volunteering</p>
              </>
            ) : (
              <>
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assigned tasks</h3>
                <p className="text-gray-600">You have not volunteered for any tasks yet</p>
              </>
            )}
          </div>
        </AnimatedCard>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task, index) => (
          <AnimatedCard key={task._id} delay={index * 0.1}>
            <div className="relative overflow-hidden">
              <img
                src={task.image}
                alt={task.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                  {task.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {task.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {task.description}
              </p>
              <div className="flex items-center text-gray-500 text-sm mb-2">
                <MapPin size={16} className="mr-1" />
                <span className="truncate">{task.location.address}</span>
              </div>
              <div className="flex items-center text-gray-500 text-sm mb-2">
                <Calendar size={16} className="mr-1" />
                <span>
                  {type === 'available' 
                    ? `Reported: ${formatDate(task.createdAt)}`
                    : `Assigned: ${formatDate(task.assignedAt)}`
                  }
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <strong>Reporter:</strong> {task.reportedBy?.name}
              </div>
              
              {/* Completion Proof */}
              {task.completionProof && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Completion Proof:</p>
                  <img
                    src={task.completionProof}
                    alt="Completion proof"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              
              {type === 'available' && task.status === 'pending' && (
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setActionType('volunteer');
                  }}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Hand size={16} />
                  <span>Volunteer for This</span>
                </button>
              )}
              
              {type === 'my-tasks' && canUpdateStatus(task) && (
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setActionType('update');
                    setNewStatus(getNextStatus(task.status));
                  }}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {task.status === 'assigned' ? (
                    <>
                      <Play size={16} />
                      <span>Start Work</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Mark Completed</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </AnimatedCard>
        ))}
      </div>
    );
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
          <h1 className="text-3xl font-bold text-gray-900">NGO Dashboard</h1>
          <p className="text-gray-600 mt-1">Volunteer for cleanup tasks and manage your assignments</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Tasks', value: stats.total, icon: ClipboardList, gradient: 'from-blue-500 to-indigo-700' },
            { label: 'Assigned', value: stats.assigned, icon: Hash, gradient: 'from-yellow-400 to-orange-500' },
            { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, gradient: 'from-orange-500 to-red-600' },
            { label: 'Pending Verification', value: stats.pendingVerification, icon: ShieldCheck, gradient: 'from-purple-500 to-fuchsia-700' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <AnimatedCard key={index} delay={index * 0.1}>
                <div className={`p-6 text-white rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg relative overflow-hidden h-full`}>
                  <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-2 -translate-y-2">
                    <Icon size={80} />
                  </div>
                  <div className="relative z-10">
                     <h3 className="text-sm font-medium text-white/90 flex items-center mb-2">
                       <Icon className="mr-2" size={16} /> {stat.label}
                     </h3>
                     <div className="text-4xl font-bold mb-1">
                       <StatsCounter end={stat.value} duration={1.5} color="text-white" />
                     </div>
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.key
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tasks Content */}
        <div className="space-y-6">
          {activeTab === 'available' ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900">Available Tasks</h2>
              {renderTasks(availableTasks, 'available')}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
              {renderTasks(myTasks, 'my-tasks')}
            </>
          )}
        </div>
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {selectedTask && (
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
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {actionType === 'volunteer' ? 'Volunteer for Task' : 'Update Task Status'}
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">{selectedTask.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{selectedTask.description}</p>
                    <p className="text-xs text-gray-500">
                      <MapPin size={12} className="inline mr-1" />
                      {selectedTask.location.address}
                    </p>
                  </div>
                </div>

                {actionType === 'volunteer' ? (
                  <div className="text-center">
                    <Hand className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to volunteer for this cleanup task? 
                      Once confirmed, this task will be assigned to your organization.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Status
                      </label>
                      <div className="space-y-2">
                        {statusOptions
                          .filter(option => {
                            if (selectedTask.status === 'assigned') return option.value === 'in-progress';
                            if (selectedTask.status === 'in-progress') return option.value === 'completed';
                            return false;
                          })
                          .map((option) => {
                            const Icon = option.icon;
                            return (
                              <label
                                key={option.value}
                                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                                  newStatus === option.value 
                                    ? 'border-primary-500 bg-primary-50' 
                                    : 'border-gray-200'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="status"
                                  value={option.value}
                                  checked={newStatus === option.value}
                                  onChange={(e) => setNewStatus(e.target.value)}
                                  className="text-primary-600 focus:ring-primary-500"
                                />
                                <Icon size={20} className="text-gray-600" />
                                <span className="font-medium text-gray-900">{option.label}</span>
                              </label>
                            );
                          })}
                      </div>
                    </div>

                    {newStatus === 'completed' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Completion Proof *
                        </label>
                        <ImageUpload
                          onImageSelect={handleImageSelect}
                          selectedImage={proofImage}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Please upload a photo showing the completed cleanup work
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-4 pt-6">
                  <button
                    onClick={() => {
                      setSelectedTask(null);
                      setActionType('');
                      setNewStatus('');
                      setProofImage(null);
                      setProofImageFile(null);
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={actionType === 'volunteer' ? handleVolunteer : handleStatusUpdate}
                    disabled={updating}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        {actionType === 'volunteer' ? (
                          <>
                            <Hand size={16} />
                            <span>Confirm Volunteer</span>
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            <span>Update Status</span>
                          </>
                        )}
                      </>
                    )}
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

export default NgoDashboard;