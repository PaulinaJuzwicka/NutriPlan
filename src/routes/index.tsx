import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextOptimized';

import Layout from '../components/layout/Layout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Medications from '../pages/Medications';
import DietPlansListPage from '../pages/DietPlansListPage';
import CreateDietPlanPage from '../pages/CreateDietPlanPage';
import CreateDietPlanFormSimple from '../components/diet/CreateDietPlanFormSimple';
import EmailVerification from '../pages/EmailVerification';
import HealthPage from '../pages/HealthPage';

// Import pages directly to avoid lazy loading issues
import RecipesPage from '../pages/RecipesPage';
import RecipeDetailPage from '../pages/RecipeDetailPage';
import NewRecipePage from '../pages/NewRecipePageSimple';
import AddMedicationPage from '../pages/AddMedicationPage';
import DietPlanDetailPage from '../pages/DietPlanDetailPage';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">Loading...</div>
);

const NotFoundPage = () => <div className="p-8">404 - Page Not Found</div>;

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  const { isAuthenticated, isLoading } = state;

  useEffect(() => {
  }, [isAuthenticated, isLoading]);

  // Show loading only during initial load
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/email-verification" element={<EmailVerification />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/medications" element={<Medications />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/diet-plan/:id" element={<Navigate to="/diet-plans" replace />} />
        
        {/* Trasy dla przepisów */}
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        <Route path="/recipes/new" element={<NewRecipePage />} />
        
        {/* Trasy dla planów dietetycznych */}
        <Route path="/diet-plans" element={<DietPlansListPage />} />
        <Route path="/diet-plans/new" element={<CreateDietPlanPage />} />
        <Route path="/diet-plans/edit/:id" element={<CreateDietPlanPage />} />
        <Route path="/diet-plans/:id" element={<DietPlanDetailPage />} />
        
        {/* Trasy dla leków */}
        <Route path="/add-medication" element={<AddMedicationPage />} />
        
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
