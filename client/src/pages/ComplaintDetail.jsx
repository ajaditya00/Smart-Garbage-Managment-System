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
  CheckCircle,
  Clock,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import SkeletonLoader from '../components/SkeletonLoader';
import StatusTimeline from '../components/StatusTimeline';
import AiInsightsPanel from '../components/AiInsightsPanel';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    if (id) {
      fetchComplaint();
    }
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const response = await api.get(`/complaints/${id}`);
      setComplaint(response.data);
      
      try {
        const feedbackRes = await api.get(`/feedback/${id}`);
        if (feedbackRes.data && feedbackRes.data.length > 0) {
          setExistingFeedback(feedbackRes.data[0]);
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
      }
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

    setSubmittingFeedback(true);
    
    try {
      await api.post('/feedback', {
        complaintId: id,
        rating: feedback.rating,
        comment: feedback.comment
      });
      toast.success('Thank you for your feedback! 🙏');
      fetchComplaint();
      setFeedback({ rating: 5, comment: '' });
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
              size={interactive ? 22 : 14}
              className={`${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-neutral-300 dark:text-neutral-700'
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
      type: complaint.assigneeType || 'crew',
      email: complaint.assignedTo.email
    };
  };

  if (loading) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-neutral-500 text-xs">Loading incident files...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <Card className="p-8 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={40} />
          <h2 className="text-lg font-bold text-neutral-950 dark:text-white mb-2">Complaint Not Found</h2>
          <p className="text-neutral-500 text-xs mb-6">The requested complaint file could not be retrieved from databases.</p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full text-xs"
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const assigneeInfo = getAssigneeInfo();

  return (
    <div className="space-y-6 text-left">
      
      {/* Back button and page titles */}
      <div>
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-3 px-3 py-1 rounded-lg text-xs font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          icon={<ArrowLeft size={14} />}
        >
          Back to list
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              Incident File <span className="font-mono text-neutral-400 text-lg">#{complaint._id.slice(-6)}</span>
            </h1>
            <p className="text-xs text-neutral-500">
              Audit the progress timeline, AI insights, and feedback parameters for this cleanup.
            </p>
          </div>
          <StatusBadge status={complaint.status} size="md" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Main Incident Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Visual Image & description */}
          <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm p-0">
            <div className="relative">
              <img
                src={complaint.image}
                alt={complaint.title}
                className="w-full h-80 object-cover"
              />
              <div className="absolute top-4 right-4 bg-black/60 p-2 rounded-xl backdrop-blur-sm border border-white/10 text-white flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                <Camera size={12} /> Before image
              </div>
            </div>
            <div className="p-6 space-y-3">
              <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest">
                Reporter description
              </h3>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 leading-tight">
                {complaint.title}
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-350 leading-relaxed pt-1">
                {complaint.description}
              </p>
            </div>
          </Card>

          {/* AI insights panel overlay */}
          <AiInsightsPanel 
            title={complaint.title} 
            category={complaint.category} 
            description={complaint.description} 
          />

          {/* Map & Coordinates */}
          <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm">
            <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 pb-2.5 border-b border-neutral-100 dark:border-neutral-800">
              <MapPin size={12} className="text-brand-500" /> Dispatch Location Coordinates
            </h3>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950/20 text-brand-600 flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-neutral-800 dark:text-neutral-200">{complaint.location.address}</p>
                {complaint.location.latitude && complaint.location.longitude && (
                  <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                    GPS Coordinates: {complaint.location.latitude}, {complaint.location.longitude}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Status Timeline Progress */}
          <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm">
            <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-5 flex items-center gap-1.5 pb-2.5 border-b border-neutral-100 dark:border-neutral-800">
              <Clock size={12} className="text-brand-500" /> Resolution Timeline Path
            </h3>
            <StatusTimeline status={complaint.status} />
          </Card>

          {/* Resolution Proof Upload Display */}
          {complaint.proofImage && (
            <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm p-0">
              <div className="relative">
                <img
                  src={complaint.proofImage}
                  alt="Resolution proof"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute top-4 right-4 bg-black/60 p-2 rounded-xl backdrop-blur-sm border border-white/10 text-white flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle size={12} className="text-emerald-400" /> Resolution proof
                </div>
              </div>
              <div className="p-6 flex items-center gap-3 text-xs text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/10">
                <CheckCircle size={18} className="shrink-0" />
                <span className="font-bold uppercase tracking-wider">Site cleared by cleanup crew and volunteered team members</span>
              </div>
            </Card>
          )}

          {/* Rate Cleanup Actions */}
          {user.role === 'citizen' && 
           complaint.userId?._id === user?._id && 
           (complaint.status === 'completed' || complaint.status === 'verified') && 
           !existingFeedback && (
            <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50 mb-1">Verify Cleanup Quality</h3>
              <p className="text-xs text-neutral-500 mb-5">Your review closes the loop and archives this municipal record.</p>
              
              <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                <div className="flex flex-col items-center p-5 bg-neutral-50 dark:bg-neutral-950 border border-dashed border-neutral-250 dark:border-neutral-800 rounded-2xl">
                  <label className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-3.5">
                    Service Satisfaction
                  </label>
                  {renderStars(feedback.rating, true, (rating) => 
                    setFeedback(prev => ({ ...prev, rating }))
                  )}
                  <p className="text-[10px] text-neutral-400 mt-3 font-semibold">Tap to select stars rating</p>
                </div>
                
                <div>
                  <label htmlFor="comment" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
                    Cleanup Feedback Comments
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    value={feedback.comment}
                    onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                    placeholder="Details about quality of cleanup..."
                  />
                </div>
                
                <Button
                  type="submit"
                  loading={submittingFeedback}
                  className="w-full py-2.5 rounded-xl text-xs font-black bg-brand-500 text-white"
                  icon={<MessageCircle size={14} />}
                >
                  Submit review verification
                </Button>
              </form>
            </Card>
          )}

        </div>

        {/* Right Column - Sidebar Parameters */}
        <div className="space-y-6">
          
          {/* Metadata Cards */}
          <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm">
            <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-850">
              Audit details
            </h3>
            <div className="space-y-3.5 text-xs">
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Category</p>
                <p className="font-bold text-neutral-800 dark:text-neutral-200 capitalize mt-0.5">{complaint.category}</p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Incidents Index ID</p>
                <p className="font-mono text-neutral-850 dark:text-neutral-300 select-all mt-0.5">{complaint._id}</p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Timeline Status</p>
                <p className="font-bold text-neutral-800 dark:text-neutral-200 capitalize mt-0.5">
                  {complaint.status.replace('-', ' ')}
                </p>
              </div>
            </div>
          </Card>

          {/* Assigned Crew Section */}
          {assigneeInfo && (
            <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-850">
                Assigned operator
              </h3>
              <div className="space-y-2 text-xs">
                <p className="font-bold text-neutral-850 dark:text-neutral-200">{assigneeInfo.name}</p>
                <p className="text-neutral-500 capitalize">
                  Role: {assigneeInfo.type} • {assigneeInfo.email}
                </p>
                {complaint.assignedAt && (
                  <p className="text-[10px] text-neutral-400 font-medium">
                    Dispatched on {formatDate(complaint.assignedAt)}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Verified Feedback review if available */}
          {existingFeedback && (
            <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-850 flex items-center gap-1.5">
                <Star size={14} className="text-yellow-400 fill-yellow-400" /> Verified Citizen review
              </h3>
              <div className="bg-emerald-50 dark:bg-emerald-950/10 rounded-2xl p-4.5 border border-emerald-100 dark:border-emerald-900/30 text-xs space-y-3.5">
                <div>
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider mb-1">Satisfactory Grade</p>
                  {renderStars(existingFeedback.rating)}
                </div>
                {existingFeedback.comment && (
                  <div>
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider mb-1">Comments</p>
                    <p className="text-neutral-700 dark:text-neutral-300 italic leading-relaxed">
                      "{existingFeedback.comment}"
                    </p>
                  </div>
                )}
                <div className="pt-2.5 border-t border-emerald-100 dark:border-emerald-900/20 text-[10px] text-neutral-400 flex items-center justify-between">
                  <span>Verified Review</span>
                  <span>{formatDate(existingFeedback.createdAt)}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Reporter details */}
          <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm">
            <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-850">
              Reporter profile
            </h3>
            <div className="space-y-2 text-xs">
              <p className="font-bold text-neutral-850 dark:text-neutral-250">{complaint.userId?.name}</p>
              <p className="text-neutral-500">{complaint.userId?.email}</p>
              <p className="text-[10px] text-neutral-400 font-medium">
                Registered on {formatDate(complaint.userId?.createdAt || Date.now())}
              </p>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};

export default ComplaintDetail;