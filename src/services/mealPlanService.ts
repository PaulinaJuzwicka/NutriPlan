import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface MealPlan {
  id: string;
  user_id: string;
  recipe_id: number;
  date: string;
  meal_time: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  created_at: string;
}

export const mealPlanService = {
  async createMealPlan(mealPlan: Omit<MealPlan, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('meal_plans')
      .insert([mealPlan])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getMealPlans(userId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data;
  },

  async updateMealPlan(id: string, updates: Partial<MealPlan>) {
    const { data, error } = await supabase
      .from('meal_plans')
      .update(updates)
      .eq('id', id)
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
  }
};