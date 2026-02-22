import React, { useState, useEffect, useCallback } from 'react';
import { Plus, AlertCircle, Pill, Edit, Trash2, Download, FileText, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextOptimized';
import { useUserData } from '../context/UserDataContext';
import { usePageState } from '../hooks/usePageState';
import medicationService from '../services/medicationService';
import { MedicationBase as Medication } from '../types/medications';
import { Button } from '../components/ui/Button';

type MedicationFormData = {
  nazwa: string;
  data_zakonczenia?: string;
  czas_trwania_dni?: number;
  czy_staly: boolean;
  aktywne: boolean;
  notatki?: string;
  godziny_przyjmowania: string[];
};

const Medications: React.FC = () => {
  const { state } = useAuth();
  const { data: userData, refreshMedications } = useUserData();
  const user = state.user;
  const navigate = useNavigate();
  const { isRestored, saveState } = usePageState('medications');
  const medications = userData.medications;
  const [takenDoses, setTakenDoses] = useState<Set<string>>(new Set()); // Śledzenie przyjętych dawek
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const active = medications.filter(m => m.aktywny).length;
    const total = medications.length;
    
    return {
      total,
      active,
    };
  }, [medications]);

  // Restore and save page state
  useEffect(() => {
    if (isRestored) {
      // Page state restored
      
      // Przywróć stan przyjętych dawek z zapisanego stanu
      try {
        const states = JSON.parse(localStorage.getItem('nutriplan_page_states') || '{}');
        
        if (states.medications) {
          const medicationsState = states.medications;
          
          if (medicationsState?.formData?.takenDoses) {
            setTakenDoses(new Set(medicationsState.formData.takenDoses));
          }
        }
      } catch (error) {
        // Failed to restore taken doses handled silently
      }
    }
  }, [isRestored]);

  // Save page state including taken doses
  useEffect(() => {
    saveState({
      scrollPosition: window.scrollY,
      formData: {
        isFormOpen,
        isReportOpen,
        hasSelectedMedication: !!selectedMedication,
        takenDoses: Array.from(takenDoses) // Konwertuj Set na Array
      }
    });
  }, [isFormOpen, isReportOpen, selectedMedication, takenDoses, saveState]);

  // Fetch medications - tylko jeśli brakuje danych lub są stare
  const fetchMedications = useCallback(async () => {
    if (!user) return;
    
    // Check if we already have recent data
    const dataAge = userData.lastUpdated ? Date.now() - userData.lastUpdated.getTime() : Infinity;
    const hasData = userData.medications && userData.medications.length > 0;
    
    if (hasData && dataAge < 5 * 60 * 1000) { // 5 minutes
      // Using cached data
      
      // Still load taken doses state
      const takenSet = new Set<string>();
      for (const med of userData.medications) {
        if (med.godziny_przyjmowania && Array.isArray(med.godziny_przyjmowania)) {
          for (const godzina of med.godziny_przyjmowania) {
            try {
              const isTaken = await medicationService.isMedicationTakenToday(med.id, user.id, godzina);
              if (isTaken) {
                takenSet.add(`${med.id}-${godzina}`);
              }
            } catch (error) {
              // Failed to check medication taken status handled silently
            }
          }
        }
      }
      setTakenDoses(takenSet);
      return;
    }
    
    // Data is stale or missing, but UserDataProvider handles refresh
    // Nie wywołuj refreshMedications - UserDataProvider już zarządza odświeżaniem
  }, [user?.id]); // Usuń zależności od userData i refreshMedications

  useEffect(() => {
    if (user) {
      // User available, checking data state
      // Tylko sprawdzamy stan - nie wywołujemy fetchMedications
      // UserDataProvider zarządza odświeżaniem danych
    }
  }, [user?.id]); // Proste zależności

  // Check medication intake status when medications data changes
  useEffect(() => {
    if (!user || !userData.medications || userData.medications.length === 0) {
      return;
    }

    const checkTakenDoses = async () => {
      const takenSet = new Set<string>();
      
      for (const med of userData.medications) {
        if (med.godziny_przyjmowania && Array.isArray(med.godziny_przyjmowania)) {
          for (const godzina of med.godziny_przyjmowania) {
            try {
              const isTaken = await medicationService.isMedicationTakenToday(med.id, user.id, godzina);
              if (isTaken) {
                takenSet.add(`${med.id}-${godzina}`);
              }
            } catch (error) {
              // Failed to check medication taken status handled silently
            }
          }
        }
      }
      
      setTakenDoses(takenSet);
    };

    checkTakenDoses();
  }, [user?.id, userData.medications]); // Sprawdzaj przy zmianie leków

  const handleAddMedicationToList = (medication: Medication) => {
    // Dane są zarządzane przez UserDataContext, więc odświeżamy
    refreshMedications();
  };

  const handleEdit = (medication: Medication) => {
    // Dane są zarządzane przez UserDataContext, więc odświeżamy
    refreshMedications();
  };

  const handleDelete = async (medication: Medication) => {
    try {
      await medicationService.deleteMedication(medication.id);
      // Odśwież dane przez UserDataContext
      await refreshMedications();
    } catch (err) {
      // Failed to delete medication handled silently
    }
  };

  const handleTakeMedication = async (medication: Medication, godzina: string) => {
    try {
      await medicationService.markMedicationTaken(medication.id, user!.id, godzina);
      
      // Dodaj do stanu przyjętych dawek
      const doseKey = `${medication.id}-${godzina}`;
      setTakenDoses(prev => new Set(prev).add(doseKey));
      
      // Medication marked as taken
    } catch (error) {
      // Error marking medication as taken handled silently
    }
  };

  // Sprawdź czy dawka została przyjęta dzisiaj
  const isDoseTaken = async (medication: Medication, godzina: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      return await medicationService.isMedicationTakenToday(medication.id, user.id, godzina);
    } catch (error) {
      // Error checking dose status handled silently
      return false;
    }
  };

  const handleReport = () => {
    setIsReportOpen(true);
  };

  const handleAddMedication = () => {
    setSelectedMedication(null);
    setIsFormOpen(true);
  };

  const handleEditMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedMedication(null);
  };

  const handleFormSubmit = useCallback(async (data: any) => {
    try {
      // Mapowanie pól z formularza na bazy danych
      const mappedData = {
        ...data,
        rozpoczeto_od: data.data_rozpoczecia, // Mapowanie data_rozpoczecia -> rozpoczeto_od
        dawki_dziennie: data.godziny_przyjmowania?.length || 1, // Dodaj wymagane pole
        // aktywny jest już poprawne - kolumna w bazie danych
      };
      
      if (selectedMedication) {
        // Update existing medication
        await medicationService.updateMedication(selectedMedication.id, mappedData);
      } else {
        // Add new medication
        await medicationService.addMedication({
          ...mappedData,
          id_uzytkownika: user!.id
        });
        // New medication added
      }
      handleCloseForm();
      // Wymuś odświeżenie danych przez UserDataContext
      await refreshMedications();
    } catch (err) {
      // Error submitting medication form handled silently
    }
  }, [selectedMedication, user, refreshMedications]);

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Moje leki</h1>
          <div className="flex gap-2">
            <Button
              onClick={handleAddMedication}
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Dodaj lek
            </Button>
            <Button
              variant="outline"
              onClick={handleReport}
              className="flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Raport
            </Button>
          </div>
        </div>
      </div>

      {userData.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{userData.error}</span>
          </div>
        </div>
      )}

      {userData.isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 border-t-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Szybko ładuję...</span>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Wszystkie leki</h3>
                <Pill className="w-5 h-5 text-gray-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Aktywne</h3>
                <div className="w-5 h-5 bg-green-500 rounded-full"></div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-green-600">{stats.active}</span>
              </div>
            </div>
          </div>

          {/* Medications List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lista leków</h2>
              
              {medications.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nie masz jeszcze żadnych leków.</p>
                  <p className="text-gray-600 mt-2">Kliknij "Dodaj lek" aby rozpocząć.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medications.map((medication) => (
                    <div key={medication.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      {/* Header with status and actions */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">{medication.nazwa}</h3>
                            {medication.aktywny ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Aktywny
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Nieaktywny
                              </span>
                            )}
                            <span className="text-sm font-medium text-gray-700">Dawkowanie:</span>
                            <p className="text-sm text-gray-900">{medication.dawka}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Częstotliwość:</span>
                            <p className="text-sm text-gray-900">{medication.czestotnosc ? medication.czestotnosc.replace(/_/g, ' ') : 'Brak danych'}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Forma:</span>
                            <p className="text-sm text-gray-900">{medication.forma}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Data rozpoczęcia:</span>
                            <p className="text-sm text-gray-900">{medication.rozpoczeto_od}</p>
                          </div>
                          {medication.data_zakonczenia && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Data zakończenia:</span>
                              <p className="text-sm text-gray-900">{medication.data_zakonczenia}</p>
                            </div>
                          )}
                          {medication.czas_trwania_dni && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Czas trwania:</span>
                              <p className="text-sm text-gray-900">{medication.czas_trwania_dni} dni</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Godziny przyjmowania */}
                      {medication.godziny_przyjmowania && medication.godziny_przyjmowania.length > 0 && (
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-700">Godziny przyjmowania:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {medication.godziny_przyjmowania.map((godzina, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {godzina}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notatki */}
                      {medication.notatki && (
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-700">Notatki:</span>
                          <p className="text-sm text-gray-600 mt-1">{medication.notatki}</p>
                        </div>
                      )}

                      {/* Sekcja przyjmowania dawek - tylko dla aktywnych leków */}
                      {medication.aktywny && (
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium text-gray-900">Przyjęcie dzisiejszych dawek</h4>
                            <span className="text-xs text-gray-500">
                              {new Date().toLocaleDateString('pl-PL')}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {medication.godziny_przyjmowania && medication.godziny_przyjmowania.length > 0 ? (
                              medication.godziny_przyjmowania.map((godzina, index) => {
                                const doseKey = `${medication.id}-${godzina}`;
                                const isTaken = takenDoses.has(doseKey);
                                
                                return (
                                  <Button
                                    key={index}
                                    size="sm"
                                    variant={isTaken ? "primary" : "outline"}
                                    className={`w-full ${isTaken 
                                      ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' 
                                      : 'hover:bg-gray-50'}`}
                                    onClick={() => !isTaken && handleTakeMedication(medication, godzina)}
                                    disabled={isTaken}
                                  >
                                    {isTaken ? (
                                      <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Przyjęto
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-4 h-4 mr-2" />
                                        {godzina}
                                      </>
                                    )}
                                  </Button>
                                );
                              })
                            ) : (
                              <div className="col-span-full text-center text-gray-500 text-sm">
                                Brak zdefiniowanych godzin przyjmowania
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Medication Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedMedication ? 'Edytuj lek' : 'Dodaj nowy lek'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-gray-600">Formularz edycji leków jest w budowie.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal raportu */}
      {isReportOpen && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Raport leków</h3>
            <p className="text-gray-600 mb-4">Funkcja raportowania leków jest w budowie.</p>
            <button
              onClick={() => setIsReportOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Medications);
