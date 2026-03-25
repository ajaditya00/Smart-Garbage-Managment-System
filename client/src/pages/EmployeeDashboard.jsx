import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Camera, CheckCircle, Clock, Play, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import AnimatedCard from '../components/AnimatedCard';
import ImageUpload from '../components/ImageUpload';
import StatsCounter from '../components/StatsCounter';

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [proofImageFile, setProofImageFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  const statusColors = {
    assigned: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    verified: 'bg-purple-100 text-purple-800'
  };

  const statusOptions = [
    { value: 'in-progress', label: 'Start Work (In Progress)', icon: Play },
    { value: 'completed', label: 'Mark as Completed', icon: CheckCircle }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        api.get('/employee/tasks'),
        api.get('/employee/stats')
      ]);

      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
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
        formData.append('completionProof', proofImageFile);
      }

      await api.put(`/employee/tasks/${selectedTask._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Task updated successfully!');
      setSelectedTask(null);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your assigned cleanup tasks</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'Total Tasks', 
              value: stats.total, 
              color: 'bg-blue-500' 
            },
            { 
              label: 'Assigned', 
              value: stats.assigned, 
              color: 'bg-yellow-500' 
            },
            { 
              label: 'In Progress', 
              value: stats.inProgress, 
              color: 'bg-orange-500' 
            },
            { 
              label: 'Completed', 
              value: stats.completed, 
              color: 'bg-green-500' 
            }
          ].map((stat, index) => (
            <AnimatedCard key={index} delay={index * 0.1}>
              <div className="p-6">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                  <span className="text-white font-bold text-xl">
                    <StatsCounter end={stat.value} duration={1.5} />
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{stat.label}</h3>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Tasks List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <AnimatedCard>
              <div className="p-8 text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
                <p className="text-gray-600">You have no assigned cleanup tasks at the moment</p>
              </div>
            </AnimatedCard>
          ) : (
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
                      <span>Assigned: {formatDate(task.assignedAt)}</span>
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
                    
                    {canUpdateStatus(task) && (
                      <button
                        onClick={() => {
                          setSelectedTask(task);
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
          )}
        </div>
      </div>

      {/* Status Update Modal */}
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Update Task Status</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">{selectedTask.title}</h4>
                    <p className="text-sm text-gray-600">{selectedTask.description}</p>
                  </div>
                </div>

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

                <div className="flex space-x-4 pt-6">
                  <button
                    onClick={() => {
                      setSelectedTask(null);
                      setNewStatus('');
                      setProofImage(null);
                      setProofImageFile(null);
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Update Status</span>
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

export default EmployeeDashboard;