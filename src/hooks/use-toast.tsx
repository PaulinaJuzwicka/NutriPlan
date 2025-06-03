import * as React from 'react';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

interface ToastContextType {
  toast: (props: ToastProps) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastProps, setToastProps] = React.useState<ToastProps | null>(null);
  const [show, setShow] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout>();

  const toast = React.useCallback((props: ToastProps) => {
    setToastProps(props);
    setShow(true);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      setShow(false);
    }, props.duration || 5000);
  }, []);

  const value = React.useMemo(() => ({
    toast,
  }), [toast]);

  const variantClasses = {
    default: 'bg-background text-foreground border',
    destructive: 'bg-destructive text-destructive-foreground',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {show && toastProps && (
        <div className="fixed bottom-4 right-4 z-50">
          <div 
            className={`${variantClasses[toastProps.variant || 'default']} px-4 py-3 rounded-md shadow-lg max-w-xs`}
          >
            <h4 className="font-medium">{toastProps.title}</h4>
            {toastProps.description && (
              <p className="text-sm opacity-90">{toastProps.description}</p>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default useToast;
