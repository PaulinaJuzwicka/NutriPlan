import React from 'react';
import { Navigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">NutriPlan</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create an account to start your personalized health journey
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm />
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} NutriPlan. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;