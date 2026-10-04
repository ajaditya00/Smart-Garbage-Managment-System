import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Edit2, Save, X, Sparkles, Shield, Heart, HelpCircle, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';

const Profile = () => {
  const { user, fetchUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

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

  if (!user) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-neutral-500 text-xs">Loading profile parameters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Sparkles className="text-brand-500" size={20} /> Settings & Workspace
        </h1>
        <p className="text-xs text-neutral-500">
          Manage your account profile parameters, directory verification states, and configurations.
        </p>
      </div>

      {/* Tabs triggers */}
      <div className="flex bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 p-1.5 rounded-xl shadow-sm max-w-fit">
        {[
          { key: 'general', label: 'General Account' },
          { key: 'security', label: 'Security & Access' }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer ${activeTab === t.key
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/80'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - Main Tab Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'general' ? (
            <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-brand-50 dark:bg-brand-950 rounded-full flex items-center justify-center font-bold text-brand-700 border border-brand-200/40 text-lg shrink-0">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-neutral-800 dark:text-neutral-200">{user.name}</h2>
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-brand-500 text-white mt-1.5">
                      {user.role}
                    </span>
                  </div>
                </div>

                {!editing && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs focus-visible:ring-2 focus-visible:ring-brand-500/40"
                    icon={<Edit2 size={13} className="text-white shrink-0" />}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-xl text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="flex space-x-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="rounded-xl text-xs py-2 bg-brand-500 text-white font-bold px-4"
                      icon={<Save size={13} />}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      className="rounded-xl text-xs py-2 bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 px-4"
                      icon={<X size={13} />}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-medium">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-450 uppercase tracking-widest mb-1">
                      Full Name
                    </label>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-850 rounded-xl text-neutral-800 dark:text-neutral-200">
                      {user.name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-neutral-450 uppercase tracking-widest mb-1">
                      Email Address
                    </label>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-850 rounded-xl text-neutral-400 dark:text-neutral-500">
                      {user.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-neutral-450 uppercase tracking-widest mb-1">
                      Phone Number
                    </label>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-850 rounded-xl text-neutral-800 dark:text-neutral-200">
                      {user.phone || 'Not provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-neutral-450 uppercase tracking-widest mb-1">
                      Member Registry
                    </label>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-850 rounded-xl text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                      <Calendar size={13} className="text-neutral-400" />
                      <span>Registered on {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6 space-y-5">
              <h3 className="text-sm font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-widest">
                Verification Credentials
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-800 rounded-xl">
                  <div className="text-xs">
                    <p className="font-bold text-neutral-800 dark:text-neutral-200">System Directory Status</p>
                    <p className="text-[10px] text-neutral-450 mt-0.5">Assigned roles parameters and credentials.</p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-black uppercase tracking-wider">
                    Verified
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-800 rounded-xl">
                  <div className="text-xs">
                    <p className="font-bold text-neutral-800 dark:text-neutral-200">Role Privilege Level</p>
                    <p className="text-[10px] text-neutral-450 mt-0.5">Scope of dispatch approvals.</p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-brand-500 text-white rounded text-[10px] font-black uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Status & Support Info */}
        <div className="space-y-6">
          <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm">
            <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-850">
              Account Status
            </h3>
            <div className="space-y-3.5 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Security Clearance</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Last Directory Sync</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-mono text-[10px]">
                  {formatDate(user.updatedAt)}
                </span>
              </div>
            </div>
          </Card>

          {user.role === 'citizen' && (
            <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-850">
                Workspace Shortcuts
              </h3>
              <div className="space-y-3">
                <Link
                  to="/dashboard"
                  className="block w-full text-left p-3.5 bg-brand-50 hover:bg-brand-100/30 dark:bg-brand-950/10 dark:border dark:border-brand-900/30 rounded-xl transition-all"
                >
                  <div className="font-black text-brand-800 dark:text-brand-400 text-xs">View Incidents Board</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Manage your logged garbage files</div>
                </Link>
                <Link
                  to="/donate"
                  className="block w-full text-left p-3.5 bg-emerald-50 hover:bg-emerald-100/30 dark:bg-emerald-950/10 dark:border dark:border-emerald-900/30 rounded-xl transition-all"
                >
                  <div className="font-black text-emerald-800 dark:text-emerald-450 text-xs">Contribute Capital Support</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Donate funds to Swachh drives</div>
                </Link>
              </div>
            </Card>
          )}

          <Card className="border border-neutral-200/50 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm">
            <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-850">
              Workspace Support
            </h3>
            <div className="text-xs text-neutral-500 leading-relaxed space-y-3">
              <p>
                Have questions about role settings, integrations, or coordinates auditing? Contact security desk:
              </p>
              <a
                href="mailto:support@swachh-ai.com"
                className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700"
              >
                support@swachh-ai.com <ArrowUpRight size={12} />
              </a>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
};

export default Profile;