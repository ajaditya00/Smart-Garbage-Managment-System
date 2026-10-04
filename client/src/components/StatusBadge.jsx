import React from 'react';
import { motion } from 'framer-motion';
import { statusBadgeVariants } from '../utils/animations';

const StatusBadge = ({ status, size = 'md' }) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'bg-warning-light text-warning-text border-warning-border',
      icon: '⏳'
    },
    assigned: {
      label: 'Assigned',
      className: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: '👤'
    },
    'in-progress': {
      label: 'In Progress',
      className: 'bg-orange-50 text-orange-800 border-orange-200',
      icon: '🔄'
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-50 text-green-800 border-green-200',
      icon: '✅'
    },
    verified: {
      label: 'Verified',
      className: 'bg-purple-50 text-purple-800 border-purple-200',
      icon: '✨'
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-danger-light text-danger-text border-danger-border',
      icon: '❌'
    }
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <motion.span
      className={`inline-flex items-center rounded-full border font-medium ${config.className} ${sizes[size]}`}
      variants={statusBadgeVariants}
      initial="initial"
      animate="animate"
      key={status}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </motion.span>
  );
};

export default StatusBadge;