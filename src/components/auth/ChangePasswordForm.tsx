import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextOptimized';

type ChangePasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ChangePasswordForm: React.FC = () => {
  const { changePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<ChangePasswordFormData>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Hasła nie są identyczne',
      });
      return;
    }

    try {
      setIsLoading(true);
      await changePassword(data.currentPassword, data.newPassword);

      setSuccessMessage('Hasło zostało pomyślnie zmienione');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error: unknown) {
      setError('root', {
        type: 'manual',
        message: (error as { message?: string }).message || 'Wystąpił błąd podczas zmiany hasła',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {errors.root && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-700">{errors.root.message}</div>
            </div>
          )}

          {successMessage && (
            <div className="rounded-md bg-green-50 p-4 mb-4">
              <div className="text-sm text-green-700">{successMessage}</div>
            </div>
          )}

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Aktualne hasło
            </label>
            <div className="mt-1">
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                className={`appearance-none block w-full px-3 py-2 border ${
                  errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                {...register('currentPassword', {
                  required: 'To pole jest wymagane',
                })}
              />
              {errors.currentPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              Nowe hasło
            </label>
            <div className="mt-1">
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                className={`appearance-none block w-full px-3 py-2 border ${
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                {...register('newPassword', {
                  required: 'To pole jest wymagane',
                  minLength: {
                    value: 6,
                    message: 'Hasło musi mieć co najmniej 6 znaków',
                  },
                })}
              />
              {errors.newPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Potwierdź nowe hasło
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`appearance-none block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                {...register('confirmPassword', {
                  required: 'To pole jest wymagane',
                  validate: (value) => value === newPassword || 'Hasła nie są identyczne',
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Zmienianie hasła...' : 'Zmień hasło'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
