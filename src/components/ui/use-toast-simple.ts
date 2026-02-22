import { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import { Toast as ToastComponent, ToastContainer, type Toast as ToastType, type ToastOptions } from './toast';

export type { ToastType, ToastOptions };

export const TOAST_DURATION = 5000;

export function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  const removeToast = useCallback((id: string) => {
    setToasts((currentToasts) => 
      currentToasts.filter((toast) => toast.id !== id)
    );
    
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
  }, []);

  const toast = useCallback(({ 
    title, 
    description, 
    type = 'default', 
    duration = TOAST_DURATION 
  }: Omit<ToastOptions, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((currentToasts) => [
      ...currentToasts,
      { id, title, description, type, duration }
    ]);

    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, duration);
      
      timeoutsRef.current[id] = timeoutId;
    }
    
    return id;
  }, [removeToast]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  return { toasts, toast, removeToast };
}

type ToastContextType = {
  toast: (options: ToastOptions) => string;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, toast, removeToast } = useToast();
  
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer 
        toasts={toasts} 
        onDismiss={removeToast} 
      />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

// For backward compatibility
export { ToastComponent as Toast };
