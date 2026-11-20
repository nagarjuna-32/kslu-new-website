import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl p-5 shadow-sm animate-pulse space-y-4">
    <div className="flex justify-between items-start">
      <div className="h-4 bg-navy-200 dark:bg-navy-800 rounded w-1/4"></div>
      <div className="h-6 bg-navy-200 dark:bg-navy-800 rounded-full w-20"></div>
    </div>
    <div className="h-5 bg-navy-200 dark:bg-navy-800 rounded w-3/4"></div>
    <div className="h-4 bg-navy-200 dark:bg-navy-800 rounded w-1/2"></div>
    <div className="pt-4 border-t border-navy-100 dark:border-navy-800 flex justify-between items-center">
      <div className="h-4 bg-navy-200 dark:bg-navy-800 rounded w-1/3"></div>
      <div className="h-8 bg-navy-200 dark:bg-navy-800 rounded-lg w-24"></div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white dark:bg-navy-900 rounded-xl border border-navy-200 dark:border-navy-800 p-4 space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-10 bg-navy-100 dark:bg-navy-800 rounded-lg w-full"></div>
    ))}
  </div>
);
