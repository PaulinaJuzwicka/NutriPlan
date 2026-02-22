import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Activity, AlertCircle, Clock } from 'lucide-react';

interface HealthParametersFormData {
  typ?: string;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  pulse?: number;
  bloodSugar?: number;
  temperature?: number;
  notes?: string;
  measuredAt: string;
  wartosc?: string | number;
  zmierzono_o?: string;
  notatki?: string;
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
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<HealthParametersFormData>();

  // Ustaw aktualną datę i godzinę przy pierwszym renderowaniu
  useEffect(() => {
    const now = new Date();
    // Format dla datetime-local w strefie czasowej użytkownika
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    setValue('measuredAt', formattedDateTime);
  }, [setValue]);

  const setCurrentDateTime = () => {
    const now = new Date();
    // Format dla datetime-local w strefie czasowej użytkownika
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    setValue('measuredAt', formattedDateTime);
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const onSubmitForm = async (data: HealthParametersFormData) => {
    
    // Dodaj typ pomiaru do danych
    if (selectedTypes.length > 0) {
      
      // Dla każdego wybranego typu utwórz osobny wpis - SEKWENCYJNIE
      for (const measurementType of selectedTypes) {
        // Przygotuj dane dla serwisu
        const serviceData: any = {
          typ: measurementType,
          zmierzono_o: data.measuredAt, // Wspólna data dla wszystkich typów
          notatki: data.notes || ''
        };
        
        // Dodaj wartość w zależności od typu
        if (measurementType === 'blood-pressure' && data.bloodPressure) {
          const systolic = typeof data.bloodPressure.systolic === 'string' 
            ? parseFloat(data.bloodPressure.systolic) 
            : data.bloodPressure.systolic;
          const diastolic = typeof data.bloodPressure.diastolic === 'string' 
            ? parseFloat(data.bloodPressure.diastolic) 
            : data.bloodPressure.diastolic;
          
          if (!isNaN(systolic) && !isNaN(diastolic)) {
            serviceData.wartosc = `${systolic}/${diastolic}`;
          }
        } else if (measurementType === 'pulse' && data.pulse) {
          serviceData.wartosc = typeof data.pulse === 'string' ? parseFloat(data.pulse) : data.pulse;
        } else if (measurementType === 'blood-sugar' && data.bloodSugar) {
          serviceData.wartosc = typeof data.bloodSugar === 'string' ? parseFloat(data.bloodSugar) : data.bloodSugar;
        } else if (measurementType === 'temperature' && data.temperature) {
          serviceData.wartosc = typeof data.temperature === 'string' ? parseFloat(data.temperature) : data.temperature;
        }
        
        
        // SEKWENCYJNE wysyłanie - czekaj na zakończenie każdego
        try {
          await onSubmit(serviceData);
        } catch (error) {
        }
      }
    } else {
      // Jeśli nie wybrano żadnego typu, wyślij błąd
      await onSubmit({ 
        typ: undefined,
        zmierzono_o: data.measuredAt,
        measuredAt: data.measuredAt,
        notatki: data.notes
      });
    }
    
    reset();
    setSelectedTypes([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-white flex items-center">
            <Activity className="h-5 w-5 mr-2" /> Dodaj pomiary
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
              Ciśnienie
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
              Tętno
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
              Cukier
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
              Temperatura
            </button>
          </div>

          {selectedTypes.includes('blood-pressure') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="systolic" className="block text-sm font-medium text-gray-700">
                  Ciśnienie skurczowe (mmHg)
                </label>
                <input
                  type="number"
                  id="systolic"
                  {...register('bloodPressure.systolic', {
                    required: selectedTypes.includes('blood-pressure')
                      ? 'Value is required'
                      : false,
                    min: {
                      value: 70,
                      message: 'Value must be greater than 70 mmHg',
                    },
                    max: {
                      value: 250,
                      message: 'Value must be less than 250 mmHg',
                    },
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
                  Ciśnienie rozkurczowe (mmHg)
                </label>
                <input
                  type="number"
                  id="diastolic"
                  {...register('bloodPressure.diastolic', {
                    required: selectedTypes.includes('blood-pressure')
                      ? 'Value is required'
                      : false,
                    min: {
                      value: 40,
                      message: 'Value must be greater than 40 mmHg',
                    },
                    max: {
                      value: 150,
                      message: 'Value must be less than 150 mmHg',
                    },
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
                Tętno (bpm)
              </label>
              <input
                type="number"
                id="pulse"
                {...register('pulse', {
                  required: selectedTypes.includes('pulse') ? 'Value is required' : false,
                  min: {
                    value: 40,
                    message: 'Value must be greater than 40 bpm',
                  },
                  max: {
                    value: 200,
                    message: 'Value must be less than 200 bpm',
                  },
                })}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.pulse ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="72"
              />
              {errors.pulse && <p className="mt-1 text-sm text-red-500">{errors.pulse.message}</p>}
            </div>
          )}

          {selectedTypes.includes('blood-sugar') && (
            <div>
              <label htmlFor="bloodSugar" className="block text-sm font-medium text-gray-700">
                Poziom cukru we krwi (mg/dL)
              </label>
              <input
                type="number"
                id="bloodSugar"
                {...register('bloodSugar', {
                  required: selectedTypes.includes('blood-sugar') ? 'Value is required' : false,
                  min: {
                    value: 20,
                    message: 'Value must be greater than 20 mg/dL',
                  },
                  max: {
                    value: 600,
                    message: 'Value must be less than 600 mg/dL',
                  },
                })}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.bloodSugar ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="100"
              />
              {errors.bloodSugar && <p className="mt-1 text-sm text-red-500">{errors.bloodSugar.message}</p>}
            </div>
          )}

          {selectedTypes.includes('temperature') && (
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
                Temperatura ciała (°C)
              </label>
              <input
                type="number"
                id="temperature"
                step="0.1"
                {...register('temperature', {
                  required: selectedTypes.includes('temperature') ? 'Value is required' : false,
                  min: {
                    value: 35,
                    message: 'Value must be greater than 35°C',
                  },
                  max: {
                    value: 42,
                    message: 'Value must be less than 42°C',
                  },
                })}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.temperature ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="36.6"
              />
              {errors.temperature && (
                <p className="mt-1 text-sm text-red-500">{errors.temperature.message}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="measuredAt" className="block text-sm font-medium text-gray-700">
              Czas pomiaru
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="datetime-local"
                id="measuredAt"
                {...register('measuredAt', { required: 'Measurement time is required' })}
                className={`flex-1 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.measuredAt ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={setCurrentDateTime}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                title="Ustaw aktualny czas"
              >
                <Clock className="h-4 w-4" />
              </button>
            </div>
            {errors.measuredAt && (
              <p className="mt-1 text-sm text-red-500">{errors.measuredAt.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notatki (opcjonalnie)
            </label>
            <textarea
              id="notes"
              rows={3}
              {...register('notes')}
              className="mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border-gray-300"
              placeholder="Dodaj dodatkowe notatki lub obserwacje..."
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Zapisywanie...' : 'Zapisz pomiary'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HealthParametersForm;
