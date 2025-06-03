import React from 'react';
import { useForm } from 'react-hook-form';
import { Activity, AlertCircle } from 'lucide-react';

interface HealthEntryFormProps {
  type: 'blood-sugar' | 'blood-pressure';
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  error?: string | null;
}

interface BloodSugarFormData {
  value: number;
  timeOfDay: string;
  relation: string;
  notes: string;
}

interface BloodPressureFormData {
  systolic: number;
  diastolic: number;
  pulse: number;
  timeOfDay: string;
  notes: string;
}

const HealthEntryForm: React.FC<HealthEntryFormProps> = ({
  type,
  onSubmit,
  isLoading = false,
  error = null,
}) => {
  const isBloodSugar = type === 'blood-sugar';
  
  const { register, handleSubmit, formState: { errors } } = useForm<
    BloodSugarFormData | BloodPressureFormData
  >();

  const timeOptions = [
    'Before breakfast',
    'After breakfast',
    'Before lunch',
    'After lunch',
    'Before dinner',
    'After dinner',
    'Before bedtime',
  ];

  const relationOptions = ['Before meal', 'After meal', 'Fasting', 'Random'];

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-white flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            {isBloodSugar ? 'Record Blood Sugar' : 'Record Blood Pressure'}
          </h3>
        </div>
      </div>

      {error && (
        <div className="m-4 p-3 rounded-md bg-red-50 border border-red-200" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-error-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-error-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form className="p-4 sm:p-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {isBloodSugar ? (
            <>
              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                  Blood Sugar Level (mg/dL)
                </label>
                <input
                  type="number"
                  id="value"
                  {...register('value', { 
                    required: 'Blood sugar value is required',
                    min: {
                      value: 20,
                      message: 'Value must be at least 20 mg/dL'
                    },
                    max: {
                      value: 600,
                      message: 'Value must be less than 600 mg/dL'
                    }
                  })}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    errors.value ? 'border-error-500' : 'border-gray-300'
                  }`}
                  placeholder="120"
                />
                {errors.value && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.value.message as string}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="relation" className="block text-sm font-medium text-gray-700">
                  Relation to Meal
                </label>
                <select
                  id="relation"
                  {...register('relation', { required: 'Please select a relation to meal' })}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    errors.relation ? 'border-error-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select relation to meal</option>
                  {relationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.relation && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.relation.message as string}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="systolic" className="block text-sm font-medium text-gray-700">
                    Systolic (mmHg)
                  </label>
                  <input
                    type="number"
                    id="systolic"
                    {...register('systolic', { 
                      required: 'Systolic value is required',
                      min: {
                        value: 70,
                        message: 'Value must be at least 70 mmHg'
                      },
                      max: {
                        value: 250,
                        message: 'Value must be less than 250 mmHg'
                      }
                    })}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                      errors.systolic ? 'border-error-500' : 'border-gray-300'
                    }`}
                    placeholder="120"
                  />
                  {errors.systolic && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.systolic.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="diastolic" className="block text-sm font-medium text-gray-700">
                    Diastolic (mmHg)
                  </label>
                  <input
                    type="number"
                    id="diastolic"
                    {...register('diastolic', { 
                      required: 'Diastolic value is required',
                      min: {
                        value: 40,
                        message: 'Value must be at least 40 mmHg'
                      },
                      max: {
                        value: 150,
                        message: 'Value must be less than 150 mmHg'
                      }
                    })}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                      errors.diastolic ? 'border-error-500' : 'border-gray-300'
                    }`}
                    placeholder="80"
                  />
                  {errors.diastolic && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.diastolic.message as string}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="pulse" className="block text-sm font-medium text-gray-700">
                  Pulse (BPM)
                </label>
                <input
                  type="number"
                  id="pulse"
                  {...register('pulse', { 
                    required: 'Pulse value is required',
                    min: {
                      value: 40,
                      message: 'Value must be at least 40 BPM'
                    },
                    max: {
                      value: 200,
                      message: 'Value must be less than 200 BPM'
                    }
                  })}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    errors.pulse ? 'border-error-500' : 'border-gray-300'
                  }`}
                  placeholder="72"
                />
                {errors.pulse && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.pulse.message as string}
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label htmlFor="timeOfDay" className="block text-sm font-medium text-gray-700">
              Time of Day
            </label>
            <select
              id="timeOfDay"
              {...register('timeOfDay', { required: 'Please select a time of day' })}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                errors.timeOfDay ? 'border-error-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select time of day</option>
              {timeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.timeOfDay && (
              <p className="mt-1 text-sm text-error-500">
                {errors.timeOfDay.message as string}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Add any relevant notes about your readings..."
            ></textarea>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HealthEntryForm;