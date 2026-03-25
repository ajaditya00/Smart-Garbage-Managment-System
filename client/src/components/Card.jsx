import React from 'react';
import { motion } from 'framer-motion';
import { cardVariants } from '../utils/animations';

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  padding = 'p-6',
  onClick,
  ...props 
}) => {
  const baseClasses = `bg-white rounded-lg shadow-md border border-gray-200 ${padding} ${className}`;

  return (
    <motion.div
      className={`${baseClasses} ${onClick ? 'cursor-pointer' : ''}`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={hover ? "hover" : "animate"}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;