import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Layout from '../components/layout/Layout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Medications from '../pages/Medications';
import HealthPage from '../pages/HealthPage';
import Settings from '../pages/Settings';
import DietPlannerPage from '../pages/DietPlannerPage';
import CreateDietPlanPage from '../pages/CreateDietPlanPage';


const LoadingSpinner = () => <div className="flex items-center justify-center min-h-screen">Loading...</div>;

const NotFoundPage = () => <div className="p-8">404 - Page Not Found</div>;
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

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
      
      {}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Dashboard />} />
        <Route path="/medications" element={<Medications />} />
        <Route path="/health" element={<HealthPage />} />
        
        {}
        <Route path="/diet-planner" element={<DietPlannerPage />} />
        
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;