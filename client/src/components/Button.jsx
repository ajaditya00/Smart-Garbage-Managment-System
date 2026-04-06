import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { buttonVariants } from '../utils/animations';
import LoadingSpinner from './LoadingSpinner';
import { Link } from 'react-router-dom';

const MotionLink = motion(Link);

const Button = forwardRef(({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  className = '',
  as,
  to,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-500',
    ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const isDisabled = disabled || loading;
  const isLink = !!to;
  const Component = isLink ? MotionLink : motion.button;

  return (
    <Component
      ref={ref}
      to={to}
      type={!isLink ? type : undefined}
      onClick={onClick}
      disabled={!isLink ? isDisabled : undefined}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
      } ${className}`}
      variants={!isDisabled ? buttonVariants : {}}
      initial="idle"
      whileHover={!isDisabled ? "hover" : "idle"}
      whileTap={!isDisabled ? "tap" : "idle"}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" text="" />
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </Component>
  );
});

export default Button;