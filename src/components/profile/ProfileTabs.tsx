import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  User as UserIcon, 
  Lock, 
  Save, 
  X, 
  Edit, 
  Loader2, 
  Heart, 
  Activity, 
  Settings, 
  Bell, 
  Sun, 
  Moon, 
  Clock, 
  Calendar, 
  Target, 
  Scale, 
  Droplet 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordForm from '../auth/ChangePasswordForm';
import { User, UserProfile } from '../../types';

interface ProfileFormData {
  name: string;
  email: string;
  dietaryRestrictions: string[];
  healthConditions: string[];
  healthMetrics?: {
    weight?: number;
    height?: number;
    bloodPressure?: string;
    bloodSugar?: number;
  };
  preferences?: {
    cuisine?: string[];
    mealTypes?: string[];
    cookingTime?: number;
    notifications?: boolean;
    theme?: 'light' | 'dark' | 'system';
  };
  goals?: {
    weightLoss?: boolean;
    muscleGain?: boolean;
    healthyEating?: boolean;
    targetWeight?: number;
    dailyCalories?: number;
  };
}

const dietaryOptions = [
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Dairy-free',
  'Ketogenic',
  'Low-carb',
  'Low-fat',
  'Halal',
  'Kosher',
];

const healthConditionOptions = [
  'Diabetes',
  'Hypertension',
  'High cholesterol',
  'Heart disease',
  'PCOS',
  'Thyroid',
  'IBS',
  'IBD',
  'GERD',
  'Other',
];

const ProfileTabs: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  const cuisineOptions = [
    'Italian', 'Mexican', 'Asian', 'Indian', 'Mediterranean', 'Japanese', 'Vegetarian'
  ];
  
  const mealTypeOptions = [
    'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer', 'Side dish', 'Drink'
  ];
  
  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  const getDefaultValues = useCallback((): ProfileFormData => ({
    name: user?.name || '',
    email: user?.email || '',
    dietaryRestrictions: user?.dietaryRestrictions || [],
    healthConditions: user?.healthConditions || [],
    healthMetrics: {
      weight: user?.healthMetrics?.weight,
      height: user?.healthMetrics?.height,
      bloodPressure: user?.healthMetrics?.bloodPressure,
      bloodSugar: user?.healthMetrics?.bloodSugar,
    },
    preferences: {
      cuisine: user?.preferences?.cuisine || [],
      mealTypes: user?.preferences?.mealTypes || [],
      cookingTime: user?.preferences?.cookingTime,
      notifications: user?.preferences?.notifications ?? true,
      theme: user?.preferences?.theme || 'system',
    },
    goals: {
      weightLoss: user?.goals?.weightLoss ?? false,
      muscleGain: user?.goals?.muscleGain ?? false,
      healthyEating: user?.goals?.healthyEating ?? true,
      targetWeight: user?.goals?.targetWeight,
      dailyCalories: user?.goals?.dailyCalories,
    },
  }), [user]);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm<ProfileFormData>({
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    resetForm(getDefaultValues());
  }, [user, resetForm, getDefaultValues]);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        dietaryRestrictions: user.dietaryRestrictions || [],
        healthConditions: user.healthConditions || [],
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!isEditing) return;
    
    try {
      setIsLoading(true);
      setUpdateError(null);
      const updateData: Partial<UserProfile> = {
        name: data.name,
        dietaryRestrictions: data.dietaryRestrictions,
        healthConditions: data.healthConditions,
        healthMetrics: data.healthMetrics,
        preferences: data.preferences,
        goals: data.goals,
      };

      await updateProfile(updateData);

      setUpdateSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setUpdateSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while updating the profile'
      );
      setTimeout(() => setUpdateError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {isEditing 
                    ? 'Update your personal information and preferences.'
                    : 'Manage your personal information and preferences.'
                  }
                </p>
              </div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      reset();
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    disabled={!isDirty || isLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="mr-1 h-3 w-3" />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {updateSuccess && (
              <div className="mb-6 p-3 bg-green-50 border-l-4 border-green-400 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{updateSuccess}</p>
                  </div>
                </div>
              </div>
            )}

            {updateError && (
              <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-400 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{updateError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-base font-medium text-gray-900">Basic Information</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="name"
                          disabled={!isEditing}
                          {...register('name', { required: 'This field is required' })}
                          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.name
                              ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                          } ${!isEditing ? 'bg-gray-50' : ''}`}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          id="email"
                          disabled
                          value={user?.email || ''}
                          className="mt-1 block w-full rounded-md bg-gray-50 border-gray-300 shadow-sm sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          To change your email address, please contact customer support.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-base font-medium text-gray-900">Dietary Preferences</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select your dietary preferences and restrictions to customize meal recommendations.
                  </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Dietary Restrictions</h4>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {dietaryOptions.map((option) => (
                          <div key={option} className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id={`dietary-${option}`}
                                type="checkbox"
                                value={option}
                                disabled={!isEditing}
                                {...register('dietaryRestrictions')}
                                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor={`dietary-${option}`} className="font-medium text-gray-700">
                                {option}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Health Conditions</h4>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {healthConditionOptions.map((option) => (
                          <div key={option} className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id={`health-${option}`}
                                type="checkbox"
                                value={option}
                                disabled={!isEditing}
                                {...register('healthConditions')}
                                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor={`health-${option}`} className="font-medium text-gray-700">
                                {option}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'password':
        return (
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
              <p className="mt-1 text-sm text-gray-500">Change your password to a new, secure password.</p>
            </div>
            <ChangePasswordForm />
          </div>
        );
      default:
        return null;
    }
  };

  const FormField = React.forwardRef<HTMLDivElement, {
    label: string;
    name: string;
    children: React.ReactNode;
    error?: any;
    className?: string;
  }>(({ label, name, children, error, className = '' }, ref) => (
    <div ref={ref} className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className={error ? 'mt-1 relative rounded-md shadow-sm' : 'mt-1'}>
        {children}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {typeof error === 'object' ? error.message : error}
        </p>
      )}
    </div>
  ));

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile', icon: <UserIcon className="mr-2 h-4 w-4" /> },
            { id: 'health', label: 'Health', icon: <Activity className="mr-2 h-4 w-4" /> },
            { id: 'preferences', label: 'Preferences', icon: <Heart className="mr-2 h-4 w-4" /> },
            { id: 'goals', label: 'Goals', icon: <Target className="mr-2 h-4 w-4" /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell className="mr-2 h-4 w-4" /> },
            { id: 'password', label: 'Security', icon: <Lock className="mr-2 h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-6 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                {tab.icon}
                {tab.label}
              </div>
            </button>
          ))}
        </nav>
      </div>
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfileTabs;
