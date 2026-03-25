import React from 'react';
import { motion } from 'framer-motion';
import { statusBadgeVariants } from '../utils/animations';

const StatusBadge = ({ status, size = 'md' }) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '⏳'
    },
    assigned: {
      label: 'Assigned',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '👤'
    },
    'in-progress': {
      label: 'In Progress',
      className: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '🔄'
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-800 border-green-200',
      icon: '✅'
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