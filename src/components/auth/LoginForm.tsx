import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContextOptimized';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm = () => {
  const navigate = useNavigate();
  const { state, login, clearError } = useAuth();
  const { error, isAuthenticated } = state;
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = useCallback(async (data: LoginFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      clearError();
      await login(data.email, data.password);
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, clearError, login]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const showLoading = isSubmitting;

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-card">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Witaj ponownie</h2>
        <p className="mt-2 text-sm text-gray-600">
          Zaloguj się, aby kontynuować
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
              Adres e-mail
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', { 
                  required: 'Adres e-mail jest wymagany',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Nieprawidłowy adres e-mail'
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
              Hasło
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password', { required: 'Hasło jest wymagane' })}
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
              Zapamiętaj mnie
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
                Logowanie...
              </>
            ) : 'Zaloguj się'}
          </button>
        </div>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Nie masz konta?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
          Zarejestruj się
        </Link>
      </p>
    </div>
);
};

export default React.memo(LoginForm);
