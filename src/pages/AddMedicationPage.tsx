import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextOptimized';
import { usePageState } from '../hooks/usePageState';
import { usePreventReload } from '../hooks/usePreventReload';
import { toast } from 'sonner';

export default function AddMedicationPage() {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user } = state;
  const { isRestored, saveState } = usePageState('add-medication');
  const { isPreventingReload } = usePreventReload(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore and save page state
  useEffect(() => {
    if (isRestored) {
      // Page state restored
    }
  }, [isRestored]);

  // Save page state
  useEffect(() => {
    saveState({
      scrollPosition: window.scrollY,
      formData: {
        isLoading,
        hasError: !!error
      }
    });
  }, [isLoading, error, saveState]);

  // Component mounted
  useEffect(() => {
    // Component mounted
  }, [user, state.isAuthenticated, state.isLoading]);

  const handleSubmit = async (data: unknown) => {
    if (!user) {
      setError('Musisz być zalogowany, aby dodać lek');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Functionality not implemented yet
      toast.success('Funkcja dodawania leków jest w budowie');
      navigate('/medications');
    } catch (err) {
      setError('Wystąpił błąd podczas dodawania leku. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when component unmounts or user changes
  React.useEffect(() => {
    return () => {
      setIsLoading(false);
      setError(null);
    };
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Musisz być zalogowany</h2>
          <p className="text-gray-600 mb-6">Zaloguj się, aby dodać lek do swojej listy.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Przejdź do logowania
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-2xl">
        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side - Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dodaj nowy lek</h1>
              <p className="text-sm text-gray-500">
                Funkcja dodawania leków jest w budowie.
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                <p>{error}</p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Formularz dodawania leków będzie dostępny wkrótce.</p>
            </div>
          </div>

          {/* Right side - Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Formularz dodawania leku</h2>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span>Wypełnij wszystkie pola formularza</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Dane zostaną zapisane w Twojej liście leków</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span>Możesz edytować lub usuwać leki później</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span>Formularz jest dostępny tylko po zalogowaniu</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Wskazówki:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Wszystkie pola są wymagane</li>
                  <li>• Sprawdź poprawność wprowadzonych danych</li>
                  <li>• Kliknij "Dodaj lek" aby zapisać</li>
                  <li>• Po dodaniu zostaniesz przeniesiony do listy leków</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
