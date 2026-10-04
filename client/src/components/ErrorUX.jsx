import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';
import Card from './Card';

const ErrorUX = ({ 
  title = 'Something went wrong', 
  message = 'An unexpected error occurred while loading this section. Please check your internet connection and try again.', 
  onRetry 
}) => {
  return (
    <Card className="border border-danger-border/30 bg-danger-light/10 dark:bg-rose-950/5 p-6 max-w-lg mx-auto my-6 text-center">
      <div className="w-10 h-10 bg-danger-light dark:bg-rose-950/20 rounded-full flex items-center justify-center text-danger-solid mx-auto mb-3 border border-danger-border">
        <AlertCircle size={20} />
      </div>
      <h3 className="text-sm font-bold text-danger-solid mb-1">
        {title}
      </h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 leading-relaxed max-w-sm mx-auto">
        {message}
      </p>
      {onRetry && (
        <div className="flex justify-center">
          <Button 
            onClick={onRetry} 
            variant="outline"
            className="border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            icon={<RefreshCw size={12} className="animate-spin-slow" />}
          >
            Retry Request
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ErrorUX;
