import React from 'react';
import { FileQuestion } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FileQuestion,
  title = 'No resources found',
  description = 'Try adjusting your search criteria or filters to find what you are looking for.',
  action = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-navy-900/60 rounded-2xl border border-dashed border-navy-300 dark:border-navy-800 my-6">
      <div className="w-16 h-16 rounded-2xl bg-navy-100 dark:bg-navy-800/80 flex items-center justify-center text-navy-600 dark:text-navy-300 mb-4 shadow-inner">
        <Icon className="w-8 h-8 text-gold-600 dark:text-gold-400" />
      </div>
      <h3 className="text-lg font-semibold text-navy-900 dark:text-navy-100 mb-2">{title}</h3>
      <p className="text-sm text-navy-600 dark:text-navy-400 max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
