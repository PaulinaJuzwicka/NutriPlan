import React from 'react';
import { useForm } from 'react-hook-form';
import { Activity, AlertCircle } from 'lucide-react';

interface HealthEntryFormProps {
  type: 'blood-sugar' | 'blood-pressure';
  onSubmit: (data: unknown) => void;
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

type FormErrors = {
  value?: { message: string };
  relation?: { message: string };
  systolic?: { message: string };
  diastolic?: { message: string };
  pulse?: { message: string };
  timeOfDay?: { message: string };
  notes?: { message: string };
};

const HealthEntryForm: React.FC<HealthEntryFormProps> = ({
  type,
  onSubmit,
  isLoading = false,
  error = null,
}) => {
  const isBloodSugar = type === 'blood-sugar';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BloodSugarFormData | BloodPressureFormData>();

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
                  Poziom cukru we krwi (mg/dL)
                </label>
                <input
                  type="number"
                  id="value"
                  {...register('value', {
                    required: 'Wartość cukru we krwi jest wymagana',
                    min: {
                      value: 20,
                      message: 'Wartość musi wynosić co najmniej 20 mg/dL',
                    },
                    max: {
                      value: 600,
                      message: 'Wartość musi być mniejsza niż 600 mg/dL',
                    },
                  })}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    (errors as FormErrors).value ? 'border-error-500' : 'border-gray-300'
                  }`}
                  placeholder="120"
                />
                {(errors as FormErrors).value && (
                  <p className="mt-1 text-sm text-error-500">{(errors as FormErrors).value?.message as string}</p>
                )}
              </div>

              <div>
                <label htmlFor="relation" className="block text-sm font-medium text-gray-700">
                  Związek z posiłkiem
                </label>
                <select
                  id="relation"
                  {...register('relation', { required: 'Wybierz związek z posiłkiem' })}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    (errors as FormErrors).relation ? 'border-error-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Wybierz związek z posiłkiem</option>
                  {relationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {(errors as FormErrors).relation && (
                  <p className="mt-1 text-sm text-error-500">{(errors as FormErrors).relation?.message as string}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="systolic" className="block text-sm font-medium text-gray-700">
                    Skurczowe (mmHg)
                  </label>
                  <input
                    type="number"
                    id="systolic"
                    {...register('systolic', {
                      required: 'Wartość skurczowa jest wymagana',
                      min: {
                        value: 70,
                        message: 'Wartość musi wynosić co najmniej 70 mmHg',
                      },
                      max: {
                        value: 250,
                        message: 'Wartość musi być mniejsza niż 250 mmHg',
                      },
                    })}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                      (errors as FormErrors).systolic ? 'border-error-500' : 'border-gray-300'
                    }`}
                    placeholder="120"
                  />
                  {(errors as FormErrors).systolic && (
                    <p className="mt-1 text-sm text-error-500">
                      {(errors as FormErrors).systolic?.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="diastolic" className="block text-sm font-medium text-gray-700">
                    Rozkurczowe (mmHg)
                  </label>
                  <input
                    type="number"
                    id="diastolic"
                    {...register('diastolic', {
                      required: 'Wartość rozkurczowa jest wymagana',
                      min: {
                        value: 40,
                        message: 'Wartość musi wynosić co najmniej 40 mmHg',
                      },
                      max: {
                        value: 150,
                        message: 'Wartość musi być mniejsza niż 150 mmHg',
                      },
                    })}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                      (errors as FormErrors).diastolic ? 'border-error-500' : 'border-gray-300'
                    }`}
                    placeholder="80"
                  />
                  {(errors as FormErrors).diastolic && (
                    <p className="mt-1 text-sm text-error-500">
                      {(errors as FormErrors).diastolic?.message as string}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="pulse" className="block text-sm font-medium text-gray-700">
                  Tętno (BPM)
                </label>
                <input
                  type="number"
                  id="pulse"
                  {...register('pulse', {
                    required: 'Wartość tętna jest wymagana',
                    min: {
                      value: 40,
                      message: 'Wartość musi wynosić co najmniej 40 BPM',
                    },
                    max: {
                      value: 200,
                      message: 'Wartość musi być mniejsza niż 200 BPM',
                    },
                  })}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    (errors as FormErrors).pulse ? 'border-error-500' : 'border-300'
                  }`}
                  placeholder="72"
                />
                {(errors as FormErrors).pulse && (
                  <p className="mt-1 text-sm text-red-600">
                    {(errors as FormErrors).pulse?.message}
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label htmlFor="timeOfDay" className="block text-sm font-medium text-gray-700">
              Pora dnia
            </label>
            <select
              id="timeOfDay"
              {...register('timeOfDay', { required: 'Wybierz porę dnia' })}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                errors.timeOfDay ? 'border-error-500' : 'border-gray-300'
              }`}
            >
              <option value="">Wybierz porę dnia</option>
              {timeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.timeOfDay && (
              <p className="mt-1 text-sm text-error-500">{errors.timeOfDay.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notatki (opcjonalnie)
            </label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Dodaj wszelkie istotne notatki dotyczące pomiarów..."
            ></textarea>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Zapisywanie...' : 'Zapisz wpis'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HealthEntryForm;
