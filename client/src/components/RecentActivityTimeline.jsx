import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clipboard, AlertCircle, CheckCircle, Clock, Heart, Users, ShieldAlert, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SkeletonLoader from './SkeletonLoader';

const RecentActivityTimeline = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      // Fetch complaints and donations in parallel
      const complaintsPromise = api.get('/complaints');
      let donationsPromise = Promise.resolve({ data: [] });

      if (user?.role === 'admin') {
        donationsPromise = api.get('/admin/donations').catch(() => ({ data: [] }));
      } else {
        donationsPromise = api.get('/donate/history').catch(() => ({ data: [] }));
      }

      const [complaintsRes, donationsRes] = await Promise.all([complaintsPromise, donationsPromise]);

      const complaints = complaintsRes.data || [];
      const donations = donationsRes.data || [];

      // Map complaints to timeline activities
      const complaintEvents = complaints.flatMap(c => {
        const events = [];

        // 1. Created Event
        events.push({
          id: `${c._id}-created`,
          type: 'created',
          title: 'Complaint Created',
          description: `"${c.title}" reported at ${c.location.address}`,
          timestamp: new Date(c.createdAt),
          icon: Clipboard,
          iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30'
        });

        // 2. Assigned Event
        if (c.status !== 'pending' && c.assignedTo) {
          events.push({
            id: `${c._id}-assigned`,
            type: 'assigned',
            title: 'Task Assigned',
            description: `Assigned to ${c.assignedTo.name || 'Worker'} (${c.assignedType?.toUpperCase()})`,
            timestamp: new Date(c.updatedAt || c.createdAt),
            icon: Users,
            iconColor: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
          });
        }

        // 3. Completed Event
        if (c.status === 'completed' || c.status === 'verified') {
          events.push({
            id: `${c._id}-completed`,
            type: 'completed',
            title: 'Cleanup Completed',
            description: `Cleanup completed for "${c.title}"`,
            timestamp: new Date(c.updatedAt),
            icon: CheckCircle,
            iconColor: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30'
          });
        }

        // 4. Verified Event
        if (c.status === 'verified') {
          events.push({
            id: `${c._id}-verified`,
            type: 'verified',
            title: 'Complaint Verified',
            description: `Resolved & verified by Citizen`,
            timestamp: new Date(c.updatedAt),
            icon: ShieldAlert,
            iconColor: 'text-brand-600 bg-brand-50 border-brand-100 dark:bg-brand-950/20 dark:text-brand-400 dark:border-brand-900/30'
          });
        }

        return events;
      });

      // Map donations to timeline activities
      const donationEvents = donations.map(d => ({
        id: `${d._id}-donation`,
        type: 'donation',
        title: 'Donation Received',
        description: `₹${d.amount} donated by ${d.donorName || d.userId?.name || 'Anonymous donor'}`,
        timestamp: new Date(d.createdAt),
        icon: Heart,
        iconColor: 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
      }));

      // Combine and sort chronologically
      const allEvents = [...complaintEvents, ...donationEvents]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10); // Display top 10 recent activities

      setActivities(allEvents);
    } catch (error) {
      console.error('Error fetching activity log:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatActivityTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex space-x-3">
            <SkeletonLoader variant="circle" width="w-8" height="h-8" />
            <div className="flex-1 space-y-2">
              <SkeletonLoader variant="text" width="w-1/3" />
              <SkeletonLoader variant="text" width="w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-neutral-400">
        No recent activities logged in the system.
      </div>
    );
  }

  return (
    <div className="relative py-1 pl-1 pr-1">
      {activities.map((act, index) => {
        const Icon = act.icon;
        const isLast = index === activities.length - 1;
        return (
          <motion.div
            key={act.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            className="flex items-stretch gap-3"
          >
            {/* Timeline node & connector column */}
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs shrink-0 ${act.iconColor}`}>
                <Icon size={12} />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-neutral-200 dark:bg-neutral-800 my-1" />
              )}
            </div>

            {/* Event Description */}
            <div className={`flex-1 min-w-0 ${isLast ? 'pb-1' : 'pb-5'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  {act.title}
                </span>
                <span className="text-[10px] text-neutral-400 font-medium shrink-0">
                  {formatActivityTime(act.timestamp)}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                {act.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default RecentActivityTimeline;
