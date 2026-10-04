import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants, backdropVariants } from '../utils/animations';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              variants={backdropVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              className={`inline-block w-full ${sizes[size]} p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl relative border border-neutral-200 dark:border-neutral-800`}
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                {title && (
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {title}
                  </h3>
                )}
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div>{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;