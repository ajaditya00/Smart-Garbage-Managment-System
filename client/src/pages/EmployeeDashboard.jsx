import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Camera, CheckCircle, Clock, Play, Upload, Hash, CheckSquare, ClipboardList, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import SkeletonLoader from '../components/SkeletonLoader';
import ImageUpload from '../components/ImageUpload';
import StatsCounter from '../components/StatsCounter';
import EmptyState from '../components/EmptyState';

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/complaints');
      const myTasks = response.data.filter(t => t.status !== 'pending');

      setTasks(myTasks);
      setStats({
        total: myTasks.length,
        assigned: myTasks.filter(t => t.status === 'assigned').length,
        inProgress: myTasks.filter(t => t.status === 'in-progress').length,
        completed: myTasks.filter(t => t.status === 'completed' || t.status === 'verified').length
      });
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
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Sparkles className="text-brand-500" size={20} /> Municipal Tasks Workspace
        </h1>
        <p className="text-xs text-neutral-500">
          Monitor your assigned ward cleanups, update task progress, and submit action proof images.
        </p>
      </div>

      {/* Stats Counter Widget */}
      <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 rounded-2xl shadow-sm">
        <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-5">
          <TrendingUp size={14} className="text-brand-500" /> Work Capacity Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Assigned Tasks', value: stats.assigned, icon: Clock, colors: 'bg-brand-50/50 text-brand-600 border border-brand-100 dark:bg-brand-950/10 dark:border-brand-900/30' },
            { label: 'In Progress', value: stats.inProgress, icon: Play, colors: 'bg-amber-50/50 text-amber-600 border border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/30' },
            { label: 'Completed Jobs', value: stats.completed, icon: CheckCircle, colors: 'bg-emerald-50/50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30' },
            { label: 'Cumulative Backlog', value: stats.total, icon: ClipboardList, colors: 'bg-purple-50/50 text-purple-600 border border-purple-100 dark:bg-purple-950/10 dark:border-purple-900/30' }
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

      {/* Task List Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-widest border-b border-neutral-200/50 dark:border-neutral-800 pb-2">
          My Active Assignments List
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((i) => (
              <SkeletonLoader key={i} variant="card" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No tasks assigned yet"
            description="You currently have an empty queue. Once administrators assign a garbage spot in your ward, it will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task, index) => (
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

                  <div className="space-y-2 pt-2 border-t border-neutral-105 dark:border-neutral-800 text-[11px] font-medium text-neutral-500">
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
                          setNewStatus(task.status === 'assigned' ? 'in-progress' : 'completed');
                        }}
                        variant="primary"
                        className="w-full text-[11px] py-2 rounded-lg bg-brand-500 text-white font-bold"
                        icon={task.status === 'assigned' ? <Play size={12} /> : <CheckSquare size={12} />}
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
        )}
      </div>

      {/* Task Update Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => {
          setSelectedTask(null);
          setNewStatus('');
          setProofImage(null);
          setProofImageFile(null);
        }}
        title="Update Job Progress"
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

export default EmployeeDashboard;