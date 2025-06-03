import React from 'react';
import { 
  Pill, 
  Edit, 
  Trash2, 
  Calendar, 
  CalendarCheck,
  Zap,
  FlaskRound,
  Clock,
  Info
} from 'lucide-react';
import { MedicationBase as Medication, MedicationForm } from '../../types/medications';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';



interface MedicationListProps {
  medications: Medication[];
  onEdit: (medication: Medication) => void;
  onDelete: (medication: Medication) => Promise<void>;
}

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'Not specified';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy', { locale: enUS });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date error';
  }
};

const MedicationList: React.FC<MedicationListProps> = ({
  medications,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-4">
      {medications.length === 0 ? (
        <div className="text-center py-8">
          <Pill className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No medications</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by adding your first medication.
          </p>
        </div>
      ) : (
        medications.map((medication) => {
          if (!medication) return null;

          return (
            <div
              key={medication.id}
              className={`bg-white rounded-lg shadow-sm border ${
                medication.is_permanent 
                  ? 'border-blue-100 bg-blue-50/30' 
                  : 'border-gray-200 hover:border-gray-300'
              } p-4 hover:shadow-md transition-all duration-200 relative overflow-hidden`}
            >
              <div className={`absolute inset-y-0 left-0 w-1 ${
                medication.is_permanent ? 'bg-blue-500' : 'bg-gray-300'
              }`}></div>
              

              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg ${
                    medication.is_permanent 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-primary-100 text-primary-600'
                  }`}>
                    <Pill className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-gray-900">{medication.name || 'Unnamed medication'}</h3>
                      {medication.is_permanent && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Zap className="h-3 w-3 mr-1" />
                          Permanent
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{medication.dosage || 'No dosage'}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => onEdit(medication)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    aria-label="Edit medication"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(medication)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    aria-label="Delete medication"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">
                    Start Date
                  </p>
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {formatDate(medication.start_date)}
                  </div>
                </div>

                {!medication.is_permanent && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">
                      End Date
                    </p>
                    <div className="flex items-center text-sm text-gray-900">
                      <CalendarCheck className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(medication.end_date)}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">
                    Form
                  </p>
                  <div className="flex items-center text-sm text-gray-900">
                     <FlaskRound className="h-4 w-4 mr-1 text-gray-400" />
                    {medication.form || 'Not specified'}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">
                    Frequency / Daily Dose
                  </p>
                  <div className="flex items-center text-sm text-gray-900">
                     <Clock className="h-4 w-4 mr-1 text-gray-400" />
                    <p className="font-medium">
                      {medication.frequency ? (
                        medication.frequency === 'once' ? 'Once daily' :
                        medication.frequency === 'twice' ? 'Twice daily' :
                        medication.frequency === 'three' ? 'Three times daily' :
                        medication.frequency === 'four' ? 'Four times daily' :
                        medication.frequency === 'as_needed' ? 'As needed' :
                        medication.frequency
                      ) : (
                        medication.daily_doses ? `${medication.daily_doses} ${medication.daily_doses === 1 ? 'dose per day' : 'doses per day'}` : 'No dosage information'
                      )}
                    </p>
                  </div>
                </div>
                {medication.notes && (
                  <div className="col-span-full space-y-1">
                    <p className="text-xs font-medium text-gray-500">Notes</p>
                    <p className="text-sm text-gray-600">{medication.notes}</p>
                  </div>
                )}
              </div>

              {medication.notes && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{medication.notes}</p>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100">
                {medication.updated_at && (
                  <p className="text-xs text-gray-400">
                    Last updated: {format(new Date(medication.updated_at), 'MMM d, yyyy, h:mm a', { locale: enUS })}
                  </p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">
                    Dosage
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                     <span className="font-semibold">Dosage:</span> {medication.dosage || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MedicationList;