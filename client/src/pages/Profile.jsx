import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AnimatedCard from '../components/AnimatedCard';

const Profile = () => {
  const { user, fetchUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    
    try {
      await api.put('/auth/profile', formData);
      toast.success('Profile updated successfully!');
      setEditing(false);
      
      // Refresh user data
      if (fetchUser) {
        await fetchUser();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || ''
    });
    setEditing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      citizen: 'bg-blue-100 text-blue-800',
      admin: 'bg-red-100 text-red-800',
      employee: 'bg-green-100 text-green-800',
      ngo: 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <AnimatedCard>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getRoleBadgeColor(user.role)}`}>
                        {user.role?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Edit2 size={16} />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="input-field"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="input-field"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <User className="text-gray-400" size={20} />
                        <span className="text-gray-900">{user.name}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="text-gray-400" size={20} />
                        <span className="text-gray-900">{user.email}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="text-gray-400" size={20} />
                        <span className="text-gray-900">
                          {user.phone || 'Not provided'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Type
                      </label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-5 h-5 bg-primary-500 rounded-full"></div>
                        <span className="text-gray-900 capitalize">{user.role}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Member Since
                      </label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="text-gray-400" size={20} />
                        <span className="text-gray-900">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AnimatedCard>
          </div>

          {/* Account Statistics */}
          <div className="space-y-6">
            <AnimatedCard delay={0.2}>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Verified</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Login</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(user.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {user.role === 'citizen' && (
              <AnimatedCard delay={0.4}>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <a
                      href="/dashboard"
                      className="block w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-primary-800">View Dashboard</div>
                      <div className="text-sm text-primary-600">Manage your complaints</div>
                    </a>
                    <a
                      href="/donate"
                      className="block w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-green-800">Make a Donation</div>
                      <div className="text-sm text-green-600">Support clean India</div>
                    </a>
                  </div>
                </div>
              </AnimatedCard>
            )}

            <AnimatedCard delay={0.6}>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    If you have questions about your account or need assistance, 
                    please contact our support team.
                  </p>
                  <div className="pt-3">
                    <a
                      href="mailto:support@swachh-ai.com"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      support@swachh-ai.com
                    </a>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;