import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ 
  variant = 'card', 
  count = 1, 
  className = '' 
}) => {
  const variants = {
    card: (
      <div className={`bg-white rounded-xl border border-neutral-200 p-6 space-y-4 shadow-sm ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 shimmer"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-neutral-100 rounded w-1/3 shimmer"></div>
            <div className="h-3 bg-neutral-100 rounded w-1/4 shimmer"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-neutral-100 rounded w-full shimmer"></div>
          <div className="h-3 bg-neutral-100 rounded w-5/6 shimmer"></div>
        </div>
      </div>
    ),
    text: (
      <div className={`space-y-2.5 ${className}`}>
        <div className="h-4 bg-neutral-100 rounded w-3/4 shimmer"></div>
        <div className="h-3.5 bg-neutral-100 rounded w-1/2 shimmer"></div>
        <div className="h-3.5 bg-neutral-100 rounded w-5/6 shimmer"></div>
      </div>
    ),
    avatar: (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="rounded-full bg-neutral-100 h-12 w-12 shimmer"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-100 rounded w-3/4 shimmer"></div>
          <div className="h-3.5 bg-neutral-100 rounded w-1/2 shimmer"></div>
        </div>
      </div>
    ),
    table: (
      <div className={`space-y-3.5 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-4 py-3.5 border-b border-neutral-200 items-center">
            <div className="h-4 bg-neutral-100 rounded flex-1 shimmer"></div>
            <div className="h-4 bg-neutral-100 rounded w-24 shimmer"></div>
            <div className="h-4 bg-neutral-100 rounded w-20 shimmer"></div>
          </div>
        ))}
      </div>
    )
  };

  const skeletonElements = Array.from({ length: count }, (_, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      {variants[variant]}
    </motion.div>
  ));

  return count === 1 ? skeletonElements[0] : <div className="space-y-4">{skeletonElements}</div>;
};

export default SkeletonLoader;