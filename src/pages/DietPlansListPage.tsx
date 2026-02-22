import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextOptimized';
import { useUserData } from '../context/UserDataContext';
import { useToast } from '../hooks/use-toast';
import { usePageState } from '../hooks/usePageState';
import { usePreventReload } from '../hooks/usePreventReload';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, Plus, Edit, Trash2, Users, Target, X, Download, ArrowLeft } from 'lucide-react';
import dietPlanService from '../services/dietPlanService';
import { supabase } from '../lib/supabase';

const DietPlansListPage: React.FC = () => {
  const { state } = useAuth();
  const { data: userData, refreshDietPlans } = useUserData();
  const user = state.user;
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isRestored, saveState } = usePageState('diet-plans-list');
  const { isPreventingReload } = usePreventReload(true);
  
  // Component mounted
  // Używamy danych z UserDataContext
  const dietPlans = userData.dietPlans;
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDietReportModal, setShowDietReportModal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Restore modal states from page state
  useEffect(() => {
    if (isRestored) {
      // Restore any saved state if needed
    }
  }, [isRestored]);

  // Save modal states
  useEffect(() => {
    saveState({
      scrollPosition: window.scrollY,
      formData: {
        hasSelectedPlan: !!selectedPlan,
        showReportModal,
        showDietReportModal
      }
    });
  }, [selectedPlan, showReportModal, showDietReportModal, saveState]);
  
  // Report configuration
  const [reportConfig, setReportConfig] = useState({
    selectedPlanId: '',
    includeDetails: true,
    includeMeals: true,
    includeIngredients: true,
    format: 'pdf' as 'pdf' | 'json'
  });

  // Pobieranie planów dietetycznych - tylko jeśli brakuje danych lub nie ma okresu grace
  const fetchDietPlans = useCallback(async () => {
    if (!user) {
      return;
    }
    
    // Skip fetching if we're in grace period (just restored from minimize)
    if (isPreventingReload()) {
      return;
    }
    
    const dataAge = userData.lastUpdated ? Date.now() - userData.lastUpdated.getTime() : Infinity;
    const hasData = userData.dietPlans && userData.dietPlans.length > 0;
    
    if (hasData && dataAge < 5 * 60 * 1000) { // 5 minutes
      return;
    }
    
    // Data is stale or missing, but UserDataProvider handles refresh
    // Nie wywołuj refreshDietPlans - UserDataProvider już zarządza odświeżaniem
  }, [user?.id]); // Usuń zależności od userData i refreshDietPlans

  useEffect(() => {
    if (user) {
      // User available, checking data state
      // Tylko sprawdzamy stan - nie wywołujemy fetchDietPlans
      // UserDataProvider zarządza odświeżaniem danych
    }
  }, [user?.id]); // Proste zależności

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      weight_loss: 'Odchudzanie',
      muscle_gain: 'Budowa masy',
      balanced: 'Zrównoważona',
      vegetarian: 'Wegetariańska',
      vegan: 'Wegańska',
      keto: 'Ketogeniczna',
      other: 'Inna',
    };
    return labels[category] || category;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: { [key: string]: string } = {
      beginner: 'Początkujący',
      intermediate: 'Średniozaawansowany',
      advanced: 'Zaawansowany',
    };
    return labels[difficulty] || difficulty;
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) {
      return 'Brak daty';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Nieprawidłowa data';
      }
      
      return date.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Błąd daty';
    }
  };

  const handleCloseDetails = () => {
    setSelectedPlan(null);
  };

  const handleGenerateReport = async () => {
    if (!user?.id) return;
    
    setIsGeneratingReport(true);
    try {
      // TODO: Implementacja generowania raportu diety
      
      setShowReportModal(false);
      addToast({
        title: "Informacja",
        description: "Funkcja generowania raportu zostanie wkrótce zaimplementowana.",
        variant: "default"
      });
    } catch (err) {
      addToast({
        title: "Błąd",
        description: 'Nie udało się wygenerować raportu.',
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-white shadow-xl rounded-2xl p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Musisz być zalogowany</h2>
          <p className="text-gray-600">Aby zobaczyć swoje plany dietetyczne, zaloguj się na konto.</p>
          <Button className="mt-4" onClick={() => window.location.href = '/login'}>
            Zaloguj się
          </Button>
        </div>
      </div>
    );
  }

  if (userData.isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-xs text-gray-600">Inicjalizacja...</span>
        </div>
      </div>
    );
  }

  if (userData.error) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {userData.error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/diet-plans')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Powrót
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-3">
                  <span className="text-white text-2xl">📋</span>
                </div>
                Moje Plany Dietetyczne
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-3">
            {dietPlans.length > 0 && (
              <button
                onClick={() => setShowDietReportModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
              >
                <Download className="w-5 h-5" />
                Generuj Raport Dietetyczny
              </button>
            )}
          </div>
          <Button 
            className="flex items-center gap-2 text-lg px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all shadow-lg rounded-xl"
            onClick={() => navigate('/diet-plans/new')}
          >
            <Plus className="w-5 h-5" />
            Stwórz Nowy Plan
          </Button>
        </div>

        {dietPlans.length === 0 && (
          <div className="bg-white shadow-xl rounded-2xl p-8 text-center">
            <div className="text-gray-500 mb-8">
              <Calendar className="w-20 h-20 mx-auto mb-8 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Brak planów dietetycznych</h2>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">Nie masz jeszcze żadnego planu dietetycznego. Stwórz swój pierwszy plan, aby zacząć zdrowe odżywianie!</p>
            <Button 
              className="flex items-center gap-3 mx-auto text-lg px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
              onClick={() => navigate('/diet-plans/new')}
            >
              <Plus className="w-6 h-6" />
              Stwórz Pierwszy Plan
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dietPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{plan.nazwa}</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all"
                      onClick={() => {
                        navigate(`/diet-plans/edit/${plan.id}`);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-300 text-red-500 hover:border-red-500 hover:bg-red-50 transition-all"
                      onClick={async () => {
                        if (window.confirm(`Czy na pewno chcesz usunąć plan "${plan.nazwa}"?`)) {
                          try {
                            await dietPlanService.deleteMealPlan(plan.id);
                            await refreshDietPlans();
                          } catch (error) {
                            alert('Nie udało się usunąć planu. Spróbuj ponownie.');
                          }
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {plan.opis}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Czas trwania:</span>
                    <span className="font-medium">{plan.czas_trwania || 0} dni</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kalorie:</span>
                    <span className="font-medium">{plan.kalorie_dzienne || 0} kcal</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Utworzono:</span>
                    <span className="font-medium">
                      {formatDate(plan.utworzono_o || plan.created_at || plan.start_date)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all"
                    onClick={() => {
                      navigate(`/diet-plans/${plan.id}`);
                    }}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Szczegóły
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all"
                    onClick={() => {
                      navigate(`/diet-plans/edit/${plan.id}`);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edycja
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Diet Report Modal */}
      {showDietReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Generuj Raport Dietetyczny</h2>
              <button
                onClick={() => setShowDietReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-600">Funkcja generowania raportów dietetycznych jest w budowie.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlansListPage;
