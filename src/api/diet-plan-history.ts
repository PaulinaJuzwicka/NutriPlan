import { supabase } from '../lib/supabase';
import { DietPlan } from './types/diet-plan';

export interface DietPlanHistoryItem {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  file_path: string;
  file_type: 'docx' | 'pdf';
  file_size: number;
  plan_data: Partial<DietPlan>;
}

export const saveDietPlanToHistory = async (
  plan: DietPlan,
  filePath: string,
  fileType: 'docx' | 'pdf',
  fileSize: number
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Użytkownik nie jest zalogowany');

    const { data, error } = await supabase
      .from('diet_plan_history')
      .insert([
        {
          user_id: user.id,
          title: plan.title,
          file_path: filePath,
          file_type: fileType,
          file_size: fileSize,
          plan_data: {
            title: plan.title,
            description: plan.description,
            duration: plan.duration,
            createdAt: plan.createdAt,
            updated_at: new Date().toISOString(),
          },
        },
      ])
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getUserDietPlans = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Użytkownik nie jest zalogowany');

    const { data, error } = await supabase
      .from('diet_plan_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const deleteDietPlan = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('diet_plan_history')
      .delete()
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};
