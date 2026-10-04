import React from 'react';
import { HelpCircle } from 'lucide-react';
import Button from './Button';
import Card from './Card';

const EmptyState = ({ 
  icon: Icon = HelpCircle, 
  title = 'No records found', 
  description = 'There are no active records matching this view.', 
  actionLabel, 
  onAction,
  actionIcon
}) => {
  return (
    <Card className="p-8 text-center max-w-md mx-auto my-6 border border-dashed border-neutral-200 dark:border-neutral-800">
      <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 mx-auto mb-4 border border-neutral-100 dark:border-neutral-700">
        <Icon size={24} className="text-neutral-400 dark:text-neutral-500" />
      </div>
      <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-1">
        {title}
      </h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="flex justify-center">
          <Button 
            onClick={onAction} 
            icon={actionIcon}
            size="sm"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default EmptyState;
