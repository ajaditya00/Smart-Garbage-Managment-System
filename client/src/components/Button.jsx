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
  const baseClasses = 'inline-flex items-center justify-center font-bold rounded-xl transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none whitespace-nowrap';

  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-xs focus-visible:ring-brand-500/40 dark:focus-visible:ring-offset-neutral-900',
    secondary: 'border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/80 text-neutral-700 dark:text-neutral-200 focus-visible:ring-neutral-400/40 dark:focus-visible:ring-offset-neutral-900 shadow-xs',
    outline: 'border border-brand-500 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 bg-transparent focus-visible:ring-brand-500/30 dark:focus-visible:ring-offset-neutral-900',
    ghost: 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 bg-transparent focus-visible:ring-neutral-300',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white focus-visible:ring-rose-500/30 dark:focus-visible:ring-offset-neutral-900 shadow-xs'
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-xl gap-2',
    xl: 'px-8 py-4 text-lg rounded-2xl gap-2.5'
  };

  const isDisabled = disabled || loading;
  const isLink = !!to;
  const Component = isLink ? MotionLink : motion.button;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <Component
      ref={ref}
      to={to}
      type={!isLink ? type : undefined}
      onClick={onClick}
      disabled={!isLink ? isDisabled : undefined}
      className={`${baseClasses} ${variants[variant]} ${sizeClass} ${
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
          {icon && <span className="shrink-0 flex items-center">{icon}</span>}
          {children}
        </>
      )}
    </Component>
  );
});

export default Button;