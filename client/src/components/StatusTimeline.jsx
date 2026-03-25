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
    <div className="flex items-center space-x-4 overflow-x-auto pb-4">
      {statuses.map((item, index) => {
        const Icon = item.icon;
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center space-y-2 min-w-max"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              } ${isCurrent ? 'ring-4 ring-primary-100' : ''}`}
            >
              <Icon size={20} />
            </div>
            <span
              className={`text-sm font-medium ${
                isActive ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              {item.label}
            </span>
            {index < statuses.length - 1 && (
              <div
                className={`w-20 h-0.5 transition-colors duration-300 ${
                  index < currentIndex ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;