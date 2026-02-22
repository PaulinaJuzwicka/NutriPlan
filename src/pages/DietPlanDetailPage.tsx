import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextOptimized';
import { usePageState } from '../hooks/usePageState';
import { usePreventReload } from '../hooks/usePreventReload';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Calendar, Clock, Flame, Users, Target, CheckCircle, Circle } from 'lucide-react';
import dietPlanService from '../services/dietPlanService';

interface DietPlanDetail {
  id: string;
  nazwa: string;
  opis?: string;
  czas_trwania: number;
  kalorie_dzienne: number;
  start_date?: string;
  alergie?: string[];
  wykluczone_skladniki?: string[];
  created_at?: string;
}

interface MealDetail {
  id: string;
  plan_id: string;
  day_number: number;
  meal_type: string;
  recipe_id: number;
  scheduled_for: string;
  calories: number;
  is_completed: boolean;
  notatki?: string;
  przepisy?: {
    id: number;
    tytul: string;
    opis?: string;
    kalorie?: number;
    instrukcje?: string;
    skladniki_przepisow?: Array<{
      id: number;
      ilosc: string;
      skladnik: {
        id: number;
        nazwa: string;
      };
    }>;
  };
}

const DietPlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { state: authState } = useAuth();
  const navigate = useNavigate();
  const { isRestored, saveState } = usePageState(`diet-plan-detail-${id}`);
  const { isPreventingReload } = usePreventReload(true);
  const [dietPlan, setDietPlan] = useState<DietPlanDetail | null>(null);
  const [meals, setMeals] = useState<MealDetail[]>([]);
  const [loading, setLoading] = useState(false); // Start with false - work in background
  const [error, setError] = useState<string | null>(null);
  const [expandedMeals, setExpandedMeals] = useState<Record<string, { ingredients?: boolean; instructions?: boolean }>>({});

  // Restore and save page state
  useEffect(() => {
    if (isRestored) {
      console.log('📋 DIET PLAN DETAIL - Page state restored');
      
      // Try to restore from cache
      try {
        const cacheKey = `nutriplan_diet_plan_${id}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const cacheAge = Date.now() - parsed.timestamp;
          
          if (cacheAge < 5 * 60 * 1000) { // 5 minutes
            console.log('📋 DIET PLAN DETAIL - Using cached data, age:', Math.round(cacheAge / 1000), 'seconds');
            setDietPlan(parsed.dietPlan);
            setMeals(parsed.meals || []);
            setExpandedMeals(parsed.expandedMeals || {});
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to restore diet plan cache:', error);
      }
    }
  }, [id, isRestored]);

  // Save to cache when data is loaded
  useEffect(() => {
    // Only save if we have valid dietPlan data
    if (dietPlan && id && dietPlan.id && dietPlan.nazwa && dietPlan.nazwa.trim() !== '') {
      try {
        const cacheKey = `nutriplan_diet_plan_${id}`;
        console.log('📋 DIET PLAN DETAIL - Saving valid data to cache');
        localStorage.setItem(cacheKey, JSON.stringify({
          dietPlan,
          meals,
          expandedMeals,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn('📋 DIET PLAN DETAIL - Failed to save diet plan cache:', error);
      }
    } else {
      console.log('📋 DIET PLAN DETAIL - Not saving to cache - invalid dietPlan data');
    }
  }, [dietPlan, meals, expandedMeals, id]);

  // Save page state
  useEffect(() => {
    saveState({
      scrollPosition: window.scrollY,
      formData: {
        planId: id,
        hasPlan: !!dietPlan,
        expandedMeals,
        mealsCount: meals.length
      }
    });
  }, [id, dietPlan, expandedMeals, meals.length, saveState]);

  // Funkcja do pobierania tylko posiłków (gdy plan jest z cache)
  const fetchMealsOnly = useCallback(async () => {
    if (!id) return;
    
    try {
      console.log('📋 DIET PLAN DETAIL - Fetching meals only');
      const mealsData = await dietPlanService.getMealsForPlan(id);
      console.log('📋 DIET PLAN DETAIL - Meals data received:', mealsData?.length || 0);
      setMeals(mealsData || []);
      
      // Update cache with meals
      try {
        const cacheKey = `nutriplan_diet_plan_${id}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          localStorage.setItem(cacheKey, JSON.stringify({
            ...parsed,
            meals: mealsData || [],
            timestamp: Date.now()
          }));
          console.log('📋 DIET PLAN DETAIL - Updated cache with meals data');
        }
      } catch (error) {
        console.warn('📋 DIET PLAN DETAIL - Failed to update cache with meals:', error);
      }
    } catch (error) {
      console.error('📋 DIET PLAN DETAIL - Error fetching meals only:', error);
    }
  }, [id]);

  // Fetch diet plan data on mount
  useEffect(() => {
    const fetchData = async () => {
      // Reset cache on page refresh to force fresh data loading
      const isPageRefresh = performance.navigation.type === 1; // 1 = page refresh
      if (isPageRefresh) {
        console.log('📋 DIET PLAN DETAIL - Page refresh detected, clearing cache');
        localStorage.removeItem(`nutriplan_diet_plan_${id}`);
        setDietPlan(null);
        setMeals([]);
      }
      
      // Skip if we already have data (but not on refresh)
      if (!isPageRefresh && (dietPlan || meals.length > 0)) {
        console.log('📋 DIET PLAN DETAIL - Data already loaded, skipping fetch');
        return;
      }

      if (!id || !authState.user) return;
      
      try {
        console.log('📋 DIET PLAN DETAIL - Starting data fetch for ID:', id);
        
        // Check cache first
        const cacheKey = `nutriplan_diet_plan_${id}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const cacheAge = Date.now() - parsed.timestamp;
          
          if (cacheAge < 5 * 60 * 1000 && parsed.dietPlan && parsed.meals?.length > 0) { // 5 minutes
            console.log('📋 DIET PLAN DETAIL - Using cached data, age:', Math.round(cacheAge / 1000), 'seconds');
            setDietPlan(parsed.dietPlan);
            setMeals(parsed.meals || []);
            return;
          }
        }
        
        // Get all plans and filter by ID
        const allPlans = await dietPlanService.getMealPlans(authState.user.id);
        const dietPlanData = (allPlans as any[]).find(plan => plan.id === id);
        
        if (!dietPlanData) {
          setError('Plan dietetyczny nie został znaleziony');
          return;
        }
        
        const mealsData = await dietPlanService.getMealsForPlan(id);
        
        console.log('📋 DIET PLAN DETAIL - Data received:', !!dietPlanData, 'meals:', mealsData?.length || 0);
        
        setDietPlan(dietPlanData);
        setMeals(mealsData || []);
        
        // Save to cache
        const cacheData = {
          dietPlan: dietPlanData,
          meals: mealsData || [],
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log('📋 DIET PLAN DETAIL - Data saved to cache');
        
      } catch (error) {
        console.error('📋 DIET PLAN DETAIL - Error loading data:', error);
        setError('Nie udało się załadować planu dietetycznego');
      }
    };

    fetchData();
  }, [id, authState.user]); // Only depend on id and user

  // Funkcja do przełączania statusu posiłku
  const toggleMealCompletion = async (mealId: string) => {
    try {
      const meal = meals.find(m => m.id === mealId);
      if (!meal) return;

      const newStatus = !meal.is_completed;
      
      // TODO: Wywołanie API do aktualizacji statusu posiłku
      console.log(`Toggle meal ${mealId} to ${newStatus}`);
      
      // Tymczasowo aktualizuj lokalnie
      setMeals(prev => prev.map(m => 
        m.id === mealId ? { ...m, is_completed: newStatus } : m
      ));
    } catch (error) {
      console.error('Error toggling meal completion:', error);
    }
  };

  // Pobieranie danych planu dietetycznego - z cache protection
  const fetchData = useCallback(async () => {
    if (!id || !authState.user) return;

    // Skip if we're in grace period (just restored from minimize)
    if (isPreventingReload()) {
      console.log('📋 DIET PLAN DETAIL - In grace period, skipping fetch');
      return;
    }

    // Skip if we already have data (from cache)
    if (dietPlan) {
      console.log('📋 DIET PLAN DETAIL - Already have data, skipping fetch');
      return;
    }

    // Check if we already have cached data
    try {
      const cacheKey = `nutriplan_diet_plan_${id}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const cacheAge = Date.now() - parsed.timestamp;
        
        if (cacheAge < 5 * 60 * 1000 && parsed.dietPlan) { // 5 minutes
          console.log('📋 DIET PLAN DETAIL - Using cached data, age:', Math.round(cacheAge / 1000), 'seconds');
          setDietPlan(parsed.dietPlan);
          setMeals(parsed.meals || []);
          setExpandedMeals(parsed.expandedMeals || {});
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.warn('Cache check failed:', error);
    }

    try {
      console.log('📋 DIET PLAN DETAIL - Fetching fresh data');
      setLoading(true);
      
      // Pobierz plan dietetyczny
      const plans = await dietPlanService.getMealPlans(authState.user.id);
      const plan = (plans as DietPlanDetail[]).find(p => p.id === id);
      
      if (!plan) {
        setError('Plan dietetyczny nie został znaleziony');
        return;
      }
      
      setDietPlan(plan);
      
      // Pobierz posiłki dla planu
      const mealsData = await dietPlanService.getMealsForPlan(id);
      setMeals(mealsData || []);
      
    } catch (err) {
      console.error('Error fetching diet plan:', err);
      setError('Wystąpił błąd podczas pobierania planu dietetycznego. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }, [id, authState.user?.id, isPreventingReload, dietPlan]);

  useEffect(() => {
    fetchData();
  }, [id, authState.user?.id]); // Usunięto fetchData z zależności

  // Grupowanie posiłków po dniach
  const mealsByDay = meals.reduce((acc, meal) => {
    if (!acc[meal.day_number]) {
      acc[meal.day_number] = [];
    }
    acc[meal.day_number].push(meal);
    return acc;
  }, {} as Record<number, MealDetail[]>);

  // Funkcja do przełączania stanu rozwiniętych sekcji
  const toggleExpanded = (mealId: string, section: 'ingredients' | 'instructions') => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealId]: {
        ...prev[mealId],
        [section]: !prev[mealId]?.[section]
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Ładowanie planu dietetycznego...</div>
      </div>
    );
  }

  if (error || !dietPlan) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {error || 'Nie znaleziono planu dietetycznego'}
          </h3>
          <Button onClick={() => navigate('/diet-plans')}>
            Wróć do listy planów
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Wróć do listy planów
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <span className="text-white text-lg">🍽️</span>
                </div>
                Szczegóły Planu Dietetycznego
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Nagłówek planu */}
      <Card className="mb-6 shadow-xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{dietPlan.nazwa}</h1>
              {dietPlan.opis && (
                <p className="text-gray-600 text-lg">{dietPlan.opis}</p>
              )}
            </div>
            <div className="flex items-center text-lg text-orange-600 bg-orange-100 px-4 py-3 rounded-xl shadow-md">
              <Flame className="w-6 h-6 mr-2" />
              {dietPlan.kalorie_dzienne} kcal/dzień
            </div>
          </div>

          {/* Metadane */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="font-medium">Czas trwania:</span> {dietPlan.czas_trwania} dni
            </div>
            
            {dietPlan.start_date && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-medium">Rozpoczęcie:</span> {new Date(dietPlan.start_date).toLocaleDateString()}
              </div>
            )}

            <div className="flex items-center text-sm text-gray-600">
              <Target className="w-4 h-4 mr-2" />
              <span className="font-medium">Posiłki wygenerowane:</span> {meals.length}
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span className="font-medium">Użytkownik:</span> {authState.user?.email}
            </div>
          </div>

          {/* Preferencje */}
          {(dietPlan.alergie?.length || dietPlan.wykluczone_skladniki?.length) && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Preferencje żywieniowe</h3>
              {dietPlan.alergie && dietPlan.alergie.length > 0 && (
                <div className="mb-2">
                  <span className="font-medium text-red-600">Alergie:</span> {dietPlan.alergie.join(', ')}
                </div>
              )}
              {dietPlan.wykluczone_skladniki && dietPlan.wykluczone_skladniki.length > 0 && (
                <div>
                  <span className="font-medium text-orange-600">Wykluczone składniki:</span> {dietPlan.wykluczone_skladniki.join(', ')}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posiłki pogrupowane po dniach */}
      {Object.keys(mealsByDay).length > 0 ? (
        Object.entries(mealsByDay).map(([dayNumber, dayMeals]) => (
          <Card key={dayNumber} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Dzień {dayNumber}
                  {dietPlan.start_date && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({new Date(new Date(dietPlan.start_date).getTime() + (parseInt(dayNumber) - 1) * 24 * 60 * 60 * 1000).toLocaleDateString()})
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-lg">
                  <Flame className="w-4 h-4 mr-1" />
                  {(dayMeals as MealDetail[]).reduce((total, meal) => total + meal.calories, 0)} kcal
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(dayMeals as MealDetail[]).map((meal) => (
                  <Card key={meal.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{meal.meal_type}</h4>
                        <div className="flex items-center text-sm text-orange-600">
                          <Flame className="w-3 h-3 mr-1" />
                          {meal.calories} kcal
                        </div>
                      </div>
                      
                      {meal.przepisy && (
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2">{meal.przepisy.tytul}</h5>
                          {meal.przepisy.opis && (
                            <p className="text-sm text-gray-600 mb-2">{meal.przepisy.opis}</p>
                          )}
                          
                          {/* Pełna lista składników */}
                          {meal.przepisy.skladniki_przepisow && meal.przepisy.skladniki_przepisow.length > 0 && (
                            <div className="mb-3">
                              <button
                                onClick={() => toggleExpanded(meal.id, 'ingredients')}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-2 flex items-center"
                              >
                                <span className="mr-1">📋</span>
                                Składniki ({meal.przepisy.skladniki_przepisow.length})
                                {expandedMeals[meal.id]?.ingredients ? ' ▲' : ' ▼'}
                              </button>
                              {!expandedMeals[meal.id]?.ingredients && (
                                <div className="hidden bg-gray-50 p-3 rounded-lg text-sm">
                                  <div className="grid grid-cols-1 gap-1">
                                    {meal.przepisy.skladniki_przepisow.map((skladnik) => (
                                      <div key={skladnik.id} className="flex justify-between items-center py-1 border-b border-gray-200">
                                        <span className="font-medium text-gray-700">{skladnik.skladnik.nazwa}</span>
                                        <span className="text-gray-600 bg-white px-2 py-1 rounded">{skladnik.ilosc}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {expandedMeals[meal.id]?.ingredients && (
                                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                  <div className="grid grid-cols-1 gap-1">
                                    {meal.przepisy.skladniki_przepisow.map((skladnik) => (
                                      <div key={skladnik.id} className="flex justify-between items-center py-1 border-b border-gray-200">
                                        <span className="font-medium text-gray-700">{skladnik.skladnik.nazwa}</span>
                                        <span className="text-gray-600 bg-white px-2 py-1 rounded">{skladnik.ilosc}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Sposób przygotowania */}
                          {meal.przepisy.instrukcje && (
                            <div className="mb-3">
                              <button
                                onClick={() => toggleExpanded(meal.id, 'instructions')}
                                className="text-sm text-green-600 hover:text-green-800 font-medium mb-2 flex items-center"
                              >
                                <span className="mr-1">👨‍🍳</span>
                                Sposób przygotowania
                                {expandedMeals[meal.id]?.instructions ? ' ▲' : ' ▼'}
                              </button>
                              {!expandedMeals[meal.id]?.instructions && (
                                <div className="hidden bg-green-50 p-3 rounded-lg text-sm">
                                  <p className="text-gray-700 leading-relaxed">{meal.przepisy.instrukcje}</p>
                                </div>
                              )}
                              {expandedMeals[meal.id]?.instructions && (
                                <div className="bg-green-50 p-3 rounded-lg text-sm">
                                  <p className="text-gray-700 leading-relaxed">{meal.przepisy.instrukcje}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="shadow-xl">
          <CardContent className="p-8 text-center">
            <Target className="w-16 h-16 mx-auto text-gray-300 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Brak wygenerowanych posiłków
            </h3>
            <p className="text-gray-600 text-lg">
              Ten plan dietetyczny nie ma jeszcze wygenerowanych posiłków.
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
};

export default React.memo(DietPlanDetailPage);
