import React from 'react';
import { AlertCircle, Pill, Clock, Calendar, Tablet, Edit, Trash2 } from 'lucide-react';
import { MedicationBase } from '../../types/medications';
import { format } from 'date-fns';

type Medication = MedicationBase & {
  taken_today?: {
    count: number;
    total: number;
    remaining: number;
  };
  daily_doses?: number;
  last_taken?: string | null;
};

interface TodaysMedicationsProps {
  medications: Medication[];
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

const TodaysMedications: React.FC<TodaysMedicationsProps> = ({
  medications = [],
  loading = false,
  error = null,
  onRefresh
}) => {
  const isMedicationActive = (med: Medication): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(med.start_date);
    startDate.setHours(0, 0, 0, 0);

    if (startDate > today) return false;
    if (med.is_permanent) return true;

    if (med.end_date) {
      const endDate = new Date(med.end_date);
      endDate.setHours(23, 59, 59, 999);
      return endDate >= today;
    }

    if (med.duration_days) {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + med.duration_days);
      endDate.setHours(23, 59, 59, 999);
      return endDate >= today;
    }

    return true;
  };

  const activeMeds = medications
    .filter(isMedicationActive)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-700">{error.message}</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  if (activeMeds.length === 0) {
    return (
      <div className="text-center py-8">
        <Pill className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No active medications</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add your medications to see them here.
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Today's Medications</h2>
        <button
          onClick={onRefresh}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <Clock className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {activeMeds.map((medication) => (
          <div
            key={medication.id}
            className={`bg-white rounded-lg shadow p-4 border ${
              medication.is_permanent ? 'border-blue-100 bg-blue-50/30' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${
                  medication.is_permanent ? 'bg-blue-200 text-blue-700' : 'bg-primary-200 text-primary-700'
                }`}>
                  <Pill className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
                  <p className="text-sm text-gray-600">{medication.dosage}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {medication.is_permanent && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Permanent
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="text-xs font-medium text-gray-500">Start Date</p>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                  <p>{format(new Date(medication.start_date), 'MMM d, yyyy')}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">Form</p>
                <div className="flex items-center mt-1">
                  <Tablet className="h-4 w-4 text-gray-500 mr-1" />
                  <p className="capitalize">{medication.form}</p>
                </div>
              </div>

              <div className="col-span-2">
                <p className="text-xs font-medium text-gray-500">Frequency / Daily Dose</p>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 text-gray-500 mr-1" />
                  <p>
                    {medication.frequency || (medication.daily_doses ? `${medication.daily_doses} ${medication.daily_doses === 1 ? 'dose per day' : 'doses per day'}` : 'Once daily')}
                  </p>
                </div>
              </div>

              {medication.last_taken && (
                <div className="col-span-2 text-xs text-gray-500 mt-2">
                  Last updated: {format(new Date(medication.last_taken), 'MMM d, yyyy, hh:mm a')}
                </div>
              )}

              <div className="col-span-2 mt-2">
                <p className="text-xs font-medium text-gray-500">Dosage</p>
                <p className="text-sm text-gray-900 font-medium">Dosage: {medication.dosage}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysMedications;