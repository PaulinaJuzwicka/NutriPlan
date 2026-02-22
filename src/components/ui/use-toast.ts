import * as React from 'react';

type ToastType = 'default' | 'destructive' | 'success';

type Toast = {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
};

type ToastOptions = {
  id?: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
};

const ToastContext = React.createContext<{
  toasts: Toast[];
  addToast: (toast: ToastOptions) => void;
  removeToast: (id: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = React.useCallback(
    (toast: ToastOptions) => {
      const toastId = toast.id || Math.random().toString(36).substr(2, 9);
      const newToast: Toast = {
        id: toastId,
        title: toast.title,
        description: toast.description,
        type: toast.type || 'default',
        duration: toast.duration || 5000,
      };

      setToasts((currentToasts) => [...currentToasts, newToast]);

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          removeToast(toastId);
        }, newToast.duration);
      }

      return toastId;
    }, [removeToast]);

  const value = React.useMemo(() => ({
    toasts,
    addToast,
    removeToast,
  }), [toasts, addToast, removeToast]);

  return React.createElement(
    ToastContext.Provider,
    { value },
    children,
    React.createElement(ToastContainer, { toasts })
  );
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  const context = React.useContext(ToastContext);
  
  return React.createElement(
    'div',
    { className: 'fixed top-4 right-4 z-50 space-y-2' },
    toasts.map((toast) =>
      React.createElement(
        'div',
        {
          key: toast.id,
          className: `p-4 rounded-lg shadow-lg border max-w-sm ${
            toast.type === 'destructive'
              ? 'bg-red-50 border-red-200 text-red-800'
              : toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-gray-50 border-gray-200 text-gray-800'
          }`,
        },
        React.createElement(
          'div',
          { className: 'flex justify-between items-start' },
          React.createElement(
            'div',
            { className: 'flex-1' },
            React.createElement('h3', { className: 'font-medium' }, toast.title),
            toast.description &&
              React.createElement(
                'p',
                { className: 'text-sm mt-1 opacity-90' },
                toast.description
              )
          ),
          React.createElement(
            'button',
            {
              onClick: () => context?.removeToast(toast.id),
              className: 'ml-4 text-gray-400 hover:text-gray-600',
            },
            '×'
          )
        )
      )
    )
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
