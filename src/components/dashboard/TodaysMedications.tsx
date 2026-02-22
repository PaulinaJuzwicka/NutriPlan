import React, { useState, useEffect } from 'react';
import { AlertCircle, Pill, Clock, Calendar, Tablet, CheckCircle, Circle, Plus } from 'lucide-react';
import { MedicationBase } from '../../types/medications';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { medicationReminderService } from '../../services/medicationReminderService';
import { supabase } from '../../lib/supabase';

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
  error: string | null;
  user?: { id: string } | null;
  onRefresh?: () => void;
  onMedicationTaken?: (medicationId: string, taken: boolean) => Promise<void>;
}

const TodaysMedications: React.FC<TodaysMedicationsProps> = ({
  medications,
  loading,
  error,
  user,
  onRefresh,
  onMedicationTaken,
}) => {
  const navigate = useNavigate();
  const [updatingMedications, setUpdatingMedications] = useState<Set<string>>(new Set());

  const getTotalDoses = (medication: Medication): number => {
    switch (medication.czestotnosc) {
      case 'raz_dziennie': return 1;
      case 'dwa_razy': return 2;
      case 'trzy_razy': return 3;
      case 'cztery_razy': return 4;
      default: return 1;
    }
  };

  // Nowa funkcja - oblicza dostępne dawki dzisiaj z uwzględnieniem godziny rozpoczęcia
  const getAvailableDosesToday = (medication: Medication): number => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    // Jeśli lek nie był aktywny dzisiaj, zwróć 0
    const startDate = new Date(medication.rozpoczeto_od);
    if (startDate >= tomorrow) {
      return 0; // Lek zaczyna się jutro lub później
    }
    
    // Jeśli lek rozpoczął się dzisiaj, sprawdź godziny
    if (startDate >= today) {
      const startHour = startDate.getHours();
      const startMinute = startDate.getMinutes();
      const startTotalMinutes = startHour * 60 + startMinute;
      
      const adminHours = medication.godziny_przyjmowania || [];
      
      if (adminHours.length > 0) {
        // Licz tylko dawki po godzinie rozpoczęcia leku
        return adminHours.filter(hour => {
          const [hourStr, minuteStr] = hour.split(':');
          const doseHour = parseInt(hourStr);
          const doseMinute = parseInt(minuteStr) || 0;
          const doseTotalMinutes = doseHour * 60 + doseMinute;
          return doseTotalMinutes >= startTotalMinutes;
        }).length;
      } else {
        // Jeśli nie ma zdefiniowanych godzin, przyjmij standardowe
        if (medication.czestotnosc.includes('dziennie')) {
          const standardHours = [8, 12, 18, 20]; // Standardowe godziny
          return standardHours.filter(hour => hour * 60 >= startTotalMinutes).length;
        } else {
          // Dla innych częstotliwości, jeśli rozpoczęto przed 12:00, liczymy jedną dawkę
          return startTotalMinutes <= 720 ? 1 : 0;
        }
      }
    }
    
    // Jeśli lek był aktywny przed dzisiaj, zwróć pełną liczbę dawek
    return getTotalDoses(medication);
  };

  const getTakenDosesCount = (medication: Medication): number => {
    return medication.taken_today?.count || 0;
  };

  // Sprawdź czy wszystkie dawki zostały wzięte (do wywołania o północy)
  const checkAllDosesTaken = (): boolean => {
    return medications.every(medication => {
      const totalDoses = getAvailableDosesToday(medication); // Używamy nowej funkcji
      const takenDoses = getTakenDosesCount(medication);
      return takenDoses >= totalDoses;
    });
  };

  // Sprawdzaj o północy czy wszystkie dawki zostały wzięte
  useEffect(() => {
    const checkMidnight = async () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Sprawdzaj między 00:00 a 00:05
      if (hours === 0 && minutes >= 0 && minutes <= 5) {
        if (!checkAllDosesTaken()) {
          // Zapisz do bazy, że nie wszystkie leki zostały przyjęte
          await recordMissedDoses();
        }
      }
    };

    const interval = setInterval(checkMidnight, 60000); // Sprawdzaj co minutę
    return () => clearInterval(interval);
  }, [medications]);

  // Zapisz informacje o niewziętych dawkach do bazy
  const recordMissedDoses = async () => {
    try {
      const missedDoses = medications.map(medication => ({
        id_leku: medication.id,
        id_uzytkownika: user?.id, // Dodaj ID użytkownika
        data: new Date().toISOString().split('T')[0], // Wczorajsza data
        status: 'missed', // Status: pominięte
        czy_przyjete: false,
        notatki: 'Automatyczne sprawdzenie o północy - nie wszystkie dawki przyjęte'
      }));

      // Zapisz do tabeli z historią przyjmowania leków
      const { error } = await supabase
        .from('historia_przyjmowania_lekow')
        .insert(missedDoses);

      if (error) {
        // Error recording missed doses silently
      } else {
        // Missed doses recorded successfully
      }
    } catch (error) {
      // Error in recordMissedDoses handled silently
    }
  };

  const handleMedicationTaken = async (medicationId: string, taken: boolean, doseNum?: number) => {
    if (!onMedicationTaken) return;

    // Znajdź lek po ID
    const medication = medications.find(m => m.id === medicationId);
    if (!medication) return;

    setUpdatingMedications(prev => new Set(prev).add(medicationId));
    
    try {
      await onMedicationTaken(medicationId, taken);
    } catch (error) {
    } finally {
      setUpdatingMedications(prev => {
        const newSet = new Set(prev);
        newSet.delete(medicationId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Ładowanie leków...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Odśwież
          </button>
        )}
      </div>
    );
  }

  if (!medications || medications.length === 0) {
    return (
      <div className="text-center py-12">
        <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Brak leków na dzisiaj</p>
        <button
          onClick={() => navigate('/medications/add')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Dodaj lek
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {medications.map((medication) => (
        <div
          key={medication.id}
          className={`bg-white rounded-lg shadow p-4 border ${
            medication.czy_staly ? 'border-blue-100 bg-blue-50/30' : 'border-gray-200'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-full ${
                  medication.czy_staly
                    ? 'bg-blue-200 text-blue-700'
                    : 'bg-primary-200 text-primary-700'
                }`}
              >
                <Pill className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{medication.nazwa}</h3>
                <p className="text-sm text-gray-600">{medication.dawka}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {medication.czy_staly && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Stały
                </span>
              )}
              {/* Status dzisiejszych dawek */}
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Dzisiaj</div>
                <div className="text-lg font-semibold text-gray-900">
                  {getTakenDosesCount(medication)}/{getAvailableDosesToday(medication)}
                </div>
                <div className="text-xs text-gray-500">
                  {getAvailableDosesToday(medication) === 1 ? 'dawka' : 
                   getAvailableDosesToday(medication) <= 4 ? 'dawki' : 'dawek'}
                </div>
              </div>

              {/* Multiple dose management - show for medications with multiple daily doses */}
              {onMedicationTaken && getAvailableDosesToday(medication) > 1 ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-xs text-gray-500">Kliknij aby oznaczyć:</div>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: getAvailableDosesToday(medication) }, (_, i) => i + 1).map((doseNum) => {
                      const isTaken = doseNum <= getTakenDosesCount(medication);
                      const isDisabled = updatingMedications.has(medication.id);
                      
                      return (
                        <button
                          key={doseNum}
                          onClick={() => handleMedicationTaken(medication.id, true, doseNum)}
                          disabled={isDisabled}
                          className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 ${
                            isTaken
                              ? 'bg-green-500 text-white shadow-sm'
                              : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm cursor-pointer'
                          } ${updatingMedications.has(medication.id) ? 'opacity-50' : ''}`}
                          aria-label={`Dawka ${doseNum} - ${isTaken ? 'przyjęta' : 'kliknij aby przyjąć'}`}
                        >
                          {updatingMedications.has(medication.id) ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                          ) : (
                            isTaken ? '✓' : doseNum
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-xs text-gray-400">
                    {getTakenDosesCount(medication) === getAvailableDosesToday(medication) 
                      ? 'Wszystkie dawki przyjęte!' 
                      : `Pozostało: ${getAvailableDosesToday(medication) - getTakenDosesCount(medication)}`}
                  </div>
                </div>
              ) : (
                /* Single dose checkbox - for medications with single daily dose */
                getAvailableDosesToday(medication) > 0 && (
                  <div className="flex flex-col items-center space-y-2">
                    <button
                      onClick={() => {
                        const isTaken = getTakenDosesCount(medication) > 0;
                        if (!isTaken) {
                          handleMedicationTaken(medication.id, true);
                        }
                      }}
                      disabled={updatingMedications.has(medication.id) || getTakenDosesCount(medication) > 0}
                      className={`p-3 rounded-full transition-all duration-200 ${
                        getTakenDosesCount(medication) > 0
                          ? 'bg-green-100 text-green-600 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer'
                      } ${updatingMedications.has(medication.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label={getTakenDosesCount(medication) > 0 ? 'Lek już przyjęty' : 'Oznacz jako przyjęty'}
                    >
                      {updatingMedications.has(medication.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b border-current"></div>
                      ) : (
                        getTakenDosesCount(medication) > 0 ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )
                      )}
                    </button>
                    <div className="text-xs text-gray-500">
                      {getTakenDosesCount(medication) > 0 ? 'Przyjęto' : 'Do przyjęcia'}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {medication.godziny_przyjmowania && medication.godziny_przyjmowania.length > 0
                ? medication.godziny_przyjmowania.join(', ')
                : 'Brak godzin'}
            </span>
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Rozpoczęto: {medication.rozpoczeto_od ? new Date(medication.rozpoczeto_od).toLocaleDateString('pl-PL') : 'Brak daty'}
            </span>
            {medication.data_zakonczenia && (
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Kończy: {new Date(medication.data_zakonczenia).toLocaleDateString('pl-PL')}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodaysMedications;
