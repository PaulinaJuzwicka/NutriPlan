import { supabase } from '../lib/supabase';

export interface Meal {
  id: string;
  title: string;
  day: string;
  mealType: string;
  calories?: number;
  recipe?: any;
}

export interface DietPlan {
  id: string;
  name: string;
  calories: number;
  allergens: string[];
  meals?: Meal[];
  week?: any;
  created_at?: string;
  user_id?: string;
}

const dietPlanService = {
  async getMealPlans(userId: string) {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },

  async createMealPlan(mealPlan: Omit<DietPlan, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('meal_plans')
      .insert([mealPlan])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteMealPlan(id: string) {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async updateMealPlan(id: string, updates: Partial<DietPlan>) {
    const { data, error } = await supabase
      .from('meal_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
};

export default dietPlanService;
