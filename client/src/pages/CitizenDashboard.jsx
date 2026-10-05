import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, MapPin, Camera, Calendar, Eye, AlertTriangle, Clock, CheckCircle, Star, MessageSquare, ChevronUp, ChevronDown, TrendingUp, Sparkles } from 'lucide-react';
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

const CitizenDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0
  });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'garbage',
    location: {
      address: '',
      latitude: '',
      longitude: ''
    },
    image: null,
    imageFile: null
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: ''
  });

  const [widgets, setWidgets] = useState({
    stats: true,
    complaints: true
  });

  useEffect(() => {
    const saved = localStorage.getItem('swachhai_citizen_widgets');
    if (saved) {
      setWidgets(JSON.parse(saved));
    }
  }, []);

  const toggleWidget = (name) => {
    const updated = { ...widgets, [name]: !widgets[name] };
    setWidgets(updated);
    localStorage.setItem('swachhai_citizen_widgets', JSON.stringify(updated));
  };

  const categories = [
    'garbage',
    'sewage',
    'road',
    'electricity',
    'water',
    'other'
  ];

  useEffect(() => {
    fetchComplaintsAndStats();
  }, []);

  const fetchComplaintsAndStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/complaints');
      const data = response.data;
      setComplaints(data);

      setStats({
        total: data.length,
        pending: data.filter(c => c.status === 'pending').length,
        resolved: data.filter(c => c.status === 'completed' || c.status === 'verified').length
      });
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toString();
        const lon = position.coords.longitude.toString();
        
        let fetchedAddress = formData.location.address;
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          
          if (data && data.display_name) {
            fetchedAddress = data.display_name;
            toast.success('Location & address detected successfully!');
          } else {
            toast.success('Location captured. Enter address manually.');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          toast.success('Location captured. Enter address manually.');
        }

        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            latitude: lat,
            longitude: lon,
            address: fetchedAddress
          }
        }));
        
        setFetchingLocation(false);
      },
      (error) => {
        setFetchingLocation(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location permission denied. Enter manually.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location unavailable. Enter manually.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out. Enter manually.");
            break;
          default:
            toast.error("Error fetching location.");
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!formData.imageFile) {
      toast.error('Please upload an image');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload Image
      const uploadData = new FormData();
      uploadData.append('image', formData.imageFile);
      uploadData.append('referenceId', `complaint_${Date.now()}`);

      const uploadRes = await api.post('/uploads', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const imageData = uploadRes.data.data;

      // 2. Submit Complaint
      const complaintData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: JSON.stringify(formData.location),
        image: imageData.url,
        imageData: JSON.stringify(imageData)
      };

      await api.post('/complaints', complaintData);

      toast.success('Complaint reported successfully!');
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'garbage',
        location: { address: '', latitude: '', longitude: '' },
        image: null,
        imageFile: null
      });

      fetchComplaintsAndStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageSelect = (file, preview) => {
    setFormData(prev => ({
      ...prev,
      imageFile: file,
      image: preview
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await api.post('/feedback', {
        complaintId: selectedComplaint._id,
        rating: feedbackData.rating,
        comment: feedbackData.comment
      });

      toast.success('Feedback submitted successfully!');
      setShowFeedbackModal(false);
      setFeedbackData({ rating: 5, comment: '' });
      fetchComplaintsAndStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, setRating, interactive = true }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={22}
            className={`${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300 dark:text-neutral-700'
            } ${interactive ? 'cursor-pointer transform hover:scale-110 transition-all' : ''}`}
            onClick={() => interactive && setRating(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Sparkles className="text-brand-500" size={20} /> Citizen Workspace
          </h1>
          <p className="text-xs text-neutral-500">
            Log new spots, monitor assignees, and ratify cleanups in your sector.
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          variant="primary"
          className="px-5 py-2.5 rounded-xl text-xs font-black shadow-sm"
          icon={<Plus size={16} />}
        >
          Report Garbage Spot
        </Button>
      </div>

      {/* Widget Grid */}
      <div className="space-y-6">
        
        {/* Statistics Widgets */}
        <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-5">
            <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp size={14} className="text-brand-500" /> Track Activity Trends
            </h3>
            <button
              onClick={() => toggleWidget('stats')}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/80 rounded-lg transition-colors"
              aria-label="Toggle Stats Widget"
            >
              {widgets.stats ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {widgets.stats && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden"
              >
                {[
                  { label: 'Total Logs Filed', value: stats.total, icon: AlertTriangle, colors: 'bg-brand-50/50 text-brand-600 border border-brand-100 dark:bg-brand-950/10 dark:border-brand-900/30' },
                  { label: 'Pending Dispatch', value: stats.pending, icon: Clock, colors: 'bg-amber-50/50 text-amber-600 border border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/30' },
                  { label: 'Resolved Cleanups', value: stats.resolved, icon: CheckCircle, colors: 'bg-emerald-50/50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30' }
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className={`p-5 rounded-2xl flex items-center justify-between ${stat.colors}`}>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{stat.label}</p>
                        <div className="text-3xl font-black">
                          <StatsCounter end={stat.value} duration={1} color="currentColor" />
                        </div>
                      </div>
                      <Icon size={28} className="opacity-70" />
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Complaints Ledger List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200/50 dark:border-neutral-800 pb-2">
            <h2 className="text-sm font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-widest">
              My Incidents Record
            </h2>
            <button
              onClick={() => toggleWidget('complaints')}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/80 rounded-lg transition-colors"
              aria-label="Toggle Complaints List"
            >
              {widgets.complaints ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {widgets.complaints && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <SkeletonLoader key={i} variant="card" />
                    ))}
                  </div>
                ) : complaints.length === 0 ? (
                  <EmptyState
                    icon={Camera}
                    title="No reported logs recorded"
                    description="Create a citizen record entry by uploading waste photo logs to begin."
                    actionLabel="Report Garbage Spot"
                    onAction={() => setShowModal(true)}
                    actionIcon={<Plus size={14} />}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {complaints.map((complaint, index) => (
                      <Card key={complaint._id} padding="p-0" className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between" delay={index * 0.05}>
                        <div className="relative">
                          <img
                            src={complaint.image}
                            alt={complaint.title}
                            className="w-full h-44 object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <StatusBadge status={complaint.status} size="sm" />
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                              {complaint.title}
                            </h3>
                            <p className="text-neutral-500 text-[11px] mt-1.5 line-clamp-2 leading-relaxed">
                              {complaint.description}
                            </p>
                          </div>
                          
                          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-medium text-neutral-500">
                            <div className="flex items-center space-x-2">
                              <MapPin size={12} className="text-neutral-400 shrink-0" />
                              <span className="truncate">{complaint.location.address}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar size={12} className="text-neutral-400 shrink-0" />
                              <span>{formatDate(complaint.createdAt)}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2 pt-1">
                            <Button
                              to={`/complaint/${complaint._id}`}
                              variant="secondary"
                              className="flex-1 text-[11px] py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                              icon={<Eye size={12} />}
                            >
                              Details
                            </Button>
                            {(complaint.status === 'completed' || complaint.status === 'verified') && (
                              <Button
                                onClick={() => {
                                  setSelectedComplaint(complaint);
                                  setShowFeedbackModal(true);
                                }}
                                variant="primary"
                                className="flex-1 text-[11px] py-2 rounded-lg bg-brand-500 text-white"
                                icon={<MessageSquare size={12} />}
                              >
                                Feedback
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Report Modal Panel */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Report Waste Location"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label htmlFor="title" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
              Incident Label
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              placeholder="Brief description of the issue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
                Waste Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
                Evidence Upload
              </label>
              <ImageUpload
                onImageSelect={handleImageSelect}
                selectedImage={formData.image}
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
              Location details
            </label>
            <div className="space-y-3">
              <input
                id="address"
                type="text"
                required
                value={formData.location.address}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, address: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                placeholder="Enter address coordinates"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  aria-label="Latitude"
                  type="number"
                  step="any"
                  value={formData.location.latitude}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, latitude: e.target.value }
                  }))}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  placeholder="Latitude (optional)"
                />
                <input
                  aria-label="Longitude"
                  type="number"
                  step="any"
                  value={formData.location.longitude}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, longitude: e.target.value }
                  }))}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  placeholder="Longitude (optional)"
                />
              </div>

              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={fetchingLocation}
                className={`text-xs font-bold flex items-center space-x-2 transition-colors py-1 cursor-pointer ${
                  fetchingLocation ? 'text-neutral-400 cursor-not-allowed' : 'text-brand-600 hover:text-brand-700'
                }`}
              >
                {fetchingLocation ? (
                  <div className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MapPin size={14} />
                )}
                <span>{fetchingLocation ? 'Detecting Location Coordinates...' : 'Auto-Detect Location GPS'}</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
              Additional Details
            </label>
            <textarea
              id="description"
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              placeholder="Provide directions or urgency details..."
            />
          </div>

          <div className="flex space-x-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="flex-1 rounded-xl text-xs py-2 bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              className="flex-1 rounded-xl text-xs py-2 bg-brand-500 text-white"
            >
              Submit Spot Log
            </Button>
          </div>
        </form>
      </Modal>

      {/* Feedback Modal Panel */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Verify and Rate Cleanup"
        size="md"
      >
        <div className="mb-5 text-left">
          <p className="text-xs text-neutral-500 mb-3.5">
            How would you rate the resolution quality for: <span className="font-bold text-neutral-900 dark:text-neutral-100">{selectedComplaint?.title}</span>?
          </p>
          <div className="flex justify-center mb-5 bg-neutral-50 dark:bg-neutral-900/50 py-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
            <StarRating
              rating={feedbackData.rating}
              setRating={(rating) => setFeedbackData(prev => ({ ...prev, rating }))}
            />
          </div>

          <label htmlFor="comment" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
            Experience Comments
          </label>
          <textarea
            id="comment"
            rows={3}
            value={feedbackData.comment}
            onChange={(e) => setFeedbackData(prev => ({ ...prev, comment: e.target.value }))}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            placeholder="Share feedback on cleanup quality..."
          />
        </div>

        <div className="flex space-x-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowFeedbackModal(false)}
            className="flex-1 rounded-xl text-xs py-2 bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            Skip Rating
          </Button>
          <Button
            onClick={handleFeedbackSubmit}
            loading={submitting}
            className="flex-1 rounded-xl text-xs py-2 bg-brand-500 text-white"
          >
            Submit Review
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CitizenDashboard;