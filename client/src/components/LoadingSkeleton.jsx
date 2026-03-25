import React from 'react';

const LoadingSkeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`loading-skeleton ${className}`}>
          &nbsp;
        </div>
      ))}
    </>
  );
};

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card p-6 space-y-4">
          <LoadingSkeleton className="h-4 w-3/4" />
          <LoadingSkeleton className="h-3 w-full" />
          <LoadingSkeleton className="h-3 w-2/3" />
          <div className="flex space-x-2">
            <LoadingSkeleton className="h-8 w-20" />
            <LoadingSkeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <LoadingSkeleton
              key={colIndex}
              className="h-4 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;