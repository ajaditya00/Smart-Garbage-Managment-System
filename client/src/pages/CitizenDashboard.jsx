import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, MapPin, Camera, Calendar, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import StatsCounter from '../components/StatsCounter';
import AnimatedCard from '../components/AnimatedCard';
import ImageUpload from '../components/ImageUpload';

const CitizenDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0
  });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const categories = [
    'garbage',
    'sewage', 
    'road',
    'electricity',
    'water',
    'other'
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    verified: 'bg-purple-100 text-purple-800'
  };

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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString()
            }
          }));
          toast.success('Location captured successfully!');
        },
        (error) => {
          toast.error('Unable to get location. Please enter manually.');
        }
      );
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Citizen Dashboard</h1>
              <p className="text-gray-600 mt-1">Report and track garbage complaints</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus size={20} />
              <span>Report Garbage</span>
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Complaints', value: stats.total, color: 'bg-blue-500' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
            { label: 'Resolved', value: stats.resolved, color: 'bg-green-500' }
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

        {/* Complaints List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">My Complaints</h2>
          
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
          ) : complaints.length === 0 ? (
            <AnimatedCard>
              <div className="p-8 text-center">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints yet</h3>
                <p className="text-gray-600">Start by reporting your first garbage complaint</p>
              </div>
            </AnimatedCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {complaints.map((complaint, index) => (
                <AnimatedCard key={complaint._id} delay={index * 0.1}>
                  <div className="relative overflow-hidden">
                    <img
                      src={complaint.image}
                      alt={complaint.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[complaint.status]}`}>
                        {complaint.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {complaint.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {complaint.description}
                    </p>
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <MapPin size={16} className="mr-1" />
                      <span className="truncate">{complaint.location.address}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mb-4">
                      <Calendar size={16} className="mr-1" />
                      <span>{formatDate(complaint.createdAt)}</span>
                    </div>
                    <Link
                      to={`/complaints/${complaint._id}`}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Eye size={16} />
                      <span>View Details</span>
                    </Link>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showModal && (
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
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Report Garbage Issue</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="input-field"
                      placeholder="Brief description of the issue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="input-field"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Evidence
                    </label>
                    <ImageUpload
                      onImageSelect={handleImageSelect}
                      selectedImage={formData.image}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        required
                        value={formData.location.address}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          location: { ...prev.location, address: e.target.value }
                        }))}
                        className="input-field"
                        placeholder="Enter address"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          step="any"
                          value={formData.location.latitude}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            location: { ...prev.location, latitude: e.target.value }
                          }))}
                          className="input-field"
                          placeholder="Latitude (optional)"
                        />
                        <input
                          type="number"
                          step="any"
                          value={formData.location.longitude}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            location: { ...prev.location, longitude: e.target.value }
                          }))}
                          className="input-field"
                          placeholder="Longitude (optional)"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
                      >
                        <MapPin size={16} />
                        <span>Use Current Location</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="input-field"
                      placeholder="Detailed description of the issue"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`flex-1 flex justify-center items-center py-2 px-4 rounded-lg font-medium transition-colors text-white ${
                        submitting ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'
                      }`}
                    >
                      {submitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CitizenDashboard;