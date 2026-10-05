import React from 'react';
import { motion } from 'framer-motion';
import { Clock, UserCheck, RefreshCw, CheckCircle2, Sparkles, XCircle } from 'lucide-react';
import { statusBadgeVariants } from '../utils/animations';

const StatusBadge = ({ status, size = 'md' }) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      icon: Clock
    },
    assigned: {
      label: 'Assigned',
      className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      icon: UserCheck
    },
    'in-progress': {
      label: 'In Progress',
      className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
      icon: RefreshCw
    },
    completed: {
      label: 'Completed',
      className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      icon: CheckCircle2
    },
    verified: {
      label: 'Verified',
      className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
      icon: Sparkles
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
      icon: XCircle
    }
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-0.5 text-[11px] gap-1 font-semibold',
    md: 'px-3 py-1 text-xs gap-1.5 font-semibold',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-semibold'
  };

  const iconSizes = {
    xs: 10,
    sm: 11,
    md: 12,
    lg: 14
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <motion.span
      className={`inline-flex items-center rounded-full border whitespace-nowrap select-none ${config.className} ${sizes[size] || sizes.md}`}
      variants={statusBadgeVariants}
      initial="initial"
      animate="animate"
      key={status}
    >
      <Icon size={iconSizes[size] || 12} className="shrink-0" />
      <span>{config.label}</span>
    </motion.span>
  );
};

export default StatusBadge;