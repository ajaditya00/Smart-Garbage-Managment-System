import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const StatsCounter = ({ end, duration = 2, suffix = '', prefix = '', color = 'text-primary-600' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const currentCount = Math.floor(progress * end);
      
      setCount(currentCount);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-2xl font-bold ${color}`}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  );
};

export default StatsCounter;