import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Hand, CheckCircle, Clock, Play, Upload, ShieldCheck, ClipboardList, Hash, TrendingUp, Sparkles, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
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

  const tabs = [
    { key: 'available', label: 'Available Jobs Board', count: stats.total },
    { key: 'my-tasks', label: 'My Volunteered Queue', count: stats.assigned + stats.inProgress + stats.pendingVerification }
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
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Sparkles className="text-brand-500" size={20} /> NGO Collaboration Space
        </h1>
        <p className="text-xs text-neutral-500">
          Volunteer for public garbage cleanup drives, coordinate with municipal units, and submit completion reports.
        </p>
      </div>

      {/* KPI Stats widgets grid */}
      <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 rounded-2xl shadow-sm">
        <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-5">
          <TrendingUp size={14} className="text-brand-500" /> Voluntary Action Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Available Jobs Board', value: stats.total, icon: ClipboardList, colors: 'bg-brand-50/50 text-brand-600 border border-brand-100 dark:bg-brand-950/10 dark:border-brand-900/30' },
            { label: 'Volunteered Task Items', value: stats.assigned, icon: Clock, colors: 'bg-blue-50/50 text-blue-600 border border-blue-100 dark:bg-blue-950/10 dark:border-blue-900/30' },
            { label: 'Cleanup In Progress', value: stats.inProgress, icon: Play, colors: 'bg-orange-50/50 text-orange-600 border border-orange-100 dark:bg-orange-950/10 dark:border-orange-900/30' },
            { label: 'Pending Verification', value: stats.pendingVerification, icon: CheckCircle, colors: 'bg-emerald-50/50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={`p-4 rounded-xl flex items-center justify-between ${stat.colors}`}>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-1">{stat.label}</p>
                  <div className="text-xl font-black">
                    <StatsCounter end={stat.value} duration={1} color="currentColor" />
                  </div>
                </div>
                <Icon size={18} className="opacity-75" />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tabs list trigger */}
      <div className="space-y-5">
        <div className="flex bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 p-1.5 rounded-xl shadow-sm max-w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.key 
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-sm' 
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/80'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                activeTab === tab.key ? 'bg-brand-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Task lists container mapping */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((i) => (
                <SkeletonLoader key={i} variant="card" />
              ))}
            </div>
          ) : activeTab === 'available' ? (
            availableTasks.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No tasks currently available"
                description="There are currently no reported waste coordinates pending volunteer cleanups. New reports logged by citizens will display here."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableTasks.map((task, index) => (
                  <Card key={task._id} padding="p-0" className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between" delay={index * 0.05}>
                    <div className="relative">
                      <img
                        src={task.image}
                        alt={task.title}
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={task.status} size="sm" />
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                          {task.title}
                        </h3>
                        <p className="text-neutral-500 text-[11px] mt-1.5 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-medium text-neutral-500">
                        <div className="flex items-center space-x-2">
                          <MapPin size={12} className="text-neutral-400 shrink-0" />
                          <span className="truncate">{task.location.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar size={12} className="text-neutral-400 shrink-0" />
                          <span>{formatDate(task.createdAt)}</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          setSelectedTask(task);
                          setActionType('volunteer');
                        }}
                        variant="primary"
                        className="w-full text-[11px] py-2 rounded-lg bg-brand-500 text-white font-bold"
                        icon={<Hand size={12} />}
                      >
                        Accept Cleanup Job
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            myTasks.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="Your active volunteered list is empty"
                description="Accept cleanup tasks from the Available Jobs Board to start building a cleaner city drive."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTasks.map((task, index) => (
                  <Card key={task._id} padding="p-0" className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between" delay={index * 0.05}>
                    <div className="relative">
                      <img
                        src={task.image}
                        alt={task.title}
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={task.status} size="sm" />
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                          {task.title}
                        </h3>
                        <p className="text-neutral-500 text-[11px] mt-1.5 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-medium text-neutral-500">
                        <div className="flex items-center space-x-2">
                          <MapPin size={12} className="text-neutral-400 shrink-0" />
                          <span className="truncate">{task.location.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar size={12} className="text-neutral-400 shrink-0" />
                          <span>{formatDate(task.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-1">
                        {task.status !== 'completed' && task.status !== 'verified' && (
                          <Button
                            onClick={() => {
                              setSelectedTask(task);
                              setActionType('update');
                              setNewStatus(task.status === 'assigned' ? 'in-progress' : 'completed');
                            }}
                            variant="primary"
                            className="w-full text-[11px] py-2 rounded-lg bg-brand-500 text-white font-bold"
                            icon={task.status === 'assigned' ? <Play size={12} /> : <CheckCircle size={12} />}
                          >
                            {task.status === 'assigned' ? 'Start Cleanup' : 'Complete Clean Job'}
                          </Button>
                        )}
                        {(task.status === 'completed' || task.status === 'verified') && (
                          <div className="w-full text-center py-2 text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center gap-1">
                            <CheckCircle size={14} /> CLEANUP SUBMITTED
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Volunteer Confirmation Modal */}
      <Modal
        isOpen={!!selectedTask && actionType === 'volunteer'}
        onClose={() => {
          setSelectedTask(null);
          setActionType('');
        }}
        title="Volunteer for Task"
        size="sm"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-neutral-500">
            Are you sure you want to volunteer for: <span className="font-bold text-neutral-800 dark:text-neutral-200">{selectedTask?.title}</span>?
          </p>
          <p className="text-[10px] text-neutral-400 leading-normal">
            By accepting, this task will move into your volunteering queue, and you will be responsible for submitting the clean photo proof once resolved.
          </p>
        </div>

        <div className="flex space-x-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-5">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSelectedTask(null);
              setActionType('');
            }}
            className="flex-1 rounded-xl text-xs py-2 bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleVolunteer}
            loading={updating}
            className="flex-1 rounded-xl text-xs py-2 bg-brand-500 text-white"
          >
            Accept Job
          </Button>
        </div>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={!!selectedTask && actionType === 'update'}
        onClose={() => {
          setSelectedTask(null);
          setActionType('');
          setNewStatus('');
          setProofImage(null);
          setProofImageFile(null);
        }}
        title="Update Voluntary Cleanup Progress"
        size="md"
      >
        <div className="space-y-5 text-left">
          <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl">
            <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">
              Active Task details
            </label>
            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">{selectedTask?.title}</p>
            <p className="text-[11px] text-neutral-500 mt-1 leading-normal">{selectedTask?.description}</p>
          </div>

          <div>
            <label htmlFor="modalStatus" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
              Update Status Phase
            </label>
            <select
              id="modalStatus"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
            >
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed (Proof Required)</option>
            </select>
          </div>

          {newStatus === 'completed' && (
            <div className="space-y-2">
              <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest">
                Cleanup Proof Image Upload
              </label>
              <ImageUpload
                onImageSelect={handleImageSelect}
                selectedImage={proofImage}
              />
              <p className="text-[10px] text-neutral-400 italic">
                * Upload clear photo evidence of the clean spot to submit to administrator for verification.
              </p>
            </div>
          )}
        </div>

        <div className="flex space-x-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-5">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSelectedTask(null);
              setActionType('');
              setNewStatus('');
              setProofImage(null);
              setProofImageFile(null);
            }}
            className="flex-1 rounded-xl text-xs py-2 bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            loading={updating}
            className="flex-1 rounded-xl text-xs py-2 bg-brand-500 text-white"
          >
            Update Assignment
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default NgoDashboard;