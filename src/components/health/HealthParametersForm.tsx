import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Activity, AlertCircle } from 'lucide-react';

interface HealthParametersFormData {
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  pulse?: number;
  bloodSugar?: number;
  temperature?: number;
  notes?: string;
  measuredAt: string;
}

interface HealthParametersFormProps {
  onSubmit: (data: HealthParametersFormData) => void;
  isLoading?: boolean;
  error?: string | null;
}

const HealthParametersForm: React.FC<HealthParametersFormProps> = ({
  onSubmit,
  isLoading = false,
  error = null,
}) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<HealthParametersFormData>();

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const onSubmitForm = async (data: HealthParametersFormData) => {
    await onSubmit(data);
    reset();
    setSelectedTypes([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-white flex items-center">
            <Activity className="h-5 w-5 mr-2" /> Enter Measurements
          </h3>
        </div>
      </div>

      {error && (
        <div className="m-4 p-3 rounded-md bg-red-50 border border-red-200" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form className="p-4 sm:p-6" onSubmit={handleSubmit(onSubmitForm)}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => toggleType('blood-pressure')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedTypes.includes('blood-pressure')
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Blood Pressure
            </button>
            <button
              type="button"
              onClick={() => toggleType('pulse')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedTypes.includes('pulse')
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Pulse
            </button>
            <button
              type="button"
              onClick={() => toggleType('blood-sugar')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedTypes.includes('blood-sugar')
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Blood Sugar
            </button>
            <button
              type="button"
              onClick={() => toggleType('temperature')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedTypes.includes('temperature')
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Temperature
            </button>
          </div>

          {selectedTypes.includes('blood-pressure') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="systolic" className="block text-sm font-medium text-gray-700">
                  Systolic Pressure (mmHg)
                </label>
                <input
                  type="number"
                  id="systolic"
                  {...register('bloodPressure.systolic', { 
                    required: selectedTypes.includes('blood-pressure') ? 'Value is required' : false,
                    min: {
                      value: 70,
                      message: 'Value must be greater than 70 mmHg'
                    },
                    max: {
                      value: 250,
                      message: 'Value must be less than 250 mmHg'
                    }
                  })}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    errors.bloodPressure?.systolic ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="120"
                />
                {errors.bloodPressure?.systolic && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.bloodPressure.systolic.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="diastolic" className="block text-sm font-medium text-gray-700">
                  Diastolic Pressure (mmHg)
                </label>
                <input
                  type="number"
                  id="diastolic"
                  {...register('bloodPressure.diastolic', { 
                    required: selectedTypes.includes('blood-pressure') ? 'Value is required' : false,
                    min: {
                      value: 40,
                      message: 'Value must be greater than 40 mmHg'
                    },
                    max: {
                      value: 150,
                      message: 'Value must be less than 150 mmHg'
                    }
                  })}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    errors.bloodPressure?.diastolic ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="80"
                />
                {errors.bloodPressure?.diastolic && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.bloodPressure.diastolic.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {selectedTypes.includes('pulse') && (
            <div>
              <label htmlFor="pulse" className="block text-sm font-medium text-gray-700">
                Pulse (bpm)
              </label>
              <input
                type="number"
                id="pulse"
                {...register('pulse', { 
                  required: selectedTypes.includes('pulse') ? 'Value is required' : false,
                  min: {
                    value: 40,
                    message: 'Value must be greater than 40 bpm'
                  },
                  max: {
                    value: 200,
                    message: 'Value must be less than 200 bpm'
                  }
                })}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.pulse ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="72"
              />
              {errors.pulse && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.pulse.message}
                </p>
              )}
            </div>
          )}

          {selectedTypes.includes('blood-sugar') && (
            <div>
              <label htmlFor="bloodSugar" className="block text-sm font-medium text-gray-700">
                Blood Sugar (mg/dL)
              </label>
              <input
                type="number"
                id="bloodSugar"
                {...register('bloodSugar', { 
                  required: selectedTypes.includes('blood-sugar') ? 'Value is required' : false,
                  min: {
                    value: 20,
                    message: 'Value must be greater than 20 mg/dL'
                  },
                  max: {
                    value: 600,
                    message: 'Value must be less than 600 mg/dL'
                  }
                })}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.bloodSugar ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="100"
              />
              {errors.bloodSugar && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.bloodSugar.message}
                </p>
              )}
            </div>
          )}

          {selectedTypes.includes('temperature') && (
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
                Body Temperature (°C)
              </label>
              <input
                type="number"
                id="temperature"
                step="0.1"
                {...register('temperature', { 
                  required: selectedTypes.includes('temperature') ? 'Value is required' : false,
                  min: {
                    value: 35,
                    message: 'Value must be greater than 35°C'
                  },
                  max: {
                    value: 42,
                    message: 'Value must be less than 42°C'
                  }
                })}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.temperature ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="36.6"
              />
              {errors.temperature && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.temperature.message}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="measuredAt" className="block text-sm font-medium text-gray-700">
              Measurement Time
            </label>
            <input
              type="datetime-local"
              id="measuredAt"
              {...register('measuredAt', { required: 'Measurement time is required' })}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                errors.measuredAt ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.measuredAt && (
              <p className="mt-1 text-sm text-red-500">
                {errors.measuredAt.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              {...register('notes')}
              className="mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border-gray-300"
              placeholder="Add any additional notes or observations..."
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Measurements'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HealthParametersForm; 