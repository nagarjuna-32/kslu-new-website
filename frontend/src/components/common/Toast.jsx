import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export const Toast = () => {
  const { toast, setToast } = useNotification();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'APPROVAL':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'REJECTION':
        return <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-gold-500 shrink-0" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 shadow-2xl rounded-xl p-4 flex items-start gap-3"
      >
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy-900 dark:text-navy-100">{toast.title}</p>
          <p className="text-xs text-navy-600 dark:text-navy-300 mt-1 line-clamp-2">{toast.message}</p>
        </div>
        <button
          onClick={() => setToast(null)}
          className="text-navy-400 hover:text-navy-700 dark:hover:text-navy-200 p-1 rounded-lg"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
