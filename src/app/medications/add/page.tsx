'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import MedicationForm from '../../../components/medications/MedicationForm';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';

export default function AddMedicationPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: Parameters<typeof MedicationForm>['0']['onSubmit'] extends (data: infer T) => any ? T : never) => {
    if (!user) {
      setError('You must be logged in to add medication');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: createError } = await supabase
        .from('medications')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single();

      if (createError) throw createError;

      toast.success('Medication added successfully');
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Error while adding medication:', err);
      setError('An error occurred while adding medication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">You must be logged in to add medication.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dodaj nowy lek</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill out the form below to add a new medication to your list.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <MedicationForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          userId={user.id}
        />
      </div>
    </div>
  );
}
