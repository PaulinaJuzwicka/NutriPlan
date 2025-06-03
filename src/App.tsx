import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MealPlanProvider } from './context/MealPlanContext';
import { ToastProvider } from './hooks/use-toast';
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
      <AuthProvider>
        <MealPlanProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </MealPlanProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;