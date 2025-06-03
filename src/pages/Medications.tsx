import React, { useState, useEffect, useCallback } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import medicationService from '../services/medicationService';
import { MedicationBase as Medication } from '../types/medications';
import MedicationForm from '../components/medications/MedicationForm';
import MedicationList from '../components/medications/MedicationList';

type MedicationFormData = {
  name: string;
  dosage: string;
  frequency: string;
  form: string;
  start_date: string;
  end_date?: string;
  duration_days?: number;
  is_permanent: boolean;
  is_active: boolean;
  notes?: string;
  intake_times?: string[];
  daily_doses?: number;
};

const Medications: React.FC = () => {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

  
  const fetchMedications = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await medicationService.getMedications(userId);
      setMedications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medications');
      console.error('Error while fetching medications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  
  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        try {
          
          const deletedCount = await medicationService.cleanupExpiredMedications();
          if (deletedCount && deletedCount > 0) {
            console.log(`Removed ${deletedCount} expired medications`);
          }
          
          await fetchMedications(user.id);
        } catch (error) {
          console.error('Error while loading medications:', error);
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, [user?.id, fetchMedications]);

  const handleSubmit = async (data: MedicationFormData) => {
    if (!user) {
      setError('You must be logged in to add medications');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Processing form data:', data);
      
      
      if (!data.name || !data.dosage || !data.frequency || !data.start_date) {
        throw new Error('Please fill in all required fields');
      }

      
      const medicationData: any = {
        ...data,
        user_id: user.id,
        form: data.form || 'tablet',
        daily_doses: data.daily_doses || 1,
        intake_times: data.intake_times || [],
        status: data.is_active ? 'active' : 'inactive',
        taken_today: selectedMedication?.taken_today || { count: 0, total: 0, remaining: 0 },
        last_taken: selectedMedication?.last_taken || null
      };

      
      if (data.is_permanent) {
        
        medicationData.duration_days = null;
        medicationData.end_date = null;
      } else {
        
        if (!data.duration_days && !data.end_date) {
          throw new Error('Please provide treatment duration or end date');
        }
        
        
        if (data.duration_days && !data.end_date) {
          const endDate = new Date(data.start_date);
          endDate.setDate(endDate.getDate() + (data.duration_days as number));
          medicationData.end_date = endDate.toISOString().split('T')[0];
        } else if (data.end_date) {
          
          medicationData.end_date = new Date(data.end_date).toISOString().split('T')[0];
        }
      }

      if (selectedMedication) {
        
        if (!user?.id) {
          throw new Error('You are not logged in');
        }
        
        const updated = await medicationService.updateMedication(
          selectedMedication.id, 
          medicationData,
          user.id
        );
        
        setMedications(prev => 
          prev.map(med => med.id === updated.id ? updated : med)
        );
        
        
        setIsFormOpen(false);
        setSelectedMedication(null);
      } else {
        
        const created = await medicationService.createMedication({
          ...medicationData,
          
          form: data.form || 'tablet',
          daily_doses: 1,
          intake_times: [],
          status: 'active',
          taken_today: { count: 0, total: 0, remaining: 0 },
          last_taken: null
        });
        
        setMedications(prev => [...prev, created]);
        
        
        setSelectedMedication(null);
        setIsFormOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save medication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (medication: Medication) => {
    setSelectedMedication(medication);
    setIsFormOpen(true);
  };

  const handleDelete = async (medication: Medication) => {
    if (!window.confirm('Are you sure you want to delete this medication?')) return;

    setError(null);
    try {
      if (!user?.id) {
        throw new Error('You are not logged in');
      }
      
      await medicationService.deleteMedication(medication.id, user.id);
      
      
      setMedications(prev => prev.filter(m => m.id !== medication.id));
      
      
      if (selectedMedication?.id === medication.id) {
        setSelectedMedication(null);
        setIsFormOpen(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the medication';
      console.error('Error while deleting medication:', err);
      setError(errorMessage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Medications</h1>
        <button
          onClick={() => {
            setSelectedMedication(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Medication
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="lg:col-span-1">
            <MedicationList
              medications={medications}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}

        {isFormOpen && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card p-6">
              <h2 className="text-xl font-semibold mb-6">
                {selectedMedication ? 'Edit Medication' : 'Add New Medication'}
              </h2>
              <MedicationForm
                key={selectedMedication ? `edit-${selectedMedication.id}` : 'new'}
                onSubmit={handleSubmit}
                initialData={selectedMedication ? {
                  name: selectedMedication.name || '',
                  dosage: selectedMedication.dosage || '',
                  frequency: selectedMedication.frequency || 'Once daily',
                  form: selectedMedication.form || 'tablet',
                  start_date: selectedMedication.start_date ? new Date(selectedMedication.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  end_date: selectedMedication.end_date ? new Date(selectedMedication.end_date).toISOString().split('T')[0] : undefined,
                  duration_days: selectedMedication.duration_days || undefined,
                  is_permanent: !selectedMedication.end_date && !selectedMedication.duration_days,
                  is_active: selectedMedication.status === 'active',
                  notes: selectedMedication.notes || '',
                  intake_times: selectedMedication.intake_times || [],
                  daily_doses: selectedMedication.daily_doses || 1
                } : undefined}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medications;