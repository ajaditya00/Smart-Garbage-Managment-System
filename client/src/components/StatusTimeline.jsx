import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const StatusTimeline = ({ status }) => {
  const statuses = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'assigned', label: 'Assigned', icon: AlertCircle },
    { key: 'in-progress', label: 'In Progress', icon: AlertCircle },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
    { key: 'verified', label: 'Verified', icon: CheckCircle }
  ];

  const currentIndex = statuses.findIndex(s => s.key === status);

  return (
    <div className="flex items-start justify-between w-full overflow-x-auto pb-4 pt-2">
      {statuses.map((item, index) => {
        const Icon = item.icon;
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <React.Fragment key={item.key}>
            {/* Step Node */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center space-y-2 text-center min-w-[5rem]"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                } ${isCurrent ? 'ring-4 ring-brand-100' : ''}`}
              >
                <Icon size={18} />
              </div>
              <span
                className={`text-xs font-semibold ${
                  isActive ? 'text-brand-600' : 'text-neutral-400'
                }`}
              >
                {item.label}
              </span>
            </motion.div>

            {/* Sibling Connector Line */}
            {index < statuses.length - 1 && (
              <div className="flex-1 h-0.5 bg-neutral-200 self-start mt-5 mx-2 min-w-[1.5rem] max-w-[8rem] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: index < currentIndex ? '100%' : '0%' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full bg-brand-500"
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StatusTimeline;