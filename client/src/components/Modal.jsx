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
              className="fixed inset-0 bg-black bg-opacity-50"
              variants={backdropVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              className={`inline-block w-full ${sizes[size]} p-6 my-8 overflow-hidden text-left align-middle bg-white shadow-xl rounded-2xl relative`}
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                {title && (
                  <h3 className="text-lg font-medium text-gray-900">
                    {title}
                  </h3>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
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