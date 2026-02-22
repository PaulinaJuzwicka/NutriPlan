import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export interface Toast extends ToastOptions {
  id: string;
}

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  toast: Toast;
  onDismiss: (id: string) => void;
  className?: string;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ toast, onDismiss, className, ...props }, ref) => {
    const typeStyles = {
      default: 'bg-white border border-gray-200',
      success: 'bg-green-50 border border-green-200',
      error: 'bg-red-50 border border-red-200',
      warning: 'bg-yellow-50 border border-yellow-200',
      info: 'bg-blue-50 border border-blue-200',
    };

    
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-start p-4 rounded-md shadow-md min-w-[300px] max-w-md mb-2 transition-all duration-300',
          typeStyles[toast.type || 'default'],
          className
        )}
        role="alert"
        {...props}
      >
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {toast.title}
          </h3>
          {toast.description && (
            <p className="mt-1 text-sm text-gray-600">
              {toast.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    );
  }
);
Toast.displayName = 'Toast';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  className?: string;
}

const ToastContainer = React.forwardRef<HTMLDivElement, ToastContainerProps>(
  ({ toasts, onDismiss, className, ...props }, ref) => {
    if (toasts.length === 0) return null;

    return (
      <div 
        ref={ref}
        className={cn('fixed bottom-4 right-4 z-50 space-y-2', className)}
        {...props}
      >
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            toast={toast} 
            onDismiss={onDismiss} 
          />
        ))}
      </div>
    );
  }
);
ToastContainer.displayName = 'ToastContainer';

export { Toast, ToastContainer };

export type { ToastProps, ToastContainerProps };
