import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextOptimized';
import { usePageState } from '../hooks/usePageState';
import { usePreventReload } from '../hooks/usePreventReload';
import { TemplateForm } from '../components/diet/TemplateForm';
import dietPlanService from '../services/dietPlanService';

interface DietPlan {
  id?: string;
  name: string;
  description?: string;
  duration: number;
  calories: number;
  mealPlanType?: "custom" | "standard" | "mixed";
  startDate?: string;
  excludeIngredients?: string[];
  allergies?: string[];
  standardMeals?: Record<string, number>;
  customMeals?: Record<string, number>;
}

const CreateDietPlanPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { state: authState } = useAuth();
  const navigate = useNavigate();
  const { isRestored, saveState } = usePageState('create-diet-plan');
  const { isPreventingReload } = usePreventReload(true);
  const [existingPlan, setExistingPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false); // Start with false - work in background
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!id;

  // Load existing plan data if in edit mode
  useEffect(() => {
    // Reset cache on page refresh to force fresh data loading
    const isPageRefresh = performance.navigation.type === 1; // 1 = page refresh
    if (isPageRefresh && isEditMode) {
      console.log('📝 CREATE DIET PLAN - Page refresh detected, clearing cache');
      localStorage.removeItem(`nutriplan_diet_plan_${id}`);
      setExistingPlan(null);
    }
    
    // Skip if we already have data or not in edit mode (but not on refresh)
    if (!isPageRefresh && (!isEditMode || existingPlan)) {
      console.log('📝 CREATE DIET PLAN - Data already loaded or not edit mode, skipping fetch');
      return;
    }

    if (isEditMode && authState.user) {
      loadExistingPlan();
    }
  }, [id, isEditMode, authState.user]); // Only depend on id, isEditMode, and user

  const loadExistingPlan = async () => {
    if (!id || !authState.user) return;

    try {
      console.log('📝 CREATE DIET PLAN - Loading plan data for ID:', id);
      
      const plans = await dietPlanService.getMealPlans(authState.user.id);
      const plan = (plans as any[]).find(p => p.id === id);
      
      if (!plan) {
        setError('Plan dietetyczny nie został znaleziony');
        return;
      }

      // Convert to form format
      const formData: DietPlan = {
        id: plan.id,
        name: plan.nazwa,
        description: plan.opis || '',
        duration: plan.czas_trwania,
        calories: plan.kalorie_dzienne,
        startDate: plan.start_date,
        excludeIngredients: [],
        allergies: [],
        standardMeals: {},
        customMeals: {}
      };

      setExistingPlan(formData);
      console.log('📝 CREATE DIET PLAN - Plan data loaded:', formData);
    } catch (err) {
      console.error('📝 CREATE DIET PLAN - Error loading plan:', err);
      setError('Nie udało się załadować planu dietetycznego');
    }
  };

  // Restore and save page state
  useEffect(() => {
    if (isRestored) {
      console.log('📋 CREATE DIET PLAN - Page state restored');
    }
  }, [isRestored]);

  // Save scroll position
  useEffect(() => {
    saveState({
      scrollPosition: window.scrollY,
      formData: {
        loading
      }
    });
  }, [saveState, loading]);

  if (!authState.user) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-white shadow rounded p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Musisz być zalogowany</h2>
          <p className="text-gray-600">Aby {isEditMode ? 'edytować' : 'stworzyć'} plan dietetyczny, zaloguj się na konto.</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => navigate('/login')}
          >
            Zaloguj się
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Ładowanie planu dietetycznego...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-red-500">❌</span>
            <span>{error}</span>
          </div>
          <button 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => navigate('/diet-plans')}
          >
            Wróć do listy planów
          </button>
        </div>
      </div>
    );
  }

  const handleSuccess = () => {
    navigate('/diet-plans');
  };

  const handleCancel = () => {
    navigate('/diet-plans');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {isEditMode ? 'Edytuj plan dietetyczny' : 'Stwórz plan dietetyczny'}
        </h2>
        <p className="text-gray-600">Funkcja tworzenia planów dietetycznych jest w budowie.</p>
      </div>
    </div>
  );
};

export default React.memo(CreateDietPlanPage);
