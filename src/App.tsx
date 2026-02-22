import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContextOptimized';
import { UserDataProvider } from './context/UserDataContext';
import { ToastProvider } from './hooks/use-toast';
import { AppStateManager } from './components/AppStateManager';
import { Toaster } from 'sonner';
import AppRoutes from './routes';

const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
} as const;

function App() {
  return (
    <BrowserRouter {...routerConfig}>
      <AppStateManager>
        <AuthProvider>
          <UserDataProvider>
            <ToastProvider>
              <AppRoutes />
              <Toaster />
            </ToastProvider>
          </UserDataProvider>
        </AuthProvider>
      </AppStateManager>
    </BrowserRouter>
  );
}

export default App;
