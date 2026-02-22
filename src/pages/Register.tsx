import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../context/AuthContextOptimized';

const Register = () => {
  const { state } = useAuth();
  const { isAuthenticated, isLoading } = state;
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary-600 flex items-center justify-center">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">NutriPlan</h2>
        <p className="mt-1 sm:mt-2 text-center text-sm text-gray-600">
          Utwórz konto, aby rozpocząć swoją spersonalizowaną podróż zdrowotną
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm
          onSuccess={() => navigate('/dashboard')}
          onSwitchToLogin={() => navigate('/login')}
        />
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} NutriPlan. Wszelkie prawa zastrzeżone.
        </p>
      </div>
    </div>
  );
};

export default React.memo(Register);
