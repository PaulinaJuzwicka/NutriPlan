import { supabase } from '../lib/supabase';
import { optimizedQueries, invalidateCache } from '../utils/dataOptimization';

interface MealToSave {
  plan_id: string;
  day_number: number;
  meal_type: string;
  recipe_id: number;
  scheduled_for: string;
  calories: number;
  is_completed: boolean;
  notatki?: string;
}

export interface Meal {
  id: string;
  name: string;
  title: string;
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  scheduledFor: string; // ISO date string
  calories?: number;
  ingredients?: Array<{
    id: string;
    name: string;
    amount: number;
    unit: string;
  }>;
  instructions?: string;
  imageUrl?: string;
  recipe?: unknown;
  isCompleted?: boolean;
  notes?: string;
}

export interface DietPlan {
  id: string;
  nazwa: string;
  opis?: string;
  czas_trwania: number;
  kalorie_dzienne: number;
  start_date?: string;
  meal_plan_type?: string;
  standard_meals?: Record<string, number>;
  custom_meals?: Record<string, number>;
  alergie?: string[];
  wykluczone_skladniki?: string[];
  id_uzytkownika: string;
  created_at?: string;
  meals?: Meal[];
  week?: unknown;
}

const dietPlanService = {
  async getMealPlans(userId: string) {
    return await optimizedQueries.getDietPlansOptimized(userId);
  },

  async createMealPlan(mealPlan: Omit<DietPlan, 'id' | 'created_at'>) {
    try {
      console.log('Creating meal plan with data:', mealPlan);
      
      const { data, error } = await supabase
        .from('plany_dietetyczne')
        .insert([mealPlan])
        .select()
        .single();
      
      if (error) {
        console.error('Błąd tworzenia planu dietetycznego:', error);
        console.error('Meal plan data being inserted:', mealPlan);
        throw new Error(`Nie udało się utworzyć planu dietetycznego: ${error.message}`);
      }
      console.log('Meal plan created successfully:', data);
      // Invalidate cache po dodaniu
      invalidateCache.dietPlans(mealPlan.id_uzytkownika);
      return data;
    } catch (err) {
      console.error('Błąd w createMealPlan:', err);
      throw err;
    }
  },

  async createMeals(meals: MealToSave[]) {
    try {
      const { data, error } = await supabase
        .from('posilki_planu')
        .insert(meals)
        .select();
      
      if (error) {
        console.error('Błąd tworzenia posiłków planu:', error);
        throw new Error(`Nie udało się utworzyć posiłków planu: ${error.message}`);
      }
      return data;
    } catch (err) {
      console.error('Błąd w createMeals:', err);
      throw err;
    }
  },

  async getMealsForPlan(planId: string) {
    const { data, error } = await supabase
      .from('posilki_planu')
      .select(`
        *,
        przepisy (
          id,
          tytul,
          opis,
          kalorie,
          instrukcje,
          skladniki_przepisow (
            id,
            ilosc,
            skladnik:skladniki (id, nazwa)
          )
        )
      `)
      .eq('plan_id', planId)
      .order('day_number', { ascending: true });
    
    if (error) throw new Error(error.message);
    
    // Niestandardowe sortowanie posiłków według prawidłowej kolejności
    const mealOrder = ['sniadanie', 'drugie_sniadanie', 'obiad', 'podwieczorek', 'kolacja'];
    
    return (data || []).sort((a, b) => {
      // Najpierw sortuj po dniu
      if (a.day_number !== b.day_number) {
        return a.day_number - b.day_number;
      }
      
      // Potem sortuj po typie posiłku według zdefiniowanej kolejności
      const aOrder = mealOrder.indexOf(a.meal_type);
      const bOrder = mealOrder.indexOf(b.meal_type);
      
      if (aOrder === -1 && bOrder === -1) return a.meal_type.localeCompare(b.meal_type);
      if (aOrder === -1) return 1;
      if (bOrder === -1) return -1;
      
      return aOrder - bOrder;
    });
  },

  async deleteMealsForPlan(planId: string) {
    try {
      console.log('Deleting meals for plan:', planId);
      const { error } = await supabase
        .from('posilki_planu')
        .delete()
        .eq('plan_id', planId);
      
      if (error) {
        console.error('Błąd usuwania posiłków planu:', error);
        throw new Error(`Nie udało się usunąć posiłków planu: ${error.message}`);
      }
      
      console.log('Meals deleted successfully for plan:', planId);
      return true;
    } catch (err) {
      console.error('Błąd w deleteMealsForPlan:', err);
      throw err;
    }
  },

  async deleteMealPlan(id: string) {
    const { error } = await supabase.from('plany_dietetyczne').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async updateMealPlan(id: string, updates: Partial<DietPlan>) {
    const { data, error } = await supabase
      .from('plany_dietetyczne')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
};

export default dietPlanService;
