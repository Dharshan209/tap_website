import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

// Toast context
const ToastContext = createContext({
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
  promise: () => {},
});

// Toast types and their styles
const toastTypes = {
  success: {
    bgColor: 'bg-success/10',
    borderColor: 'border-success',
    textColor: 'text-success',
    icon: <CheckCircle className="h-5 w-5" />,
  },
  error: {
    bgColor: 'bg-danger/10',
    borderColor: 'border-danger',
    textColor: 'text-danger',
    icon: <XCircle className="h-5 w-5" />,
  },
  warning: {
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning',
    textColor: 'text-warning',
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  info: {
    bgColor: 'bg-info/10',
    borderColor: 'border-info',
    textColor: 'text-info',
    icon: <Info className="h-5 w-5" />,
  },
};

// Component for individual toast
const Toast = ({ id, message, type = 'info', duration = 5000, onRemove }) => {
  const { bgColor, borderColor, textColor, icon } = toastTypes[type] || toastTypes.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  return (
    <motion.div
      key={id}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'relative flex items-start gap-2 py-3 pl-4 pr-8 shadow-md rounded-lg border-l-[4px]',
        'max-w-md w-full',
        bgColor,
        borderColor,
      )}
    >
      <div className={cn('flex-shrink-0', textColor)}>{icon}</div>
      
      <div className="flex-1 mr-2">
        <p className="text-foreground text-sm font-medium">{message}</p>
      </div>
      
      <button 
        onClick={() => onRemove(id)} 
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close toast"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

// Toast container
export const ToastContainer = () => {
  const { toasts } = useToastContext();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Toast provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type, duration = 5000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message, duration) => addToast(message, 'success', duration);
  const error = (message, duration) => addToast(message, 'error', duration);
  const warning = (message, duration) => addToast(message, 'warning', duration);
  const info = (message, duration) => addToast(message, 'info', duration);

  const promise = (
    promiseFn,
    {
      loading = 'Processing...',
      success = 'Completed successfully!',
      error = 'An error occurred',
    } = {},
    duration
  ) => {
    const toastId = addToast(loading, 'info', 0); // No auto-dismiss for pending toast

    promiseFn
      .then(() => {
        removeToast(toastId);
        success && addToast(success, 'success', duration);
      })
      .catch((err) => {
        removeToast(toastId);
        error && addToast(typeof error === 'function' ? error(err) : error, 'error', duration);
      });

    return toastId;
  };

  return (
    <ToastContext.Provider value={{ toasts, removeToast, success, error, warning, info, promise }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

// Simple toast export for direct imports
export const toast = {
  success: (message, duration) => {
    try {
      const { success } = useToastContext();
      return success(message, duration);
    } catch (error) {
      console.warn('Toast used outside of ToastProvider, message:', message);
      return null;
    }
  },
  error: (message, duration) => {
    try {
      const { error } = useToastContext();
      return error(message, duration);
    } catch (error) {
      console.warn('Toast used outside of ToastProvider, message:', message);
      return null;
    }
  },
  warning: (message, duration) => {
    try {
      const { warning } = useToastContext();
      return warning(message, duration);
    } catch (error) {
      console.warn('Toast used outside of ToastProvider, message:', message);
      return null;
    }
  },
  info: (message, duration) => {
    try {
      const { info } = useToastContext();
      return info(message, duration);
    } catch (error) {
      console.warn('Toast used outside of ToastProvider, message:', message);
      return null;
    }
  },
  promise: (promiseFn, options, duration) => {
    try {
      const { promise } = useToastContext();
      return promise(promiseFn, options, duration);
    } catch (error) {
      console.warn('Toast used outside of ToastProvider, promise:', promiseFn);
      return null;
    }
  },
};