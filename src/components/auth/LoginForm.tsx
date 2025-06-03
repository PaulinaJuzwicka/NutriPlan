import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, clearError, isAuthenticated, isInitializing } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isInitializing) {
      console.log('User is authenticated, navigating to home page...');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      clearError();
      console.log('Attempting login...');
      await login(data.email, data.password);
      console.log('Login successful, should redirect...');
    } catch (error) {
      console.error('Login error:', error);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const showLoading = isInitializing || isSubmitting;

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-card">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Log in to continue
        </p>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-error-500 bg-red-100 rounded-lg flex items-center" role="alert">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
          <button className="ml-auto text-red-500 hover:text-red-700" onClick={clearError}>
            &times;
          </button>
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.email ? 'border-error-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                placeholder="your@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-error-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                {...register('password', { required: 'Password is required' })}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.password ? 'border-error-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-error-500">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={showLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
              showLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {showLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : 'Log in'}
          </button>
        </div>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;