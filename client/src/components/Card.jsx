import React from 'react';
import { motion } from 'framer-motion';
import { cardVariants } from '../utils/animations';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'p-6',
  delay = 0,
  onClick,
  ...props 
}) => {
  const isClickable = !!onClick;
  const shouldHover = hover || isClickable;
  const baseClasses = `bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs transition-colors duration-150 ${padding} ${className}`;

  return (
    <motion.div
      className={`${baseClasses} ${isClickable ? 'cursor-pointer' : ''}`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={shouldHover ? "hover" : "animate"}
      transition={{ delay }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;