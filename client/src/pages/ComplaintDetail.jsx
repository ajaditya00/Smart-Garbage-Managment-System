import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Star, 
  MessageCircle,
  Camera,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatusTimeline from '../components/StatusTimeline';
import AnimatedCard from '../components/AnimatedCard';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: ''
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    assigned: 'bg-blue-100 text-blue-800 border-blue-200',
    'in-progress': 'bg-orange-100 text-orange-800 border-orange-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    verified: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  useEffect(() => {
    if (id) {
      fetchComplaint();
    }
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const response = await api.get(`/complaints/${id}`);
      setComplaint(response.data);
    } catch (error) {
      console.error('Error fetching complaint:', error);
      toast.error('Failed to load complaint details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    if (feedback.rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    if (!feedback.comment.trim()) {
      toast.error('Please provide feedback comments');
      return;
    }

    setSubmittingFeedback(true);
    
    try {
      await api.post(`/complaints/${id}/feedback`, feedback);
      toast.success('Thank you for your feedback!');
      fetchComplaint(); // Refresh to show new feedback
      setFeedback({ rating: 0, comment: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onRate(star) : undefined}
            className={`${
              interactive 
                ? 'cursor-pointer hover:scale-110 transition-transform' 
                : 'cursor-default'
            }`}
            disabled={!interactive}
          >
            <Star
              size={interactive ? 24 : 16}
              className={`${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getAssigneeInfo = () => {
    if (!complaint?.assignedTo) return null;
    
    return {
      name: complaint.assignedTo.name || 'Unknown',
      type: complaint.assigneeType || 'Unknown',
      email: complaint.assignedTo.email
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint not found</h2>
          <p className="text-gray-600 mb-4">The complaint you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const assigneeInfo = getAssigneeInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{complaint.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>Reported on {formatDate(complaint.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User size={16} />
                  <span>by {complaint.reportedBy?.name}</span>
                </div>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusColors[complaint.status]}`}>
              {complaint.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <AnimatedCard>
              <div className="relative">
                <img
                  src={complaint.image}
                  alt={complaint.title}
                  className="w-full h-80 object-cover rounded-t-xl"
                />
                <div className="absolute top-4 right-4">
                  <Camera className="text-white bg-black bg-opacity-50 p-2 rounded-full" size={36} />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{complaint.description}</p>
              </div>
            </AnimatedCard>

            {/* Location */}
            <AnimatedCard delay={0.1}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Location Details</h3>
                <div className="flex items-start space-x-3">
                  <MapPin className="text-primary-500 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">{complaint.location.address}</p>
                    {complaint.location.latitude && complaint.location.longitude && (
                      <p className="text-sm text-gray-600 mt-1">
                        Coordinates: {complaint.location.latitude}, {complaint.location.longitude}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Status Timeline */}
            <AnimatedCard delay={0.2}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Progress Timeline</h3>
                <StatusTimeline status={complaint.status} />
              </div>
            </AnimatedCard>

            {/* Completion Proof */}
            {complaint.completionProof && (
              <AnimatedCard delay={0.3}>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Completion Proof</h3>
                  <img
                    src={complaint.completionProof}
                    alt="Completion proof"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="flex items-center text-green-600 mt-3">
                    <CheckCircle size={20} className="mr-2" />
                    <span className="font-medium">Work completed and verified</span>
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* Feedback Form */}
            {user.role === 'citizen' && 
             complaint.reportedBy?._id === user._id && 
             complaint.status === 'completed' && 
             !complaint.feedback && (
              <AnimatedCard delay={0.4}>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Provide Feedback</h3>
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How would you rate the cleanup quality?
                      </label>
                      {renderStars(feedback.rating, true, (rating) => 
                        setFeedback(prev => ({ ...prev, rating }))
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Comments
                      </label>
                      <textarea
                        rows={4}
                        value={feedback.comment}
                        onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                        className="input-field"
                        placeholder="Share your thoughts about the cleanup work..."
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      {submittingFeedback ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <MessageCircle size={16} />
                          <span>Submit Feedback</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </AnimatedCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Basic Info */}
            <AnimatedCard delay={0.1}>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Complaint Info</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium text-gray-900 capitalize">{complaint.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Complaint ID</p>
                    <p className="font-medium text-gray-900 font-mono text-sm">{complaint._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {complaint.status.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Assignment Info */}
            {assigneeInfo && (
              <AnimatedCard delay={0.2}>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Assigned To</h3>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{assigneeInfo.name}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {assigneeInfo.type} • {assigneeInfo.email}
                    </p>
                    {complaint.assignedAt && (
                      <p className="text-xs text-gray-500">
                        Assigned on {formatDate(complaint.assignedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* Existing Feedback */}
            {complaint.feedback && (
              <AnimatedCard delay={0.3}>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Citizen Feedback</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Rating</p>
                      {renderStars(complaint.feedback.rating)}
                    </div>
                    {complaint.feedback.comment && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Comments</p>
                        <p className="text-gray-800 text-sm leading-relaxed">
                          {complaint.feedback.comment}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Submitted on {formatDate(complaint.feedback.createdAt)}
                    </p>
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* Reporter Info */}
            <AnimatedCard delay={0.4}>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Reported By</h3>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{complaint.reportedBy?.name}</p>
                  <p className="text-sm text-gray-600">{complaint.reportedBy?.email}</p>
                  <p className="text-xs text-gray-500">
                    Citizen since {formatDate(complaint.reportedBy?.createdAt)}
                  </p>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;