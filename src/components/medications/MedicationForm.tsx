import React from 'react';
import { useForm } from 'react-hook-form';
import { Pill, Clock, AlertCircle } from 'lucide-react';

type MedicationForm = 'tablet' | 'capsule' | 'syrup' | 'injection' | 'ointment' | 'drops' | 'inhalation' | 'other';

interface MedicationFormData {
  name: string;
  dosage: string;
  frequency: string;
  form: MedicationForm;
  start_date: string;
  end_date?: string;
  duration_days?: number;
  is_permanent: boolean;
  is_active: boolean;
  notes?: string;
}

interface NewMedicationFormProps {
  onSubmit: (data: MedicationFormData) => void;
  initialData?: Partial<MedicationFormData>;
  isLoading?: boolean;
  error?: string | null;
  userId: string;
}

const NewMedicationForm = ({
  onSubmit,
  initialData = {},
  isLoading = false,
  error = null,
  userId,
}: NewMedicationFormProps) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<MedicationFormData>({
    defaultValues: {
      name: '',
      dosage: '',
      frequency: '',
      form: 'tablet',
      start_date: new Date().toISOString().split('T')[0],
      end_date: undefined,
      duration_days: 30,
      is_permanent: false,
      is_active: true,
      notes: '',
      ...initialData,
    },
  });

  const isPermanent = watch('is_permanent');
  const startDate = watch('start_date');
  const durationDays = watch('duration_days');

  
  React.useEffect(() => {
    if (isPermanent) {
      setValue('duration_days', undefined);
    } else {
      setValue('duration_days', 30);
    }
  }, [isPermanent, setValue]);

  const calculateEndDate = () => {
    if (!startDate || !durationDays) return '';
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);
    return endDate.toISOString().split('T')[0];
  };

  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times a day',
    'Four times a day',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'Once a week',
    'Once a month',
    'As needed',
    'Other (specify in notes)'
  ];

  
  const validateStartDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    if (date < today) {
      return 'Start date cannot be in the past';
    }
    return true;
  };

  const formSubmit = (data: MedicationFormData) => {
    if (!data.is_permanent && data.duration_days) {
      const endDate = new Date(data.start_date);
      endDate.setDate(endDate.getDate() + data.duration_days);
      data.end_date = endDate.toISOString().split('T')[0];
    } else {
      data.end_date = undefined;
      data.duration_days = undefined;
    }
    console.log('Submitting medication data:', data);
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(formSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medication Name
          </label>
          <input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dosage
          </label>
          <input
            type="text"
            {...register('dosage', { required: 'Dosage is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.dosage && <p className="mt-1 text-sm text-red-600">{errors.dosage.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Form
          </label>
          <select
            {...register('form', { required: 'Form is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="tablet">Tablet</option>
            <option value="capsule">Capsule</option>
            <option value="syrup">Syrup</option>
            <option value="injection">Injection</option>
            <option value="ointment">Ointment</option>
            <option value="drops">Drops</option>
            <option value="inhalation">Inhalation</option>
            <option value="other">Other</option>
          </select>
          {errors.form && <p className="mt-1 text-sm text-red-600">{errors.form.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequency
          </label>
          <select
            {...register('frequency', { required: 'Frequency is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="once">Once a day</option>
            <option value="twice">Twice a day</option>
            <option value="three">Three times a day</option>
            <option value="four">Four times a day</option>
            <option value="as_needed">As needed</option>
          </select>
          {errors.frequency && <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            {...register('start_date', { required: 'Start date is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('is_permanent')}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Permanent medication
          </label>
        </div>

        {!isPermanent && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (days)
            </label>
            <input
              type="number"
              {...register('duration_days', { 
                required: !isPermanent ? 'Duration is required for non-permanent medications' : false,
                min: { value: 1, message: 'Duration must be at least 1 day' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              min="1"
            />
            {errors.duration_days && <p className="mt-1 text-sm text-red-600">{errors.duration_days.message}</p>}
            {durationDays && startDate && (
              <div className="mt-2 text-sm text-gray-600">
                Treatment will end on: {calculateEndDate()}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? (
            <>
              <Clock className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Saving...
            </>
          ) : (
            'Save Medication'
          )}
        </button>
      </div>
    </form>
  );
};

export default NewMedicationForm;
